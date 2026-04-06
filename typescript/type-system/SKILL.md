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

**`unknown` vs `any`** — `any` disables all checking; `unknown` forces narrowing before use. Use `unknown` for external data (API responses, `JSON.parse`, user input).

**Type narrowing** — TypeScript tracks types through `if`, `typeof`, `instanceof`, `in`, equality, truthiness, and `Array.isArray`. Called refinement.

**Discriminated unions** — literal tag field (`type: "auth" | "data" | "error"`) lets TypeScript dispatch on shape in a `switch`. Invaluable for Redux actions, WebSocket messages, API response variants.

**Exhaustiveness checking** — `assertNever(value: never)` causes a compile error if a new union member is added but not handled.

**Mapped types** — transform every key of an existing type: `{ [K in keyof T]?: T[K] }`. Built-ins: `Partial`, `Required`, `Readonly`, `Pick`, `Record`.

**Conditional types** — type-level ternary: `T extends Promise<infer U> ? U : T`. Distributive over unions. Built-ins: `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Awaited`.

**User-defined type guards** — predicate return `value is T` carries refinement across function boundaries.

**Type branding** — `type UserId = string & { readonly _brand: unique symbol }` prevents structural aliasing at zero runtime cost.

**Companion object pattern** — declare the same name as both a `type` and a `let`/`const` value; TypeScript's separate namespaces allow it. One import covers type annotation and utility methods.

**`as const`** — freezes a value to its narrowest literal type. Use on config objects and arrays to derive union types: `type Method = (typeof HTTP_METHODS)[number]`.

**Escape hatches** — `as T` (assertion), `!` (non-null), `!:` (definite assignment). Use as a last resort; frequent use signals types should be restructured.

→ Full examples with runnable code: `references/type-system.md`
