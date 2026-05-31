# JavaScript: The Full Story (ECMA-262, 1997 → 2025)

The complete feature history of the language across all 16 editions of the ECMA-262 standard, compiled from the specification PDFs in this directory.

JavaScript was invented by **Brendan Eich at Netscape** and first shipped in Navigator 2.0 (1995). Standardization began in November 1996; the first ECMA-262 edition was adopted in June 1997. The arc since: a fast birth (ES1–ES3), a long stall and an abandoned rewrite (ES4), a cleanup release (ES5), the revolution (ES2015), and then a steady yearly cadence (ES2016 onward) that continues through ES2025.

## At-a-Glance Timeline

| Edition | Year | Name | Headline |
| :--- | :--- | :--- | :--- |
| 1st | 1997 | ES1 | Foundation: types, objects, prototypes, core built-ins |
| 2nd | 1998 | ES2 | Editorial — ISO/IEC 16262 alignment |
| 3rd | 1999 | ES3 | Regex, `try`/`catch`, `switch`, better strings |
| (4th) | — | ES4 | **Abandoned** — never shipped |
| 5th | 2009 | ES5 | Strict mode, JSON, property descriptors, Array iteration methods |
| 5.1 | 2011 | ES5.1 | Editorial — ISO/IEC 16262:2011 alignment |
| 6th | 2015 | ES2015 (ES6) | The revolution: `class`, `let`/`const`, arrows, modules, Promises |
| 7th | 2016 | ES2016 | `Array.includes`, `**` |
| 8th | 2017 | ES2017 | `async`/`await`, `Object.entries/values`, string padding |
| 9th | 2018 | ES2018 | Object spread/rest, async iteration, regex upgrades |
| 10th | 2019 | ES2019 | `Array.flat/flatMap`, `Object.fromEntries`, optional catch |
| 11th | 2020 | ES2020 | Optional chaining `?.`, nullish `??`, `BigInt`, dynamic `import()` |
| 12th | 2021 | ES2021 | Logical assignment, numeric separators, `replaceAll`, `WeakRef` |
| 13th | 2022 | ES2022 | Class fields/private `#`, top-level `await`, `.at()` |
| 14th | 2023 | ES2023 | Change-by-copy array methods, `findLast`, hashbang |
| 15th | 2024 | ES2024 | `Object.groupBy`, `Promise.withResolvers`, regex `v` flag |
| 16th | 2025 | ES2025 | Iterator helpers, Set methods, JSON modules, `Promise.try`, `Float16Array` |

---

## ES1 — 1st edition (1997)

The foundational language. Everything modern JS builds on starts here.

- Core types: Undefined, Null, Boolean, Number (IEEE-754 double), String, Object
- Functions as first-class objects; `function` declarations and expressions
- Prototype-based inheritance via `prototype`
- Operators, automatic semicolon insertion, `var` scoping
- Control flow: `if`/`else`, `for`, `while`, `do`...`while`, `break`, `continue`, `return`, `with`
- Built-in objects: `Object`, `Function`, `Array`, `String`, `Boolean`, `Number`, `Math`, `Date`
- `eval`, `parseInt`, `parseFloat`, `NaN`, `Infinity`

## ES2 — 2nd edition (1998)

- **Editorial only.** No new language features.
- Aligned the standard with international standard ISO/IEC 16262. Changes between 1st and 2nd editions are editorial in nature.

## ES3 — 3rd edition (1999)

The first edition with substantial new language power.

- Regular expressions (literal `/.../` syntax + `RegExp`)
- `try` / `catch` / `finally` exception handling and `throw`
- The `switch` statement
- `do`...`while` loops
- Labelled statements
- Better string handling
- Tighter definition of errors (the standard `Error` types)
- Improved numeric output formatting
- Minor changes anticipating internationalisation

## ES4 — abandoned

The 4th edition was an ambitious rewrite (classes, types, namespaces, packages) developed across the mid-2000s. It was **never standardized**: TC39 abandoned it in 2008 due to disagreement over scope. Many ideas resurfaced later in ES2015. There is no ES4 specification PDF.

## ES5 — 5th edition (2009)

The cleanup release that codified de-facto behavior and added safety tooling.

- Strict mode (`"use strict"`)
- `JSON` object: `JSON.parse()`, `JSON.stringify()`
- Property descriptors: `Object.defineProperty()`, `Object.defineProperties()`
- `Object.create()`, `Object.getPrototypeOf()`
- `Object.getOwnPropertyNames()`, `Object.getOwnPropertyDescriptor()`, `Object.keys()`
- Object immutability: `Object.freeze()`, `Object.seal()`, `Object.preventExtensions()` (+ `isFrozen`/`isSealed`/`isExtensible`)
- Getters/setters in object literals (`get`/`set`)
- Array iteration methods: `forEach`, `map`, `filter`, `reduce`, `reduceRight`, `some`, `every`, `indexOf`, `lastIndexOf`
- `Array.isArray()`
- `Function.prototype.bind()`
- `String.prototype.trim()`
- `Date.now()`, `Date.prototype.toISOString()`
- Reserved words allowed as property names; trailing commas in object/array literals

## ES5.1 — 5.1 edition (2011)

- **Editorial only.** No new language features.
- Aligned ECMA-262 with the third edition of the international standard ISO/IEC 16262:2011.

