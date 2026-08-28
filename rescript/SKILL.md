---
name: rescript
description: Write, review, debug, and explain ReScript code and rewatch projects. Use whenever the user mentions ReScript, .res/.resi files, rescript.json or bsconfig.json, rewatch, rescript build/watch/format, npx create-rescript-app, @rescript/core, @rescript/react, @react.component, JSX version 4, rescript-jest, rescript-test, uncurried functions, genType, variant/record/dict literals, or migrating ReScript 11 to 12 — or asks to set up a ReScript project, bind to a JS library, or translate JS/TS logic into ReScript. Trigger even if the user never says "ReScript" and just pastes .res code with a compiler error asking "what's wrong here", or asks for the ReScript equivalent of something they already know from JS/TS. The user is an experienced JS/TS/PHP developer but a genuine ReScript beginner — explanations should assume strong general programming skill and zero ReScript-specific knowledge, never the reverse.
---

# ReScript

ReScript is a statically-typed language that compiles to clean, readable, dependency-free ES modules — the emitted JS is meant to be reviewed and shipped, not treated as an artifact. Coming from JS/TS, the biggest mental shift is not syntax — it's that **the type system is sound and always on**: there is no `any`, no `unknown`-laundering, no `strictNullChecks` knob to forget in one project, and no structural escape hatch. The guarantees TypeScript makes opt-in are unconditional here.

Default to explaining *why* something is idiomatic, not just *that* it is — the user is learning the language, not just translating syntax.

The runtime story matters less than the type story: a record compiles to a JS array and a variant to a tagged block. The full value-representation walkthrough, and everything about talking to JavaScript: [references/interop-and-runtime.md](references/interop-and-runtime.md).

## Type inference: don't annotate unless asked

ReScript infers every type globally with full soundness — not "best effort like TS but stricter". Unless the user asks for annotations or you're at a boundary, write bindings without any:

```rescript
// Prefer
let totalTtc = (priceHt, taxRate) => priceHt * (1 + taxRate)

// Not, unless asked
let totalTtc = (priceHt: int, taxRate: int): int => priceHt * (1 + taxRate)
```

Annotate only at boundaries where inference meets the outside world: `external` bindings (see below) and `.resi` interfaces. If the user is confused about a type, the answer is to ask the compiler, not to sprinkle annotations: hover in the LSP, or deliberately misuse the value and read the error, which prints the full inferred type.

## Setup & project layout

Don't hand-write config from scratch when scaffolding — use the generator, then adjust:

```
npx create-rescript-app <name>   # official Next.js / Vite / Node templates
npm install rescript              # or: add ReScript to an existing JS repo
```

A hand-written project is one JSON file plus a source dir:

```json
{
  "name": "myproject",
  "sources": { "dir": "src", "subdirs": true },
  "package-specs": { "module": "esmodule", "in-source": true },
  "jsx": { "version": 4 }
}
```

```
rescript.json       ; project config — note: not bsconfig.json since v11; v12 uses dependencies / dev-dependencies / compiler-flags
src/
  App.res           ; each file is a module named by its capitalized filename
  App.resi          ; optional interface file — a hand-written .d.ts that also hides implementation details
src/App.res.js      ; emitted ESM (in-source) — readable, reviewable output
```

- **`rescript build`** compiles. **`rescript watch`** is the dev loop — rewatch (the Rust builder, default since v12) rebuilds in subsecond time, so "save → compiler opinion" *is* the workflow, not a background type-checker. **`rescript format`** formats. The old OCaml builder survives as `rescript legacy`.
- If the user hands you an old codebase with `bsconfig.json` or ReScript 11-era config, use `npx rescript-tools migrate-all` before any manual edits — see the migration checklist: [references/testing-and-tooling.md](references/testing-and-tooling.md).

## Core language cheat sheet

- **Variant types replace TS unions/enums, and `switch` is exhaustiveness-checked** — add a case and every unmatched `switch` anywhere fails to compile. Don't reach for a `_` default branch to "keep it compiling"; that deletes the guarantee:
  ```rescript
  type shape =
    | Circle(float)
    | Rectangle(float, float)

  let area = shape => switch shape {
    | Circle(r) => 3.14159 *. r *. r
    | Rectangle(w, h) => w *. h
  }
  ```
  Switching on a tuple matches nested shapes at once: `switch (a, b) { | (Some(x), Some(y)) => ... | _ => ... }` — the machine-checked version of TS's discriminated-union nesting.
