---
name: typescript-type-system
description: Deep dive into TypeScript's type system—narrowing, discriminated unions, mapped types, conditional types, type guards, branding, and escape hatches.
triggers:
  - unknown vs any
  - type narrowing
  - discriminated unions
  - exhaustiveness checking
  - mapped types
  - conditional types
  - infer keyword
  - user-defined type guards
  - type branding
  - companion object pattern
  - as const
  - escape hatches
  - type assertion
  - how do I narrow a type
  - how do I write a type predicate
  - how to create nominal types
  - how to prevent structural aliasing
---

# TypeScript Type System

## Quick Concept Index

| Problem / Topic                              | Concept                        |
| -------------------------------------------- | ------------------------------ |
| Safely handle API responses / JSON.parse     | `unknown` vs `any`             |
| Narrow a union based on runtime checks       | Type narrowing & refinement    |
| Route on message type with different shapes  | Discriminated unions           |
| Fail at compile time when a case is missed   | Exhaustiveness / `assertNever` |
| Create `Partial`, `Readonly`, or custom maps | Mapped types                   |
| Unwrap `Promise<T>`, filter union members    | Conditional types + `infer`    |
| Carry narrowing across function boundaries   | User-defined type guards       |
| Prevent mixing `UserId` and `SessionToken`   | Type branding (nominal types)  |
| Pair a type and utility under one import     | Companion object pattern       |
| Preserve literal types in config objects     | `as const` / type widening     |
| Last-resort override of TypeScript's checks  | Escape hatches (`as T`, `!`)   |

## Concepts

**`unknown` vs `any`** — `any` disables checking; `unknown` forces narrowing. Use for external data.

**Type narrowing** — TypeScript narrows types through `typeof`, `instanceof`, `in`, equality, truthiness, `Array.isArray`.

**Discriminated unions** — Tag field enables dispatch via `switch`. Essential for Redux actions, WebSocket messages, API variants.

**Exhaustiveness checking** — `assertNever(value: never)` forces compile error if new union member isn't handled.

**Mapped types** — Transform object keys: `{ [K in keyof T]?: T[K] }`. Built-ins: `Partial`, `Required`, `Readonly`, `Pick`, `Record`.

**Conditional types** — Type-level ternary: `T extends Promise<infer U> ? U : T`. Built-ins: `Exclude`, `Extract`, `Awaited`.

**User-defined type guards** — Return `value is T` to carry refinement across function boundaries.

**Type branding** — `type UserId = string & { readonly _brand: unique symbol }` prevents structural aliasing at zero cost.

**Companion object pattern** — Bind the same name to both a type and const value. One import covers annotation and utilities.

**`as const`** — Freeze values to literal types. Use on configs/arrays to derive union types.

**Escape hatches** — `as T`, `!`, `!:` override TypeScript checks. Last resort; frequent use signals refactoring needed.

→ Full examples with runnable code: `references/type-system.md`
