---
name: refactoring
description: >
  Detect and refactor code bloaters — Long Methods, Large Classes, Primitive Obsession, Long Parameter Lists, and Data Clumps.
  Provides concrete refactoring techniques with before/after examples. Use this skill whenever reviewing code, users ask "how can I simplify this?",
  show you a long method or class, ask about reducing method parameters, or mention code is getting too complex. Perfect for code review agents
  evaluating maintainability and suggesting structural improvements.
---

# Refactoring Catalog: Code Bloaters

A comprehensive guide to detecting and refactoring the five main code bloater smells that accumulate as programs evolve. Code bloaters make code harder to understand, test, and maintain.

---

## What Are Code Bloaters?

**Code bloaters** are code smells where code gradually accumulates unnecessary size and complexity. Unlike other smells that appear suddenly, bloaters creep in incrementally as a codebase evolves. They violate the Single Responsibility Principle and make code harder to change.

> "Bloaters are code, methods, and classes that have increased to such gargantuan proportions that they're hard to work with." — Refactoring Guru

The five main bloater types are:

1. **Long Method** — A method with too many lines of code
2. **Large Class** — A class with too many fields, methods, or responsibilities
3. **Primitive Obsession** — Overusing primitive types instead of small objects
4. **Long Parameter List** — Methods with too many parameters
5. **Data Clumps** — Groups of identical variables appearing together in different places

---

## Bloater #1: Long Method

### What It Is

A method that has grown beyond ~10 lines of code. The longer the method, the harder it is to understand, test, and reuse.

### How to Detect It

- Method exceeds 10-15 lines (rule of thumb; complex logic may be shorter)
- Method has multiple levels of indentation
- Method does multiple things (violates SRP)
- Hard to name the method concisely — the name is vague or overly long
- Many local variables within the method
- Difficult to test in isolation without setup

### Detection Pattern

```python
# ❌ Long Method (hard to understand)
def process_payment(order, payment_info, invoice_manager, email_service):
    # Validate payment
    if payment_info['amount'] <= 0:
        raise ValueError("Invalid amount")
    if payment_info['card_number'] is None:
        raise ValueError("Card number required")

    # Process charge
    transaction_id = gateway.charge(
        payment_info['card_number'],
        payment_info['amount'],
        payment_info['expiry']
    )

    # Update order
    order.transaction_id = transaction_id
    order.status = 'paid'
    order.paid_at = datetime.now()

    # Generate invoice
    invoice = invoice_manager.create(order, transaction_id)

    # Send confirmation
    email_service.send_order_confirmation(order)
    email_service.send_invoice(order.customer_email, invoice)

    return transaction_id
```

### Refactoring Treatment: Extract Method

Split the long method into focused, single-responsibility methods. Each extracted method should do one thing and have a clear name.

```python
# ✅ Refactored (easy to understand)
def process_payment(order, payment_info, invoice_manager, email_service):
    validate_payment_info(payment_info)
    transaction_id = charge_payment(payment_info)
    update_order_with_transaction(order, transaction_id)
    send_order_confirmation(order, invoice_manager, email_service)
    return transaction_id

def validate_payment_info(payment_info):
    if payment_info['amount'] <= 0:
        raise ValueError("Invalid amount")
    if payment_info['card_number'] is None:
        raise ValueError("Card number required")

def charge_payment(payment_info):
    return gateway.charge(
        payment_info['card_number'],
        payment_info['amount'],
        payment_info['expiry']
    )

def update_order_with_transaction(order, transaction_id):
    order.transaction_id = transaction_id
    order.status = 'paid'
    order.paid_at = datetime.now()

def send_order_confirmation(order, invoice_manager, email_service):
    invoice = invoice_manager.create(order, order.transaction_id)
    email_service.send_order_confirmation(order)
    email_service.send_invoice(order.customer_email, invoice)
```

**Payoff:** Each method is now testable in isolation, intent is clear from method names, logic is reusable.

---

## Bloater #2: Large Class

### What It Is

A class that has accumulated too many fields, methods, or lines of code. It violates Single Responsibility Principle and handles multiple concerns.

### How to Detect It

- Class has many fields (>5-7 related to different concerns)
- Class has many methods (>10-15)
- Class name is vague or includes "Manager," "Handler," "Processor," "Service"
- Multiple reasons to change the class (violates SRP)
- Hard to instantiate or test the class (requires many dependencies)
- Class mixes domain logic with infrastructure logic

### Detection Pattern

