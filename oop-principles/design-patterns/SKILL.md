---
name: oop-principles-design-patterns
description: >
  Design patterns — Factory, Strategy, Builder, Decorator, Singleton, Mixin, and more with problem-oriented and GoF triggers.
  TRIGGER when: user mentions design patterns, OOP design patterns, Strategy pattern, Factory pattern, Abstract Factory,
  Builder pattern, Singleton pattern, Decorator pattern, Proxy pattern, Mixin pattern, Observer pattern, Flyweight pattern,
  Mediator pattern, Companion Object, swap algorithms at runtime, create families of related objects,
  construct a complex object step-by-step, add cross-cutting behavior, share behavior across classes,
  pair a type and factory, decouple components via a hub, reuse instances to reduce memory.
user-invocable: false
---

# Design Patterns

## Quick Pattern Selector

| Problem                                          | Pattern                              |
| ------------------------------------------------ | ------------------------------------ |
| One shared instance (DB, config, logger)         | **Singleton**                        |
| Swap algorithms at runtime                       | **Strategy**                         |
| Create families of related objects               | **Abstract Factory**                 |
| Create objects without naming the concrete class | **Factory**                          |
| Construct complex objects step-by-step           | **Builder**                          |
| Pair a type and utility object under one name    | **Companion Object**                 |
| Notify subscribers on state change               | **Observer**                         |
| Add cross-cutting behavior non-invasively        | **Decorator**                        |
| Intercept/validate/log property access           | **Proxy**                            |
| Share behavior across unrelated classes          | **Mixin**                            |
| Reuse instances to reduce memory                 | **Flyweight**                        |
| Decouple via a central hub                       | **Mediator**                         |

→ Full pattern examples with trade-offs: `references/patterns.md`

---

## Response Format

For every pattern question, provide:

1. **What it is** — one sentence
2. **When to use / NOT to use** — concrete conditions
3. **Minimal example** — runnable, in the user's language
4. **Trade-offs** — gains vs. costs
5. **⚠️ Caveat** — flag any language-specific nuance

---

## Pattern Summaries

**Factory** — Create objects without naming the concrete class at the call site. Decouples construction from usage; makes swapping implementations easy (test doubles, alternate providers). Pair with companion object to group type + factory under one import.

```typescript
interface Logger { log(msg: string): void; }

function createLogger(env: "prod" | "test"): Logger {
  return env === "prod" ? new CloudLogger() : new SilentLogger();
}
```

→ Full examples: `references/patterns.md`

---

**Strategy** — Encapsulate an interchangeable algorithm behind an interface. The caller holds a reference to the strategy and delegates to it; swapping at runtime requires only reassigning that reference — no conditionals in the caller.

```typescript
interface SortStrategy { sort(data: number[]): number[]; }

class Sorter {
  constructor(private strategy: SortStrategy) {}
  run(data: number[]) { return this.strategy.sort(data); }
}

const sorter = new Sorter(new QuickSort());
sorter.run([3, 1, 2]);
```

→ Full examples: `references/patterns.md`

---

**Observer** — An observable object maintains a subscriber list and notifies all subscribers on state change. Decouples the emitter from its consumers; consumers register at runtime without the emitter knowing who they are.

```typescript
class EventBus<T> {
  private subscribers: ((event: T) => void)[] = [];
  subscribe(fn: (event: T) => void) { this.subscribers.push(fn); }
  publish(event: T) { this.subscribers.forEach(fn => fn(event)); }
}

const bus = new EventBus<{ type: string }>();
bus.subscribe(e => console.log(e.type));
bus.publish({ type: "user.created" });
```

→ Full examples: `references/patterns.md`

---

**Builder** — Fluent step-by-step construction with validation and an immutable product at the end. Useful when a constructor would have 4+ params or when some combinations of params are invalid. The Step Builder variant enforces required fields at compile time.

```typescript
class QueryBuilder {
  private _table = "";
  private _where = "";

  from(table: string) { this._table = table; return this; }
  where(clause: string) { this._where = clause; return this; }
  build(): string { return `SELECT * FROM ${this._table} WHERE ${this._where}`; }
}

const q = new QueryBuilder().from("users").where("active = true").build();
```

→ Full examples: `references/patterns.md`

---

**Decorator** — Add cross-cutting behavior (logging, caching, rate-limiting, auth) without modifying the decorated class. Wraps the original object and delegates; multiple decorators compose. Implementation varies by language: TS 5+ standard decorators, Python `@decorator`, Java annotations.

```typescript
function logged<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    console.log(`calling with`, args);
    const result = fn(...args);
    console.log(`result`, result);
    return result;
  }) as T;
}

const add = logged((a: number, b: number) => a + b);
add(1, 2); // logs inputs + output
```

→ Full examples: `references/patterns.md`

---

**Abstract Factory** — Interface for compatible product families. Client depends on factory, never concretes. → `references/patterns.md`

**Companion Object Pattern** — Bind same name to type and utility object. One import covers both. → `references/patterns.md`

**Mixin** — Share behavior across unrelated classes without inheritance. (is-a → inheritance; has-a → delegation; can-do → mixin.) → `references/patterns.md`
