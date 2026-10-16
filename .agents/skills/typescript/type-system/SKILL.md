---
name: type-system
description: Deep dive into TypeScript's type system — structural typing, type erasure, narrowing, discriminated unions, mapped/conditional types, type guards, branding, and escape hatches. Reference bundle for the `typescript` skill; not independently triggered. DO NOT USE for complex generic/conditional-type design or compiler-error fixing (use `typescript-magician`), test-writing (`testing`), or class/SOLID design (`object-oriented-programming`).
metadata:
  role: reference-bundle
  parent-skill: typescript
---

# TypeScript Type System

Primary reference: [TypeScript docs](https://www.typescriptlang.org/docs/). Section links below point at the exact page each concept comes from.

## Quick Concept Index

| Problem / Topic                                                    | Concept                                |
| ------------------------------------------------------------------ | -------------------------------------- |
| Safely handle API responses / JSON.parse                           | `unknown` vs `any`                     |
| Reuse an object without tying it to a class name                   | Structural typing                      |
| Explain why static types do not validate runtime data              | Type erasure                           |
| Narrow a union based on runtime checks                             | Type narrowing & refinement            |
| Route on message type with different shapes                        | Discriminated unions                   |
| Model entity lifecycle without invalid states                      | Make Illegal States Unrepresentable    |
| Fail at compile time when a case is missed                         | Exhaustiveness / `assertNever`         |
| Create `Partial`, `Readonly`, or custom maps                       | Mapped types                           |
| Unwrap `Promise<T>`, filter union members                          | Conditional types + `infer`            |
| Why a callback with a narrower parameter type is rejected (TS2345) | Variance (covariance / contravariance) |
| Carry narrowing across function boundaries                         | User-defined type guards               |
| Prevent mixing `UserId` and `SessionToken`                         | Type branding (nominal types)          |
| Pair a type and utility under one import                           | Companion object pattern               |
| Preserve literal types in config objects                           | `as const` / type widening             |
| Last-resort override of TypeScript's checks                        | Escape hatches (`as T`, `!`)           |

## Concepts

For type derivation (`keyof typeof`, indexed access), `satisfies`, generic inference (`NoInfer`), conditional-type distribution, and type tests, read [Total TypeScript guidance](../references/total-typescript.md).

- **Structural typing** — Compatibility is determined by shape, not name. Prefer the narrowest useful shape; avoid empty structures (`interface Empty {}`, `{}`) that accept almost anything. Use branding for domain IDs.
- **Type erasure** — Static `T` does not survive into emitted JavaScript. Validate data crossing a runtime boundary with Zod — see `../zod/SKILL.md`.
- **`unknown` vs `any`** — `any` disables checking; `unknown` forces narrowing. Default to `unknown` for external data. See [The `unknown` type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type).
- **Type narrowing** — `typeof`, `instanceof`, `in`, equality, truthiness, and `Array.isArray` eliminate impossible branches. See [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html).
- **Discriminated unions** — A shared literal tag (`kind`, `type`, `status`) lets `switch`/`if` dispatch on shape. See [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions).
- **Make Illegal States Unrepresentable** — One type per lifecycle state in a discriminated union, not one type with optional fields.
- **Exhaustiveness** — `assertNever(value: never)` fails compilation when a union member goes unhandled. See [Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking).
- **Mapped types** — `{ [K in keyof T]?: T[K] }`; built-ins `Partial`, `Required`, `Readonly`, `Pick`, `Record`. See [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html).
- **Conditional types** — `T extends U ? X : Y`; `infer` extracts type arguments. See [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html).
- **User-defined type guards** — Return `value is T` to carry narrowing across function boundaries. See [User-Defined Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).
- **Variance** — Functions are covariant in return type and contravariant in parameters, so a handler with a narrower parameter type is not assignable where a wider one is expected (TS2345). Under [strictFunctionTypes](https://www.typescriptlang.org/tsconfig/#strictFunctionTypes) this is checked only for function-_property_ syntax — method syntax stays bivariant — so declare callback-typed options as properties.
- **Type branding** — Prevents mixing structurally identical types (`UserId` vs `SessionToken`) at zero runtime cost; use `unique symbol`. Example in [structural typing and branding](references/structural-typing-and-branding.md).
- **Companion object pattern** — Bind one name to both a type and a const value so one import covers both.
- **`as const`** — Only when no type exists yet for what you derive; otherwise annotate with the existing type — see `../rules/favor-existing-types-over-as-const.md`.
- **Escape hatches** — `as T`, `!`, `!:` are a last resort; see `../rules/avoid-type-assertions.md`.

Do NOT prefix interfaces with `I`. See `../rules/no-interface-prefix.md`.

## Read On Demand

| Read when                                                                                  | Link                                                                                 |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Modeling entity lifecycles (`Task` example) or adding `assertNever` exhaustiveness         | [Illegal states and exhaustiveness](references/illegal-states-and-exhaustiveness.md) |
| Structural typing pitfalls, `UserId`/`SessionToken` branding, companion objects            | [Structural typing and branding](references/structural-typing-and-branding.md)       |
| Choosing `interface` vs `type`, using generics sensibly, enums, lazy object initialization | [Declarations and style](references/declarations-and-style.md)                       |
| Benchmark results and release-gate notes                                                   | [Benchmarks](references/benchmarks.md)                                               |