```typescript
// ❌ Large Class (too many responsibilities)
class UserService {
  private db: Database;
  private emailService: EmailService;
  private auditLog: AuditLog;
  private cache: Cache;
  private cryptoService: CryptoService;

  createUser(name: string, email: string, password: string): User {
    // validation
    // hashing
    // db insert
    // cache update
    // audit log
    // email send
  }

  updateUser(id: string, updates: Partial<User>): User { /* ... */ }
  deleteUser(id: string): void { /* ... */ }
  findUserById(id: string): User | null { /* ... */ }
  findUserByEmail(email: string): User | null { /* ... */ }
  hashPassword(password: string): string { /* ... */ }
  verifyPassword(password: string, hash: string): boolean { /* ... */ }
  resetPassword(userId: string): string { /* ... */ }
  sendWelcomeEmail(user: User): void { /* ... */ }
  sendPasswordResetEmail(user: User, token: string): void { /* ... */ }
  logAudit(action: string, userId: string): void { /* ... */ }
  cacheUser(user: User): void { /* ... */ }
  clearUserCache(userId: string): void { /* ... */ }
  // ... 20+ more methods
}
```

### Refactoring Treatment: Extract Class

Extract cohesive responsibilities into separate, focused classes.

```typescript
// ✅ Refactored (focused responsibilities)

// User domain object — pure data
type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

// Password handling
class PasswordManager {
  hash(password: string): string { /* ... */ }
  verify(password: string, hash: string): boolean { /* ... */ }
  generateResetToken(userId: string): string { /* ... */ }
}

// User persistence
class UserRepository {
  constructor(private db: Database, private cache: Cache) {}

  create(user: User): User { /* ... */ }
  update(id: string, updates: Partial<User>): User { /* ... */ }
  delete(id: string): void { /* ... */ }
  findById(id: string): User | null { /* ... */ }
  findByEmail(email: string): User | null { /* ... */ }
}

// User operations
class UserService {
  constructor(
    private userRepository: UserRepository,
    private passwordManager: PasswordManager,
    private emailService: EmailService,
    private auditLog: AuditLog
  ) {}

  registerUser(name: string, email: string, password: string): User {
    const hash = this.passwordManager.hash(password);
    const user = this.userRepository.create({ id: generateId(), name, email, passwordHash: hash, createdAt: new Date() });
    this.emailService.sendWelcomeEmail(user);
    this.auditLog.log('user_registered', user.id);
    return user;
  }

  resetPassword(userId: string): string {
    const token = this.passwordManager.generateResetToken(userId);
    const user = this.userRepository.findById(userId);
    if (user) {
      this.emailService.sendPasswordReset(user, token);
      this.auditLog.log('password_reset_requested', userId);
    }
    return token;
  }
}
```

**Payoff:** Each class is focused, easy to test, easier to extend with new functionality, clearer intent.

---

## Bloater #3: Primitive Obsession

### What It Is

Overusing primitive types (strings, integers, arrays) instead of creating small objects for domain concepts. This results in scattered validation logic and repeated patterns.

### How to Detect It

- Using string constants to represent structured data:
  ```typescript
  const status = "pending"; // Should be an enum or type
  if (status === "pending") { /* ... */ }
  ```
- Using primitive arrays as pseudo-objects:
  ```typescript
  const person = ["John", 30, "john@example.com"]; // Magic indices!
  const name = person[0];
  ```
- Validation logic scattered throughout the codebase:
  ```typescript
  if (email.includes("@") && email.includes(".")) { /* ... */ }
  // ...repeated in 5 different places
  ```
- Type information lost through generics:
  ```typescript
  const values: unknown[] = [1, "string", true]; // Type safety lost
  ```

### Refactoring Treatment: Introduce a Type/Object

Create a small object or type to represent the domain concept. Encapsulate validation logic once.

```typescript
// ❌ Primitive Obsession
function processOrder(customerId: string, items: string[], amount: number, status: string) {
  // Validation scattered everywhere
  if (customerId.length === 0) throw new Error("Invalid customer");
  if (items.length === 0) throw new Error("No items");
  if (amount <= 0) throw new Error("Invalid amount");
  if (["pending", "processing", "completed", "cancelled"].includes(status) === false) {
    throw new Error("Invalid status");
  }

  // Status checking scattered
  if (status === "pending") {
    // do something
  } else if (status === "processing") {
    // do something else
  }
  // ...
}
```

```typescript
// ✅ With proper types
enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

type Email = string & { readonly __brand: "Email" };

function createEmail(value: string): Email {
  if (!value.includes("@") || !value.includes(".")) {
    throw new Error("Invalid email");
  }
  return value as Email;
}

type CustomerId = string & { readonly __brand: "CustomerId" };

function createCustomerId(value: string): CustomerId {
  if (value.length === 0) throw new Error("Invalid customer ID");
  return value as CustomerId;
}

type Order = {
  readonly customerId: CustomerId;
  readonly items: readonly string[];
  readonly amount: number;
  readonly status: OrderStatus;
};

function processOrder(order: Order) {
  // Type system prevents invalid states
  // Validation happened at construction time

  switch (order.status) {
    case OrderStatus.PENDING:
      // Type-safe handling
      break;
    case OrderStatus.PROCESSING:
      // Type-safe handling
      break;
    // ...
  }
}
```

