---
name: typescript
description: >
  Apply design patterns, type-system features, and SOLID principles in idiomatic
  TypeScript. Use when the user asks about a named pattern (Strategy, Abstract
  Factory, Builder, Factory, Observer, Singleton, Decorator, Proxy, Mixin,
  Flyweight, Mediator), asks how to structure or decouple classes, wants to apply
  SOLID principles, or describes a problem a pattern solves: "swap algorithms at
  runtime", "create families of related objects", "notify subscribers on state
  change", "construct a complex object step-by-step", "add logging without
  modifying classes", "share behavior across unrelated classes". Also use for
  advanced type-system topics: unknown vs any, type narrowing, discriminated
  unions, mapped/conditional types, type branding, companion object pattern, and
  error-handling strategies. Based on Pro TypeScript 2nd ed. (Fenton 2018) and
  Programming TypeScript (Cherny, O'Reilly 2019), verified against TS 5.x docs.
---

# TypeScript Design Patterns & Type System

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
→ Builder + Step Builder variant: `references/builder-pattern.md`

---

## Response Format

For every pattern or type topic, provide:

1. **What it is** — one sentence
2. **When to use / NOT to use** — concrete conditions
3. **Minimal TypeScript 5+ example** — runnable
4. **Trade-offs** — gains vs. costs
5. **⚠️ Caveat** — flag any divergence from the books

---

## SOLID Principles

Apply when reviewing class design or explaining why a pattern fits.

**SRP** — One reason to change. A `UserController` that also validates and hashes passwords needs splitting.
**OCP** — Extend via subclass, don't modify proven code. Add a `CsvResponseFormatter` without editing `JsonResponseFormatter`.
**LSP** — Subtypes substitutable without surprising callers. No `instanceof` checks in calling code.
**ISP** — Many focused interfaces over one fat one. Split `AuthProvider` into `Authenticator | TokenIssuer | SessionStore`.
**DIP** — Depend on abstractions. `EmailService(private transport: MailTransport)` not `SendgridClient`.

→ Annotated examples: `references/solid.md`

---

## Pattern Summaries

### Factory

Create objects without exposing the concrete class. Use the companion object pattern to pair the type and factory under one name.

→ Full example with companion object overloads: `references/patterns.md`

### Strategy

Encapsulate interchangeable algorithms; swap at runtime.

→ Full example with RateLimiter and token-bucket strategies: `references/patterns.md`

### Abstract Factory

Interface for creating compatible product families; client knows nothing of concrete classes.

→ Full example with cross-platform Button/Modal UI families: `references/patterns.md`

### Builder

Fluent step-by-step construction; centralises validation; returns an immutable product.

→ Full example + Step Builder (compile-time required-field safety): `references/builder-pattern.md`

### Companion Object Pattern

TypeScript's separate type/value namespaces let you bind the same name to both a type and a utility object. Import both with one statement.

→ Full example: `references/type-system.md` → Companion Object Pattern

### Real Mixins ⚠️

Use the class-expression pattern only. Legacy `applyMixins` has no `super()` and is now marked outdated in the official handbook.

"is-a" → inheritance · "has-a" → delegation · "can-do" → mixin.

→ Full example with Cacheable and Loggable mixins: `references/patterns.md`

### Decorator (TS 5.0+ Standard API) ⚠️

Cross-cutting concerns applied declaratively. No flag needed.

Frameworks using DI-style `@inject` (Angular, NestJS, typeorm) still require `"experimentalDecorators": true`. The two APIs are not interoperable.

→ Full example with complete API comparison table: `references/patterns.md`

---

## Type System

- **unknown > any** — force narrowing before use; right type for API responses and JSON.parse
- **Discriminated unions** — literal tag field; exhaustiveness via assertNever
- **Mapped/conditional types** — Partial, Readonly, infer, Awaited — built-in and custom
- **Type branding** — prevent structural aliasing for IDs and tokens at zero runtime cost

→ Full examples with narrowing, type guards, widening, escape hatches: `references/type-system.md`

---

## Error Handling

| Strategy                                     | Caller forced to handle?   | Composability        |
| -------------------------------------------- | -------------------------- | -------------------- |
| Return `T \| null`                           | Yes (null check)           | Low                  |
| Throw exception                              | No — easy to miss          | High                 |
| **Return exception** `T \| ErrorA \| ErrorB` | **Yes — union exhaustion** | Medium               |
| Option/Either type                           | Via `.flatMap` chain       | High (needs library) |

**Return exceptions (preferred for expected failures):**

```typescript
class BadRequestError extends Error {
  readonly status = 400 as const;
}
class UnauthorizedError extends Error {
  readonly status = 401 as const;
}
class NotFoundError extends Error {
  readonly status = 404 as const;
}

function resolveUser(
  token: string,
  id: string,
): User | BadRequestError | UnauthorizedError | NotFoundError {
  if (!id.trim()) return new BadRequestError("Missing user ID");
  if (!isValidJwt(token)) return new UnauthorizedError("Invalid token");
  const user = userStore.get(id);
  if (!user) return new NotFoundError(`User ${id} not found`);
  return user;
}

const result = resolveUser(authHeader, userId);
if (result instanceof BadRequestError) res.status(400).send(result.message);
else if (result instanceof UnauthorizedError)
  res.status(401).send(result.message);
else if (result instanceof NotFoundError) res.status(404).send(result.message);
else res.status(200).json(result);
```

---

## Generics

Generic fetch wrapper (`apiFetch<T>`), generic Repository interface, branded RouteParam. TS 5.x `const` type parameters preserve literal route/method types — use for route config objects.

→ Full examples: `references/patterns.md` → Generics section

---

**Open recursion** — `this.method()` dispatches to the most-derived class. **Delegation** — pass `this` into a collaborator so it can call back. Prefer when "has-a" applies. **Structural polymorphism** — explicit `implements` is optional; shape compatibility is enough.

---

## TypeScript at Scale

### Strictness as Policy

Enable `"strict": true` globally. Enforce in CI so regressions are blocked before merge. Prefer `@ts-expect-error` (fails if the error disappears) over `@ts-ignore` (silently stale). Track `any` usage as a metric and reduce it continuously via linting.

### Domain Types vs Transport Types

Keep API/DTO types separate from domain models. Map external responses into domain objects at architectural boundaries — don't let wire-format shapes leak into business logic.

```typescript
// Transport (DTO) — mirrors the API wire format
type UserDTO = { user_id: string; display_name: string; created_at: string };

// Domain — owned by the application
type User = { id: string; name: string; createdAt: Date };

function toDomain(dto: UserDTO): User {
  return {
    id: dto.user_id,
    name: dto.display_name,
    createdAt: new Date(dto.created_at),
  };
}
```

### Runtime Validation at Boundaries

TypeScript is compile-time only. Validate external inputs (API bodies, env vars, message queues) at entry points with a schema library (e.g., Zod). Never trust inbound shapes.

```typescript
import { z } from "zod";

const UserSchema = z.object({ id: z.string(), name: z.string() });

// In an API handler — validated once, typed for the rest of the app
const user = UserSchema.parse(req.body); // throws ZodError on mismatch
```

### Monorepo Contracts

In a monorepo, publish domain contracts as a dedicated package (e.g., `@org/contracts`) shared by frontend, backend, and services. Use TypeScript project references to make boundaries explicit and enforce that packages don't import deeply across each other.

Version shared types semantically: deprecate before removing, and communicate breaking changes before merging.

### Type Debt

Track type debt like failing tests: measure excessive `any` usage, inconsistent `null` handling, and duplicate type definitions. Reduce via linting rules (`@typescript-eslint/no-explicit-any`) and gradual refactoring — don't let it accumulate silently.

> Types are documentation. If they confuse humans, they're failing.

