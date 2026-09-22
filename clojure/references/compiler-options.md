# Compiler Options

ClojureScript exposes a large set of compiler options (`:optimizations`,
`:target`, `:main`, `:npm-deps`, `:modules`, `:source-map`, `:closure-defines`,
`:externs`, `:static-fns`, …) with exact semantics and defaults that are easy
to misremember. This is the reference for the load-bearing ones — don't guess
at option names or defaults; check here first. The tool that wires these
options differs by build tool (shadow-cljs vs stock `cljs.main` vs
`cljs-build-api`); see the Tooling section at the end for where each option
lives.

## Optimization levels

`:optimizations` controls how aggressively the Google Closure Compiler rewrites
output. This is the single most consequential option.

| Level       | What it does                                                                             | Default?          |
| ----------- | ---------------------------------------------------------------------------------------- | ----------------- |
| `:none`     | No Closure optimization; dev output, one file per namespace, fast rebuilds               | **Yes (default)** |
| `:simple`   | Renames/minifies, inlines; does _not_ rewrite property access                            | No                |
| `:advanced` | Full Closure: dead-code elimination, aggressive property renaming, cross-module inlining | No                |

**Default is `:none`, not `:advanced`.** A project with no explicit
`:optimizations` is running unoptimized dev output — do not assume `:advanced`
is on just because "it's production".

`:advanced` rewrites JS property access by renaming, which **breaks untyped
JS interop** unless guarded. "Works in dev, breaks in prod" is almost always
`:advanced` renaming hitting un-extern'd JS — fix with an **externs file** or
**string-keyed access** (`goog.object/get`), not by changing app logic. See
`references/dependencies-and-interop.md` for the externs mechanics.

## Core options reference

| Option                | Default                             | Meaning                                                                                                                                                                                                                                                   |
| --------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `:output-to`          | (required)                          | Path to the single output JS file. **Mutually exclusive with `:modules`** — under `:modules`, each module map needs its own `:output-to`, not a top-level one.                                                                                            |
| `:output-dir`         | `out/`                              | Directory for intermediate dev-mode output (per-namespace files under `:none`).                                                                                                                                                                           |
| `:main`               | none                                | Entry namespace. Under `:none`, only namespaces reached by `:main`'s transitive `:require`s load — a side-effect-only namespace not reached silently doesn't run (add an explicit `:require` or use `:preloads`).                                         |
| `:target`             | `:none` (browser)                   | `:nodejs` to emit `require` preamble + shebang for Node; `:bundle` to delegate npm deps to a JS bundler (Webpack/etc.); `:none` for browser.                                                                                                              |
| `:npm-deps`           | `false`                             | Map of npm packages to install; **defaults to `false`** (off). With `:install-deps true` the CLJS compiler installs them; under `:target :bundle` you use a bundler instead. shadow-cljs handles npm via `package.json` and does **not** use this option. |
| `:install-deps`       | `false`                             | Lets the CLJS compiler run `npm install` for `:npm-deps`. shadow-cljs users don't need this.                                                                                                                                                              |
| `:externs`            | `[]`                                | Vector of externs files declaring JS APIs to protect from `:advanced` renaming. Required for un-extern'd JS interop under `:advanced`.                                                                                                                    |
| `:foreign-libs`       | `[]`                                | Vector of non-Closure JS files to wrap as namespaces (legacy; `:target :bundle` supersedes for most cases).                                                                                                                                               |
| `:modules`            | none                                | Map of code-split module → `{:output-to, :entries, :depends-on}`. Replaces top-level `:output-to`. Each module map needs its own `:output-to`.                                                                                                            |
| `:source-map`         | `false` (dev true under some tools) | Emit source maps. Accepts `true`, or a path/opts map. Essential for debugging `:advanced` builds.                                                                                                                                                         |
| `:closure-defines`    | `{}`                                | Compile-time constants replaced by Closure's `--define`. Use to inject env vars/build flags into `goog-define`d vars.                                                                                                                                     |
| `:asset-path`         | none                                | Path prefix for loading dev-mode (`:none`) modules when the served URL differs from the output dir.                                                                                                                                                       |
| `:static-fns`         | `false` (true under `:advanced`)    | Emit direct static method/field access instead of dynamic dispatch. **Defaults to `false` except under `:advanced`**, where Closure turns it on. Don't toggle blindly — it can change polymorphic dispatch behavior.                                      |
| `:fn-invoke-direct`   | `false`                             | Inline direct calls to known fns; an optimization, off by default.                                                                                                                                                                                        |
| `:optimize-constants` | `false`                             | Hoist constants; `:advanced`-only, off otherwise.                                                                                                                                                                                                         |
| `:verbose`            | `false`                             | Print compiler progress. Useful when a build "just hangs".                                                                                                                                                                                                |
| `:warnings`           | `true`                              | Whether to emit compiler warnings. Set `{:options ...}` or `false` to silence (not recommended).                                                                                                                                                          |
| `:preloads`           | `[]`                                | Namespaces loaded before `:main` — use for side-effect-only namespaces that must run under `:none` (see `:main` above).                                                                                                                                   |
| `:browser-repl`       | `false`                             | Embed the browser REPL connection.                                                                                                                                                                                                                        |