**Payoff:** Validation happens once at construction, type system prevents invalid states, intent is clearer, logic is not scattered.

---

## Bloater #4: Long Parameter List

### What It Is

A method or function that requires many parameters (>3-4). Long parameter lists make the interface confusing and call sites error-prone.

### How to Detect It

- Method signature exceeds 3-4 parameters
- Parameters are related to a common concept but passed separately:
  ```typescript
  function createUser(name: string, email: string, country: string, city: string, zipCode: string)
  // All address-related — should be one Address object
  ```
- Callers struggle to remember parameter order:
  ```typescript
  createOrder(customer, items, true, false, "rush", 50); // What does each boolean mean?
  ```
- Common sets of parameters repeated across multiple methods
- Hard to test — many combinations to cover

### Detection Pattern

```python
# ❌ Long Parameter List
def book_flight(
    departure_city,
    arrival_city,
    departure_date,
    return_date,
    number_of_passengers,
    cabin_class,
    is_direct_only,
    max_price,
    airline_preference,
    hotel_needed,
    hotel_city,
    hotel_check_in,
    hotel_check_out,
    car_rental_needed,
    car_rental_location,
    car_rental_type
):
    # ... 50 lines of logic
    pass

# Call site is confusing
book_flight(
    "NYC", "LAX", "2026-04-01", "2026-04-08",
    2, "business", True, 1500, "United",
    True, "LAX", "2026-04-01", "2026-04-08",
    True, "LAX", "midsize"
)
```

### Refactoring Treatment: Introduce Parameter Objects

Group related parameters into objects. Collapse boolean flags into enums.

```python
# ✅ Refactored with Parameter Objects
from enum import Enum
from dataclasses import dataclass
from datetime import date

class CabinClass(Enum):
    ECONOMY = "economy"
    BUSINESS = "business"
    FIRST = "first"

@dataclass
class FlightCriteria:
    departure_city: str
    arrival_city: str
    departure_date: date
    return_date: date | None = None
    number_of_passengers: int = 1
    cabin_class: CabinClass = CabinClass.ECONOMY
    is_direct_only: bool = False
    max_price: float | None = None
    airline_preference: str | None = None

@dataclass
class AccommodationCriteria:
    hotel_needed: bool = False
    hotel_city: str | None = None
    hotel_check_in: date | None = None
    hotel_check_out: date | None = None
    car_rental_needed: bool = False
    car_rental_location: str | None = None
    car_rental_type: str | None = None

def book_trip(flight_criteria: FlightCriteria, accommodation: AccommodationCriteria):
    # ... logic
    pass

# Call site is now self-documenting
flight = FlightCriteria(
    departure_city="NYC",
    arrival_city="LAX",
    departure_date=date(2026, 4, 1),
    return_date=date(2026, 4, 8),
    number_of_passengers=2,
    cabin_class=CabinClass.BUSINESS,
    max_price=1500,
    airline_preference="United"
)

accommodation = AccommodationCriteria(
    hotel_needed=True,
    hotel_city="LAX",
    hotel_check_in=date(2026, 4, 1),
    hotel_check_out=date(2026, 4, 8),
    car_rental_needed=True,
    car_rental_location="LAX",
    car_rental_type="midsize"
)

book_trip(flight, accommodation)
```

**Payoff:** Clearer intent at call sites, easier to test (fewer combinations), easier to extend with new parameters, self-documenting code.

---

## Bloater #5: Data Clumps

### What It Is

Groups of identical variables appearing together in different places. These should be consolidated into a single object. Data clumps signal missing abstractions.

### How to Detect It

- Same variables appear in multiple method signatures:
  ```typescript
  function connectToDatabase(host: string, port: number, username: string, password: string) { }
  function queryDatabase(host: string, port: number, username: string, password: string) { }
  function closeConnection(host: string, port: number, username: string, password: string) { }
  ```
- Same fields appear in multiple classes:
  ```typescript
  class DatabaseService {
    host: string;
    port: number;
    username: string;
    password: string;
  }

  class CacheService {
    host: string;
    port: number;
    username: string;
    password: string;
  }
  ```
- Same local variables used together:
  ```python
  def send_message(recipient_name, recipient_email, recipient_phone):
    # used together in multiple places
  ```

### Detection Pattern

