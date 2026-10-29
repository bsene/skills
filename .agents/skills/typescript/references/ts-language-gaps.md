# TypeScript Language Gaps

Source: _Programming TypeScript_ (Boris Cherny) and _Programming with Types_ (Vlad Riscutia). Only topics not covered by `type-system/` or `rules/`. Advanced type-level work belongs to `typescript-magician`.

## Variance and subtyping

| Position                      | Variance          | TypeScript behavior                                                       |
| ----------------------------- | ----------------- | ------------------------------------------------------------------------- |
| Object property / return type | Covariant         | `Dog` is assignable where `Animal` expected                               |
| Function parameter            | Contravariant     | Enforced with `strictFunctionTypes` for function-typed properties         |
| Method-syntax parameter       | Bivariant         | Unsound escape hatch; use property syntax `(x: T) => void` for strictness |
| Mutable array `Dog[]`         | Treated covariant | Unsound (`animals.push(cat)`); prefer `readonly Animal[]` for inputs      |

Annotate generic variance with `in`/`out` (`interface Sink<in T>`, `Source<out T>`) when it documents intent or speeds checking.

Rule of thumb: accept the widest type (`readonly` supertype), return the narrowest.

## Function typing

| Feature                  | Guidance                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Overloads                | Last resort; prefer a union parameter or generic. Overload order matters: most specific first |
| `this` parameter         | `function f(this: Ctx, x: number)` types `this`; erased at runtime                            |
| Assertion functions      | `asserts x is T` / `asserts cond` for validators that throw; narrows after the call           |
| Type predicates          | `x is T` must be truthful both ways; TS 5.5 infers simple ones                                |
| Rest/tuple params        | `(...args: [id: string, retries?: number])` gives labeled, optional positional params         |
| Generic bounds           | `<T extends { id: string }>`; use defaults (`<T = unknown>`) so callers can omit              |
| Generics bind early/late | Type parameter on the call signature binds per call; on the alias/interface it binds per use  |

## Types worth knowing

| Type / feature              | Use                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `unique symbol`             | Nominal-style brand key without runtime cost                                                                  |
| `bigint`                    | Integers beyond 2^53; cannot mix with `number`; not JSON-serializable                                         |
| Index signatures            | `{ [k: string]: V }`; with `noUncheckedIndexedAccess` reads become `V \| undefined`                           |
| `Record<K, V>` with union K | Exhaustive object map; missing key is a compile error                                                         |
| Tuples                      | Fixed-length positional data; variadic tuples type `[...A, ...B]`                                             |
| `never`                     | Exhaustiveness checks and unreachable branches                                                                |
| `enum`                      | Prefer string literal unions or `as const` objects; if used, `const enum` is disabled under `isolatedModules` |
| Abstract class              | Shared implementation + required members; use an interface when no shared code                                |
| Declaration merging         | Interfaces and namespaces merge; use to augment third-party types (`declare module`)                          |

## Classes

- Prefer `#private` or `readonly` fields; TS `private` is compile-time only.
- Parameter properties (`constructor(private readonly db: Db)`) are not supported by type stripping (`erasableSyntaxOnly`); declare fields explicitly in Node strip-types projects.
- Return `this` for fluent APIs so subclasses keep their type.
- Favor composition and interfaces over deep inheritance; see `object-oriented-programming`.

## Modules and project setup

| Topic                                    | Guidance                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Module resolution                        | `moduleResolution: "nodenext"` for Node (requires file extensions in ESM); `"bundler"` with a bundler |
| `isolatedModules`/`verbatimModuleSyntax` | Use `import type` for type-only imports; required by most transpilers                                 |
| `target` / `lib`                         | `target` decides emitted syntax, `lib` decides available APIs; polyfills are your job                 |
| Source maps                              | Enable `sourceMap` so stack traces point at `.ts`                                                     |
| Third-party types                        | `@types/*` as devDependency; ambient declarations in a `types/` dir listed in `include`               |
| Incremental builds                       | `composite` + project references for monorepos; `tsc -b`                                              |
| Gradual migration                        | `allowJs` + `checkJs`, convert leaf modules first, tighten flags last                                 |

## Type-driven design (Programming with Types)

| Idea                                | Practice                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Make invalid states unrepresentable | Union of states each carrying only its valid fields, not optional bags                               |
| Primitive obsession                 | Wrap `string`/`number` with brands (`UserId`, `Cents`) so arguments cannot be swapped                |
| Types as documentation              | Name the domain concept; a signature should read like a sentence                                     |
| Sum + product types                 | Unions (OR) and objects/tuples (AND) cover most modeling; add classes only for behavior              |
| Option instead of null              | `T \| undefined` or a small `Option` type at API edges; handle at one boundary                       |
| Higher-kinded types                 | Not expressible directly; avoid generic abstractions needing them (`Functor<F>`), use concrete types |
| Subtyping vs composition            | Prefer composing small types; subtype only for true "is-a" substitutability (LSP)                    |

## Error and runtime safety

- `catch (e)` is `unknown` under `useUnknownInCatchVariables`; narrow with `instanceof Error`.
- Type assertions do not validate; parse external data (see `zod/SKILL.md`).
- `JSON.parse` returns `any`; assign to `unknown` first.
