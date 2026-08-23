# Dependencies & Interop

CLJS code ends up consuming JS from three distinct worlds — npm packages, Google
Closure Library, and arbitrary "foreign" (non-Closure-compatible) JS — and each has
different `:require`/`:import` shapes and different failure modes under optimized
builds. Getting the wrong shape usually still works under `:optimizations :none`
and then breaks (silently or loudly) under `:simple`/`:advanced`. Check which world
a dependency belongs to before writing the require.

## 1. npm packages (via `:npm-deps` or `:target :bundle`)

There are two different conventions in the wild here, and mixing them up is a common source of confusion:

**shadow-cljs (most common in practice today)** consumes npm packages directly via a string-form require, the same way JS/TS does:

```clojure
(ns my.app.core
  (:require ["react" :as react]
            ["lodash/debounce" :default debounce]
            ["some-lib" :refer [thing1 thing2]]))
```

- The **string** in the `:require` vector is the npm package/module specifier —
  exactly what you'd put in a JS `import`/`require`. This is distinct from a
  symbol-form require (`[my.app.util :as u]`), which is for CLJS/Closure namespaces.
- `:as` binds the whole module; `:default` binds a package's default export;
  `:refer` destructures named exports.
- Under shadow-cljs, npm deps just need to be present in `node_modules` (via
  `package.json`) — no separate `:npm-deps` compiler-option map is needed.
- **This string-require form is a shadow-cljs convention, not something documented
  on ClojureScript.org's own reference pages** — don't present it as "the" standard
  CLJS syntax without qualification when the project isn't using shadow-cljs.

