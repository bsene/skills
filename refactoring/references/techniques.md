# Refactoring Techniques

Tools to improve code design, clarity, and maintainability. Smells live in [smells.md](smells.md).

---

## Technique #1: Extract Method / Function

**When:** clear-purpose section buried in larger method · same logic in 3+ places (Rule of Three) · isolating local-variable cluster · code comment describes a section.

```typescript
// ❌
function processOrder(order: Order) {
  if (order.payment.amount <= 0) throw new Error("Amount must be positive");
  if (!order.payment.cardToken) throw new Error("Card required");
  if (order.payment.amount > order.payment.cardLimit) throw new Error("Exceeds card limit");
}

// ✅
function processOrder(order: Order) { validatePayment(order.payment); }
function validatePayment(payment: Payment) {
  if (payment.amount <= 0) throw new Error("Amount must be positive");
  if (!payment.cardToken) throw new Error("Card required");
  if (payment.amount > payment.cardLimit) throw new Error("Exceeds card limit");
}
```

**Payoff:** shorter, intent-bearing names, isolated tests, one place to change.

---

## Technique #2: Extract Class

**When:** multiple reasons to change · subset of fields only used together · same parameter group passes repeatedly · complex to instantiate/test.

```typescript
// ❌ Order owns two address sextuples
class Order {
  id; customerId; items;
  shippingStreet; shippingCity; shippingZip;
  billingStreet; billingCity; billingZip;
}

// ✅ Address is reusable
class Address { street; city; zip; }
class Order {
  id; customerId; items;
  shippingAddress: Address; billingAddress: Address;
}
```

**Payoff:** focused class, reusable type, clearer dependencies.

---

## Technique #3: Replace Conditional with Polymorphism

**When:** `if/switch` on type or status · same shape repeated across functions · adding a new case requires editing multiple places (OCP violation).

```typescript
// ❌
function calculateDiscount(customer: Customer): number {
  if (customer.type === "gold") return customer.totalSpent * 0.15;
  if (customer.type === "silver") return customer.totalSpent * 0.10;
  if (customer.type === "bronze") return customer.totalSpent * 0.05;
  return 0;
}

// ✅
interface Customer { calculateDiscount(): number; sendNotification(msg: string): void; }
class GoldCustomer implements Customer {
  calculateDiscount() { return this.totalSpent * 0.15; }
  sendNotification(msg) { sendEmail(this.email, msg); sendSMS(this.phone, msg); }
}
class SilverCustomer implements Customer {
  calculateDiscount() { return this.totalSpent * 0.10; }
  sendNotification(msg) { sendEmail(this.email, msg); }
}

const discount = customer.calculateDiscount();
```

**Payoff:** new type = new class; existing code untouched; behavior localized.

---

## Technique #4: Introduce Variable / Extract Variable

**When:** complex expression hard to parse · same expression repeated · want a semantic name for an intermediate · precedence is confusing.

```python
# ❌
if user.age >= 18 and user.country in ["US","CA","MX"] and user.verification_status == "verified" and user.account_age_days > 30:
    allow_checkout()

# ✅
def is_eligible_for_checkout(user):
    return (user.age >= 18
            and user.country in ["US","CA","MX"]
            and user.verification_status == "verified"
            and user.account_age_days > 30)

if is_eligible_for_checkout(user): allow_checkout()
```

**Payoff:** explicit intent; reusable predicate; testable.

---

## Technique #5: Simplify Conditional Logic

**When:** nested if/else >2 levels · repeated checks · scattered early exits · boolean flags ping-ponging.

```typescript
// ❌ Pyramid
function calculateShipping(order: Order) {
  if (order.weight > 0) {
    if (order.destination !== null) {
      if (order.isPriority) return calculateExpressShipping(order);
      return calculateStandardShipping(order);
    } else throw new Error("No destination");
  } else throw new Error("Invalid weight");
}

// ✅ Guard clauses
function calculateShipping(order: Order) {
  if (order.weight <= 0) throw new Error("Invalid weight");
  if (!order.destination) throw new Error("No destination");
  if (order.isPriority) return calculateExpressShipping(order);
  return calculateStandardShipping(order);
}
```

**Payoff:** linear flow; happy path obvious; fewer indents.

---

## Technique #6: Move Method / Field

**When:** method uses more of another class's data than its own · called more from elsewhere · field belongs with related data.

```typescript
// ❌ Order computing customer-shaped logic
class Order {
  calculateCustomerDiscount() {
    return this.customer.isPremium
      ? this.items.reduce((s,i) => s + i.price, 0) * 0.15 : 0;
  }
}

// ✅ Move to Customer
class Customer {
  calculateDiscount(orderTotal: number) { return this.isPremium ? orderTotal * 0.15 : 0; }
}
class Order {
  getTotal() {
    const subtotal = this.items.reduce((s,i) => s + i.price, 0);
    return subtotal - this.customer.calculateDiscount(subtotal);
  }
}
```

