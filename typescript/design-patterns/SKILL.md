---
name: typescript-design-patterns
description: Design patterns for TypeScript—Factory, Strategy, Builder, Decorator, Singleton, Mixin, and more with problem-oriented and GoF triggers.
triggers:
  - design patterns
  - typescript design patterns
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

# TypeScript Design Patterns

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
| Add cross-cutting behavior non-invasively        | **Decorator** (TS 5+ standard)       |
| Intercept/validate/log property access           | **Proxy**                            |
| Share behavior across unrelated classes          | **Mixin** (class-expression pattern) |
| Reuse instances to reduce memory                 | **Flyweight**                        |
| Decouple via a central hub                       | **Mediator**                         |

→ Full pattern examples with trade-offs: `references/patterns.md`

---

## Response Format

For every pattern question, provide:

1. **What it is** — one sentence
2. **When to use / NOT to use** — concrete conditions
3. **Minimal TypeScript 5+ example** — runnable
4. **Trade-offs** — gains vs. costs
5. **⚠️ Caveat** — flag any TS-version or API-specific nuance

---

## Pattern Summaries

### Factory

Create objects without exposing the concrete class. Use the companion object pattern to pair the type and factory under one name.

→ Full example with companion object overloads: `references/patterns.md`

### Strategy

Encapsulate interchangeable algorithms behind an interface; swap at runtime without changing the caller.

→ Full example with RateLimiter and token-bucket strategies: `references/patterns.md`

### Abstract Factory

Interface for creating compatible product families; client depends only on the factory interface, never on concrete classes.

→ Full example with cross-platform Button/Modal UI families: `references/patterns.md`

### Builder

Fluent step-by-step construction; centralises validation; returns an immutable product. Required fields go in the constructor; optional fields as chainable setters with safe defaults; `build()` returns a frozen product.

Also covers the **Step Builder** variant for compile-time required-field enforcement.

→ Full example + Step Builder variant: `references/patterns.md`

### Companion Object Pattern

TypeScript's separate type/value namespaces let you bind the same name to both a type and a utility object. Import both with one statement.

→ Full example: `references/patterns.md`

### Real Mixins ⚠️

Use the class-expression pattern only. Legacy `applyMixins` has no `super()` and is now marked outdated in the official handbook.

"is-a" → inheritance · "has-a" → delegation · "can-do" → mixin.

→ Full example with Cacheable and Loggable mixins: `references/patterns.md`

### Decorator (TS 5.0+ Standard API) ⚠️

Cross-cutting concerns applied declaratively. No compiler flag needed for the standard API.

Frameworks using DI-style `@inject` (Angular, NestJS, typeorm) still require `"experimentalDecorators": true`. The two APIs are not interoperable.

→ Full example with complete API comparison table: `references/patterns.md`
