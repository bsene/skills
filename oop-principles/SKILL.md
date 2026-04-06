---
name: oop-principles
description: >
  Analyze TypeScript/JavaScript code against Dave Thomas's object-oriented principles to identify when classes should be utility functions, when data structures are overengineered, and when design patterns are unnecessary. Also apply the Tell Don't Ask principle to review encapsulation and data access patterns. Helps developers write simpler, more maintainable code by distinguishing true object-oriented design from class-oriented anti-patterns.
  Trigger when users ask about class design, want to refactor classes into functions, question whether they need a class, ask about "is this a code smell?", show you TypeScript/JavaScript code with potential design issues, discuss patterns like Decorators, Factories, or Strategy, ask about getters/setters, want to review a class for encapsulation issues, ask how to move logic closer to data, ask why code feels procedural despite using classes, or ask to refactor code with data access patterns.
---

# OO Principles

A skill for evaluating TypeScript/JavaScript code against Dave Thomas's principles for distinguishing true object-oriented design from class-oriented anti-patterns.

## Core Philosophy

Alan Kay, who coined "Object-Oriented," did not envision C++ or Java. Modern Ruby has the flexibility to move beyond class-centric design. The goal is to use **classes only when they solve the problem they're designed for** — creating multiple instances with their own state.

## The Seven Rules (Checklist)

### Rule 1: If it's not an object factory, don't use a class

**The Anti-Pattern:** A class with no constructor parameters, no instance variables, only static methods (especially common in checksum calculators, validators, or utilities).

```typescript
// ❌ Class-oriented (anti-pattern)
class ChecksumCalculator {
  static calculate(data: string): string {
    // implementation
  }

  static validate(data: string, checksum: string): boolean {
    // implementation
  }
}
```

```typescript
// ✅ Object-oriented (better)
const ChecksumCalculator = {
  calculate(data: string): string {
    // implementation
  },

  validate(data: string, checksum: string): boolean {
    // implementation
  },

  // Private helper (not exposed)
  _helperMethod(): void {
    // now hidden from consumers
  }
} as const;
```

Or use standalone functions:
```typescript
export function calculateChecksum(data: string): string {
  // implementation
}

export function validateChecksum(data: string, checksum: string): boolean {
  // implementation
}

function helperMethod(): void {
  // truly private in module scope
}
```

**Why it matters:** Standalone functions or object literals are clearer than static methods. They don't create unnecessary class instances and make it obvious you're not creating multiple objects.

---

### Rule 2: If it's named after a design pattern, don't use a class

**The Anti-Pattern:** Forcing classic Gang-of-Four patterns (Decorator, Factory, Strategy, Observer) into explicit classes when functions and composition already provide them elegantly.

**The Context:** The "Design Patterns" book solved C++'s rigidities. TypeScript handles many of these with functions and higher-order functions:

- **Decorators:** Use composition or higher-order functions instead of wrapper classes
- **Factories:** Use factory functions, not a `FactoryClass`
- **Strategy:** Pass a function instead of requiring a Strategy class
- **Command:** A function works just as well as a Command object

```typescript
// ❌ Over-engineered
class DiscountDecorator {
  constructor(private item: Item) {}

  getPrice(): number {
    return this.item.price * 0.9;
  }
}

// ✅ Simpler (composition + functions)
const applyDiscount = (item: Item) => item.price * 0.9;
const discountedPrice = applyDiscount(item);
```

Or with a higher-order function:
```typescript
// ✅ Even better (higher-order function)
const withDiscount = (discountPercent: number) => (item: Item) =>
  item.price * (1 - discountPercent / 100);

const apply10PercentDiscount = withDiscount(10);
const price = apply10PercentDiscount(item);
```

**Why it matters:** Functions are simpler to understand, test, and reuse than explicit pattern classes. They make intent clearer.

---

### Rule 3: Abstract base classes aren't always necessary

