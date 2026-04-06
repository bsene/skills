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

**SRP** — One reason to change. A `UserController` that also validates and hashes passwords needs splitting into `UserValidator`, `PasswordHasher`, and `UserRepository`.

**OCP** — Add behavior via subclass, don't edit proven code. Add `CsvResponseFormatter extends JsonResponseFormatter` without touching `JsonResponseFormatter`.

**LSP** — Every subtype must be fully substitutable for its supertype. If `ReadOnlyCache extends Cache` but throws on `set()`, it violates LSP — fix by segregating `ReadableCache` and `WritableCache` interfaces.

**ISP** — Split fat interfaces into focused slices. A `DataStore` with `read`, `write`, `delete`, `stream`, and `transaction` forces analytics dashboards (which only need `read` + `stream`) to depend on write operations they never use.

**DIP** — High-level modules depend on abstractions. `EmailService(private transport: MailTransport)` not `new SendgridClient()`. The abstraction lets you swap `SendgridTransport` for `SmtpTransport` or `NullTransport` (tests) without touching `EmailService`.

→ Full annotated examples for all five principles: `references/solid.md`
