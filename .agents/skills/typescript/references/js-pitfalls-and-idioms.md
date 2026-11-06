# JavaScript Pitfalls and Idioms

Source: _Effective JavaScript_ (Herman), _JavaScript: The Good Parts_ (Crockford), _JavaScript Patterns_ (Stefanov), _You Don't Know JS_ (Simpson), _JavaScript for Impatient Programmers_ (Rauschmayer). Pre-ES2015 advice (`with`, `eval`, `arguments` tricks, ES3 scoping quirks) is dropped; only rules still true in modern JS/TS remain. For `this`, closures, event loop, promises see [js-runtime-mechanics.md](js-runtime-mechanics.md).

## Coercion and equality

| Pitfall                                        | Rule                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `==` with mixed types                          | Use `===`; the only accepted `==` is `x == null` (matches `null` and `undefined`)                     |
| `+` with a string operand                      | Concatenates; convert explicitly (`Number(s)`, `` `${n}` ``) rather than rely on coercion             |
| Truthiness as presence test                    | `0`, `""`, `NaN` are falsy; use `??` and `x === undefined`, not `\|\|`, for defaults                  |
| `NaN !== NaN`                                  | `Number.isNaN(x)` / `Object.is`; never `x === NaN`; global `isNaN` coerces first                      |
| Floating point                                 | `0.1 + 0.2 !== 0.3`; compare with epsilon, use integer cents or `bigint` for money                    |
| Wrapper objects (`new String`, `new Boolean`)  | Never; `new Boolean(false)` is truthy. Call `String(x)` / `Number(x)` without `new`                   |
| `parseInt(s)` without radix, or on non-strings | `Number(s)` for strict parsing; `parseInt(s, 10)` only to read a numeric prefix                       |
| Objects coerced via `toString` / `valueOf`     | Implement `Symbol.toPrimitive` or avoid coercing objects; `[] + {}` is not a feature                  |
| Strings are UTF-16 code units, not characters  | `"😀".length === 2`; iterate with `for...of` / `[...s]` (code points), `Intl.Segmenter` for graphemes |

### What `==` does (ECMA-262 `IsLooselyEqual`)

Same type → same as `===`. Otherwise, in order: `null == undefined` is true (and equal to nothing else); Number vs String → String converted to Number; BigInt vs String → String parsed as BigInt (`false` if unparsable); Boolean → converted to Number first; String/Number/BigInt/Symbol vs Object → Object converted with `ToPrimitive`; BigInt vs Number → compared by mathematical value (`1n == 1` is true, never for `NaN`/`Infinity`); anything else false.

Consequences: `"0" == false` is true (`false`→`0`, `"0"`→`0`), `[] == false` is true, `null == 0` is false, `NaN == NaN` is false. `ToPrimitive` calls `obj[Symbol.toPrimitive](hint)` if present (hint `"default"`, `"string"`, or `"number"`), else `valueOf` then `toString` (reversed for the `"string"` hint); a non-primitive result throws `TypeError`.

## Scope and declarations

- `const` by default, `let` when rebinding, never `var`. Declare every variable; an undeclared assignment creates a global (modules and `"use strict"` throw instead).
- Minimize global state: one namespace/module per file; ES modules give this for free.
- Function declarations in blocks are portable only in strict/module code; prefer `const f = () => {}`.
- An IIFE is only needed for one-shot async setup (`(async () => { ... })()`) or in non-module scripts. In modules use top-level `await`.

## Objects and dictionaries

| Need                             | Use                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| Dynamic string/any keys          | `Map`; or `Object.create(null)` when JSON-shaped data is required                            |
| Fixed-shape record               | Plain object literal + type/interface                                                        |
| Own-property test                | `Object.hasOwn(o, k)`; `k in o` includes inherited keys (`"toString" in {}`)                 |
| Ordered collection               | Array, not an object (key order of objects is not an API for numeric-like keys)              |
| Iterate own enumerable props     | `Object.keys/values/entries`; avoid `for...in` (walks the prototype chain)                   |
| Modify while iterating           | Don't add/remove keys mid-loop; collect first, then mutate                                   |
| `__proto__` / `Object.prototype` | Read with `Object.getPrototypeOf`; never assign `__proto__`, never extend `Object.prototype` |

Prototype pollution: `obj[userKey] = v` with `userKey === "__proto__"` or `"constructor"` poisons every object. Validate keys, use `Map`, or `Object.create(null)` for user-keyed bags. Be especially careful with recursive merge/clone helpers on untrusted JSON.

## Arrays and iteration

