---
name: oop-principles-design-patterns
description: Design patterns—Factory, Strategy, Builder, Decorator, Singleton, Mixin, and more with problem-oriented and GoF triggers.
triggers:
  - design patterns
  - OOP design patterns
  - Strategy pattern
  - Factory pattern
  - Abstract Factory
  - Builder pattern
  - Singleton pattern
  - Decorator pattern
  - Proxy pattern
  - Mixin pattern
  - Observer pattern
  - Flyweight pattern
  - Mediator pattern
  - Companion Object
  - swap algorithms at runtime
  - create families of related objects
  - construct a complex object step-by-step
  - add cross-cutting behavior
  - share behavior across classes
  - pair a type and factory
  - decouple components via a hub
  - reuse instances to reduce memory
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

**Factory** — Create objects without exposing concrete classes. Pair type and factory via companion object. → `references/patterns.md`

**Strategy** — Encapsulate interchangeable algorithms; swap at runtime without changing caller. → `references/patterns.md`

**Abstract Factory** — Interface for compatible product families. Client depends on factory, never concretes. → `references/patterns.md`

**Builder** — Fluent step-by-step construction with validation and immutable product. Covers Step Builder for compile-time field enforcement. → `references/patterns.md`

**Companion Object Pattern** — Bind same name to type and utility object. One import covers both. → `references/patterns.md`

**Mixin** — Share behavior across unrelated classes without inheritance. (is-a → inheritance; has-a → delegation; can-do → mixin.) → `references/patterns.md`

**Decorator** — Cross-cutting concerns declaratively. Implementation varies by language (Python decorators, TS 5+ standard decorators, Java annotations). → `references/patterns.md`
