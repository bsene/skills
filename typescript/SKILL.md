---
name: typescript
description: >
  TypeScript error handling strategies, strictness policy, runtime validation,
  monorepo contracts, and domain types vs DTOs. Use when the user asks about
  error handling in TypeScript ("return exceptions", "union error types",
  "T | Error pattern", "typed errors"), runtime validation ("Zod", "schema
  validation at boundaries", "validate API response"), TypeScript at scale
  ("strict mode", "ts-expect-error vs ts-ignore", "any as metric",
  "monorepo shared types", "project references", "type debt", "domain vs DTO",
  "wire format leaking into business logic"). Based on Pro TypeScript (Fenton
  2018) and Programming TypeScript (Cherny, O'Reilly 2019).
---

# TypeScript

Sub-skills — route here first if the user's question fits:

- Design patterns (Strategy, Factory, Builder, Decorator, Mixin…) → `design-patterns/` sub-skill
- Type system (unknown/any, narrowing, discriminated unions, mapped types…) → `type-system/` sub-skill
- SOLID principles (SRP, OCP, LSP, ISP, DIP) → `solid/` sub-skill

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
