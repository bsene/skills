---
name: clojurescript-nbb
description: Write, review, and debug scripts for nbb (babashka/nbb) — ad-hoc ClojureScript scripting on Node.js via SCI. Use this whenever the user mentions nbb, "node babashka", .cljs scripts meant to run with `nbb script.cljs`/`npx nbb`, or wants a quick CLI/automation/serverless script written in ClojureScript instead of Node.js. Also use it for npm interop from nbb (`:require ["pkg" :as x]`, `$default` imports), promise handling with promesa (`p/let`, `p/do!`), first-class macros in nbb scripts, nbb.edn Clojure deps, or the nbb REPL/nREPL. Do NOT use this for shadow-cljs/Closure-compiled CLJS projects, advanced-compilation questions, or browser-optimized builds — nbb has no Closure Compiler stage and a different (smaller) language surface; prefer the general `clojurescript` skill for those.
compatibility: Requires Node.js 14+ and the `nbb` npm package (`npm install nbb -g` or a local install) to actually run scripts. Consuming this skill for writing/reviewing code needs no tools. Loading Clojure (Maven-coordinate) dependencies via nbb.edn additionally requires the `bb` (babashka) executable on PATH.
metadata:
  version: "1.0.0"
  source: https://github.com/babashka/nbb
---

# ClojureScript on nbb

nbb is "ad-hoc CLJS scripting on Node.js": it evaluates ClojureScript through **SCI** (the same interpreter that powers babashka), not through the usual CLJS-to-JS compile + Google Closure Compiler pipeline. That trade-off is the whole story of how nbb differs from "normal" CLJS (shadow-cljs, `cljs.main`, Leiningen):

- **Fast startup, no build step.** No `:optimizations` levels, no advanced-compilation renaming, no externs. `nbb script.cljs` just runs — startup is ~170ms.
- **A subset of the language.** SCI interprets a large but not-complete subset of CLJS. Notably: no `deftype` (as of current nbb). Assume standard `defn`/`let`/`defrecord`/protocols/multimethods/`core.async`-adjacent constructs work; verify anything exotic against `references/` or the nbb README/CHANGELOG rather than assuming full compiled-CLJS parity.
- **First-class macros, right in the script.** Unlike self-hosted CLJS generally, you can `defmacro` directly inside a `.cljs` file and use it in the same file — no separate `.clj`/`.cljc` split needed. This is a headline nbb feature; lean on it for things like sync-looking async code (see `plet` below).
- **npm interop is the default interop story**, not an optional add-on — nbb scripts routinely `:require` npm packages directly.

If you're unsure whether a request is nbb or general/shadow-cljs CLJS, check for `nbb.edn`, a `#!/usr/bin/env nbb` shebang, or explicit "nbb"/"node babashka" mentions. If it's a browser app, Reagent+re-frame SPA, or mentions `:optimizations`/`shadow-cljs.edn`, that's the general `clojurescript` skill's territory instead.

## Requiring npm packages

nbb implements `:require` for npm packages via a dynamic `import()`, resolved relative to the script and to that script's local `node_modules`:

```clojure
(ns example
  (:require ["csv-parse/sync" :as csv]
            ["fs" :as fs]
            ["path" :as path]
            ["shelljs$default" :as sh]
            ["zx" :refer [$]]
            [nbb.core :refer [*file*]]))
```

Key rule: **use the `$default` suffix to pull a package's default export**, e.g. `["shelljs$default" :as sh]`. This is a CLJS library-name-namespace syntax (not nbb-specific in origin), but nbb relies on it directly since it doesn't support shadow-cljs's `:default foo` require-option syntax. If default-export interop isn't working, this suffix is almost always the fix — see `references/npm-interop.md` for more on package resolution, the `--classpath` flag for local `.cljs` files, and limitations of the bundled `cljs-bean` / `applied-science.js-interop` libraries (e.g. `js-interop` requires keyword-based property access in nbb, not `.-x`).

Loading dependencies from the Clojure/Maven ecosystem (not npm) needs an `nbb.edn` file and the `bb` executable on PATH — see `references/npm-interop.md`.

## Async: promesa first, not raw `.then` chains

nbb bundles **promesa** (`promesa.core`), and it's the idiomatic way to write promise-based nbb code — reach for it before hand-rolling `.then`/`.catch` chains:

