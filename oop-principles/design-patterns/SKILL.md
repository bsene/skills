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

One line each; full runnable examples + trade-offs in `references/patterns.md`.

**Factory** — Create objects without naming the concrete class at the call site. Decouples construction from usage; eases swapping implementations (test doubles, alternate providers). Pair with companion object to group type + factory under one import.

**Strategy** — Encapsulate an interchangeable algorithm behind an interface; the caller holds a reference and delegates. Swap at runtime by reassigning the reference — no conditionals in the caller.

**Observer** — Observable maintains a subscriber list and notifies all on state change. Decouples emitter from consumers; consumers register at runtime without the emitter knowing them.

**Builder** — Fluent step-by-step construction with validation and an immutable product. Use when a constructor would take 4+ params or some param combinations are invalid. Step Builder variant enforces required fields at compile time.

**Decorator** — Add cross-cutting behavior (logging, caching, rate-limiting, auth) without modifying the decorated class. Wraps and delegates; decorators compose. Implementation varies: TS 5+ standard decorators, Python `@decorator`, Java annotations.

**Abstract Factory** — Interface for compatible product families. Client depends on factory, never concretes.

**Companion Object Pattern** — Bind same name to type and utility object. One import covers both.

**Mixin** — Share behavior across unrelated classes without inheritance. (is-a → inheritance; has-a → delegation; can-do → mixin.)
