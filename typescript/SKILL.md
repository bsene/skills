---
name: typescript
description: >
  TypeScript-specific best-practices and rule enforcement — type safety, runtime validation,
  error handling, and TS-only conventions. Routes to type-system and Zod sub-skills, the
  `javascript` skill for JS-foundation rules, and `oop-principles` for design patterns and SOLID.

  TRIGGER when: language (TypeScript, TS, .ts, .tsx, idiomatic TypeScript),
  type-system (discriminated unions, generics, utility types, make illegal states unrepresentable, type narrowing),
  safety (strict mode, any vs unknown, ts-expect-error, ts-ignore, type assertions),
  runtime (Zod, schema validation, runtime type checks, parse/safeParse),
  errors (error handling without throwing, union return errors, Result type),
  ts-conventions (readonly modifier, return type annotations, interface prefix, `as const`),
  contracts (domain vs DTO, monorepo types, API contract types).
  DO NOT USE when: user asks generic JS questions with no TS angle — use `javascript` instead.
user-invocable: false
---

# TypeScript

Primary reference: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html). Rule files below link to the specific handbook section they encode; when a rule and the handbook disagree, the handbook wins and the rule should be updated.

## Route to Sub-skills

`type-system/` and `zod/` are reference bundles read on demand from this router — they are not independently discovered skills, so their own frontmatter is intentionally minimal (no duplicate trigger list needed).

→ **Type system** (unknown/any, narrowing, discriminated unions, mapped types…) → `type-system/SKILL.md`
→ **Zod** (schema validation, transforms, coercion, branded types…) → `zod/SKILL.md`
→ **JavaScript conventions** (naming, `this`-handling, barrel files, arrays, null/undefined) → `javascript` skill
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

1. Enable `"strict": true` globally; enforce in CI ([Compiler Options](https://www.typescriptlang.org/tsconfig/#strict))
2. Use `@ts-expect-error` over `@ts-ignore`
3. Track `any` usage via `@typescript-eslint/no-explicit-any`
4. Keep API/DTO types separate from domain types — map at boundaries (full example: `references/user-example.md`)
5. Validate external inputs (API bodies, env vars, queues) with Zod at boundaries (full example: `zod/example.md`)
6. Publish domain contracts as `@org/contracts`; use project references for boundaries ([Project References](https://www.typescriptlang.org/docs/handbook/project-references.html))

## Read On Demand

- Domain vs. DTO mapping, full example: `references/user-example.md`.
- Zod boundary-validation example: `zod/example.md` (deeper annotated patterns in `zod/references/zod.md`).
- ECMAScript edition history (ES1 1997 → ES2025): see `../javascript/references/ecmascript-history.md`. Use when choosing `tsconfig` `target`/`lib`, judging what downlevels vs. needs a polyfill, or which edition first shipped a feature.

## JavaScript foundation

TypeScript augments JavaScript — it does not replace JS conventions. Apply the `javascript` skill's rules (naming, `this`-handling, barrel files, intermediate arrays, null/undefined) **in addition** to the TS-specific rules below.

## Rules (TypeScript-specific, always apply)

| Rule | File |
|---|---|
| Avoid type assertions (`as T`, `!`, `as unknown as T`) | `rules/avoid-type-assertions.md` |
| Favor existing types over `as const` | `rules/favor-existing-types-over-as-const.md` |
| Do not prefix interfaces with `I` | `rules/no-interface-prefix.md` |
| Mark properties and arrays `readonly` to signal immutability | `rules/readonly.md` |
| Annotate function return types explicitly; enable `noImplicitAny` | `rules/explicit-return-types.md` |

---

## Benchmark

This router has no scenario of its own. Gate data lives in the leaf footers:

- `type-system/SKILL.md` → `## Benchmark` (scenario `typescript-001`, run 2026-06-14, SOFT PASS).
- Historical optimizer runs: `run-history.md`. Per-skill gate targets: `RELEASE_GATES.md`.

Gate per `skill-optimizer/release-gates.md`.
