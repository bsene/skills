# Compiler Options

Options passed to the ClojureScript compiler (in `shadow-cljs.edn` build config, a `build.edn`/`cljs.edn` file for `cljs.main`, or `:cljsbuild` in Leiningen's `project.clj`). Source: https://clojurescript.org/reference/compiler-options

## Common options

| Option | Purpose | Default |
|---|---|---|
| `:optimizations` | `:none` \| `:whitespace` \| `:simple` \| `:advanced`. `:none` for dev, `:advanced` recommended for production. | `:none` |
| `:output-to` | Path of the single output JS file. | — |
| `:output-dir` | Directory for temp/compiled files. | `"out"` |
| `:main` | Entry-point namespace. With `:optimizations :none`, emits a file that loads `goog/base.js` + the namespace + a `goog.require`, so dev/prod HTML can stay identical. Also see `:asset-path`. | — |
| `:asset-path` | Relative URL path the `:main` entry script loads scripts from (not a filesystem path) — needed when `:output-dir` and the webserver root differ. | — |
| `:target` | `:nodejs` \| `:webworker` \| `:bundle` \| `:none`. Unset = browser target. `:bundle` hands off `node_modules`-style `require`s to Webpack/Metro/etc. | browser |
| `:modules` | Code-splitting into named Closure Modules, each with its own `:output-to`, `:entries` (namespace set), and `:depends-on`. Replaces `:output-to` when used. Namespaces not in any `:entries` land in the default `:cljs-base` module. A namespace can only appear in one module's `:entries`. | — |
| `:npm-deps` | Map of npm package name → version (or boolean) to pull from `node_modules`. Alpha status under optimized builds — not all npm libs survive Closure optimization; consider the Webpack guide as an alternative. | `false` |
| `:install-deps` | Auto-install declared `:npm-deps` (including transitive). | — |
| `:foreign-libs` | Vector of maps describing non-Closure-compatible JS deps to bundle: `:file`, `:file-min`, `:provides` (namespace(s) the require resolves to), `:requires`, `:module-type` (`:commonjs`/`:amd`/`:es6`), `:preprocess`, `:global-exports`. | `[]` |
| `:externs` | Externs files telling Closure which symbols must not be renamed under `:simple`/`:advanced`. Searched on cwd + classpath. | `[]` |
| `:libs` | Paths to Closure-compatible JS (`goog.provide`/`goog.require`) to bundle and watch. | `[]` |
| `:preloads` | Symbols of dev-only namespaces to load right after `cljs.core` (e.g. enabling console printing). Requires `:main` under `:optimizations :none`. | — |
| `:source-map` | Under `:none`: `true`/`false` (default `true`). Under other optimization levels: a path string for the map file. | see above |
| `:pretty-print` | Human-readable JS output. | `false` |
| `:verbose` | Emit compiler timing/details. | `false` |
| `:checked-arrays` | `:warn`/`:error`/falsy — validate `aget`/`aset` types at runtime. No effect under `:advanced`. | — |
| `:stable-names` | Reduce name churn between advanced builds (useful with `:modules` + vendorization). | — |
| `:global-goog-object&array` | If `true`, load `goog.object`/`goog.array` as globals instead of `goog.module`s. | `false` |
| `:bundle-cmd` | Shell commands run after a build when `:target :bundle` — separate `:none` (dev) and `:default` (post-Closure) commands. | — |

## Less-common options worth knowing exist

- **`:closure-defines`** — set values of `@define`/`goog-define` vars at compile time (e.g. `{"goog.DEBUG" false}`); combine with `identical?` checks (not `case`/`condp`) to get real dead-code elimination for things like locale-specific builds.
- **`:closure-warnings`** — map of Closure warning name → `:error`/`:warning`/`:off` (e.g. `{:externs-validation :off}`).
- **`:warnings`** — CLJS-level compiler warnings (undeclared vars, arity mismatches, etc.); `true`/`false` or a map of specific warning keys, e.g. `{:fn-deprecated false}`.
- **`:static-fns`** — static dispatch instead of `.call`; defaults `false` except under `:advanced` (stdlib is always compiled with it on). Turning it off during dev makes function redefinition at the REPL work smoothly.
- **`:elide-asserts`** — strip `assert`/`:pre`/`:post` checks (production perf). Always `false` by default, even under `:advanced`.
- **`:infer-externs`** — auto-generate externs for interop calls (alpha).
- **`:language-in` / `:language-out`** — ES-version input/output targeting for the Closure Compiler (e.g. `:ecmascript5`, `:es2020`, `:es-next`); `:language-in` defaults `:ecmascript5`, `:language-out` defaults `:no-transpile`.
- **`:rewrite-polyfills`** — let Closure polyfill things like native `Promise`; requires `:language-in :es6` or higher, else silently ignored.
- **`:process-shim`** — shims `process.env.NODE_ENV` via a Closure define; on by default except when `:target :nodejs`.
- **`:package-json-resolution`** — which `package.json` fields (`"browser"`/`"module"`/`"main"`) are used to resolve npm deps; defaults to `:nodejs` (`["main"]`) if `:target :nodejs`, else `:webpack` (`["browser" "module" "main"]`).
- **`:fingerprint`** — content-hash output filenames + emit a `manifest.edn` mapping; useful with `:modules` + `:source-map`.
- **`:parallel-build`** — compile across multiple cores.
- **`:anon-fn-naming-policy`** — `:off`/`:unmapped`/`:mapped` naming of anonymous functions in advanced output (debugging aid).
- **`:pseudo-names`** — readable-ish names under `:advanced`, useful for debugging missing externs.

## Common failure patterns tied to these options

- **"Works in dev, breaks under `:advanced`"** → almost always a missing extern or an untyped JS interop call getting renamed. Fix with `:externs`, `:infer-externs`, or by switching the interop to string-keyed access (`goog.object/get`).
- **`:main` code "not loading"** under `:optimizations :none` → the namespace or its side effects aren't in the transitive `:require` graph; either `:require` it properly or add it to `:preloads`.
- **`:npm-deps` build breaking only under optimization** → the npm package likely isn't Closure-compatible; consider the `:bundle` target + Webpack/Metro pipeline instead of raw `:npm-deps`.
- **Confusing `:output-to` and `:modules`** → these are mutually exclusive; `:modules` needs per-module `:output-to` inside each module map, not a top-level one.