**Payoff:** related data lives together; less coupling; method reusable.

---

## Technique #7: Rename (Variable, Method, Class)

**Principle:** A good name answers three questions — *why does this exist, what does it do, how is it used?* If the name requires a comment, the name does not reveal intent. — *Clean Code*, Martin, ch. 2

See [Smell #7 Uncommunicative Name](smells.md) for detection signals + the mine sweeper example.

**When:** name doesn't express intent (`calc`, `tmp`, `data`) · misleading/outdated · requires explanation · single letter/abbreviation · unit hidden (`int d` for days) · generic placeholder (`data`, `getThem`, `list1`).

```typescript
// ❌
function proc(d: any[]): any[] {
  const r = [];
  for (let i = 0; i < d.length; i++) {
    if (d[i].s === "active") r.push(d[i].amt * 1.15);
  }
  return r;
}

// ✅
const TAX_RATE = 1.15;
function calculateTaxAdjustedAmounts(orders: Order[]): number[] {
  return orders.filter(o => o.status === "active").map(o => o.amount * TAX_RATE);
}
```

**Pick the right rename** — the right name depends on which question matters:

```java
int d;                       // ❌
int elapsedTimeInDays;       // ✅ duration
int daysSinceCreation;       // ✅ age from anchor
int fileAgeInDays;           // ✅ domain framing
```

**Payoff:** code self-documents; comments restating intent become deletable.

---

## Part 2b — Additional High-Value Techniques

Compact entries for Fowler-catalog refactorings beyond the seven above.

### Inline Method / Variable

**When:** method body as clear as its name; temp variable restates the expression — indirection adds noise. Inverse of Extract.

```typescript
// ❌
function getRating(d) { return moreThanFiveLateDeliveries(d) ? 2 : 1; }
function moreThanFiveLateDeliveries(d) { return d.numberOfLateDeliveries > 5; }
// ✅
function getRating(d) { return d.numberOfLateDeliveries > 5 ? 2 : 1; }
```

---

### Change Function Declaration

**When:** name, parameter order, or set no longer matches purpose. For risky changes: introduce new function, delegate old, migrate callers, delete old.

```typescript
// ❌  circum(radius: number)
// ✅  circumference(radius: number)
```

---

### Introduce Parameter Object

**When:** same parameter group travels together across multiple functions — often the seed of a real domain concept.

```typescript
// ❌
function inRange(start: Date, end: Date, point: Date) {}
function overlaps(s1: Date, e1: Date, s2: Date, e2: Date) {}
// ✅
type DateRange = { start: Date; end: Date };
function inRange(r: DateRange, point: Date) {}
function overlaps(a: DateRange, b: DateRange) {}
```

---

### Replace Magic Literal

**When:** literal carries domain meaning. Skip for self-explanatory (`0`, `1`, `""`).

```typescript
// ❌  if (blood < 0.08) ...
// ✅  const LEGAL_BAC_LIMIT = 0.08; if (blood < LEGAL_BAC_LIMIT) ...
```

---

### Decompose Conditional

**When:** conditional has complex predicate and branches. Extract each piece into a named function.

```typescript
// ❌
if (date.before(SUMMER_START) || date.after(SUMMER_END))
  charge = quantity * winterRate + winterServiceCharge;
else charge = quantity * summerRate;

// ✅
charge = isSummer(date) ? summerCharge(quantity) : winterCharge(quantity);
```

---

### Consolidate Conditional Expression

**When:** sequence of separate conditionals all return the same result.

```typescript
// ❌
if (seniority < 2) return 0;
if (monthsDisabled > 12) return 0;
if (isPartTime) return 0;
// ✅
if (isNotEligibleForDisability()) return 0;
function isNotEligibleForDisability() { return seniority < 2 || monthsDisabled > 12 || isPartTime; }
```

---

### Remove Dead Code

**When:** code unreachable, unused export, or feature flag flipped. Delete it — version control is the archive.

---

### Remove Flag Argument

**When:** boolean (or enum) parameter selects between two distinct behaviors. Split.

```typescript
// ❌  bookConcert(customer, isPremium)
// ✅  bookConcert(customer); premiumBookConcert(customer)
```

---

### Separate Query from Modifier

**When:** function both returns a value *and* has a side effect (CQS violation).

```typescript
// ❌
function getTotalOutstandingAndSendBill(): number { const t = compute(); sendBill(t); return t; }
// ✅
function totalOutstanding(): number { return compute(); }
function sendBill(): void { sendBillFor(totalOutstanding()); }
```
