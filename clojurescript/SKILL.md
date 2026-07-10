---
name: clojurescript
description: Write, review, debug, and configure ClojureScript code and projects. Use this whenever the user mentions ClojureScript, .cljs/.cljc files, shadow-cljs, figwheel, the CLJS compiler, JS interop from Clojure, Reagent/re-frame/Reagent-style UI code, or asks to convert JS/TS logic into ClojureScript. Also use it for questions about CLJS compiler options (:optimizations, :main, :npm-deps, :externs, etc.), consuming JS/npm libraries from CLJS, source maps, Google Closure Library usage, or the newer ^:async/await function support. Trigger even if the user just pastes CLJS code with an error and asks "what's wrong here" or asks to set up a new CLJS project. Do NOT use for nbb (babashka/nbb) scripts, `nbb.edn` projects, or anything meant to run via `nbb script.cljs`/`npx nbb` — those have a different (SCI-interpreted, no-Closure-Compiler) language surface; use the clojurescript-nbb skill for those instead.
compatibility: No special tools required to consult this skill. Actually building or running code needs a CLJS toolchain (shadow-cljs, Clojure CLI, or Leiningen) and a JS runtime (browser or Node.js), but the skill itself is pure reference/instruction content.
metadata:
  version: "1.0.0"
  source: https://clojurescript.org/reference/documentation
---

# ClojureScript

ClojureScript (CLJS) is Clojure that compiles to JavaScript via the Google Closure Compiler. It shares Clojure's syntax, immutable data structures, and REPL-driven workflow, but runs on JS engines (browser, Node.js) and interoperates directly with JS objects, functions, and npm/Closure libraries.

This skill covers writing idiomatic CLJS, JS interop, dependency/build configuration, and the newer native async/await support. When in doubt about compiler flags or interop mechanics, check `references/` rather than guessing — CLJS has a lot of build-tooling surface area that's easy to get subtly wrong.

## Gotchas

- **`:optimizations` defaults to `:none`**, not `:advanced` — a project with no explicit `:optimizations` setting is running unoptimized dev output.
- **Symbol renaming under `:advanced` breaks untyped JS interop.** "Works in dev, breaks in prod" is almost always this — fix with an externs file or string-keyed access (`goog.object/get`), not by changing app logic.
- **`:main` under `:optimizations :none` only loads what's actually `:require`d.** A side-effect-only namespace not reached by the entry namespace's transitive requires silently doesn't run — add an explicit `:require` or put it in `:preloads`.
- **`:output-to` and `:modules` are mutually exclusive**, not layered — `:modules` needs a per-module `:output-to` inside each module map, not a top-level one.
- **No arbitrary-precision numbers.** CLJS numbers are all JS `number` (a double) — no JVM-style BigDecimal/BigInt/ratios. Watch for precision loss on large integers.
- **`^:async` metadata goes on the `fn`/name only, never the arg vector**, and `await` only works inside a function actually marked `:async` — a nested `fn` doesn't inherit it and needs its own `^:async` (see `references/async-functions.md`).
- **An `:async` function always returns a `Promise`**, even when the body looks like it returns a plain value.
- **Truthiness differs from JS.** Only `false` and `nil` are falsy — `0`, `""`, `js/NaN`, `[]`, and `(array)` are all truthy. `(if 0 "yes" "no")` → `"yes"`, unlike JS. Easy to get backwards when translating JS/TS conditionals.

## Core language cheat sheet

CLJS syntax is essentially Clojure's, so standard Clojure knowledge (immutable persistent data structures, `let`/`fn`/`defn`, `->`/`->>` threading, `map`/`filter`/`reduce`, multimethods, protocols, `core.async`) applies directly. For a categorized index of core-library functions when you need the exact name of something less common, see `references/core-function-index.md` (based on https://cljs.info/cheatsheet/). The CLJS-specific things to keep front of mind:

- **Numbers**: CLJS has only one numeric type backed by JS `number` (a double). No arbitrary-precision integers/ratios like JVM Clojure — watch for precision issues with large integers.
- **Namespaces map to JS modules/Closure namespaces.** `(ns my.app.core (:require [my.app.util :as u]))` — `:require` for CLJS/Closure namespaces, `:import` for Closure classes/enums (e.g. `(:import [goog Timer])`).
- **`defprotocol`/`deftype`/`defrecord`** work like Clojure and compile to real JS constructor functions/prototypes.
- **`js/` prefix** accesses JS global objects: `js/console`, `js/document`, `js/Math`, `js/window`.
- **No JVM interop** — anything JVM-specific (`Thread`, `java.*` classes, blocking IO) doesn't exist. Concurrency is single-threaded/event-loop based; use `core.async` channels or promises/async functions instead of threads or locks.
- **`.cljc` files** hold code shared between Clojure and ClojureScript, guarded with reader conditionals: `#?(:clj (do-jvm-thing) :cljs (do-js-thing))`.

## JavaScript interop