```clojure
(require '[promesa.core :as p])

(p/let [a (fetch-thing)
        b (inc a)
        c (fetch-other-thing)]
  (prn (+ b c)))
```

`p/do!` sequences side-effecting/promise-returning steps like a `do` block that also awaits promises along the way. Because macros are first-class in nbb, you'll also see hand-written `plet`-style macros in the wild for the same purpose — recognize the pattern but prefer `promesa.core/p/let` in new code since it's already bundled and battle-tested. Full detail and examples: `references/promises-and-macros.md`.

Don't assume the newer core-CLJS `^:async`/`await` function support (from mainline ClojureScript 1.12+) is available — nbb runs on SCI and its language-feature set doesn't automatically track every recent CLJS compiler release. If asked to use that form, check the current nbb README/CHANGELOG first rather than assuming; default to promesa unless told otherwise.

## Testing with `cljs.test`

`cljs.test` is built into nbb's runtime — no extra dependency needed, just `:require` it like any other namespace and call `cljs.test/run-tests` as a top-level form to make the script self-running (`nbb my_test.cljs`). See `references/example-namespaces-and-testing.md` for a full worked example (a module + its test file, bundled in `assets/examples/`) covering the namespace/filename convention, the standard `deftest`/`testing`/`is` shape, and when to graduate to a community test-runner (`nbb-test-runner`) for multi-file suites.

## Structure of a typical nbb script/project

```
my-script/
├── package.json      # npm deps, resolved relative to the script
├── nbb.edn           # optional: Clojure/Maven deps (needs bb on PATH)
└── script.cljs
```

- Entry point convention: define `-main` and run with `nbb -m my.namespace` when you want args/lifecycle like a "real" CLI, or just let a script's top-level forms run when invoked directly (`nbb script.cljs`).
- `nbb.core/*file*` gives the path of the currently-executing file; `(= nbb.core/*file* (nbb.core/invoked-file))` is nbb's equivalent of Python's `if __name__ == "__main__"`.
- Reader conditionals: use `:org.babashka/nbb` (checked first) alongside or instead of `:cljs` when code needs to branch on "am I running under nbb specifically" vs. plain CLJS: `#?(:org.babashka/nbb ... :cljs ...)`.
- REPL options: plain console REPL (`nbb`), socket REPL (`nbb socket-repl :port N`), or nREPL (`nbb nrepl-server :port N`) for editor integration (Calva, CIDER, vim-fireplace, etc.). See `references/tooling-and-repl.md`.

## Terminal UIs with Reagent + ink

nbb bundles `reagent.core` (lazy-loaded) for building small TUI apps on top of the npm `ink` library — the same Reagent API used for React apps, targeting a terminal renderer instead of the DOM:

```clojure
(ns ink-demo
  (:require ["ink" :refer [render Text]]
            [reagent.core :as r]))

(defonce state (r/atom 0))

(defn hello []
  [:> Text {:color "green"} "Hello, world! " @state])

(render (r/as-element [hello]))
```

Same Reagent idioms as browser CLJS apply (`r/atom`, hiccup-style vectors, `[:> JsComponent props ...]` for interop with a JS/React component) — just swap the DOM-flavored surrounding tooling for `ink`.

## Working style

- Same idiomatic-CLJS defaults as general ClojureScript: immutable data, `let`/destructuring, threading macros, small composed functions, `cond`/`when-let` over nested `if`. See the general `clojurescript` skill's "Working style" section for the full list — it applies here unchanged.
- Prefer nbb's bundled libraries (`promesa`, `cljs-bean`, `applied-science.js-interop`) over hand-rolled interop helpers; they're already vetted against SCI's constraints.
- When something doesn't work and looks like it should (a macro, a language feature, a `deftype`), suspect the SCI language subset before assuming a bug in the user's code — confirm against `references/` or suggest checking the nbb CHANGELOG for recent additions.
- Don't propose `:optimizations`, externs, or other Closure-Compiler-era fixes for nbb problems — that pipeline doesn't exist here. If the user's actual problem is "I need this to compile to a fast, browser-optimized bundle," point out nbb likely isn't the right tool and shadow-cljs is (there's a documented migration path from nbb to shadow-cljs).
