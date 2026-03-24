# Real-World Bloater Examples and Refactorings

Practical examples of code bloaters found in real projects and how to refactor them.

---

## Example 1: E-Commerce Order Processing (Long Method + Data Clumps)

### The Problem

A single method handling too many concerns with repeated parameter patterns:

```python
# ❌ In orders.py
def create_order(
    user_id: str,
    user_email: str,
    user_phone: str,
    product_ids: list[str],
    product_quantities: list[int],
    street: str,
    city: str,
    state: str,
    zip_code: str,
    country: str,
    card_number: str,
    card_expiry: str,
    card_cvv: str,
    use_two_factor: bool
):
    # Validate user
    user = get_user(user_id)
    if not user or user.email != user_email:
        raise ValueError("Invalid user")

    # Validate products
    items = []
    for i, product_id in enumerate(product_ids):
        product = get_product(product_id)
        if not product:
            raise ValueError(f"Invalid product: {product_id}")
        items.append({
            'product': product,
            'quantity': product_quantities[i],
            'price': product.price
        })

    # Calculate total
    total = sum(item['price'] * item['quantity'] for item in items)
    if total > 10000:
        raise ValueError("Order total exceeds limit")

    # Process payment
    payment_result = process_payment(
        card_number=card_number,
        card_expiry=card_expiry,
        card_cvv=card_cvv,
        amount=total
    )
    if not payment_result['success']:
        raise ValueError(f"Payment failed: {payment_result['error']}")

    # Create shipping address
    address = {
        'street': street,
        'city': city,
        'state': state,
        'zip_code': zip_code,
        'country': country
    }

    # Save order
    order = {
        'user_id': user_id,
        'user_email': user_email,
        'user_phone': user_phone,
        'items': items,
        'total': total,
        'address': address,
        'payment_id': payment_result['id'],
        'status': 'confirmed'
    }

    save_order_to_db(order)

    # Send confirmation email
    send_email(
        to=user_email,
        subject="Order Confirmation",
        body=f"Your order for ${total} has been confirmed."
    )

    # Log audit
    log_audit('order_created', user_id, order['id'])

    return order
```

### Issues

1. **Long Method** — 60+ lines doing 6 different things
2. **Data Clumps** — Address fields repeated (street, city, state, zip, country)
3. **Data Clumps** — Card fields repeated (card_number, card_expiry, card_cvv)
4. **Primitive Obsession** — User contact info passed as separate strings
5. **Long Parameter List** — 14 parameters, hard to call correctly

### Refactored Solution

```python
from dataclasses import dataclass

# Extract domain objects to replace primitive clumps

@dataclass
class UserInfo:
    id: str
    email: str
    phone: str

    def validate(self):
        if not self.id or not self.email or not self.phone:
            raise ValueError("Invalid user info")

@dataclass
class ShippingAddress:
    street: str
    city: str
    state: str
    zip_code: str
    country: str

    def validate(self):
        if not all([self.street, self.city, self.state, self.zip_code, self.country]):
            raise ValueError("Invalid address")

    def format_for_label(self) -> str:
        return f"{self.street}\n{self.city}, {self.state} {self.zip_code}\n{self.country}"

@dataclass
class CreditCard:
    number: str
    expiry: str
    cvv: str

    def validate(self):
        if len(self.number) != 16 or len(self.cvv) != 3:
            raise ValueError("Invalid card")

@dataclass
class OrderLineItem:
    product_id: str
    quantity: int

@dataclass
class OrderRequest:
    user: UserInfo
    items: list[OrderLineItem]
    address: ShippingAddress
    payment_card: CreditCard

# Extract separate services

class OrderService:
    def __init__(self, repo, payment_svc, notification_svc, audit_log):
        self.repo = repo
        self.payment_svc = payment_svc
        self.notification_svc = notification_svc
        self.audit_log = audit_log

    def create_order(self, request: OrderRequest) -> Order:
        """Orchestrates order creation with clear responsibilities."""
        request.validate()

        order = self._prepare_order(request)
        self._process_payment(order, request.payment_card)
        self._save_order(order)
        self._notify_customer(order, request.user.email)
        self._audit_log('order_created', request.user.id, order.id)

        return order

    def _prepare_order(self, request: OrderRequest) -> Order:
        """Extract to separate method for clarity."""
        items = self._fetch_and_validate_products(request.items)
        total = self._calculate_total(items)

        return Order(
            user_id=request.user.id,
            user_email=request.user.email,
            user_phone=request.user.phone,
            items=items,
            total=total,
            address=request.address,
            status='pending'
        )

    def _fetch_and_validate_products(self, items: list[OrderLineItem]) -> list[OrderItem]:
        """Extract product validation logic."""
        validated_items = []
        for item in items:
            product = get_product(item.product_id)
            if not product:
                raise ValueError(f"Invalid product: {item.product_id}")
            validated_items.append(OrderItem(
                product=product,
                quantity=item.quantity,
                price=product.price
            ))
        return validated_items

    def _calculate_total(self, items: list[OrderItem]) -> float:
        """Extract calculation logic."""
        total = sum(item.price * item.quantity for item in items)
        if total > 10000:
            raise ValueError("Order total exceeds limit")
        return total

    def _process_payment(self, order: Order, card: CreditCard) -> None:
        """Extract payment processing."""
        result = self.payment_svc.charge(card, order.total)
        if not result.success:
            raise ValueError(f"Payment failed: {result.error}")
        order.payment_id = result.id

    def _save_order(self, order: Order) -> None:
        """Extract persistence."""
        self.repo.save(order)

    def _notify_customer(self, order: Order, email: str) -> None:
        """Extract notification logic."""
        self.notification_svc.send_confirmation(order, email)

    def _audit_log(self, action: str, user_id: str, order_id: str) -> None:
        """Extract audit logging."""
        self.audit_log.record(action, {'user_id': user_id, 'order_id': order_id})
```