---

> From here, ES2015 is the modern baseline. Editions ship yearly, each adding a focused set of features.

## ES2015 (ES6) — 6th edition (2015)

The revolution. The largest single update in the language's history.

- `let` / `const`
- Arrow functions
- Classes
- Template literals
- Destructuring
- Default / rest / spread parameters
- `Promise`
- `Map` / `Set` / `WeakMap` / `WeakSet`
- Generators & iterators
- `for...of`
- Modules (`import` / `export`)
- `Symbol`
- `Proxy` / `Reflect`

## ES2016 — 7th edition (2016)

- `Array.prototype.includes()`
- Exponentiation operator `**`

## ES2017 — 8th edition (2017)

- `async` / `await`
- `Object.values()`, `Object.entries()`
- `Object.getOwnPropertyDescriptors()`
- String padding: `String.prototype.padStart()`, `padEnd()`
- Trailing commas in function parameter lists and calls
- Shared memory and atomics: `SharedArrayBuffer`, `Atomics`

## ES2018 — 9th edition (2018)

- Asynchronous iteration: `for await...of`, async generators
- Object rest/spread properties: `{ ...obj }`
- `Promise.prototype.finally()`
- RegExp improvements:
  - Named capture groups `(?<name>...)`
  - Lookbehind assertions `(?<=...)` / `(?<!...)`
  - `s` (dotAll) flag
  - Unicode property escapes `\p{...}`

## ES2019 — 10th edition (2019)

- `Array.prototype.flat()`, `flatMap()`
- `Object.fromEntries()`
- `String.prototype.trimStart()`, `trimEnd()`
- `Symbol.prototype.description`
- Optional catch binding: `catch { }` (no parameter)
- Stable `Array.prototype.sort()` (guaranteed)
- `Function.prototype.toString()` revision (exact source text)
- Well-formed `JSON.stringify()` (escapes lone surrogates)
- JSON superset (allows U+2028/U+2029 in string literals)

## ES2020 — 11th edition (2020)

- Optional chaining `?.`
- Nullish coalescing `??`
- `BigInt` (arbitrary-precision integers, `n` suffix)
- `Promise.allSettled()`
- `String.prototype.matchAll()`
- Dynamic `import()`
- `import.meta`
- `globalThis`
- Namespace re-export: `export * as ns from "mod"`
- `for-in` enumeration order standardized

## ES2021 — 12th edition (2021)

- `String.prototype.replaceAll()`
- `Promise.any()` + `AggregateError`
- Logical assignment operators: `&&=`, `||=`, `??=`
- Numeric separators: `1_000_000`
- `WeakRef`, `FinalizationRegistry`

## ES2022 — 13th edition (2022)

- Class fields: public and private instance fields/methods (`#x`)
- Static class fields and methods, including static private
- Static initialization blocks: `static { }`
- Private brand check: `#x in obj`
- Top-level `await` (in modules)
- `Object.hasOwn()`
- `.at()` on `Array`, `String`, `TypedArray`
- `Error` cause: `new Error(msg, { cause })`
- RegExp `d` flag (match indices, `hasIndices`)

## ES2023 — 14th edition (2023)

- `Array.prototype.findLast()`, `findLastIndex()`
- Change-by-copy: `toReversed()`, `toSorted()`, `toSpliced()`, `with()`
- Hashbang (`#!`) grammar
- Symbols as `WeakMap` keys

## ES2024 — 15th edition (2024)

- `Object.groupBy()`, `Map.groupBy()`
- `Promise.withResolvers()`
- `Array.fromAsync()`
- Resizable `ArrayBuffer` + `transfer()`, growable `SharedArrayBuffer`
- `String.prototype.isWellFormed()`, `toWellFormed()`
- `Atomics.waitAsync()`
- RegExp `v` flag (unicodeSets — set notation, string properties)

## ES2025 — 16th edition (2025)

Source: ECMA-262 16th edition Introduction.

- Iterator helpers: new `Iterator` global with static and prototype methods (`map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `toArray`, etc.)
- `Set.prototype` methods for set operations: `union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf`, `isDisjointFrom`
- Importing JSON modules + syntax for declaring import attributes (`with { type: "json" }`)
- `RegExp.escape()` — escape a string for safe use in a regular expression
- Inline regex flag modifiers — enable/disable flags within a pattern, e.g. `(?i:...)`
- `Promise.try()` — call a function and always get a Promise back
- `Float16Array` TypedArray, plus `DataView.prototype.getFloat16` / `setFloat16` and `Math.f16round`

---

## Cross-Cutting Themes

1. **Birth to standard (1997–1999):** ES1–ES3 turned Netscape's JavaScript into a stable, regex-and-exceptions-capable scripting language.
2. **The lost decade (1999–2009):** ES4 collapsed under its own ambition; ES5 instead consolidated, adding strict mode, JSON, and the Array/Object utility methods that defined a generation of code.
3. **The revolution (2015):** ES2015 delivered classes, modules, `let`/`const`, arrows, and Promises — the foundation of modern application development.
4. **Yearly cadence (2016→):** Small, predictable releases. The throughline is safety (`?.`, `??`), immutability (change-by-copy methods), better async (`async`/`await`, top-level `await`), and richer standard data tooling (`Object.groupBy`, Set methods, Iterator helpers).
