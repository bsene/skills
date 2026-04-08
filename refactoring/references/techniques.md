# Refactoring Techniques

## Part 2 — Refactoring Techniques

Refactoring techniques are the tools you actively apply to improve code design, clarity, and maintainability. While Part 1 catalogs *smells to avoid*, Part 2 catalogs *techniques to apply*.

### Technique #1: Extract Method / Extract Function

#### What It Is

Pull out a section of code into a separate, named method/function. This is the most frequent refactoring operation.

#### When to Use

- Code section has a clear, single purpose but is buried in a larger method
- Same logic appears in **3+ places** (Rule of Three — wait until the third occurrence before extracting; two duplicates rarely reveal the right abstraction)
- Method has complex local variables and you want to isolate them
- You want to test a section in isolation
- Code comment describes what a section does — that's a candidate for extraction

#### Detection Pattern

```typescript
function processOrder(order: Order) {

  if (order.payment.amount <= 0) {
    throw new Error("Amount must be positive");
  }
  if (!order.payment.cardToken) {
    throw new Error("Card required");
  }
  if (order.payment.amount > order.payment.cardLimit) {
    throw new Error("Exceeds card limit");
  }

}
```

#### Refactoring: Extract Method

```typescript
function processOrder(order: Order) {
  validatePayment(order.payment);
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

### Technique #2: Extract Class

#### What It Is

Move a group of related fields and methods into a separate class. This splits responsibilities and makes the original class simpler.

#### When to Use

- Class has too many responsibilities (multiple reasons to change)
- A subset of fields are only used together in certain methods
- You find yourself passing the same group of parameters repeatedly
- Class is hard to instantiate or test due to complexity

#### Detection Pattern

```typescript
class Order {
  id: string;
  customerId: string;
  items: OrderItem[];

  shippingStreet: string;
  shippingCity: string;
  shippingZip: string;
  billingStreet: string;
  billingCity: string;
  billingZip: string;

}
```

#### Refactoring: Extract Class

```typescript
class Address {
  street: string;
  city: string;
  zip: string;

}

class Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;

}
```

**Payoff:** Each class is focused, easier to test, Address is reusable in other contexts, dependencies are clear.

---

### Technique #3: Replace Conditional with Polymorphism

#### What It Is

Replace if/switch statements that check object type with polymorphic method calls. The type determines which implementation runs.

#### When to Use

- Multiple if/switch statements checking the same type or status
- Different behavior based on object type (animal.type === 'dog')
- Same logic repeated for different cases
- Adding a new type requires changing multiple places (violates Open/Closed Principle)

#### Detection Pattern

```typescript
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
  }
}
```

#### Refactoring: Use Polymorphism

```typescript
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
  }
}

const discount = customer.calculateDiscount();
customer.sendNotification(msg);
```

**Payoff:** Adding a new customer type is just a new class, no existing code changes, behavior is localized, easier to test each type in isolation, follows Open/Closed Principle.

---

### Technique #4: Introduce Variable / Extract Variable

#### What It Is

Assign an intermediate result or complex expression to a named variable. This makes intent clearer and breaks up nested logic.

#### When to Use

- Complex expression is hard to read at first glance
- Same complex expression appears multiple times
- You want to give a semantic name to an intermediate result
- Expression uses multiple operators and precedence is confusing

#### Detection Pattern

```python
# ❌ Hard to parse
if user.age >= 18 and user.country in ["US", "CA", "MX"] and \
   user.verification_status == "verified" and user.account_age_days > 30:
    allow_checkout()
```

#### Refactoring: Introduce Variable

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

### Technique #5: Simplify Conditional Logic

#### What It Is

Reduce nested if/else statements, remove duplication in conditions, or flatten logic flow. Common strategies: consolidate conditions, use guard clauses, remove unnecessary nesting.

#### When to Use

- Multiple if/else branches doing similar things
- Deep nesting (3+ levels)
- Repeated condition checks
- Method has many early exits that aren't guard clauses
- Boolean flags are being set and checked repeatedly

#### Detection Pattern: Guard Clauses

```typescript
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

#### Refactoring: Guard Clauses (fail fast)

```typescript
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

### Technique #6: Move Method / Move Field

#### What It Is

Relocate a method or field to a class where it's more closely related or more frequently used. Reduces coupling.

#### When to Use

- Method uses more data from another class than its own
- Method is called more often from another class
- Field is only used in one method and belongs with related data
- You're refactoring toward better cohesion

#### Detection Pattern

```typescript
class Order {
  items: OrderItem[];
  customer: Customer;

  calculateCustomerDiscount(): number {
    if (this.customer.isPremium) {
      return this.items.reduce((sum, item) => sum + item.price, 0) * 0.15;
    }
    return 0;
  }
}
```

#### Refactoring: Move to Customer

```typescript
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

### Technique #7: Rename (Variable, Method, Class)

#### What It Is