### Benefits of Refactoring

- **Parameters reduced** from 14 to 1 (the OrderRequest)
- **Data clumps eliminated** — Address and Card are proper objects
- **Long method broken down** — Each concern has its own method
- **Testability improved** — Each method can be tested independently
- **Reusability** — ShippingAddress, CreditCard, OrderRequest can be reused
- **Clarity** — Intent is obvious from method and class names

---

## Example 2: User Authentication (Large Class + Primitive Obsession)

### The Problem

A monolithic UserAuthService with 20+ methods mixing multiple concerns:

```typescript
// ❌ Large, unfocused class
class UserAuthService {
    private db: Database;
    private cache: Cache;
    private emailService: EmailService;
    private logger: Logger;

    // User CRUD
    createUser(email: string, password: string, name: string): User { }
    updateUser(id: string, updates: Partial<User>): User { }
    deleteUser(id: string): void { }
    getUserById(id: string): User | null { }
    getUserByEmail(email: string): User | null { }

    // Authentication
    authenticate(email: string, password: string): AuthToken { }
    validateToken(token: string): boolean { }
    refreshToken(token: string): AuthToken { }
    logout(token: string): void { }
    revokeToken(token: string): void { }

    // Password management
    hashPassword(password: string): string { }
    verifyPassword(password: string, hash: string): boolean { }
    resetPassword(userId: string, newPassword: string): void { }
    changePassword(userId: string, oldPassword: string, newPassword: string): void { }
    generatePasswordResetToken(userId: string): string { }

    // Role/Permission management (mixing concerns!)
    assignRole(userId: string, role: string): void { }
    removeRole(userId: string, role: string): void { }
    checkPermission(userId: string, permission: string): boolean { }
    getPermissions(userId: string): string[] { }

    // Session management
    createSession(userId: string): Session { }
    validateSession(sessionId: string): boolean { }
    endSession(sessionId: string): void { }

    // Logging and auditing
    logLoginAttempt(email: string, success: boolean): void { }
    logPasswordChange(userId: string): void { }
    getAuditLog(userId: string): AuditEntry[] { }

    // Caching
    cacheUser(user: User): void { }
    invalidateUserCache(userId: string): void { }

    // Email operations
    sendWelcomeEmail(user: User): void { }
    sendPasswordResetEmail(user: User, token: string): void { }

    // Rate limiting
    checkRateLimit(email: string): boolean { }
    recordAttempt(email: string): void { }
}
```

### Issues

1. **Large Class** — 20+ methods, 5+ different responsibilities
2. **Mixed Concerns** — User management, auth, passwords, roles, sessions, audit, cache, email, rate limiting
3. **Hard to Test** — 20+ dependencies injected, complex setup needed
4. **Primitive Obsession** — String constants for roles: `"admin"`, `"user"`
5. **Single Reason to Change** Violated — Changes to email, roles, caching, etc. all require changes here

### Refactored Solution