## Where each option lives, by tool

### shadow-cljs (most common in practice)

Options live in `shadow-cljs.edn`, under each build's `:compiler` map, **with
kebab-case keywords**:

```clojure
{:builds
 {:app {:target :browser
        :modules {:main {:entries [my.app.core]}}
        :compiler-options {:externs ["externs/foo.js"]
                           :closure-defines {my.app.config/env "prod"}
                           :source-map true}}}}
```

shadow-cljs **handles npm deps itself** via `package.json` + string-form
requires — you do **not** set `:npm-deps`/`:install-deps` in shadow-cljs. Code
splitting uses `:modules`; `:output-to` lives inside each module.

### Stock `cljs.main` / Clojure CLI (`deps.edn`)

Passed as CLI flags or in a `:cljs.build/build` map:

```bash
clj -M -m cljs.main -co build.edn -c
```

```clojure
;; build.edn
{:main          my.app.core
 :output-to     "out/app.js"
 :output-dir    "out"
 :optimizations  :advanced
 :npm-deps      {"react" "18.2.0"}
 :install-deps  true
 :externs       ["externs/react.js"]
 :source-map    true}
```

Use `:target :bundle` + a bundler (Webpack/Vite) instead of `:npm-deps` +
`:install-deps` for modern npm consumption; `:npm-deps`/`:install-deps` is the
older, officially-documented path.

### Leiningen + `lein-cljsbuild` / figwheel-main

Options live under `:cljsbuild :builds <build> :compiler` in `project.clj` (or a
`figwheel-main` config). Same keyword names as stock `cljs.main`.

## Common failure patterns (cross-reference)

| Symptom                                        | Option at fault                                       | Fix                                                                     |
| ---------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Works in dev, breaks under `:advanced`         | `:optimizations :advanced` renaming un-extern'd JS    | Add `:externs`, or string-keyed access                                  |
| Side-effect namespace never runs under `:none` | `:main` only loads transitive `:require`s             | Add explicit `:require`, or `:preloads`                                 |
| `:output-to` + `:modules` both set → error     | mutually exclusive                                    | Drop top-level `:output-to`; per-module `:output-to` in each module map |
| npm dep not found under stock CLJS             | `:npm-deps` defaults to `false`                       | Set `:npm-deps` + `:install-deps true`, or switch to `:target :bundle`  |
| Large-integer precision loss                   | (not an option) CLJS numbers are JS `number` (double) | Use a bigint lib; no JVM BigDecimal in CLJS                             |
| `:static-fns` changes dispatch                 | `:static-fns` defaults false except `:advanced`       | Don't toggle without profiling; check whether `:advanced` turned it on  |

## Further reading

- [ClojureScript Compiler Options](https://clojurescript.org/reference/compiler-options) — official, authoritative reference for every option
- [shadow-cljs config](https://shadow-cljs.github.io/docs/UsersGuide.html) — shadow-cljs–specific shapes
