---
name: typescript
description: >
  JS/TS best-practices and rule enforcement — JS idioms, TS type safety, Zod runtime validation,
  error handling, and Deno workflows.

  TRIGGER when: TS/JS code; discriminated unions, generics, narrowing, any vs unknown; Zod
  parse/safeParse; Result types; readonly, `as const`, modules; destructuring, optional
  chaining; pipe/compose/currying; unit tests, mock vs stub; Deno (deno.json, permissions,
  JSR, Deno.serve, Node-to-Deno migration); or "is this idiomatic JS/TS".

  DO NOT USE for advanced generic/conditional/mapped types or compiler-error puzzles
  (`typescript-magician`), class/SOLID design (`object-oriented-programming`), or
  language-agnostic test strategy (`testing`).
metadata:
  user-invocable: "false"
---

# JavaScript & TypeScript

Primary reference: [TypeScript docs](https://www.typescriptlang.org/docs/). Rule files below link to the specific docs section they encode; when a rule and the official docs disagree, the docs win and the rule should be updated.

## Follow the project

Use the repository's configured runtime, imports, test runner, and verification commands.
Read its agent instructions and configuration before changing tooling or introducing a workflow.

## Route to Sub-skills

`type-system/` and `zod/` are reference bundles read on demand from this router — they are not independently discovered skills, so their own frontmatter is intentionally minimal (no duplicate trigger list needed).

→ **Type system** (unknown/any, narrowing, discriminated unions, mapped types…) → `type-system/SKILL.md`
→ **Total TypeScript / Matt Pocock** (type derivation, `satisfies`, generic inference, `NoInfer`, distributivity, type tests) → [references/total-typescript.md](references/total-typescript.md)
→ **Zod** (schema validation, transforms, coercion, branded types…) → `zod/SKILL.md`
→ **Functional composition** (pipe/compose, currying, pure functions, factories, functional mixins, monoids…) → `composition/SKILL.md`
→ **Node.js design patterns** (async control flow, streams, EventEmitter, DI, batching, workers, scaling) → [references/node-patterns.md](references/node-patterns.md)
→ **JS runtime mechanics** (`this`, closures, prototypes, generators, event-loop order, promises) → [references/js-runtime-mechanics.md](references/js-runtime-mechanics.md)
→ **TS language gaps** (variance, overloads, assertion functions, module resolution, type-driven design) → [references/ts-language-gaps.md](references/ts-language-gaps.md)
→ **Deno runtime** (configuration, permissions, dependencies, HTTP, tests, Node compatibility) → [references/deno.md](references/deno.md)
→ **Design patterns** (Strategy, Factory, Builder, Decorator, Mixin…) → `object-oriented-programming` skill
→ **SOLID principles** (SRP, OCP, LSP, ISP, DIP) → `object-oriented-programming` skill
→ **Testing** (unit tests, mocks vs stubs, brittle tests, test pyramid) → `testing` skill

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
4. Keep API/DTO types separate from domain types — map at boundaries (example below)
5. Validate external inputs (API bodies, env vars, queues) with Zod at boundaries (example: `zod/SKILL.md`)
6. Publish domain contracts as `@org/contracts`; use project references for boundaries ([Project References](https://www.typescriptlang.org/docs/handbook/project-references.html))

## Read On Demand

- Effect TS — use the [official documentation](https://effect.website/docs/) for typed errors, concurrency, resource management, and dependency requirements. Match the documentation version to the project's installed `effect` version before using API examples.
- Domain vs. DTO mapping example — DTO shape never leaks into the domain:

```typescript
export type UserDTO = {
  user_id: string;
  display_name: string;
  created_at: string;
};

export type User = { id: string; name: string; createdAt: Date };

export function toDomain(dto: UserDTO): User {
  return {
    id: dto.user_id,
    name: dto.display_name,
    createdAt: new Date(dto.created_at),
  };
}
```

- Zod boundary-validation example: `zod/SKILL.md`.
- Node.js runtime topics (event loop/libuv, core modules, CJS/ESM, debugging & profiling, HTTP ecosystem, npm/packaging, security): see the free ebook ["Become a Node.js developer"](https://github.com/fraxken/ebook_nodejs) ([online](https://fraxken.github.io/ebook_nodejs/)). Note: French edition is complete; English edition is partial.
- ECMAScript edition history (ES1 1997 → ES2025): see [MDN's JavaScript editions timeline](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript). Use when judging which edition first shipped a feature, what needs a polyfill on older runtimes, which syntax is safe for a target environment, or choosing `tsconfig` `target`/`lib`.

## Rules (JavaScript & TypeScript, always apply)

### JavaScript foundation

| Rule                                                                                     | File                                         |
| ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| Use JavaScript general conventions (naming, const/let, destructuring, template literals) | `rules/js-general-conventions.md`            |
| Prefer explicit context (params) over implicit `this`                                    | `rules/prefer-explicit-context-over-this.md` |
| Do not use barrel files (`index.js`/`index.ts` re-exports)                               | `rules/no-barrel-files.md`                   |
| Avoid intermediate arrays on hot paths (`filter().map()` chains)                         | `rules/avoid-intermediate-arrays.md`         |
| `undefined` for absence, `null` for API/external contracts                               | `rules/null-undefined.md`                    |

### TypeScript-specific

| Rule                                                                                          | File                                          |
| --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Avoid type assertions (`as T`, `!`, `as unknown as T`)                                        | `rules/avoid-type-assertions.md`              |
| Favor existing types over `as const`                                                          | `rules/favor-existing-types-over-as-const.md` |
| Do not prefix interfaces with `I`                                                             | `rules/no-interface-prefix.md`                |
| Mark properties and arrays `readonly` to signal immutability                                  | `rules/readonly.md`                           |
| Infer obvious local returns; annotate public APIs and risky inference; enable `noImplicitAny` | `rules/explicit-return-types.md`              |
| Use modules instead of namespaces; prefer named exports                                       | `rules/module-organization.md`                |
| Prefer shipped types / `@types/*`; otherwise add a minimal `.d.ts`                            | `rules/js-interop-declarations.md`            |

---

## Benchmark

This router has no scenario of its own. Gate data lives in the leaf footers:

- `type-system/SKILL.md` → `## Benchmark` (scenarios `typescript-001` PASS and `typescript-002` SOFT PASS, run 2026-08-31).
- `composition/SKILL.md` → `## Benchmark` (scenario `composing-software-001`, run 2026-08-31, PASS).
- Historical optimizer runs: `run-history.md` (includes per-skill gate targets).

Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
