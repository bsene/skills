# Refactoring Decision Guide: Choosing the Right Pattern

When you spot something that needs refactoring, use this guide to pick the right technique(s).

## Common Refactoring Scenarios

### Scenario 1: Long Method (20+ lines)

**Step 1: Can you break it into logical sections?**
- Yes → **Extract Method** (pull out each section)
- No (it's one complex operation) → **Simplify Conditional** or **Introduce Variable**

**Step 2: After extraction, do you see type/status checks?**
- Yes → Consider **Replace Conditional with Polymorphism**

**Example path:**
```
Original: 40-line method
  ↓ Extract Method (3x)
Three 10-15 line methods
  ↓ Simplify Conditional on one
Two 8-10 line methods + one 5-line method
  ✓ Done
```

---

### Scenario 2: Large Class (20+ methods, 500+ lines)

**Step 1: Are there clear groups of related fields/methods?**
- Yes → **Extract Class** for each group
- No → Reread the class; usually there are groups you missed

**Step 2: Do extracted classes mostly use fields from the original?**
- Yes, consistently → Move those fields with **Move Field**
- Some methods should move → **Move Method**

**Example path:**
```
Original: UserService (20 methods)
  - 5 password methods
  - 8 persistence methods
  - 4 email methods
  - 3 cache methods
  ↓ Extract Class 4x
PasswordManager, UserRepository, EmailService, CacheService
  ↓ Move Method (adjust any that don't belong)
Final: Focused classes with clear responsibilities
```

---

### Scenario 3: Complex Conditional (nested if/else, 3+ levels)

**Quick decision tree:**

```
Is it checking object type/class?
  Yes → Replace Conditional with Polymorphism
  No ↓
Is it checking status/state?
  Yes → Replace Conditional with Polymorphism (or Introduce Variable for each state)
  No ↓
Is nesting >2 levels deep?
  Yes → Simplify Conditional (guard clauses, extract conditions)
  No ↓
Is the condition complex/repeated?
  Yes → Introduce Variable (name the condition)
  No → Consider Extract Method (logic is simple but long)
```

**Example:**
```typescript
// ❌ Complex nested
if (user) {
  if (user.isActive) {
    if (user.account.isPremium) {
      if (user.account.stripeStatus === 'active') {
        // do premium thing
      }
    }
  }
}

// ✅ After Simplify Conditional (guard clauses)
if (!user || !user.isActive) return;
if (!user.account.isPremium) return;
if (user.account.stripeStatus !== 'active') return;
// do premium thing

// ✅ Or with Introduce Variable
const isPremiumActive = user?.isActive && user.account?.isPremium &&
                        user.account.stripeStatus === 'active';
if (isPremiumActive) {
  // do premium thing
}
```

---

### Scenario 4: Scattered Duplicate Logic

**Step 1: Is it the exact same code repeated?**
- Yes → **Extract Method** (once, call from multiple places)
- No (similar but slightly different logic) ↓

**Step 2: Is the variation based on object type?**
- Yes → **Replace Conditional with Polymorphism**
- No → **Extract Method with parameters** to handle variations

**Example path:**
```
calculateGoldDiscount() { return total * 0.15; }
calculateSilverDiscount() { return total * 0.10; }
calculateBronzeDiscount() { return total * 0.05; }
  ↓ Replace Conditional with Polymorphism
class GoldCustomer { calculateDiscount() { ... } }
class SilverCustomer { calculateDiscount() { ... } }
class BronzeCustomer { calculateDiscount() { ... } }
```

---

### Scenario 5: Method Using Another Class's Data

**Check: Which class does the method use most?**

```
class Order {
  discount: number;
  customer: Customer;

  getCustomerTax() {  // Uses customer data, not order data much
    return this.customer.calculateTax();  // Should be on Customer
  }
}

// ✓ After Move Method:
class Customer {
  calculateTax() { /* moved here */ }
}

class Order {
  customer: Customer;
  getTotal() { return this.subtotal - this.customer.calculateTax(); }
}
```

---

### Scenario 6: Hard to Understand Parameter List

**Step 1: Are the parameters conceptually related?**
- Yes (all address info, or all payment info) → **Extract Class**
- No (random mix) → **Introduce Parameter Object** or look for a missing abstraction

**Step 2: Are you passing the same group repeatedly?**
- Yes → **Extract Class** (create a dedicated type, use everywhere)
- No → Consider if **Move Method** makes sense

**Example:**
```typescript
// ❌ Scattered address parameters
connectToDatabase(host, port, username, password);
query(host, port, username, password, sql);
closeConnection(host, port, username, password);

// ✅ After Extract Class
class DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

class Database {
  constructor(config: DatabaseConfig) { }
  query(sql: string) { }
  close() { }
}
```

---

### Scenario 7: Name Doesn't Express Intent

**Decision:**

1. **Single variable/parameter** → **Rename**
2. **Complex expression** → **Introduce Variable** (give it a name), then **Rename** intermediate vars
3. **Method/function** → **Rename**, then check if **Extract Method** makes sense
4. **Class** → **Rename**, then check if **Extract Class** or **Move Class** makes sense

**Example:**
```typescript
// ❌ Poor names
const d = calculateTotal(items);
function calc(x: any): any { return x * 1.15; }

// ✅ After Rename
const totalWithTax = calculateTotalWithTax(items);
function applyTaxRate(amount: number): number { return amount * 1.15; }

// ✅ Further: Introduce Variable
const TAX_RATE = 1.15;
function applyTaxRate(amount: number): number { return amount * TAX_RATE; }
```

---

## Refactoring Sequence (Priority Order)

When you spot multiple issues, apply patterns in this order:

1. **Rename** — Fix naming first (makes next steps clearer)
2. **Extract Method/Variable** — Break up long code
3. **Simplify Conditional** — Reduce nesting and complexity
4. **Extract Class** — Separate concerns
5. **Move Method/Field** — Adjust responsibilities
6. **Replace Conditional** — Introduce polymorphism

This order often reveals opportunities for later patterns.

---

## Anti-Patterns: When NOT to Refactor

- **Small, one-off code**: Extracting 3 lines into a method adds more noise than clarity
- **Unstable code**: Don't refactor code that's about to change; refactor after it stabilizes
- **Code under test**: Refactor *and* update tests together
- **Performance-critical path**: Profile first; refactoring for clarity might hurt performance
- **Coming from code review**: Be explicit: "Refactoring for clarity, no behavior change"

---

## Validation: How to Know You're Done

After refactoring, check:

- ✅ Every method has a single, clear responsibility
- ✅ Every class has one reason to change (SRP)
- ✅ No duplicate logic (DRY)
- ✅ Names express intent (Rename applied everywhere needed)
- ✅ No deep nesting (guard clauses, extract methods)
- ✅ Type checks are centralized (if polymorphism applies)
- ✅ Tests still pass, and you added tests for extracted methods