**Stock `cljs.main`/Clojure CLI** (the officially-documented path, per the
[ClojureScript with Webpack guide](https://clojurescript.org/guides/webpack)) instead
requires the npm package with ordinary **symbol-form** require, once `:npm-deps` +
`:install-deps` (or `:target :bundle` + a bundler) makes it resolvable as a
namespace:

```clojure
(ns hello-bundler.core
  (:require [react]))

(.log js/console react/Component)
```

- Set `:npm-deps {"react" "..."}` (or `:install-deps true`) plus `:target :bundle`,
  then hand the compiler's output to Webpack/Metro via `:bundle-cmd` — see
  `references/compiler-options.md`.
- Which convention applies depends entirely on the toolchain the project already
  uses — check for a `shadow-cljs.edn` (string-form) vs a `deps.edn`/`build.edn`
  driving `cljs.main` directly (symbol-form) before writing a require, rather than
  assuming.

### npm + `:advanced` optimization

`:npm-deps`-based consumption is **alpha status under optimized builds** — not every
npm package survives Closure's `:advanced` renaming, because most npm code isn't
written with Closure's property-renaming assumptions in mind. If an npm-backed build
works under `:none`/`:simple` but breaks under `:advanced`:

- Prefer `:target :bundle` + Webpack/Metro so Closure never touches the npm code's
  internals — Closure only optimizes your CLJS, and Webpack bundles the (unrenamed)
  JS dependency separately.
- If you must stay on raw `:npm-deps` + `:advanced`, you may need an externs file
  for that package (see Externs below), or to access it via string-keyed property
  access (`goog.object/get`) rather than dot-interop.

## 2. Google Closure Library

Closure Library ships with the CLJS compiler and is always available — no
package.json entry needed. It's a different namespace-import mechanism from CLJS's
own `:require`:

```clojure
(ns my.app.core
  (:require [goog.string :as gstring]
            [goog.object :as gobj])
  (:import [goog Timer]
           [goog.async Debouncer]))
```

- `:require` for Closure namespaces that are themselves `goog.provide`d (mirrors
  CLJS-to-CLJS requires).
- `:import` for Closure **classes/enums/constructors** specifically (e.g. `goog
  Timer`, `goog.async Debouncer`) — mirrors JVM Clojure's `:import` for Java
  classes, and is the CLJS-side equivalent for Closure's constructor-style APIs.
- Because Closure Library is written for Closure's compiler, it survives
  `:advanced` renaming safely — no externs needed for it.
- `goog.object`/`goog.array` functions (`goog.object/get`, `goog.object/set`) are
  the standard escape hatch for reading/writing properties on JS objects that must
  survive `:advanced` without renaming — reach for these instead of `.-prop` dot
  interop when a property name is dynamic or comes from untyped/foreign JS.

## 3. Foreign (non-Closure-compatible) JS

For a raw JS file that's neither an npm package nor Closure-compatible (e.g. a
vendored `.js` file, a CDN-style global-exporting script), use `:foreign-libs` in
the compiler config:

```clojure
:foreign-libs [{:file "vendor/some-lib.js"
                 :provides ["some.lib"]
                 :global-exports '{some.lib SomeGlobal}}]
```

- `:file` — path to the JS source.
- `:provides` — the namespace(s) this file makes available to `:require`.
- `:requires` — other namespaces this file itself depends on (if any).
- `:module-type` — `:commonjs`, `:amd`, or `:es6` if the file uses one of those
  module systems; omit for a plain global-exporting script.
- `:global-exports` — maps the provided namespace to the global var/object the
  script attaches to `window`/`global`, so CLJS knows how to reach it. **The map
  must be quoted** (`'{some.lib SomeGlobal}`) since the keys/values are plain
  symbols, not resolvable vars — an unquoted map here is a common copy-paste bug.
  String keys/values (`{"some.lib" "SomeGlobal"}`) work too and don't need quoting.

This is the older, pre-npm-interop mechanism (sometimes bundled historically via
CLJSJS packages, which wrapped popular JS libs as `:foreign-libs`-ready jars).
Prefer npm-based `:require` (section 1) for anything actually published to npm —
reach for `:foreign-libs` mainly for vendored/local files with no npm distribution.

## 4. Externs — telling Closure what not to rename

Under `:simple`/`:advanced`, the Closure Compiler renames symbols it doesn't
recognize as "must stay stable" — which includes essentially all untyped JS you
interop with unless you tell it otherwise. An externs file is a `.js` file
containing type/property declarations (no implementation) that marks names as
off-limits for renaming:

```javascript
// externs.js
var SomeGlobal = {};
SomeGlobal.doThing = function(x) {};
```

```clojure
:externs ["externs.js"]
```

- Searched on the classpath and cwd; declared in the `:externs` compiler option
  (a vector of file paths).
- **The single most common "works in dev, breaks in prod" bug** is a missing
  extern: dot-interop (`.doThing`, `.-someProp`) on an object Closure doesn't
  recognize gets silently renamed under `:advanced`, and the property access then
  fails at runtime against the real (unrenamed) object.
- Two fixes, in order of preference:
  1. Add an externs file for the library (best long-term fix, keeps normal
     `.method`/`.-prop` syntax working).
  2. Switch the interop to string-keyed access (`goog.object/get obj "doThing"`),
     which is immune to renaming because it's not a static property reference at
     all.
- `:infer-externs` (alpha) can auto-generate externs for interop call sites, but
  don't rely on it for anything beyond a quick sanity check — hand-written externs
  are still the reliable path for a library you'll ship.
- `:pseudo-names` (see `references/compiler-options.md`) makes `:advanced` output
  readable enough to spot exactly which renamed property is breaking, when
  debugging a missing-externs failure.

## Decision guide

| Dependency is... | Use |
|---|---|
| Published to npm | `["pkg-name" :as x]` string-form require |
| Part of Closure Library | `:require`/`:import` symbol-form, `goog.*` namespace |
| A vendored/local JS file, no npm distribution | `:foreign-libs` entry |
| Any of the above, breaking only under `:advanced` | Add/check externs first; fall back to `goog.object/get` string-keyed access |

## CLJS libraries (normal case)

Plain CLJS libraries (published as jars/deps, not JS) just use ordinary
`:require` — no special interop handling needed, since they're already CLJS/Closure
namespaces. This whole file only applies once you cross the boundary into
JS-authored code.