```typescript
// Extract focused classes for each concern

// Domain objects
type UserId = string & { readonly __brand: "UserId" };
type Email = string & { readonly __brand: "Email" };
type PasswordHash = string & { readonly __brand: "PasswordHash" };

enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator"
}

// User repository — persistence only
class UserRepository {
  constructor(private db: Database) {}

  save(user: User): User { }
  findById(id: UserId): User | null { }
  findByEmail(email: Email): User | null { }
  delete(id: UserId): void { }
}

// Password management — isolated concerns
class PasswordManager {
  hash(password: string): PasswordHash { }
  verify(password: string, hash: PasswordHash): boolean { }
  validate(password: string): void {
    if (password.length < 12) throw new Error("Too short");
    if (!password.match(/[A-Z]/)) throw new Error("Needs uppercase");
  }
}

// Token management
class TokenService {
  generateAccessToken(userId: UserId): string { }
  generateRefreshToken(userId: UserId): string { }
  validateToken(token: string): UserId | null { }
  refreshToken(token: string): string { }
  revokeToken(token: string): void { }
}

// Session management
class SessionManager {
  createSession(userId: UserId): Session { }
  validateSession(sessionId: string): boolean { }
  endSession(sessionId: string): void { }
}

// Role and permission management
class RoleManager {
  assignRole(userId: UserId, role: UserRole): void { }
  removeRole(userId: UserId, role: UserRole): void { }
  hasRole(userId: UserId, role: UserRole): boolean { }
  getPermissions(userId: UserId): Set<string> { }
  hasPermission(userId: UserId, permission: string): boolean { }
}

// Audit logging
class AuditLog {
  logLoginAttempt(email: Email, success: boolean): void { }
  logPasswordChange(userId: UserId): void { }
  logRoleChange(userId: UserId, role: UserRole, action: 'assigned' | 'removed'): void { }
  getEntriesForUser(userId: UserId): AuditEntry[] { }
}

// Rate limiting
class RateLimiter {
  isAllowed(email: Email): boolean { }
  recordAttempt(email: Email): void { }
  reset(email: Email): void { }
}

// High-level orchestration
class AuthenticationService {
  constructor(
    private userRepo: UserRepository,
    private passwordManager: PasswordManager,
    private tokenService: TokenService,
    private sessionManager: SessionManager,
    private roleManager: RoleManager,
    private auditLog: AuditLog,
    private rateLimiter: RateLimiter,
    private emailService: EmailService
  ) {}

  async registerUser(email: Email, password: string, name: string): Promise<User> {
    const validatedPassword = password; // PasswordManager.validate() called above
    const hash = this.passwordManager.hash(validatedPassword);

    const user = new User(email, hash, name);
    this.userRepo.save(user);

    this.auditLog.logUserRegistration(user.id);
    await this.emailService.sendWelcomeEmail(user);

    return user;
  }

  async authenticate(email: Email, password: string): Promise<AuthToken> {
    if (!this.rateLimiter.isAllowed(email)) {
      throw new Error("Too many attempts");
    }

    const user = this.userRepo.findByEmail(email);
    if (!user || !this.passwordManager.verify(password, user.passwordHash)) {
      this.rateLimiter.recordAttempt(email);
      this.auditLog.logLoginAttempt(email, false);
      throw new Error("Invalid credentials");
    }

    const token = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);
    const session = this.sessionManager.createSession(user.id);

    this.auditLog.logLoginAttempt(email, true);

    return { accessToken: token, refreshToken, sessionId: session.id };
  }

  async resetPassword(userId: UserId, newPassword: string): Promise<void> {
    this.passwordManager.validate(newPassword);
    const hash = this.passwordManager.hash(newPassword);

    const user = this.userRepo.findById(userId);
    if (user) {
      user.passwordHash = hash;
      this.userRepo.save(user);
      this.auditLog.logPasswordChange(userId);
      this.tokenService.revokeToken(userId.toString());
    }
  }
}
```

### Benefits

- **Focused classes** — Each class has one reason to change
- **Testability** — Test PasswordManager independently, mock others as needed
- **Reusability** — TokenService can be used by different auth providers
- **Extensibility** — Add new strategies (OAuth, SAML) without touching existing classes
- **Clear boundaries** — Responsibilities are obvious

---

## Example 3: Parameter Objects in API Handler

### The Problem

A handler with a growing parameter list:

```typescript
// ❌ Long parameter list for search
function searchProducts(
  query: string,
  category: string,
  minPrice: number,
  maxPrice: number,
  inStock: boolean,
  sortBy: string,
  sortOrder: string,
  page: number,
  limit: number
): Product[] {
  // ...
}

// Call sites are error-prone
const results = searchProducts("laptop", "electronics", 500, 2000, true, "price", "asc", 1, 20);
// What does each parameter mean? Hard to remember order.
```

### Refactored

```typescript
enum SortOrder {
  ASC = "asc",
  DESC = "desc"
}

enum ProductSortField {
  PRICE = "price",
  NAME = "name",
  RATING = "rating",
  RELEVANCE = "relevance"
}

interface ProductSearchCriteria {
  query: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  sort?: {
    field: ProductSortField;
    order: SortOrder;
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

function searchProducts(criteria: ProductSearchCriteria): Product[] {
  // ...
}

// Much clearer at call site
const results = searchProducts({
  query: "laptop",
  category: "electronics",
  priceRange: { min: 500, max: 2000 },
  inStock: true,
  sort: { field: ProductSortField.PRICE, order: SortOrder.ASC },
  pagination: { page: 1, limit: 20 }
});
```

---

## Key Lessons

1. **Extract classes early** — When you see a method growing, extract before it becomes unmaintainable
2. **Group related parameters** — Data clumps signal missing abstractions
3. **Use types to prevent errors** — Enums and branded types catch mistakes at compile time
4. **One responsibility per class** — Makes testing, extending, and maintaining easier
5. **Orchestration classes** — It's OK to have a class that coordinates others (AuthenticationService)

These patterns make code more maintainable, testable, and easier to extend with new features.
