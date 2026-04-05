---
name: comments-smells
description: >
  Detect and fix "Comments" code smells — comments that explain what code does instead of why.
  Trigger when: user shares code with heavy comments, asks about comment best practices,
  wants a code review for readability/clarity, asks "are my comments too much?",
  pastes code and asks how to make it cleaner or more self-documenting.
---

# Comments Code Smell — Detection & Refactoring

A **Comments smell** occurs when comments explain _what_ the code does rather than _why_ a
decision was made — a sign the code structure needs refactoring, not annotation.

## Detection Checklist

- Comment above a code block describing what it does → **Extract Method**
- Comment explaining a complex expression → **Extract Variable**
- Method purpose unclear from its name → **Rename Method**
- Comment describing a required precondition → **Introduce Assertion**
- Comment documenting expected behavior or edge cases → **Write Tests**
- Commented-out code → ask user if it can be deleted
- Outdated or misleading comment → delete

---

## Refactoring Techniques

### 1. Extract Variable

```typescript
// Before
if (user.age >= 18 && user.country === "FR" && !user.isBanned) {
  // check if user can access adult content in France
  allowAccess();
}

// After
const canAccessAdultContentInFrance =
  user.age >= 18 && user.country === "FR" && !user.isBanned;
if (canAccessAdultContentInFrance) {
  allowAccess();
}
```

### 2. Extract Method

```typescript
// Before
function processOrder(order: Order) {
  // validate order items
  for (const item of order.items) {
    if (item.quantity <= 0) throw new Error("Invalid quantity");
    if (item.price < 0) throw new Error("Invalid price");
  }
  // calculate total
  const total = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

// After
function processOrder(order: Order) {
  validateOrderItems(order.items);
  const total = calculateOrderTotal(order.items);
}

function validateOrderItems(items: OrderItem[]) {
  for (const item of items) {
    if (item.quantity <= 0) throw new Error("Invalid quantity");
    if (item.price < 0) throw new Error("Invalid price");
  }
}

function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}
```

### 3. Rename Method

```typescript
// Before
function process(x: number): number {
  // converts celsius to fahrenheit
  return (x * 9) / 5 + 32;
}

// After
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}
```

### 4. Introduce Assertion

```typescript
// Before
setDiscount(rate: number) {
  // rate must be between 0 and 1
  this.discount = rate;
}

// After
setDiscount(rate: number) {
  if (rate < 0 || rate > 1) throw new RangeError("Discount rate must be between 0 and 1");
  this.discount = rate;
}
```

### 5. Write Tests as Executable Comments

```typescript
// Before
function calculateDiscount(price: number, percentage: number): number {
  // percentage must be 0-100, not 0-1
  return price * (1 - percentage / 100);
}

// After
it("expects percentage as 0-100, not 0-1", () => {
  expect(calculateDiscount(100, 10)).toBe(90); // 10% off
  expect(calculateDiscount(100, 0)).toBe(100);
  expect(calculateDiscount(100, 100)).toBe(0);
});
```

---

## When Comments Are Legitimate

Do **not** remove comments that:

- Explain **why** a decision was made (business rule, workaround, regulatory requirement)
  ```typescript
  // Using SHA-1 here for legacy API compatibility — their endpoint doesn't support SHA-256
  ```
- Explain a **genuinely complex algorithm** where simpler alternatives were exhausted
- Document **public API surface** (JSDoc for libraries/SDKs)
- Reference **external context** (ticket numbers, spec references, legal requirements)
- Specify **order of execution** or constraints not inferable from the code
- Are **TODO comments** — never remove automatically; require manual human decision

> "The whole point is not to delete comments, but to obviate them and then delete them." — Tim Ottinger

---

## Review Workflow

1. **Scan all comments** — list each one with type (what/why/how/outdated)
2. **Classify each**:
   - ✅ Legitimate (explains _why_, complex algorithm, API doc)
   - ⚠️ Smell — explains _what_ (refactor candidate)
   - ❌ Outdated / misleading (delete)
3. **For each smell**, suggest the refactoring technique with a concrete before/after
4. **Summarize** how the code becomes more intuitive without the comments

---

## Quick Reference

| Comment explains...         | Action               |
| --------------------------- | -------------------- |
| A complex expression        | Extract Variable     |
| What a code block does      | Extract Method       |
| What a method does          | Rename Method        |
| A required precondition     | Introduce Assertion  |
| Expected behavior/edge case | Write Tests          |
| Why a design was chosen     | ✅ Keep it           |
| A complex, irreducible algo | ✅ Keep it           |
| Something outdated/wrong    | ❌ Delete it         |