**The Anti-Pattern:** Creating a base class when composition or interfaces would work better. Inheriting tightly couples your code to the parent.

```typescript
// ❌ Over-engineered inheritance
class Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  save() { /* ... */ }
  delete() { /* ... */ }
  validate() { /* ... */ }
}

class User extends Entity {
  name: string;
  // Now coupled to Entity, inherits ~20+ methods you might not need
}
```

```typescript
// ✅ Composition is simpler
class User {
  id: string;
  name: string;
  createdAt: Date;
}

const userRepository = {
  save(user: User) { /* ... */ },
  delete(userId: string) { /* ... */ },
  validate(user: User) { /* ... */ }
};
```

**Polymorphism in TypeScript:** Structural typing means you don't need an interface for simple cases. Just implement the methods consumers expect.

```typescript
// No base class needed — just implement the interface
interface Handler {
  handle(data: Data): void;
}

function process(handler: Handler): void {
  handler.handle(data);  // Works for any object with a handle method
}
```

**Why it matters:** Composition over inheritance. You pull in only what you need, avoid tight coupling, and code is easier to test and reuse.

---

### Rule 4: No state, no class

**The Anti-Pattern:** A class with a single method that holds no state. This is just a bucket for a function.

```typescript
// ❌ "Perform" smell
class SendEmailJob {
  constructor(userId: string, template: string) {
    this.userId = userId;
    this.template = template;
  }

  perform(): void {
    // uses this.userId, this.template
  }
}

// Called as:
new SendEmailJob(user.id, "welcome").perform();

// ✅ Just a function
async function sendEmailJob(userId: string, template: string): Promise<void> {
  // same logic
}

sendEmailJob(user.id, "welcome");
```

**The Constructor Trap:** Creating a temporary object (via `new`), passing values to the constructor, calling one method, then discarding it:
- Allocates unnecessary memory
- Makes intent less clear (why a class?)
- Adds parsing/instantiation overhead

```typescript
// ❌ Wasteful
class UserRegistration {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  register(): User {
    // registration logic
  }
}

const user = new UserRegistration(email, password).register();

// ✅ Clear and efficient
async function registerUser(email: string, password: string): Promise<User> {
  // registration logic
}

const user = await registerUser(email, password);
```

**Why it matters:** Functions are clearer in intent, cheaper to call, and easier to test (no instantiation).

---

### Rule 5: If it's invalid after construction, don't use a class

**The Anti-Pattern:** A class initialized without required data that must be set via methods before use.

```typescript
// ❌ Invalid after construction
class ReportBuilder {
  private data: unknown | null = null;
  private format: string | null = null;

  setData(data: unknown): this {
    this.data = data;
    return this;
  }

  setFormat(format: string): this {
    this.format = format;
    return this;
  }

  build(): Report {
    if (!this.data) throw new Error("Data not set!");
    if (!this.format) throw new Error("Format not set!");
    // finally build
  }
}

// ✅ Use a function with all required args
function buildReport(data: unknown, format: string): Report {
  if (!data) throw new Error("Data is required");
  if (!format) throw new Error("Format is required");
  // build directly, no invalid intermediate state
}
```

Or with validation in constructor:
```typescript
// ✅ Valid from construction if you must use a class
class ReportConfig {
  constructor(
    readonly data: unknown,
    readonly format: string
  ) {
    if (!data) throw new Error("Data is required");
    if (!format) throw new Error("Format is required");
  }

  build(): Report {
    // no need to re-validate
  }
}

const config = new ReportConfig(data, format); // ✅ Valid from start
```

**Why it matters:** Objects that are "broken" immediately after construction signal poor design. Functions prevent invalid states from ever existing.

---

### Rule 6: Stop writing "Data Classes"

**The Anti-Pattern:** Writing classes full of boilerplate constructors and getters.

```typescript
// ❌ Boilerplate data class
class Person {
  name: string;
  age: number;
  email: string;

  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
}
```

