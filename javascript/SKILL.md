---
name: javascript
description: >
  JavaScript best-practices and rule enforcement — naming conventions, modern syntax idioms,
  `this`-handling, module structure, array/iteration performance, and nullability.
  TRIGGER when: language (JavaScript, JS, .js, .mjs, .cjs, Node.js, browser JS, ESM, CommonJS),
  syntax (const/let, destructuring, optional chaining, nullish coalescing, arrow functions),
  patterns (this binding, detached method, module imports, barrel file, index.js),
  performance (array chains, filter().map(), intermediate arrays, hot path, GC pressure),
  nullability (null vs undefined, sentinel value, == null check), naming (camelCase, PascalCase),
  ask (idiomatic JS, JS conventions, JS best practices, JS code review).
  ALSO APPLIES to TypeScript — load alongside `typescript` on `.ts`/`.tsx`; for type-system rules
  (generics, `as`, interfaces, narrowing) route to `typescript` / `typescript-type-system`.
  DO NOT USE as primary skill for type-system questions — this skill still applies for naming and JS idioms.
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

## Read On Demand

- ECMAScript edition history (ES1 1997 → ES2025): see `references/ecmascript-history.md`. Use when judging which edition first shipped a feature, what needs a polyfill on older runtimes, or which syntax is safe for a target environment.

## Specialist Skills

| Situation | Skill | Why |
|---|---|---|
| TypeScript-specific features (types, generics, `as const`, `readonly`) | `typescript` | Type-system rules on top of JS conventions |
| Function composition, pipe, currying, FP patterns | `composing-software` | FP-flavored design beyond raw JS idioms |
| OOP / SOLID / design patterns | `oop-principles` | Class-based architecture |
