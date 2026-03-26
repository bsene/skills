---
name: refactoring-patterns
description: >
  Master core refactoring operations: Extract Method, Extract Class, Replace Conditional with Polymorphism,
  Introduce Variable, Simplify Conditionals, Move Method, and Rename. Organized by operation type with before/after examples.
  Use when refactoring code structure, improving clarity, reducing duplication, or dealing with complex conditionals.
---

# Refactoring Patterns: Operations & Techniques

A focused guide to the seven most impactful refactoring operations. Unlike code bloaters (which are *smells* to avoid), these are *techniques* you actively apply to improve design, clarity, and maintainability.

---

## Pattern #1: Extract Method / Extract Function

### What It Is

Pull out a section of code into a separate, named method/function. This is the most frequent refactoring operation.

### When to Use

- Code section has a clear, single purpose but is buried in a larger method
- Same logic appears in multiple places (extract once, reuse everywhere)
- Method has complex local variables and you want to isolate them
- You want to test a section in isolation
- Code comment describes what a section does — that's a candidate for extraction

### Detection Pattern

```typescript
// ❌ Logic buried in larger method
function processOrder(order: Order) {
  // ... 20 lines of setup ...

  // Validate payment
  if (order.payment.amount <= 0) {
    throw new Error("Amount must be positive");
  }
  if (!order.payment.cardToken) {
    throw new Error("Card required");
  }
  if (order.payment.amount > order.payment.cardLimit) {
    throw new Error("Exceeds card limit");
  }

  // ... 20 more lines ...
}
```

### Refactoring: Extract Method

```typescript
// ✅ Validation isolated and reusable
function processOrder(order: Order) {
  // ... setup ...
  validatePayment(order.payment);
  // ... rest of logic ...
}

function validatePayment(payment: Payment) {
  if (payment.amount <= 0) {
    throw new Error("Amount must be positive");
  }
  if (!payment.cardToken) {
    throw new Error("Card required");
  }
  if (payment.amount > payment.cardLimit) {
    throw new Error("Exceeds card limit");
  }
}
```

**Payoff:** Each method is shorter, intent is clearer, validation can be tested and reused, easier to change validation logic in one place.

---

## Pattern #2: Extract Class

### What It Is

Move a group of related fields and methods into a separate class. This splits responsibilities and makes the original class simpler.

### When to Use

- Class has too many responsibilities (multiple reasons to change)
- A subset of fields are only used together in certain methods
- You find yourself passing the same group of parameters repeatedly
- Class is hard to instantiate or test due to complexity

### Detection Pattern

```typescript
// ❌ Mixed concerns in one class
class Order {
  id: string;
  customerId: string;
  items: OrderItem[];

  // Address fields scattered
  shippingStreet: string;
  shippingCity: string;
  shippingZip: string;
  billingStreet: string;
  billingCity: string;
  billingZip: string;

  getShippingAddress(): string { /* ... */ }
  getBillingAddress(): string { /* ... */ }
  updateShippingAddress(street, city, zip) { /* ... */ }
  validateShippingAddress() { /* ... */ }
  calculateShippingCost() { /* ... */ }
}
```

### Refactoring: Extract Class

```typescript
// ✅ Address responsibility extracted
class Address {
  street: string;
  city: string;
  zip: string;

  validate(): void { /* ... */ }
  toString(): string { /* ... */ }
}

class Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;

  calculateShippingCost(): void { /* ... */ }
}
```

**Payoff:** Each class is focused, easier to test, Address is reusable in other contexts, dependencies are clear.

---

## Pattern #3: Replace Conditional with Polymorphism

### What It Is

Replace if/switch statements that check object type with polymorphic method calls. The type determines which implementation runs.

### When to Use

- Multiple if/switch statements checking the same type or status
- Different behavior based on object type (animal.type === 'dog')
- Same logic repeated for different cases
- Adding a new type requires changing multiple places (violates Open/Closed Principle)

### Detection Pattern

```typescript
// ❌ Type-based conditionals scattered
function calculateDiscount(customer: Customer): number {
  if (customer.type === "gold") {
    return customer.totalSpent * 0.15;
  } else if (customer.type === "silver") {
    return customer.totalSpent * 0.10;
  } else if (customer.type === "bronze") {
    return customer.totalSpent * 0.05;
  }
  return 0;
}

function sendNotification(customer: Customer, message: string) {
  if (customer.type === "gold") {
    sendEmail(customer.email, message);
    sendSMS(customer.phone, message);
  } else if (customer.type === "silver") {
    sendEmail(customer.email, message);
  } else {
    // bronze gets nothing
  }
}
```