**Better Approaches:**

- **Plain Objects** (simplest):
  ```typescript
  interface Person {
    name: string;
    age: number;
    email: string;
  }

  const person: Person = { name: "Alice", age: 30, email: "alice@example.com" };
  ```

- **Type Aliases** for more flexibility:
  ```typescript
  type Person = {
    name: string;
    age: number;
    email: string;
  };

  const person: Person = { name: "Alice", age: 30, email: "alice@example.com" };
  ```

- **Readonly** for immutability:
  ```typescript
  type ReadonlyPerson = Readonly<{
    name: string;
    age: number;
    email: string;
  }>;

  const person: ReadonlyPerson = { name: "Alice", age: 30, email: "alice@example.com" };
  ```

- **Separate Logic:** Don't put business logic inside the data structure.
  ```typescript
  // ❌ Logic mixed with data
  class Person {
    birthYear: number;

    getAge(): number {
      return new Date().getFullYear() - this.birthYear;
    }
  }

  // ✅ Logic in a utility function
  type Person = { birthYear: number };

  function calculateAge(person: Person): number {
    return new Date().getFullYear() - person.birthYear;
  }

  const age = calculateAge(person);
  ```

**Why it matters:** Keep data structures "dumb." Logic lives separately and is easier to test, reuse, and move. Simpler code overall.

---

### Rule 7: Test-First Design Implications

These principles have profound testing benefits:

| Pattern | Setup Complexity | Testing Burden |
|---------|------------------|---|
| Pure functions | Minimal (just pass args) | Test in isolation, no mocks needed |
| Classes with state | Complex (factories, mocks, setup) | Tangled, requires context |
| Inheritance chains | Massive (dependencies, setup) | Nightmare (mocks, factories, complex fixtures) |

```typescript
// Testing a pure function — zero setup
test("calculateChecksum", () => {
  const result = calculateChecksum("data");
  expect(result).toBe(expectedChecksum);
});

// Testing a class method — setup required
test("getUserAge", () => {
  const user = new User({ birthYear: 1990 });  // setup needed
  expect(user.getAge()).toBe(expectedAge);
});

// Testing inherited class — complex setup
test("saveUser", async () => {
  const user = createUserFactory({ /* ... */ });  // factory setup
  const mockDb = jest.fn();  // mock setup
  await user.save(mockDb);  // mocking required
  expect(mockDb).toHaveBeenCalledWith(user);
});
```

**Function-based design** is naturally testable because there's no hidden state or dependencies to mock.

---

## Tell Don't Ask (Encapsulation)

When you *do* use a class, follow the **Tell Don't Ask** principle: instead of *asking* an object for its data and then acting on it externally, *tell* the object what to do and let it use its own data internally.

This flows directly from OOP's core idea — bundle data with the behavior that operates on it. Tightly coupled data and behavior belong in the same component.

### Identifying "Ask" Style (The Problem)

Watch for external code that **queries** an object's state and then **makes decisions** based on that state:

```typescript
// ❌ Ask style (anti-pattern)
if (order.status === "pending" && order.total > 1000) {
  order.approvalQueue.push(order.id);
  order.status = "awaiting_approval";
}
```

Red flags:
- Chains of getters used to make a decision
- `if (obj.getX() > obj.getLimit())` patterns outside the class
- External code setting state after reading state (`get` then `set`)
- Logic that "belongs" to an object scattered across callers

### Applying the Refactor

Move the decision-making logic **into the object** that owns the data:

```typescript
// ✅ Tell style (better)
order.submitForApproval();

class Order {
  submitForApproval(): void {
    if (this.status === "pending" && this.total > 1000) {
      this.approvalQueue.push(this.id);
      this.status = "awaiting_approval";
    }
  }
}
```

The caller **tells** the object what to do; the object **decides** how.

### Step-by-Step Refactoring Guide

