---
name: javascript
description: >
  JavaScript best-practices and rule enforcement — naming conventions, modern syntax idioms,
  `this`-handling, module structure, array/iteration performance, and nullability.
  Applies to plain JavaScript and is the foundation TypeScript builds on.

  TRIGGER when: language (JavaScript, JS, .js, .mjs, .cjs, Node.js, browser JS, ES modules, ESM, CommonJS),
  syntax (const/let, destructuring, template literals, optional chaining, nullish coalescing, arrow functions),
  patterns (this binding, callback, detached method, pure function vs method, module imports, barrel file, index.js),
  performance (array chains, filter().map(), intermediate arrays, hot path, GC pressure),
  nullability (null vs undefined, absence, sentinel value, == null check),
  naming (camelCase, PascalCase, kebab-case, boolean prefix),
  ask (idiomatic JavaScript, JS conventions, JS best practices, JS code review).
  ALSO APPLIES to TypeScript — it is the foundation TS builds on; load it alongside `typescript`
  on `.ts`/`.tsx`. For type-specific rules (type assertions `as T`, interfaces, generics, `readonly`
  modifier, `as const`, return type annotations) the `typescript` skill adds guidance on top.
user-invocable: false
---

# JavaScript

Conventions and rules for idiomatic JavaScript. TypeScript builds on these — when working in TS, apply both this skill and `typescript`.

## Rules (always apply)

| Rule | File |
|---|---|
| Use JavaScript general conventions (naming, const/let, destructuring, template literals) | `rules/js-general-conventions.md` |
| Prefer explicit context (params) over implicit `this` | `rules/prefer-explicit-context-over-this.md` |
| Do not use barrel files (`index.js`/`index.ts` re-exports) | `rules/no-barrel-files.md` |
| Avoid intermediate arrays on hot paths (`filter().map()` chains) | `rules/avoid-intermediate-arrays.md` |
| `undefined` for absence, `null` for API/external contracts | `rules/null-undefined.md` |

## Specialist Skills

| Situation | Skill | Why |
|---|---|---|
| TypeScript-specific features (types, generics, `as const`, `readonly`) | `typescript` | Type-system rules on top of JS conventions |
| Function composition, pipe, currying, FP patterns | `composing-software` | FP-flavored design beyond raw JS idioms |
| OOP / SOLID / design patterns | `oop-principles` | Class-based architecture |
