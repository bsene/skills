---
name: typescript-solid
description: SOLID principles for reducing coupling and improving testability—SRP, OCP, LSP, ISP, and DIP with TypeScript examples.
triggers:
  - SOLID
  - SRP
  - OCP
  - LSP
  - ISP
  - DIP
  - single responsibility principle
  - open-closed principle
  - Liskov substitution
  - interface segregation
  - dependency inversion
  - god class
  - fat interface
  - one reason to change
  - extend without modifying
  - depend on abstractions
  - interface too large
  - reduce coupling
  - improve testability
---

# SOLID Principles

## Quick Reference

| Principle | Rule | Signal it's violated |
|---|---|---|
| **SRP** — Single Responsibility | One reason to change | Class handles auth, hashing, and persistence |
| **OCP** — Open–Closed | Extend via subclass; don't modify proven code | Adding CSV export requires editing `JsonFormatter` |
| **LSP** — Liskov Substitution | Subtypes substitutable without surprising callers | `instanceof` checks in calling code; subclass throws "not supported" |
| **ISP** — Interface Segregation | Many focused interfaces over one fat one | Read-only client forced to implement write methods |
| **DIP** — Dependency Inversion | Depend on abstractions, not concretions | `EmailService` directly instantiates `SendgridClient` |

## Concepts

**SRP** — One reason to change. Split `UserController` into `UserValidator`, `PasswordHasher`, `UserRepository`.

**OCP** — Extend via subclass, don't edit proven code. Add `CsvResponseFormatter extends JsonResponseFormatter` without touching the base.

**LSP** — Subtypes must be fully substitutable. `ReadOnlyCache extends Cache` violating `set()` is LSP violation—use `ReadableCache` / `WritableCache` interfaces instead.

**ISP** — Split fat interfaces into focused slices. Don't force read-only clients to depend on write methods.

**DIP** — Depend on abstractions, not concretions. `EmailService(transport: MailTransport)` not `new SendgridClient()`. Enables swapping implementations.

→ Full annotated examples for all five principles: `references/solid.md`
