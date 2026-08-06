# Object Calisthenics

9 rules from Jeff Bay (*The ThoughtWorks Anthology*) that force better encapsulation, cohesion, and naming by constraining how you write classes/methods. Not a style guide to enforce 100% of the time — a lens to apply during review/refactor to surface bad decomposition. Examples here use TypeScript/Node.js/NestJS.

Use this to **review existing code** (flag violations, propose the refactor) or to **write new code** with the constraints on from the start. Don't lecture about the theory — show the violation and the fix.

## The 9 rules — checklist

Run code through these in order. Each one exposes a specific smell.

### 1. One level of indentation per method
- **Check**: count nested blocks (`for`/`if`/`while` inside another) in each method body.
- **Violation**: 2+ levels of nesting.
- **Fix**: Extract Method — pull the inner block into a private method named for what it does.
- **Gotcha**: this rule alone is often enough to force rule #2 and #6 to fall out naturally — extracting flattens nesting, extracted methods get small, names get more precise.

```ts
// ❌ 2 levels
function insertionSort(arr: number[]): number[] {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i - 1; j >= 0; j--) {           // 2nd level
      if (arr[j] > arr[i]) { /* ... */ }          // 3rd level
    }
  }
  return arr;
}

// ✅ extracted
function insertionSort(arr: number[]): number[] {
  for (let i = 0; i < arr.length; i++) insert(arr, i);
  return arr;
}
function insert(arr: number[], i: number): void {
  for (let j = i - 1; j >= 0; j--) swap(arr, i, j);
}
```

### 2. Don't use `else`
- **Check**: any `else`/`else if` branch.
- **Fixes, in order of preference**:
  1. **Early return / guard clause** — validate/short-circuit first, no `else` needed.
  2. **Polymorphism** — if branching on a `type`/`kind` field, replace with a class hierarchy or a strategy map (`Record<Kind, Handler>`), each branch becomes its own class/function.
  3. **Null Object / default value** — instead of `if (x) {...} else { default }`, make the default the initial value so callers never branch on it (e.g. `lineItems ?? []` in the constructor, not at every call site).
- **Gotcha**: don't force polymorphism prematurely for a two-branch guard clause — that's over-engineering. Reserve polymorphism for branching that recurs across the codebase on the same discriminant.

```ts
// ❌
function discount(customer: Customer, subtotal: number): number {
  if (customer.type === "EMPLOYEE") return subtotal - 20;
  else if (customer.type === "NON_EMPLOYEE") return subtotal - 10;
  else return subtotal;
}

// ✅ strategy map (TS-idiomatic alternative to a class hierarchy)
const DISCOUNTS: Record<CustomerType, number> = {
  EMPLOYEE: 20,
  NON_EMPLOYEE: 10,
  DEFAULT: 0,
};
const discount = (customer: Customer, subtotal: number) =>
  subtotal - (DISCOUNTS[customer.type] ?? DISCOUNTS.DEFAULT);
```

### 3. Wrap all primitives and strings (kill Primitive Obsession)
- **Check**: any primitive (`number`/`string`) parameter or field that has *validation rules* or *behavior*, not just a raw pass-through value.
- **Fix**: wrap in a Value Object (class or branded type) that validates on construction and is immutable.
- **Gotcha**: don't wrap everything — an `id: string` with no rules doesn't need a class. Wrap when there's a constraint (range, format, invariant) or domain behavior (e.g. `Money.add()`) — the DDD Value Object case.

```ts
// ❌ validation scattered, primitives leak everywhere
class SmsSubscription {
  constructor(public quantity: number, public month: number, public year: number) {
    if (quantity < 1 || quantity > 250) throw new Error("bad quantity");
    if (month < 1 || month > 12) throw new Error("bad month");
    if (year < 1970) throw new Error("bad year");
  }
}

// ✅ each rule owned by its Value Object
class Quantity {
  private constructor(readonly value: number) {}
  static of(value: number): Quantity {
    if (value < 1 || value > 250) throw new Error("Quantity must be 1-250");
    return new Quantity(value);
  }
}
// Month, Year follow the same shape
class SmsSubscription {
  constructor(readonly quantity: Quantity, readonly month: Month, readonly year: Year) {}
}
```

### 4. First-class collections
- **Check**: any class holding a `Array`/`Set`/`Map` field *plus other* member variables, or raw collections passed around and manipulated by client code (`.filter()`, `.map()` scattered outside the owning class).
- **Fix**: wrap the collection in its own class; collection-specific behavior (filtering, totals, uniqueness rules) lives there, not in the caller.