- **Records are not JS objects.** They are closed, typed, and compile to arrays. `{x: 1, y: 2}` requires a declared `type point = {x: int, y: int}` in scope, and passing a JS object literal where a record is expected is a compile error, not a surprise. Functional update: `let moved = {...p, x: 0}`. Fields are immutable unless declared `mutable`. For genuinely dynamic keys use `Dict` (dict literals: `dict{"a": 1, "b": 2}`) — deep dive in [references/interop-and-runtime.md](references/interop-and-runtime.md).
- **`option` replaces null/undefined, and `null` genuinely does not exist in the language.** A `None` must be pattern-matched to be read — "forgot to check for null" is not a category of bug. JS APIs still return `null`: convert at the boundary with `Option.fromNullable` (`Js.Nullable` for pre-`@rescript/core` code).
- **`[1, 2, 3]` is a linked list and `[|1, 2, 3|]` is a JS-backed array.** Different literals, different mutability, different `map`. The single most common literal-syntax mistake coming from JS — fingers write `[...]` and reach for `Array` functions, then wonder about the type error. Choose `array` when you need JS interop or index access; `list` for persistent/immutable data.
- **Operators are unified (v12).** `+ - * / % **` work for `int`, `float`, and `bigint`, and `+` concatenates strings — `1 + 2` and `"a" + "b"` both typecheck. `1.5 + 2` doesn't: the int/float distinction moved from the operator (`+.`, `+`) to the type, so `5 / 2` is still *integer* division giving `2`.
- **`->` is the fast pipe and does property access.** `x->prop` reads the field, `xs->List.map(f)` pipes into a call — `->` is the idiomatic default in modern code; `|>` exists but you'll rarely see it. `list->Array.fromList->toJson` reads left-to-right like a method chain without the object.
- **Mutation is `ref` + `.val`** — there is no OCaml-style `:=`/`!`: `let x = ref(0)` then `x.val = x.val + 1`. Reach for immutable rebinding before reaching for `ref`.
- **`==` is structural equality and `===` is reference identity — the exact reverse of JS reflexes.** `=`/`!=` also exist as structural aliases. A deep compare is the *cheap-looking* one to your fingers but the expensive one at runtime.
- **Backticks interpolate**: `` `Hello ${name}, you have ${count} unread` ``. No more `+`-chained string building.
- **Labeled and optional arguments**: `let send = (~to_, ~timeout=?, body) => ...` — called as `send(~to_="bob", body="hi")`. Optional args arrive as `option` and must be unwrapped. Note an omitted argument in an ordinary call is a *compile error* (uncurried-only since v12), not partial application.
- **`let () = ...` is the main entry idiom.** Everything is an expression; a bare `let x = doSomething()` on a unit-returning call is a type error telling you to discard the value deliberately. Top-level side effects go under `let () =`.
- **Modules need no import statements.** Every `.res` file is a module named by its capitalized filename (`src/appState.res` → `AppState`), resolved by path; `open` is a scoped, positional construct (`open List` then `map(f)`) — not a top-of-file import list, and shadowing rules still apply inside it.

## JS interop

Cross-boundary calls are declared with `external` and typed exactly — a mis-shaped call site fails to compile instead of at runtime, the failure TS `any` bindings silently permit:

```rescript
@val external setTimeout: (unit => unit, int) => unit = "setTimeout"
@send external addEventListener: (EventTarget.t, string, Event.t => unit) => unit = "addEventListener"
```

Dynamic JS objects use `@obj` destructuring or `Dict`; `@unboxed` makes a wrapper compile to its raw value. For libraries consumed by TypeScript, genType emits real `.d.ts`. Attribute catalogue, null-handling, and reading the emitted JS: [references/interop-and-runtime.md](references/interop-and-runtime.md).

## React & JSX

```rescript
@react.component
let make = (~name, ~onOk=?, ()) => {
  <div> {React.string("Hello " + name)} </div>
}
```

Props are labeled arguments, optional props arrive as `option` (`~onOk=?`), and there's no components-as-classes — every component is a `make` function. JSX is **version 4 only** (`"jsx": {"version": 4}` in rescript.json); v3-era `...children` spread is gone, and a new `"preserve": true` mode re-emits JSX verbatim for an esbuild/SWC/Babel pipeline. Hooks bindings, config details, framework setup: [references/jsx-and-react.md](references/jsx-and-react.md).

## Testing

**`@glennsl/rescript-jest`** is the default recommendation for a JS developer — real Jest underneath, so watch mode, snapshots, and existing CI all work with zero new muscle memory. The ReScript-native alternative is `rescript-test` with its `retest` runner; `@dusty-phillips/rescript-zora` is documented against ReScript 11 and looks unmaintained — don't reach for it. Comparison, setup, and idioms: [references/testing-and-tooling.md](references/testing-and-tooling.md).

## Debugging & compiler errors

- Treat `rescript build`/`watch` output as ground truth, not a nuisance to silence — a type error usually points at a real logic gap (a missed switch arm, a wrong assumption about a JS value's shape), not a syntax nit.
- The reported error location is often the *second use site* of a bad value, not the mistake itself — read the inferred type in the message first, then find where the value got the wrong shape.
- A binding misbehaving at runtime? Read the emitted `.res.js` next to it. It's written to be read; what a binding actually compiles to is usually obvious there in a few lines.
- Beginner traps, fixed: the `[...]` vs `[|...|]` literal mix-up; forgetting an optional arg produces `option` (use it, don't pass it along); forgetting that `->` on a method needs `@send` on the binding.

## Style defaults

- Variants + switch over boolean-flag soup — model states as a variant, not as two independent `bool`s that can disagree.
- Total functions: return `option`/`Result` for expected failures rather than throwing; reserve `throw`/`JsExn` for the genuinely exceptional, and declare binding-side exceptions with `@throws` so they stay visible in types.
- Modules of functions over classes — there are no classes; translate a JS class into a module exposing functions over a record type.
- Keep `external` bindings in dedicated edge modules (an `Externals.res` per library is the common shape) so interop stays at the fringe and domain code stays typed end-to-end.