- Prefer `map`/`filter`/`reduce`/`some`/`every`/`find`/`for...of` over index loops; reach for a loop only for early exit with `break`, performance in a measured hot path, or async sequencing (`for await`).
- `for...of` on arrays, not `for...in` (which yields string indexes and inherited keys).
- Array-likes (`NodeList`, `arguments`, `{length: n}`): convert with `Array.from(x)` or `[...x]` instead of `Array.prototype.slice.call`.
- `new Array(n)` makes holes; use `Array.from({ length: n }, (_, i) => i)` or `.fill()`. `new Array(3)` vs `Array(3, 4)` differ by argument count.
- `sort()` without comparator sorts as strings (`[10, 9].sort()` → `[10, 9]`); always pass `(a, b) => a - b`. It mutates; use `toSorted()` (ES2023) for a copy.
- Don't subclass `Array`/`Map` casually; wrap them (composition) so the API surface stays yours.

## API design

| Rule                                    | Why                                                                                          |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Options object for 3+ or boolean params | `connect({ host, retries: 3 })` is readable at the call site; boolean flags are not          |
| `undefined` means "no value"            | Don't make `undefined` a meaningful argument; use defaults (`{ retries = 3 } = {}`)          |
| Accept structural shapes                | Take `{ id: string }`, not a class; mirrors TS structural typing and eases testing           |
| Consistent conventions                  | Same argument order, naming (`getX`/`setX`), and return shape across a module                |
| Avoid hidden mutable state              | Prefer pure functions; stateful APIs need explicit `reset`/lifecycle, and are harder to test |
| Method chaining                         | Return `this` (or a new immutable copy) from mutators only when the chain reads naturally    |
| Don't over-coerce inputs                | Validate at the boundary (Zod) and reject; silently coercing hides caller bugs               |
| Monkey-patching built-ins               | Avoid; if you must polyfill, feature-detect first and keep it spec-compliant                 |

## Async discipline (still valid under `async/await`)

- Never block the event loop on I/O or heavy CPU; offload to streams, workers, or chunk with `setImmediate`.
- Never call an async callback synchronously in some branches and asynchronously in others ("Zalgo"); an API is either always sync or always async. A promise-returning `async function` guarantees this.
- Dropped errors: an `async` function without `await`/`.catch` at the call site swallows rejections. Lint with `@typescript-eslint/no-floating-promises`.
- Concurrency: `Promise.all` / `Promise.allSettled` replaces hand-rolled counters; bound concurrency (pool or `p-limit`) for large fan-out.
- Async loops: `for await`/sequential `await` for ordered work; `Promise.all(items.map(...))` only when items are independent and N is bounded.

## Patterns that survived (and ones that did not)

| Pattern (Patterns / Good Parts)                                                                     | Status today                                                                                                  |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Namespace object, module pattern (IIFE)                                                             | Replaced by ES modules                                                                                        |
| Constructor + `new`-agnostic guard                                                                  | Replaced by `class` (throws without `new`)                                                                    |
| Private via closure                                                                                 | Use `#private` fields (closures still fine for factories)                                                     |
| Factory function returning an object                                                                | Still preferred over classes for small, stateless-ish components                                              |
| Memoization, currying, partial apply                                                                | Still valid; see [composition](../composition/SKILL.md)                                                       |
| Callbacks / promise chains                                                                          | `async/await` now; callbacks only at edges (events, streams)                                                  |
| Mixins via `Object.assign`                                                                          | Still valid; type with intersection types                                                                     |
| Singleton, Observer (`EventEmitter`)                                                                | Module scope is a singleton; use `EventTarget`/`EventEmitter` for observers                                   |
| Method borrowing (`call`/`apply`)                                                                   | Rarely; use spread and `Function.prototype.bind` only when needed                                             |
| Crockford "bad parts" (`with`, `eval`, `==`, `new Number`, `continue`, fall-through `switch`, `++`) | Still avoid `with`, `eval`, `==`, wrapper objects; enforce via ESLint (`eqeqeq`, `no-eval`, `no-fallthrough`) |

## Language-mechanics checklist (YDKJS / Impatient)

- **Lexical scope** is fixed at author time; `this` is decided at call time (see runtime-mechanics).
- **Strict mode** is on in modules and classes; a plain script needs `"use strict"`.
- **TDZ**: accessing `let`/`const`/`class` before declaration throws `ReferenceError`; `typeof` is not safe there.
- **Destructuring defaults** fire only on `undefined`, not `null`.
- **Spread** is shallow; use `structuredClone` for deep copies (loses functions, class prototypes).
- **Getters/setters and `Object.defineProperty`** default to non-enumerable, non-writable; `JSON.stringify` skips non-enumerables, functions, `undefined`, and throws on `bigint`/cycles.
- **Dates**: months are 0-indexed; store UTC instants (ISO strings or epoch ms); prefer `Temporal` where available.
- **Symbols and well-knowns** (`Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive`, `Symbol.toStringTag`) are the sanctioned extension points for built-in behavior.
- **Regex**: `g`/`y` flags make `.test()`/`.exec()` stateful via `lastIndex`; reuse of a global regex literal across calls causes alternating results.
