---
name: typescript
description: >
  JavaScript & TypeScript best-practices and rule enforcement — JS idioms (naming, `this`-handling,
  module structure, nullability, iteration performance) and TS-specific type safety, runtime
  validation, and error handling. Routes to type-system and Zod sub-skills and
  `object-oriented-programming` for design patterns and SOLID.

  TRIGGER when: language (TypeScript, TS, .ts, .tsx, JavaScript, JS, .js, .mjs, .cjs, Node.js,
  browser JS, ESM, CommonJS),
  type-system (discriminated unions, generics, utility types, make illegal states unrepresentable, type narrowing,
  variance, contravariance),
  safety (strict mode, any vs unknown, ts-expect-error, ts-ignore, type assertions,
  noUncheckedIndexedAccess, noImplicitReturns),
  runtime (Zod, schema validation, runtime type checks, parse/safeParse),
  errors (error handling without throwing, union return errors, Result type),
  ts-conventions (readonly modifier, return type annotations, module organization, namespace, export default,
  interface prefix, `.d.ts`, ambient declaration, declaration file, `as const`),
  js-idioms (const/let, destructuring, optional chaining, nullish coalescing, arrow functions,
  this binding, detached method, barrel file, index.js, array chains, filter().map(), intermediate
  arrays, hot path, GC pressure, null vs undefined, sentinel value, camelCase, PascalCase),
  contracts (domain vs DTO, monorepo types, API contract types),
  composition (pipe, compose, currying, partial application, point-free, pure functions, functional mixin, factory function, object composition, monoid, merge, aggregate, reduce, fold, shopping cart merge, permissions merge, combine these objects),
  ask (idiomatic JS/TS, JS/TS conventions, JS/TS best practices, JS/TS code review,
  "compose these functions", "pipe this data", "make this more functional").
metadata:
  user-invocable: "false"
---

# JavaScript & TypeScript

Primary reference: [TypeScript docs](https://www.typescriptlang.org/docs/). Rule files below link to the specific docs section they encode; when a rule and the official docs disagree, the docs win and the rule should be updated.

## Route to Sub-skills

`type-system/` and `zod/` are reference bundles read on demand from this router — they are not independently discovered skills, so their own frontmatter is intentionally minimal (no duplicate trigger list needed).

→ **Type system** (unknown/any, narrowing, discriminated unions, mapped types…) → `type-system/SKILL.md`
→ **Zod** (schema validation, transforms, coercion, branded types…) → `zod/SKILL.md`
→ **Functional composition** (pipe/compose, currying, pure functions, factories, functional mixins, monoids…) → `composition/SKILL.md`
→ **Design patterns** (Strategy, Factory, Builder, Decorator, Mixin…) → `object-oriented-programming` skill
→ **SOLID principles** (SRP, OCP, LSP, ISP, DIP) → `object-oriented-programming` skill

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

1. Enable `"strict": true` globally; enforce in CI ([Compiler Options](https://www.typescriptlang.org/tsconfig/#strict)); layer on the flags not included in strict: [`noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess), [`noImplicitReturns`](https://www.typescriptlang.org/tsconfig/#noImplicitReturns), [`noFallthroughCasesInSwitch`](https://www.typescriptlang.org/tsconfig/#noFallthroughCasesInSwitch), [`noUnusedLocals`](https://www.typescriptlang.org/tsconfig/#noUnusedLocals), [`noUnusedParameters`](https://www.typescriptlang.org/tsconfig/#noUnusedParameters)
2. Use `@ts-expect-error` over `@ts-ignore`
3. Track `any` usage via `@typescript-eslint/no-explicit-any`
4. Keep API/DTO types separate from domain types — map at boundaries (full example: `references/user-example.md`)
5. Validate external inputs (API bodies, env vars, queues) with Zod at boundaries (full example: `zod/example.md`)
6. Publish domain contracts as `@org/contracts`; use project references for boundaries ([Project References](https://www.typescriptlang.org/docs/handbook/project-references.html))

## Read On Demand

- Domain vs. DTO mapping, full example: `references/user-example.md`.
- Zod boundary-validation example: `zod/example.md` (deeper annotated patterns in `zod/references/zod.md`).
- ECMAScript edition history (ES1 1997 → ES2025): see [MDN's JavaScript editions timeline](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript). Use when judging which edition first shipped a feature, what needs a polyfill on older runtimes, which syntax is safe for a target environment, or choosing `tsconfig` `target`/`lib`.

## Rules (JavaScript & TypeScript, always apply)

### JavaScript foundation

| Rule | File |
|---|---|
| Use JavaScript general conventions (naming, const/let, destructuring, template literals) | `rules/js-general-conventions.md` |
| Prefer explicit context (params) over implicit `this` | `rules/prefer-explicit-context-over-this.md` |
| Do not use barrel files (`index.js`/`index.ts` re-exports) | `rules/no-barrel-files.md` |
| Avoid intermediate arrays on hot paths (`filter().map()` chains) | `rules/avoid-intermediate-arrays.md` |
| `undefined` for absence, `null` for API/external contracts | `rules/null-undefined.md` |

### TypeScript-specific

| Rule | File |
|---|---|
| Avoid type assertions (`as T`, `!`, `as unknown as T`) | `rules/avoid-type-assertions.md` |
| Favor existing types over `as const` | `rules/favor-existing-types-over-as-const.md` |
| Do not prefix interfaces with `I` | `rules/no-interface-prefix.md` |
| Mark properties and arrays `readonly` to signal immutability | `rules/readonly.md` |
| Annotate function return types explicitly; enable `noImplicitAny` | `rules/explicit-return-types.md` |
| Use modules instead of namespaces; prefer named exports | `rules/module-organization.md` |
| Prefer shipped types / `@types/*`; otherwise add a minimal `.d.ts` | `rules/js-interop-declarations.md` |

---

## Benchmark

This router has no scenario of its own. Gate data lives in the leaf footers:

- `type-system/SKILL.md` → `## Benchmark` (scenario `typescript-001`, run 2026-06-14, SOFT PASS).
- `composition/SKILL.md` → `## Benchmark` (scenario `composing-software-001`, run 2026-06-25, PASS).
- Historical optimizer runs: `run-history.md`. Per-skill gate targets: `RELEASE_GATES.md`.

Gate per `skill-optimizer/release-gates.md`.