### Refactoring: Use Polymorphism

```typescript
// ✅ Each customer type knows its own behavior
interface Customer {
  name: string;
  totalSpent: number;
  calculateDiscount(): number;
  sendNotification(message: string): void;
}

class GoldCustomer implements Customer {
  calculateDiscount(): number {
    return this.totalSpent * 0.15;
  }

  sendNotification(message: string): void {
    sendEmail(this.email, message);
    sendSMS(this.phone, message);
  }
}

class SilverCustomer implements Customer {
  calculateDiscount(): number {
    return this.totalSpent * 0.10;
  }

  sendNotification(message: string): void {
    sendEmail(this.email, message);
  }
}

class BronzeCustomer implements Customer {
  calculateDiscount(): number {
    return this.totalSpent * 0.05;
  }

  sendNotification(message: string): void {
    // intentionally does nothing
  }
}

// Call site is now simple
const discount = customer.calculateDiscount();
customer.sendNotification(msg);
```

**Payoff:** Adding a new customer type is just a new class, no existing code changes, behavior is localized, easier to test each type in isolation, follows Open/Closed Principle.

---

## Pattern #4: Introduce Variable / Extract Variable

### What It Is

Assign an intermediate result or complex expression to a named variable. This makes intent clearer and breaks up nested logic.

### When to Use

- Complex expression is hard to read at first glance
- Same complex expression appears multiple times
- You want to give a semantic name to an intermediate result
- Expression uses multiple operators and precedence is confusing

### Detection Pattern

```python
# ❌ Hard to parse
if user.age >= 18 and user.country in ["US", "CA", "MX"] and \
   user.verification_status == "verified" and user.account_age_days > 30:
    allow_checkout()
```

### Refactoring: Introduce Variable

```python
# ✅ Clear intent
is_adult = user.age >= 18
is_allowed_region = user.country in ["US", "CA", "MX"]
is_verified = user.verification_status == "verified"
is_established = user.account_age_days > 30

if is_adult and is_allowed_region and is_verified and is_established:
    allow_checkout()

# Even better: extract to a method
def is_eligible_for_checkout(user: User) -> bool:
    return (
        user.age >= 18 and
        user.country in ["US", "CA", "MX"] and
        user.verification_status == "verified" and
        user.account_age_days > 30
    )

if is_eligible_for_checkout(user):
    allow_checkout()
```

**Payoff:** Readability improves, intent is explicit, logic can be tested separately, same condition can be reused.

---

## Pattern #5: Simplify Conditional Logic

### What It Is

Reduce nested if/else statements, remove duplication in conditions, or flatten logic flow. Common strategies: consolidate conditions, use guard clauses, remove unnecessary nesting.

### When to Use

- Multiple if/else branches doing similar things
- Deep nesting (3+ levels)
- Repeated condition checks
- Method has many early exits that aren't guard clauses
- Boolean flags are being set and checked repeatedly

### Detection Pattern: Guard Clauses

```typescript
// ❌ Nested if/else (default case buried at end)
function calculateShipping(order: Order): ShippingCost {
  if (order.weight > 0) {
    if (order.destination !== null) {
      if (order.isPriority) {
        return calculateExpressShipping(order);
      } else {
        return calculateStandardShipping(order);
      }
    } else {
      throw new Error("No destination");
    }
  } else {
    throw new Error("Invalid weight");
  }
}
```

### Refactoring: Guard Clauses (fail fast)

```typescript
// ✅ Guards at top, happy path clear
function calculateShipping(order: Order): ShippingCost {
  if (order.weight <= 0) {
    throw new Error("Invalid weight");
  }
  if (!order.destination) {
    throw new Error("No destination");
  }

  if (order.isPriority) {
    return calculateExpressShipping(order);
  }
  return calculateStandardShipping(order);
}
```

**Payoff:** Logic is easier to follow (top to bottom), invalid cases fail immediately, happy path is obvious, fewer nested levels.

---

## Pattern #6: Move Method / Move Field

### What It Is

Relocate a method or field to a class where it's more closely related or more frequently used. Reduces coupling.

### When to Use

- Method uses more data from another class than its own
- Method is called more often from another class
- Field is only used in one method and belongs with related data
- You're refactoring toward better cohesion

