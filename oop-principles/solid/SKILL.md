---
name: oop-principles-solid
description: >
  SOLID principles for reducing coupling and improving testability — SRP, OCP, LSP, ISP, and DIP with annotated examples.
  TRIGGER when: user mentions SOLID, SRP, OCP, LSP, ISP, DIP, single responsibility principle, open-closed principle,
  Liskov substitution, interface segregation, dependency inversion, god class, fat interface, one reason to change,
  extend without modifying, depend on abstractions, interface too large, reduce coupling, improve testability.
user-invocable: false
---

# SOLID Principles

## Quick Reference

| Principle | Rule | Signal it's violated | Fix |
|---|---|---|---|
| **SRP** — Single Responsibility | One reason to change | Class handles auth, hashing, and persistence | Split `UserController` → `UserValidator`, `PasswordHasher`, `UserRepository` |
| **OCP** — Open–Closed | Extend via subclass; don't modify proven code | Adding CSV export requires editing `JsonFormatter` | Add `CsvResponseFormatter extends JsonResponseFormatter` without touching the base |
| **LSP** — Liskov Substitution | Subtypes substitutable without surprising callers | `instanceof` checks in calling code; subclass throws "not supported" | Split `ReadableCache` / `WritableCache` interfaces instead of `ReadOnlyCache extends Cache` |
| **ISP** — Interface Segregation | Many focused interfaces over one fat one | Read-only client forced to implement write methods | Slice fat interface; don't force read-only clients onto write methods |
| **DIP** — Dependency Inversion | Depend on abstractions, not concretions | `EmailService` directly instantiates `SendgridClient` | Inject `EmailService(transport: MailTransport)`, not `new SendgridClient()` |

→ Full annotated examples for all five principles: `references/solid.md`