```python
# ❌ Data Clump
class PaymentProcessor:
    def process_transaction(self, card_number, card_holder, exp_month, exp_year, cvv):
        # Validation
        if len(card_number) != 16:
            raise ValueError("Invalid card")
        if exp_month < 1 or exp_month > 12:
            raise ValueError("Invalid month")
        # ... more validation and processing

class PaymentValidator:
    def validate_card(self, card_number, card_holder, exp_month, exp_year, cvv):
        # Same validation logic repeated
        if len(card_number) != 16:
            raise ValueError("Invalid card")
        if exp_month < 1 or exp_month > 12:
            raise ValueError("Invalid month")

class PaymentGateway:
    def charge(self, card_number, card_holder, exp_month, exp_year, cvv, amount):
        # Uses same parameters together
        pass
```

### Refactoring Treatment: Extract Class

Create an object to represent the data clump. Move validation logic into this object.

```python
# ✅ Refactored with CreditCard object
from dataclasses import dataclass
from datetime import datetime

@dataclass
class CreditCard:
    number: str
    holder_name: str
    exp_month: int
    exp_year: int
    cvv: str

    def __post_init__(self):
        self.validate()

    def validate(self):
        if len(self.number) != 16 or not self.number.isdigit():
            raise ValueError("Invalid card number")
        if self.exp_month < 1 or self.exp_month > 12:
            raise ValueError("Invalid expiration month")
        if self.exp_year < datetime.now().year:
            raise ValueError("Card expired")
        if len(self.cvv) != 3 or not self.cvv.isdigit():
            raise ValueError("Invalid CVV")

    def is_expired(self) -> bool:
        return datetime.now().year > self.exp_year or \
               (datetime.now().year == self.exp_year and datetime.now().month > self.exp_month)

class PaymentProcessor:
    def process_transaction(self, card: CreditCard, amount: float):
        # Validation happens automatically during construction
        # No need to repeat validation logic
        if card.is_expired():
            raise ValueError("Card expired")
        # ... process with card object

class PaymentGateway:
    def charge(self, card: CreditCard, amount: float):
        # Single, clear parameter
        pass
```

**Payoff:** Validation logic lives in one place, parameters are clearer and harder to misuse, same object used consistently across the codebase, easier to extend (add new card methods in one place).

---

## Quick Reference Table

| Bloater | Detection | Refactoring | Payoff |
|---------|-----------|-------------|--------|
| **Long Method** | >10 lines, multiple responsibilities | Extract Method | Testable, reusable, clear intent |
| **Large Class** | >10 methods, multiple concerns, hard to test | Extract Class | Focused, maintainable, easier to extend |
| **Primitive Obsession** | String/int constants for domain concepts | Create Type/Object | Type-safe, validation once, intent clear |
| **Long Parameter List** | >3-4 parameters, related params | Parameter Objects/Enums | Self-documenting, testable, extensible |
| **Data Clumps** | Same variables in multiple places | Extract Class | Validation once, consistency, clarity |

---

## Code Review Workflow for Reviewers

When reviewing code for bloaters:

1. **Scan for Long Methods**
   - Check method length (aim for <10-15 lines)
   - Look for multiple indentation levels
   - Identify sections that could be extracted

2. **Check for Large Classes**
   - Count methods and fields
   - Identify multiple responsibilities (reasons to change)
   - Look for cohesion issues

3. **Watch for Primitive Obsession**
   - String/int constants representing domain concepts
   - Magic array indices
   - Scattered validation logic
   - Suggest enums, types, or small objects

4. **Examine Parameter Lists**
   - Count parameters (>3-4 is suspicious)
   - Identify related parameters that should be grouped
   - Suggest parameter objects

5. **Spot Data Clumps**
   - Look for identical variable sets across methods/classes
   - Identify missing abstractions
   - Suggest extracting into a class

**For each bloater found:**
- Explain which bloater it is
- Show why it's problematic (testability, maintainability, clarity)
- Suggest the appropriate refactoring with a concrete example
- Show before/after if possible
- Explain the payoff

---

## When NOT to Refactor

Sometimes code size is justified:

- **Complex algorithms** that genuinely need many lines (with clear comments explaining why)
- **Declarative structures** like configuration objects or test data (accept longer parameter lists)
- **Temporary code** that will be replaced soon (refactoring cost > benefit)
- **One-off utilities** where extracting adds more boilerplate than it saves

Always ask: **"Does this complexity serve the code's purpose, or does it obscure it?"**

---

## References

- **Source:** [Refactoring Guru: Code Smells - Bloaters](https://refactoring.guru/refactoring/smells/bloaters)
- **Related:** Martin Fowler's "Refactoring: Improving the Design of Existing Code"
- **Principle:** Single Responsibility Principle (SRP), DRY (Don't Repeat Yourself)