### Detection Pattern

```typescript
// ❌ Method belongs elsewhere
class Order {
  items: OrderItem[];
  customer: Customer;

  // This method uses mostly customer data
  calculateCustomerDiscount(): number {
    if (this.customer.isPremium) {
      return this.items.reduce((sum, item) => sum + item.price, 0) * 0.15;
    }
    return 0;
  }
}
```

### Refactoring: Move to Customer

```typescript
// ✅ Discount logic lives with customer
class Customer {
  isPremium: boolean;

  calculateDiscount(orderTotal: number): number {
    return this.isPremium ? orderTotal * 0.15 : 0;
  }
}

class Order {
  items: OrderItem[];
  customer: Customer;

  getTotal(): number {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    const discount = this.customer.calculateDiscount(subtotal);
    return subtotal - discount;
  }
}
```

**Payoff:** Related data lives together, less coupling, method is reusable in other contexts, responsibilities are clearer.

---

## Pattern #7: Rename (Variable, Method, Class)

### What It Is

Give something a clearer, more intention-revealing name. This is often the most underrated refactoring.

### When to Use

- Name doesn't express intent (e.g., `calc`, `tmp`, `data`)
- Name is misleading or outdated
- Name requires explanation (code comment says what it does)
- Single letter or abbreviation obscures meaning

### Detection Pattern

```typescript
// ❌ Poor naming requires mental mapping
function proc(d: any[]): any[] {
  const r = [];
  for (let i = 0; i < d.length; i++) {
    if (d[i].s === "active") {
      r.push(d[i].amt * 1.15); // What's being calculated?
    }
  }
  return r;
}
```

### Refactoring: Clearer Names

```typescript
// ✅ Intent is self-evident
function calculateTaxAdjustedAmounts(orders: Order[]): number[] {
  const taxAdjustedAmounts = [];
  for (const order of orders) {
    if (order.status === "active") {
      const taxRate = 1.15; // 15% tax
      taxAdjustedAmounts.push(order.amount * taxRate);
    }
  }
  return taxAdjustedAmounts;
}

// Even better with functional approach
function calculateTaxAdjustedAmounts(orders: Order[]): number[] {
  return orders
    .filter((order) => order.status === "active")
    .map((order) => order.amount * 1.15);
}
```

**Payoff:** Code is self-documenting, onboarding is faster, fewer bugs from misunderstanding, refactoring opportunities become obvious.

---

## Quick Reference: When to Use Each Pattern

| Pattern | Use When | Payoff |
|---------|----------|--------|
| **Extract Method** | Logic has single purpose, appears multiple times, or is hard to test | Reusable, testable, clearer intent |
| **Extract Class** | Class has multiple responsibilities or mixed concerns | Focused, reusable, easier to test |
| **Replace Conditional** | Same type/status check scattered in multiple places | Open/Closed Principle, localized behavior, extensible |
| **Introduce Variable** | Complex expression is hard to read or repeated | Self-documenting, testable, reusable |
| **Simplify Conditional** | Nested or complex if/else logic | Readable, fail-fast, happy path clear |
| **Move Method/Field** | Method/field belongs logically elsewhere | Better cohesion, less coupling, reusable |
| **Rename** | Name doesn't express intent | Self-documenting, faster onboarding, clearer design |

---

## Code Review Workflow

When reviewing code for refactoring opportunities:

1. **Extract Method** — Look for inline comments describing logic sections
2. **Extract Class** — Spot multiple reasons to change the class or scattered concerns
3. **Replace Conditional** — Find type/status checks repeated across methods
4. **Introduce Variable** — Find complex expressions or repeated conditions
5. **Simplify Conditional** — Count nesting levels (>2 is suspicious) and guard clauses
6. **Move Method** — Check what data/methods the method actually uses
7. **Rename** — Ask "Is this name self-documenting?" for every significant identifier

For each opportunity found:
- Identify the pattern
- Explain the current problem (readability, coupling, testability)
- Show the refactoring with a concrete before/after
- Explain the payoff

---

## References

- **Source:** [Martin Fowler's Refactoring Catalog](https://refactoring.com/catalog/) — 72+ techniques organized by operation
- **Complementary:** See `refactoring-catalog` skill for *code bloater smells* (things to avoid)
- **Principles:** Single Responsibility, Open/Closed, DRY (Don't Repeat Yourself)