Give something a clearer, more intention-revealing name. This is often the most underrated refactoring.

#### When to Use

- Name doesn't express intent (e.g., `calc`, `tmp`, `data`)
- Name is misleading or outdated
- Name requires explanation (code comment says what it does)
- Single letter or abbreviation obscures meaning

#### Detection Pattern

```typescript
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

#### Refactoring: Clearer Names

```typescript
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

function calculateTaxAdjustedAmounts(orders: Order[]): number[] {
  return orders
    .filter((order) => order.status === "active")
    .map((order) => order.amount * 1.15);
}
```

**Payoff:** Code is self-documenting, onboarding is faster, fewer bugs from misunderstanding, refactoring opportunities become obvious.

---

## Part 2b — Additional High-Value Techniques

Compact entries for common Fowler-catalog refactorings beyond the seven above. Each one: when to use, before → after.

### Inline Method / Inline Variable

**When:** A method body is as clear as its name, or a temp variable just restates an expression — the indirection adds noise without value. Inverse of Extract.

```typescript
// ❌
function getRating(driver: Driver) { return moreThanFiveLateDeliveries(driver) ? 2 : 1; }
function moreThanFiveLateDeliveries(driver: Driver) { return driver.numberOfLateDeliveries > 5; }

// ✅
function getRating(driver: Driver) { return driver.numberOfLateDeliveries > 5 ? 2 : 1; }
```

---

### Change Function Declaration

**When:** A function's name, parameter order, or parameter set no longer matches its purpose. Rename, reorder, add, or remove parameters. Migrate call sites in lockstep.

```typescript
// ❌  circum(radius: number)
// ✅  circumference(radius: number)
```

For risky changes across many call sites: introduce the new function, delegate the old to it, migrate callers, then delete the old.

---

### Introduce Parameter Object

**When:** The same group of parameters travels together across multiple functions. Bundle them into a type — often the seed of a real domain concept.

```typescript
// ❌
function inRange(start: Date, end: Date, point: Date) { ... }
function overlaps(start1: Date, end1: Date, start2: Date, end2: Date) { ... }

// ✅
type DateRange = { start: Date; end: Date };
function inRange(range: DateRange, point: Date) { ... }
function overlaps(a: DateRange, b: DateRange) { ... }
```

---

### Replace Magic Literal

**When:** A literal value (number, string) carries domain meaning that isn't obvious from context.

```typescript
// ❌  if (blood < 0.08) ...
// ✅  const LEGAL_BAC_LIMIT = 0.08;
//     if (blood < LEGAL_BAC_LIMIT) ...
```

Skip for truly self-explanatory literals (`0`, `1`, `""`).

---

### Decompose Conditional

**When:** A conditional has complex predicate and branches. Extract each piece into a named function so the structure reads like prose.

```typescript
// ❌
if (date.before(SUMMER_START) || date.after(SUMMER_END)) {
  charge = quantity * winterRate + winterServiceCharge;
} else {
  charge = quantity * summerRate;
}

// ✅
charge = isSummer(date) ? summerCharge(quantity) : winterCharge(quantity);
```

---

### Consolidate Conditional Expression

**When:** A sequence of separate conditionals all return the same result. Merge them with `&&`/`||` (and usually extract the merged predicate).

```typescript
// ❌
if (seniority < 2) return 0;
if (monthsDisabled > 12) return 0;
if (isPartTime) return 0;

// ✅
if (isNotEligibleForDisability()) return 0;
function isNotEligibleForDisability() {
  return seniority < 2 || monthsDisabled > 12 || isPartTime;
}
```

---

### Replace Temp with Query

**When:** A local variable holds the result of an expression that could be a method. Promoting it lets other methods reuse the value and shrinks the enclosing function.

```typescript
// ❌
const basePrice = quantity * itemPrice;
if (basePrice > 1000) return basePrice * 0.95;

// ✅
if (basePrice() > 1000) return basePrice() * 0.95;
function basePrice() { return quantity * itemPrice; }
```

Caveat: only when the expression is pure and cheap (or cached).

---

### Remove Dead Code

**When:** Code is unreachable, an unused export, or a feature flag long since flipped. Delete it. Version control is the archive — don't comment it out.

---

### Remove Flag Argument

**When:** A boolean (or enum) parameter selects between two distinct behaviors. Split into two clearly named functions; callers become self-documenting.

```typescript
// ❌  bookConcert(customer, isPremium)
// ✅  bookConcert(customer)
//     premiumBookConcert(customer)
```

---

### Separate Query from Modifier

**When:** A function both returns a value *and* has a side effect. Split into a pure query and a separate command (Command-Query Separation).

```typescript
// ❌
function getTotalOutstandingAndSendBill(): number {
  const total = ...;
  sendBill(total);
  return total;
}

// ✅
function totalOutstanding(): number { ... }
function sendBill(): void { sendBillFor(totalOutstanding()); }
```

Callers can now query freely without triggering side effects.

---
