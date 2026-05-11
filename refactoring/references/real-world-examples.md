# Real-World Bloater Examples and Refactorings

Practical examples of code bloaters found in real projects and how to refactor them.

---

## Example 1: E-Commerce Order Processing (Long Method + Data Clumps)

### The Problem

A single method handling too many concerns with repeated parameter patterns:

```python
# ❌ In orders.py — 14 parameters, 6 concerns in one function
def create_order(
    user_id: str, user_email: str, user_phone: str,
    product_ids: list[str], product_quantities: list[int],
    street: str, city: str, state: str, zip_code: str, country: str,
    card_number: str, card_expiry: str, card_cvv: str,
    use_two_factor: bool
):
    user = get_user(user_id)
    if not user or user.email != user_email:
        raise ValueError("Invalid user")

    items = []
    for i, product_id in enumerate(product_ids):
        product = get_product(product_id)
        if not product:
            raise ValueError(f"Invalid product: {product_id}")
        items.append({'product': product, 'quantity': product_quantities[i], 'price': product.price})

    total = sum(item['price'] * item['quantity'] for item in items)
    if total > 10000:
        raise ValueError("Order total exceeds limit")

    payment_result = process_payment(card_number=card_number, card_expiry=card_expiry, card_cvv=card_cvv, amount=total)
    if not payment_result['success']:
        raise ValueError(f"Payment failed: {payment_result['error']}")

    order = {'user_id': user_id, 'items': items, 'total': total,
             'address': {'street': street, 'city': city, 'state': state, 'zip_code': zip_code, 'country': country},
             'payment_id': payment_result['id'], 'status': 'confirmed'}
    save_order_to_db(order)
    send_email(to=user_email, subject="Order Confirmation", body=f"Your order for ${total} has been confirmed.")
    return order
```

### Issues

1. **Long Method** — 30+ lines doing 6 different things
2. **Data Clumps** — Address fields (street, city, state, zip, country) and card fields (number, expiry, cvv)
3. **Long Parameter List** — 14 parameters, hard to call correctly

### Refactored Solution

```python
from dataclasses import dataclass

@dataclass
class ShippingAddress:
    street: str
    city: str
    state: str
    zip_code: str
    country: str

@dataclass
class CreditCard:
    number: str
    expiry: str
    cvv: str

@dataclass
class OrderRequest:
    user_id: str
    items: list[tuple[str, int]]  # (product_id, quantity)
    address: ShippingAddress
    payment_card: CreditCard

class OrderService:
    def __init__(self, repo, payment_svc, notification_svc):
        self.repo = repo
        self.payment_svc = payment_svc
        self.notification_svc = notification_svc

    def create_order(self, request: OrderRequest) -> Order:
        user = self._validate_user(request.user_id)
        items = self._fetch_and_validate_products(request.items)
        total = self._calculate_total(items)
        self._process_payment(request.payment_card, total)
        order = self.repo.save(user, items, total, request.address)
        self.notification_svc.send_confirmation(order, user.email)
        return order

    # Similar focused methods for _validate_user, _fetch_and_validate_products,
    # _calculate_total, _process_payment — each ~5 lines
```

### Benefits

- **Parameters reduced** from 14 to 1 (OrderRequest)
- **Data clumps eliminated** — Address and Card are proper objects
- **Each concern** has its own method, testable independently

---

## Example 2: User Authentication (Large Class)

### The Problem

A monolithic class with 20+ methods mixing multiple concerns:

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
    // ... 2 more CRUD methods

    // Authentication
    authenticate(email: string, password: string): AuthToken { }
    validateToken(token: string): boolean { }
    // ... 3 more auth methods

    // Password management
    hashPassword(password: string): string { }
    verifyPassword(password: string, hash: string): boolean { }
    // ... 3 more password methods

    // Role/Permission, Session, Audit, Cache, Email, Rate limiting
    // ... 12 more methods across 6 concerns
}
```

### Refactored Solution

```typescript
// Domain types
type UserId = string & { readonly __brand: "UserId" };
type Email = string & { readonly __brand: "Email" };
enum UserRole { ADMIN = "admin", USER = "user", MODERATOR = "moderator" }

// Focused classes — one per concern
class UserRepository {
  constructor(private db: Database) {}
  save(user: User): User { }
  findById(id: UserId): User | null { }
  findByEmail(email: Email): User | null { }
  delete(id: UserId): void { }
}

class PasswordManager {
  hash(password: string): PasswordHash { }
  verify(password: string, hash: PasswordHash): boolean { }
  validate(password: string): void { }
}

// Similar focused classes: TokenService, SessionManager, RoleManager,
// AuditLog, RateLimiter — each with 3-5 methods

// Orchestrator
class AuthenticationService {
  constructor(
    private userRepo: UserRepository,
    private passwordManager: PasswordManager,
    private tokenService: TokenService,
    private sessionManager: SessionManager,
    private auditLog: AuditLog,
    private rateLimiter: RateLimiter,
    private emailService: EmailService
  ) {}

  async authenticate(email: Email, password: string): Promise<AuthToken> {
    if (!this.rateLimiter.isAllowed(email)) throw new Error("Too many attempts");

    const user = this.userRepo.findByEmail(email);
    if (!user || !this.passwordManager.verify(password, user.passwordHash)) {
      this.rateLimiter.recordAttempt(email);
      this.auditLog.logLoginAttempt(email, false);
      throw new Error("Invalid credentials");
    }

    const token = this.tokenService.generateAccessToken(user.id);
    this.sessionManager.createSession(user.id);
    this.auditLog.logLoginAttempt(email, true);
    return { accessToken: token };
  }
}
```

### Benefits

- **Focused classes** — Each has one reason to change
- **Testability** — Test PasswordManager independently, mock others
- **Extensibility** — Add new auth strategies without touching existing classes

---

## Example 3: Parameter Objects in API Handler

### The Problem

```typescript
// ❌ Long parameter list for search
function searchProducts(
  query: string, category: string, minPrice: number, maxPrice: number,
  inStock: boolean, sortBy: string, sortOrder: string, page: number, limit: number
): Product[] { }

// Call sites are error-prone
const results = searchProducts("laptop", "electronics", 500, 2000, true, "price", "asc", 1, 20);
```

### Refactored

```typescript
enum SortOrder { ASC = "asc", DESC = "desc" }
enum ProductSortField { PRICE = "price", NAME = "name", RATING = "rating", RELEVANCE = "relevance" }

interface ProductSearchCriteria {
  query: string;
  category?: string;
  priceRange?: { min: number; max: number };
  inStock?: boolean;
  sort?: { field: ProductSortField; order: SortOrder };
  pagination?: { page: number; limit: number };
}

function searchProducts(criteria: ProductSearchCriteria): Product[] { }

const results = searchProducts({
  query: "laptop",
  category: "electronics",
  priceRange: { min: 500, max: 2000 },
  inStock: true,
  sort: { field: ProductSortField.PRICE, order: SortOrder.ASC },
  pagination: { page: 1, limit: 20 }
});
```