1. **Find the ask chain** — locate external code that reads object data to make a decision.
2. **Identify which object owns the data** — the class whose fields are being read.
3. **Name the intent** — what is the caller *trying to accomplish*? Name a method for that intent (e.g., `submitForApproval`, `checkAlarm`, `applyDiscount`).
4. **Move the logic in** — cut the conditional/action block and paste it into the new method on the owning class.
5. **Replace the call site** — swap the ask chain with a single tell call.
6. **Remove now-unnecessary getters** if nothing else uses them (be cautious — see nuance below).

### Nuance: When Getters Are Fine

Martin Fowler himself notes he doesn't strictly follow TDA. Query methods are legitimate when:

- An object **transforms** data for its caller (e.g., formatting, aggregation)
- The object is a **value object** or DTO whose purpose is to carry data
- You're crossing **architectural layers** (e.g., persistence, serialization)
- Removing a getter would create **convolutions** worse than the query

The goal is **co-locating behavior with data**, not eliminating all accessors. Don't become a "getter eradicator" — use judgment.

### Quick Reference Examples

| Ask (avoid) | Tell (prefer) |
|---|---|
| `if (a.value > a.limit) a.alarm.warn(...)` | `a.setValue(newVal)` — alarm logic inside `setValue` |
| `if (cart.items.length === 0) showEmpty()` | `if (cart.isEmpty()) showEmpty()` — at minimum, encapsulate the check |
| `order.status = order.computeNextStatus()` | `order.advance()` |

### When Reviewing Code

For each class under review:
1. List all getters — are any used only to make external decisions about the object?
2. Find conditional blocks that read from a single object's fields — can they move in?
3. Look for setter chains (`setA`, `setB`, `setC` in sequence) — could that be one `configure(...)` or `initialize(...)` call?

Flag violations clearly, suggest the encapsulated alternative, but note if the refactor would be overkill (e.g., trivial DTOs, framework-required accessors).

---

## Practical Workflow Advice

1. **Start Flat:** Don't design a folder hierarchy upfront. Write raw code in a single file first.
2. **Wrap When Uncomfortable:** Only extract into functions once it feels hard to manage.
3. **Use Objects First:** Before creating a class, try a **plain object literal**. It's often all you need.
   ```typescript
   const person = { name: "Alice", age: 30, email: "alice@example.com" };
   ```
4. **Metrics for Refactoring:**
   - Does this create multiple instances with their own state? → Keep it a class.
   - Does it have only static methods? → Make it a utility object or functions.
   - Does it hold zero state and do one thing? → Make it a standalone function.

---

## How to Use This Skill

When you:
- **Paste TypeScript/JavaScript code and ask "is this a code smell?"** → I'll check against all 7 rules and encapsulation patterns
- **Ask "should this be a class or a function?"** → I'll guide you through the checklist
- **Show design patterns in your code** → I'll suggest simpler approaches
- **Want to refactor a complex class** → I'll help extract logic into focused functions
- **Question whether you need a class** → I'll help you decide
- **Ask about getters, setters, or data access patterns** → I'll review for encapsulation issues using Tell Don't Ask
- **Want to move logic closer to data or reduce procedural feel** → I'll guide you toward better encapsulation
- **Ask why code feels procedural despite using classes** → I'll show you how to apply Tell Don't Ask

## Key Takeaway

> "If it's not making multiple instances, it's not a class." — Dave Thomas

Use classes for **domain objects with state**. Use functions for **behavior and utilities**. Use objects for **data structures**. Keep it simple.

---

## References

- **Source:** [Dave Thomas: Start writing Ruby (stop using classes)](https://www.youtube.com/watch?v=sjuCiIdMe_4)
- **Related Reading:** Sandi Metz's "Practical Object-Oriented Design in Ruby" (POODR)
- **Tell Don't Ask:** Martin Fowler's nuanced approach to encapsulation and TDA principle
