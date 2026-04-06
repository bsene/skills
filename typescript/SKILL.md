---
name: typescript
description: TypeScript error handling via union returns, strictness policy, runtime validation with Zod, monorepo contracts, and domain types vs DTOs.
triggers:
  - TypeScript error handling
  - Zod validation
  - strict mode
  - runtime validation
  - domain vs DTO
  - typescript best practices
  - handle errors without throwing
  - validate API response
  - type safety
  - typescript strictness
  - ts-expect-error
  - monorepo types
  - api contract
---

# TypeScript

## Route to Sub-skills

→ **Design patterns** (Strategy, Factory, Builder, Decorator, Mixin…) → `design-patterns/` sub-skill
→ **Type system** (unknown/any, narrowing, discriminated unions, mapped types…) → `type-system/` sub-skill
→ **SOLID principles** (SRP, OCP, LSP, ISP, DIP) → `solid/` sub-skill

---

## Error Handling

| Strategy                                     | Caller forced to handle?   | Composability        |
| -------------------------------------------- | -------------------------- | --------------------- |
| Return `T | null`                           | Yes (null check)           | Low                  |
| Throw exception                              | No — easy to miss          | High                 |
| **Return exception** `T | ErrorA | ErrorB` | **Yes — union exhaustion** | Medium               |
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
```

```typescript
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
Enable `"strict": true` globally and enforce in CI. Prefer `@ts-expect-error` over `@ts-ignore`. Track and reduce `any` usage via linting.

### Domain Types vs Transport Types
Keep API/DTO types separate. Map external responses into domain objects at boundaries.

```typescript
type UserDTO = { user_id: string; display_name: string; created_at: string };
type User = { id: string; name: string; createdAt: Date };

function toDomain(dto: UserDTO): User {
  return { id: dto.user_id, name: dto.display_name, createdAt: new Date(dto.created_at) };
}
```

### Runtime Validation at Boundaries
Validate external inputs (API bodies, env vars, queues) at boundaries with Zod.

```typescript
const UserSchema = z.object({ id: z.string(), name: z.string() });
const user = UserSchema.parse(req.body);
```

### Monorepo Contracts
Publish domain contracts as `@org/contracts`. Use TypeScript project references to enforce boundaries.

### Type Debt
Track and reduce `any` usage, `null` inconsistency, and duplicate definitions via `@typescript-eslint/no-explicit-any`.

> Types are documentation. If they confuse humans, they’re failing.

## References

- User example: see `references/user-example.md`.
- Zod example: see `references/zod-example.md`.