- Method call: `(.methodName obj arg1 arg2)` → `obj.methodName(arg1, arg2)`
- Property access: `(.-propName obj)` → `obj.propName`
- Property set: `(set! (.-propName obj) val)`
- Constructor: `(SomeClass. arg1 arg2)` → `new SomeClass(arg1, arg2)`
- Static/global access: `js/JSON.stringify`, `js/Object.keys`
- Chained calls read top-down with `..`: `(.. js/document (getElementById "app") -innerHTML)`
- JS↔CLJS data conversion: `(clj->js m)` and `(js->clj o :keywordize-keys true)`
- Destructuring JS objects: `(let [{:keys [a b]} (js->clj obj :keywordize-keys true)] ...)` or interop-style `^js` type hints with `.-` accessors when you don't want a full conversion.

For consuming Closure Library, npm packages, foreign (non-Closure-compatible) JS, and CLJS libraries — including externs, advanced-compilation pitfalls, and CLJSJS — see `references/dependencies-and-interop.md` before guessing at a `:require`/`:import` shape or writing an externs file from scratch.

## Async / promises

CLJS added native `^:async` functions with an `await` macro (since v1.12.145) as a lighter-weight alternative to `core.async` for promise-based code. This is a newer feature that's easy to get wrong or not know about at all — **read `references/async-functions.md` before writing or reviewing any CLJS code that deals with `Promise`s, `fetch`, or `async`/`await`-shaped logic** (see Gotchas above for the two most common mistakes). One more rule worth holding in mind: prefer `Promise/all` (via `mapv`) over `map` when you need to await several promises produced in a loop.

If the codebase already uses `core.async` (`go`, `<!`, channels) for async control flow, stay consistent with that style rather than mixing in `^:async`/`await` unless asked to migrate.

## External resources

For idiomatic-Clojure background/mindset reading (design patterns translated to Clojure idioms, `core.async` worked examples, FP mindset shifts) beyond this skill's own reference material, see `references/external-resources.md`, which points to relevant posts on Janet A. Carr's Clojure blog (https://blog.janetacarr.com/). Use it as supplementary color/perspective, not as the source of truth for CLJS-specific mechanics — those stay in this skill's other reference files.

## Build & compiler configuration

CLJS projects are almost always built with **shadow-cljs** (npm/JS-ecosystem friendly, handles npm deps automatically) or the **Clojure CLI (`deps.edn`) + `cljs.main`/`cljs-build-api`** combo; some older projects use Leiningen + `figwheel-main`. Don't assume the tool — check for `shadow-cljs.edn`, `deps.edn`, or `project.clj` in the project before giving setup instructions.

For the full list of compiler options (`:optimizations`, `:target`, `:main`, `:npm-deps`, `:modules`, `:source-map`, `:closure-defines`, warnings, etc.) with exact semantics and defaults, see `references/compiler-options.md`. Don't guess at option names or defaults — this is a large, easy-to-misremember surface (e.g. `:static-fns` defaults to `false` except under `:advanced`, `:npm-deps` defaults to `false`). See Gotchas above for the most common failure patterns tied to these options.

## Working style

**Default to idiomatic Clojure(Script), not a literal JS translation.** This is the top priority whenever writing or rewriting CLJS, and it should win over "closest to what the JS/TS looked like" unless the user's existing codebase clearly does otherwise. Concretely, that means:

- **Immutability and pure functions first.** Reach for persistent data structures (maps, vectors, sets) and pure transformations over mutable state, `atom`s, or `set!`. Only use an `atom`/`volatile!` for genuine local mutable state (e.g. component-local UI state), not as a default variable substitute.
- **Data over classes.** Model domain data as plain maps/records rather than JS-style classes with methods, unless polymorphism genuinely calls for `defprotocol`/`deftype`/`defrecord` or a JS class is required at an interop boundary (e.g. a React component).
- **Sequence/threading idioms over loops.** Prefer `map`/`filter`/`reduce`/`keep`/`for` and `->`/`->>` threading over `for`/`while`-style imperative loops, index juggling, or manual accumulation, unless performance profiling justifies `loop`/`recur` or a transient.
- **Destructuring over manual accessors.** Use `let`/fn-arg destructuring (`{:keys [...]}`, `[a b & rest]`) instead of repeated `(get m :k)` or positional indexing.
- **Small composed functions over long procedural bodies.** Break logic into small, named, testable functions and compose them, rather than one large function with sequential mutation-heavy steps.
- **Idiomatic control flow.** Prefer `cond`/`case`/`condp` and `when`/`if-let`/`when-let` over nested `if`s or JS-style early-return chains; prefer `^:async`/`await` or `core.async` (per the async section above) over manual `.then` chains.
- **Namespaced keywords and data-driven design** where they fit naturally (e.g. `:person/name` in shared/library code) rather than plain strings for map keys.

When converting JS/TS to CLJS specifically: re-derive the idiomatic CLJS shape of the logic rather than transliterating line-by-line — e.g. turn `.then` chains into `^:async`/`await` or `core.async`, turn classes into `defrecord`/protocols or plain maps + functions, turn `for`-loops with accumulator variables into `reduce` or `into`.

If the surrounding codebase has an established (even if less idiomatic) convention, match it for consistency rather than unilaterally "fixing" the whole file — but say so, and offer the idiomatic alternative as a suggestion rather than silently picking one or the other.

Other working-style notes:
- When debugging, ask whether the error is happening under `:none` (dev) or `:advanced`/`:simple` (prod) optimizations — the failure modes are very different (the former is usually a logic/require bug, the latter is very often a renaming/externs issue).