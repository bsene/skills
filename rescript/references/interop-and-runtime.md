# ReScript interop & runtime representation

How ReScript values map to JS at runtime, and how to talk to untyped JavaScript across the `external` boundary. Loaded on demand from SKILL.md.

The rule of thumb: **ReScript types the boundary, JS keeps the runtime.** A binding declares a _typed view_ of an untyped JS value; the compiler trusts the view, and the emitted JS is a pass-through unless told otherwise. So the craft is (1) knowing what your value actually becomes at runtime, and (2) writing bindings where the declared type matches reality.

## Runtime representation

- **Records compile to arrays** — `{x: 1, y: 2}` becomes `[1, 2]` with the compiler mapping fields to indices. Small, GC-friendly, non-guessable from JS. Consequences: a JS object is _never_ a record; record field lookup can't be done dynamically from JS on ReScript records; changing a record type changes the emitted layout. When a JS side must receive an object, build it with `@obj` (below) or `Dict` — don't bend a record.
- **Variants compile to tagged blocks.** Polymorphic variants and tag-carrying constructors become small objects or numbers depending on shape. Don't pattern-match on the emitted JS shape — it's an implementation detail that has changed between compiler versions.
- **`option`**: `None` is a JS `undefined` (sometimes `null` depending on the compiler's representation choice), `Some(v)` may unbox to `v` itself in many cases. You cannot rely on this — always cross nulls explicitly with `Option.fromNullable` / `Js.Nullable`, never by runtime-guessing.
- **`array`** is a real JS array; **`list`** is a linked structure and does _not_ round-trip into JS code invisibly. Convert at the boundary: `List->Array.fromList`, `List.fromArray`.
- **Strings are JS strings, ints are JS numbers.** A ReScript `int` has no int-ness at runtime — it _is_ a JS number; float functions (`Float.*`) exist because `/` and `Math.*` differ, not because the value is different.

Why this matters for review: the emitted `.res.js` sits next to the source (with `"in-source": true`). When a binding misbehaves, reading the few lines of emitted JS is faster than reasoning from the type error. It's written to be read.

## `external` bindings — the attribute catalogue

`external name: type = "jsName"` declares a typed view. The attributes pick the JS shape:

```rescript
// Global value / function
@val external document: Dom.document = "document"
@val external fetch: (string, fetchOptions) => promise<fetchResponse> = "fetch"

// Method call — binds at the prototype level, correct `this`
@send external addEventListener: (EventTarget.t, string, Event.t => unit) => unit = "addEventListener"

// Constructor — `new X(...)`
@new external Map: unit => map<...> = "Map"
@new external makeDate: float => Js.Date.t = "Date"

// Same name, different JS name, or renaming to avoid collisions
@send external append: (Dom.parent, Dom.child) => unit = "appendChild"

// Optional argument forwarding: JS may omit the arg entirely
@send external scrollIntoView: (Element.t, scrollIntoViewOptions) => unit = "scrollIntoView"

// Variadic — pass a tuple of types, call with fewer (uncurried world knows which are required)
@variadic external all: (array<promise<'a>>) => promise<array<'a>> = "Promise.all"

// Exceptions a JS call may throw — keeps them visible in types
@throws typeofError(string)
external parseJson: string => Json.t = "JSON.parse"

// Module attribute: one whole JS module bound in one place
@@module("lodash")
external debounce: ('a, int) => 'a = "debounce"
```

Notes that bite:

- `@send` vs `@val` is the difference between `element.addEventListener(...)` compiling as a call _on the receiver_ and a free function call. Wrong choice = `this` is undefined at runtime, invisible in types.
- An `external` type annotation is a **promise, not a checked fact**. It's the one place in ReScript where you can write `"the JS says so"`. Bind narrowly (specific return types, not `unit => 'a` laziness) so a real mismatch surfaces at the call site.
- Exceptions: thrown errors from JS arrive as `JsExn`. Catch with `| JsExn.Error(e) => ...`; message via `JsExn.message(e)`.

## Dynamic objects — three tools, one rule

Rule: **`@obj` for reading, `Dict` for writing, records for neither.**

- **`@obj` destructuring** (read a JS object's known fields):
  ```rescript
  type config = @obj {
    @optional retries: int,
    url: string,
  }
  let getConfig = (raw: config) => raw.retries->Option.value(~default=3)
  ```
- **`Dict` / `dict{}` literals** (dynamic keys, both directions):
  ```rescript
  let ages = dict{"alice": 30, "bob": 25}
  ages->Dict.get("carol") // option<int> — absent key is None, not a crash
  ```
- **`@unboxed`** makes a single-field wrapper compile to the raw value — the right tool when you want a nominal type for a JS-pass-through value (id strings, etc.):
  ```rescript
  type id = Id(string) @unboxed
  ```

## genType — when TypeScript consumers exist

genType emits real `.d.ts` (+ runtime converters if you set `module` mode) from ReScript signatures, so a TS codebase imports your ReScript module and keeps its own tooling happy. Only reach for it at edges where the _consumer_ is TS; internal ReScript↔ReScript calls need it never. When the user describes "our ReScript lib is used from TS" — that's genType territory; check which genType mode their `genType.json` requests before writing bindings, because the round-trip direction decides whether types flow through or converters are injected.

## Migration spot: 11 → 12 (and the `bsconfig.json` eras)

Old codebases carry old interop assumptions. See the migration checklist in [testing-and-tooling.md](testing-and-tooling.md) for the mechanical steps; the interop-relevant shifts: `@rescript/core` is bundled (delete `RescriptCore` opens and the dep), uncurried is unconditional (hand-written currying tricks on callbacks break), and JSX v3 bindings (`...children` spread components) need rewrites, not flags.
