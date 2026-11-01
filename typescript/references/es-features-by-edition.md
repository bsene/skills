# ECMAScript Features by Edition

Source: [ECMA-262](https://tc39.es/ecma262/) 16th edition (ES2025), Introduction. Use to decide what is safe to use per target (`tsconfig` `target`/`lib`, Node version, browserslist). Features are in the spec once they reach stage 4; runtime support still varies, so check the project's engines before adopting.

| Edition     | Added                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ES2015 (6)  | `class`, modules, arrow functions, `let`/`const`, template literals, destructuring, default/rest/spread, iterators, generators, `Promise`, `Map`/`Set`/`WeakMap`/`WeakSet`, `Symbol`, `Proxy`/`Reflect`, typed arrays                             |
| ES2016 (7)  | `**` operator, `Array.prototype.includes`                                                                                                                                                                                                         |
| ES2017 (8)  | `async`/`await`, `Object.values`/`entries`/`getOwnPropertyDescriptors`, `SharedArrayBuffer` + `Atomics`                                                                                                                                           |
| ES2018 (9)  | Async iteration (`for await`, async generators), object rest/spread, regex: `s` flag, named groups, lookbehind, Unicode property escapes                                                                                                          |
| ES2019 (10) | `flat`/`flatMap`, `Object.fromEntries`, `trimStart`/`trimEnd`, optional catch binding, **stable `Array.prototype.sort`**, well-formed `JSON.stringify`                                                                                            |
| ES2020 (11) | `?.` optional chaining, `??` nullish coalescing, `BigInt`, `import()`, `import.meta`, `export * as ns`, `Promise.allSettled`, `globalThis`, `String.prototype.matchAll`                                                                           |
| ES2021 (12) | `replaceAll`, `Promise.any`, `AggregateError`, `??=` `&&=` `\|\|=`, numeric separators (`1_000`), `WeakRef`, `FinalizationRegistry`                                                                                                               |
| ES2022 (13) | Top-level `await`, class fields + `#private` methods/accessors, `static {}` blocks, `#x in obj`, regex `/d` indices, `Error` `cause`, `.at()`, `Object.hasOwn`                                                                                    |
| ES2023 (14) | Non-mutating `toSorted`/`toReversed`/`toSpliced`/`with`, `findLast`/`findLastIndex`, `#!` hashbang, symbols as `WeakMap` keys                                                                                                                     |
| ES2024 (15) | `Object.groupBy`/`Map.groupBy`, `Promise.withResolvers`, resizable/transferable `ArrayBuffer`, regex `/v` flag, `Atomics.waitAsync`, `isWellFormed`/`toWellFormed`                                                                                |
| ES2025 (16) | `Iterator` helpers (`map`, `filter`, `take`, `drop`, `flatMap`, `toArray`, `Iterator.from`), `Set` methods (`union`, `intersection`, …), JSON modules + import attributes, `RegExp.escape`, inline regex modifiers, `Promise.try`, `Float16Array` |

## Use instead of

| Old                                                | Modern                                                         | Since  |
| -------------------------------------------------- | -------------------------------------------------------------- | ------ |
| `arr.indexOf(x) !== -1`                            | `arr.includes(x)`                                              | ES2016 |
| `x && x.y && x.y.z`                                | `x?.y?.z`                                                      | ES2020 |
| `x !== undefined ? x : d` / `x \|\| d`             | `x ?? d`                                                       | ES2020 |
| `obj.hasOwnProperty(k)`                            | `Object.hasOwn(obj, k)`                                        | ES2022 |
| `arr[arr.length - 1]`                              | `arr.at(-1)`                                                   | ES2022 |
| `arr.slice().sort(cmp)`                            | `arr.toSorted(cmp)` (also `toReversed`, `with`, `toSpliced`)   | ES2023 |
| manual `reduce` into buckets                       | `Object.groupBy(items, fn)` / `Map.groupBy` (non-object keys)  | ES2024 |
| `new Promise((res, rej) => { r = res; … })`        | `const { promise, resolve, reject } = Promise.withResolvers()` | ES2024 |
| `new Set([...a].filter(x => b.has(x)))`            | `a.intersection(b)`                                            | ES2025 |
| `[...it].map(f).slice(0, n)` on big/lazy iterables | `it.map(f).take(n).toArray()`                                  | ES2025 |
| `new Promise(r => r(fn()))` to unify sync/async    | `Promise.try(fn)`                                              | ES2025 |
| hand-escaping a string for `new RegExp`            | `RegExp.escape(s)`                                             | ES2025 |

## TypeScript notes

- `target` controls syntax down-leveling; `lib` controls which built-ins type-check. Set `lib` to match the runtime (e.g. `"ES2024"`, or `"ESNext"` only if the engine is current), otherwise `toSorted` or `Object.groupBy` fail to type-check or fail at runtime.
- Prefer `--target` at the runtime's level over transpiling: native `async`, classes, and `?.` are faster and smaller than helpers.
- Features not yet in ECMA-262 (Temporal, `using`/explicit resource management, `Array.fromAsync`, `Uint8Array` base64) are not in this edition of the spec; verify engine support before using, polyfill or avoid.
- Pair with [js-pitfalls-and-idioms.md](js-pitfalls-and-idioms.md) for what to avoid and [js-runtime-mechanics.md](js-runtime-mechanics.md) for semantics.