```ts
// ❌ raw array manipulated by callers everywhere
class Order { lineItems: LineItem[] = []; }
const total = order.lineItems.reduce((s, li) => s + li.price, 0); // logic leaks out

// ✅
class LineItems {
  private readonly items: LineItem[] = [];
  add(item: LineItem): void { this.items.push(item); }
  total(): Money { return this.items.reduce((s, li) => s.add(li.price), Money.zero()); }
}
```

### 5. One dot per line (Law of Demeter)
- **Check**: chained property/method access reaching through 2+ objects, e.g. `a.getFoo().getBar().doSomething()`.
- **Fix**: "Tell, don't ask" — ask the neighboring object to do the work, don't reach through it. See `tell-dont-ask.md` for the full version of this idea applied beyond just dot-chains.
- **Not a violation**: fluent builders (`builder.withX().withY().build()`) — those return the builder itself, not internal state, so they don't leak encapsulation.

```ts
// ❌ reaching through the object graph
order.getCustomer().getAddress().getCity();

// ✅ tell the neighbor
order.customerCity(); // Order asks Customer, Customer asks Address
```

### 6. Don't abbreviate
- **Check**: shortened names (`calc`, `mgr`, `idx`, `tmp`, `usr`) or names that repeat context already implied by the class (`Order.shipOrder()` instead of `Order.ship()`).
- **Fix**: if the full name feels too long to write repeatedly, that's a signal of a missing class or a misplaced responsibility — not a reason to abbreviate.

### 7. Keep entities small
- **Check**: class > ~50-150 lines, or a module/directory with too many files doing unrelated things.
- **Fix**: split by responsibility. This is a smell trigger, not a hard gate — judge by whether the class is doing one cohesive thing, not just the line count.

### 8. No class with more than 2 instance variables
- **Check**: count non-static fields per class.
- **Fix**: split into a class that owns one variable's state, and a class that coordinates two collaborators. This is the hardest rule to satisfy literally — treat it as a strong prompt to decouple, not a hard CI gate.
- **Gotcha**: NestJS services with several injected dependencies (repository, logger, event bus, config) are a *known, accepted* exception — this rule targets state/data cohesion, not DI collaborators. Don't flag constructor-injected services for this.

### 9. No getters/setters (Tell, Don't Ask)
- **Check**: methods named `getX()`/`setX()` that just return/mutate a field with no behavior, and callers that pull data out to act on it externally instead of asking the object to act.
- **Fix**: replace with behavior methods (`account.deposit(amount)` instead of `account.setBalance(account.getBalance() + amount)`). Full treatment: `tell-dont-ask.md`.
- **Watch for**: returning a mutable internal collection reference from a getter — callers can mutate it from outside, breaking encapsulation even without a setter. Return a copy, a readonly view, or better, don't expose it at all.
- **Legitimate exceptions**: DTOs / API response objects / anything crossing a serialization boundary (JSON response, ORM entity mapped to a DB row) — those exist specifically to expose data, so getters are fine there. Also fine: a getter that runs real validation logic, not a bare pass-through.

## How to apply this in review

1. Read the class/method top to bottom, flag violations rule-by-rule using the checks above — don't just recite the rule name, name which specific line violates it and why.
2. Propose the concrete refactor (Extract Method, Value Object, First-Class Collection, etc.), not just "consider improving this."
3. Prioritize: #1 (indentation) and #2 (else) are cheap wins with high signal. #8 (2 instance variables) is the most aggressive and often not worth forcing to the letter — flag it as a discussion point, not a blocking issue.
4. In NestJS/DDD contexts specifically: rule #3 (wrap primitives) maps directly to Value Objects, rule #4 (first-class collections) maps to Aggregate-owned collections, rule #9 maps to keeping Entities behavior-rich instead of anemic. Frame feedback in those terms when the codebase already uses DDD language.

## Where this sits relative to the rest of the skill

Calisthenics rules #1–2 overlap with the class-shape decision tree (`refactoring-checklist.md`) — both push you to extract and flatten. Rules #3–4 and #9 overlap with SRP and Tell Don't Ask. Treat calisthenics as the "turn the dial up" version of the same underlying principles: use it for a stricter pass once the basic class-shape and SOLID checks are clean.

## References

- Jeff Bay, *The ThoughtWorks Anthology* — original source of the 9 rules
- <https://williamdurand.fr/2013/06/03/object-calisthenics/>
- <https://developerhandbook.stakater.com/architecture/object-calisthenics.html>
