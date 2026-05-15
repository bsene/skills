# Refactoring Decision Guide

Picking the right technique once a smell is spotted.

---

## Review Workflow

1. **Detect** — scan for smells ([smells.md](smells.md))
2. **Decide** — use scenarios below
3. **Apply** — before/after + payoff per opportunity
4. **Verify** — tests pass, no duplicate logic, names express intent

---

## Scenario 1: Long Method (20+ lines)

- Logical sections? → **Extract Method** per section
- One complex operation? → **Simplify Conditional** or **Introduce Variable**
- After extraction, type/status checks remain? → **Replace Conditional with Polymorphism**

```
40-line method
  ↓ Extract Method ×3
3 × 10–15 line methods
  ↓ Simplify Conditional on one
2 × 8–10 line + 1 × 5-line method
```

---

## Scenario 2: Large Class (20+ methods)

- Clear groups? → **Extract Class** per group
- Extracted classes use original's fields? → **Move Field**
- Methods that don't belong? → **Move Method**

```
UserService (20 methods)
  → PasswordManager, UserRepository, EmailService, CacheService
```

---

## Scenario 3: Complex Conditional (nested 3+ levels)

```
Checking object type/class? → Replace Conditional with Polymorphism
Checking status/state?      → Polymorphism OR Introduce Variable per state
Nesting >2 levels?          → Simplify Conditional (guard clauses)
Complex/repeated condition? → Introduce Variable (name it)
```

```typescript
// ❌
if (user) {
  if (user.isActive) {
    if (user.account.isPremium) {
      if (user.account.stripeStatus === 'active') doIt();
    }
  }
}
// ✅ Guard clauses
if (!user || !user.isActive) return;
if (!user.account.isPremium) return;
if (user.account.stripeStatus !== 'active') return;
doIt();
```

---

## Scenario 4: Scattered Duplicate Logic

Apply **Rule of Three**:

| Occurrences | Action |
|-------------|--------|
| 1–2 | leave it; note but don't extract — two points rarely reveal the right abstraction |
| 3+ | proceed |

- Exact same code? → **Extract Method** once, call from multiple sites
- Similar, varies by type? → **Replace Conditional with Polymorphism**
- Similar, varies by data? → **Extract Method with parameters**

---

## Scenario 5: Method Uses Another Class's Data More

```typescript
// ❌ Order computes a customer concern
class Order {
  getCustomerTax() { return this.customer.calculateTax(); }
}
// ✅ Move to Customer
class Customer { calculateTax() { /* moved */ } }
```

---

## Scenario 6: Hard-to-Understand Parameter List

- Params conceptually related? → **Extract Class** (becomes a real type)
- Random mix? → **Introduce Parameter Object** or look for a missing abstraction
- Same group passed repeatedly? → **Extract Class** (use everywhere)

```typescript
// ❌ Scattered DB params
connectToDatabase(host, port, username, password);
query(host, port, username, password, sql);
// ✅
class DatabaseConfig { host; port; username; password; }
class Database {
  constructor(config: DatabaseConfig) {}
  query(sql: string) {}
}
```

---

## Scenario 7: Name Doesn't Express Intent

| Target | Apply |
|--------|-------|
| Variable / parameter | **Rename** |
| Complex expression | **Introduce Variable**, then **Rename** the intermediate |
| Method / function | **Rename**; consider **Extract Method** |
| Class | **Rename**; consider **Extract Class** / **Move Class** |

```typescript
// ❌
const d = calculateTotal(items);
function calc(x: any): any { return x * 1.15; }
// ✅
const TAX_RATE = 1.15;
const totalWithTax = calculateTotalWithTax(items);
function applyTaxRate(amount: number): number { return amount * TAX_RATE; }
```

---

## Refactoring Sequence (Priority Order)

When multiple issues present, apply in this order — each step often reveals the next:

1. **Rename** — fix naming first; later steps become clearer
2. **Extract Method / Variable** — break up long code
3. **Simplify Conditional** — reduce nesting
4. **Extract Class** — separate concerns
5. **Move Method / Field** — adjust responsibilities
6. **Replace Conditional with Polymorphism** — introduce types

See SKILL.md *When NOT to Refactor* for exceptions and guardrails.

---

## Validation Checklist

- ✅ Every method has a single, clear responsibility
- ✅ Every class has one reason to change (SRP)
- ✅ No logic duplicated 3+ times (DRY, tempered by Rule of Three)
- ✅ Names express intent
- ✅ No deep nesting (guard clauses, extracted methods)
- ✅ Type checks centralized (if polymorphism applies)
- ✅ Tests pass + new tests cover extracted methods
