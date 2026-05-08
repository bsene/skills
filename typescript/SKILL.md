---
name: typescript
description: >
  TypeScript best-practices router: error handling via union returns, strict-mode policy, runtime validation with Zod,
  monorepo contracts, domain vs DTO types, and routing to type-system/Zod sub-skills plus design-patterns and SOLID
  via oop-principles. Always-on rules cover type assertions, readonly, null vs undefined, return-type annotations,
  interface prefixes, intermediate arrays, JS general conventions, and barrel files.

  TRIGGER when: user mentions TypeScript, TS, .ts/.tsx files, type safety, type system, type narrowing,
  discriminated unions, make illegal states unrepresentable, illegal states, state machine types,
  mapped types, generics, conditional types, utility types (Partial/Pick/Omit/Record),
  Zod, schema validation, runtime validation, strict mode, strictness, ts-expect-error, ts-ignore,
  error handling without throwing, union return errors, domain vs DTO, monorepo types, api contract,
  design patterns in TypeScript, SOLID in TypeScript, typescript best practices, idiomatic TypeScript,
  any/unknown usage, type assertions, readonly, interface prefix, return type annotations,
  barrel files, barrel exports, index.ts re-exports, barrel imports.
user-invocable: false
---

# TypeScript

## Route to Sub-skills

→ **Type system** (unknown/any, narrowing, discriminated unions, mapped types…) → `type-system/` sub-skill
→ **Zod** (schema validation, transforms, coercion, branded types…) → `zod/` sub-skill
→ **Design patterns** (Strategy, Factory, Builder, Decorator, Mixin…) → `oop-principles` skill
→ **SOLID principles** (SRP, OCP, LSP, ISP, DIP) → `oop-principles` skill

---

## Error Handling

| Strategy | Caller forced to handle? | Composability |
| --- | --- | --- |
| Return `T \| null` | Yes (null check) | Low |
| Throw exception | No — easy to miss | High |
| **Return exception** `T \| ErrorA \| ErrorB` | **Yes — union exhaustion** | Medium |
| Option/Either type | Via `.flatMap` chain | High (needs library) |

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

1. Enable `"strict": true` globally; enforce in CI
2. Use `@ts-expect-error` over `@ts-ignore`
3. Track `any` usage via `@typescript-eslint/no-explicit-any`
4. Keep API/DTO types separate from domain types — map at boundaries
5. Validate external inputs (API bodies, env vars, queues) with Zod at boundaries
6. Publish domain contracts as `@org/contracts`; use project references for boundaries

```typescript
// Domain vs Transport — map at boundary
type UserDTO = { user_id: string; display_name: string; created_at: string };
type User = { id: string; name: string; createdAt: Date };

function toDomain(dto: UserDTO): User {
  return { id: dto.user_id, name: dto.display_name, createdAt: new Date(dto.created_at) };
}
```

## Read On Demand

- User example: see `references/user-example.md`.
- Zod example: see `references/zod-example.md`.

## Rules (always apply)

| Rule | File |
|---|---|
| Avoid type assertions (`as T`, `!`, `as unknown as T`) | `rules/avoid-type-assertions.md` |
| Avoid intermediate arrays on hot paths | `rules/avoid-intermediate-arrays.md` |
| Favor existing types over `as const` | `rules/favor-existing-types-over-as-const.md` |
| Use JavaScript general conventions (naming, const/let, destructuring, template literals) | `rules/js-general-conventions.md` |
| Do not prefix interfaces with `I` | `rules/no-interface-prefix.md` |
| Mark properties and arrays `readonly` to signal immutability | `rules/readonly.md` |
| Annotate function return types explicitly; enable `noImplicitAny` | `rules/explicit-return-types.md` |
| `undefined` for absence, `null` for API/external contracts | `rules/null-undefined.md` |
| Do not use barrel files (`index.ts` re-exports) | `rules/no-barrel-files.md` |
