# npm & Clojure Dependency Interop in nbb

Source: https://github.com/babashka/nbb

## npm packages

All npm libraries a script requires are resolved **relative to that script** (i.e. its nearest `node_modules`, same as Node itself would resolve them) — declare them in a normal `package.json` next to the script(s):

```json
{
  "dependencies": {
    "csv-parse": "^5.3.0",
    "shelljs": "^0.8.5",
    "term-size": "^3.0.2",
    "zx": "^7.1.1"
  }
}
```

```clojure
(ns example
  (:require ["csv-parse/sync" :as csv]
            ["fs" :as fs]
            ["path" :as path]
            ["shelljs$default" :as sh]
            ["term-size$default" :as term-size]
            ["zx" :refer [$]]
            ["zx$fs" :as zxfs]
            [nbb.core :refer [*file*]]))
```

### The `$default` suffix

nbb implements `:require` of npm packages via a dynamic `import()` call under the hood. This means the shadow-cljs-only `:default foo` require-option syntax isn't available (nbb doesn't support it). Instead, use the `$default` suffix on the package name to pull the default export:

```clojure
(:require ["shelljs$default" :as sh])   ;; sh is the module's default export
```

This `$default` syntax comes from mainline CLJS's library-name-namespace convention and works the same way in shadow-cljs, which is why nbb adopted it rather than inventing something bespoke.

## Local `.cljs` files and the classpath

- The current directory is added to the classpath automatically.
- Use `--classpath` to add other local directories or dependency sources.
- Namespace-to-path conventions match standard Clojure tooling: a namespace `foo.bar` loads from `foo/bar.cljs` relative to a classpath root, and `foo-bar` in a namespace name becomes `foo_bar` in the directory/file name.

## Clojure (Maven-coordinate) dependencies

For dependencies from the Clojure ecosystem (not npm), create an `nbb.edn`:

```clojure
{:deps {com.github.seancorfield/honeysql {:mvn/version "2.2.868"}}}
```

nbb unpacks these into a local `.nbb` directory (analogous to `node_modules`) and loads them from there. **This requires the `bb` (babashka) executable to be present on the system `PATH`** — nbb shells out to babashka to resolve and fetch the dependency, it doesn't do this itself.

## Bundled interop libraries

nbb ships several libraries so you don't have to hand-roll interop helpers:

- **`cljs-bean`** — fast, lazy conversion between JS objects and Clojure maps (since nbb v0.1.0).
- **`applied-science.js-interop`** (since nbb v0.0.75) — ergonomic JS property/method access:
  ```clojure
  (require '[applied-science.js-interop :as j])
  (def o (j/lit {:a 1 :b 2 :c {:d 1}}))
  (j/select-keys o [:a :b])   ;; #js {:a 1, :b 2}
  (j/get-in o [:c :d])        ;; 1
  ```
  **Two things this library does NOT support under nbb**, unlike full-CLJS environments: `:syms` destructuring, and `.-x`-style property access — in nbb you must use keyword-based access (`j/get`, `j/get-in`, etc.) instead of `.-x` when going through `js-interop`. Plain interop (`.-x`, `.method`) outside this library still works normally.
- **`reagent.core`** — lazily loaded; primarily used with `ink` for terminal UI apps (see main SKILL.md).
- **`promesa.core`** — see `references/promises-and-macros.md`.

## `$default` vs. plain requires — quick troubleshooting

| Symptom                                                                                    | Likely cause / fix                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `require` of an npm package returns `undefined`/`nil` where you expected a function/object | Package exports a default export — add the `$default` suffix to the require string.                                                                                                                  |
| `Cannot find module` for a package that's clearly installed                                | Check the package is in `package.json` **relative to the script being run**, not just some other directory's `node_modules`.                                                                         |
| A local namespace `(:require [foo.bar :as fb])` isn't found                                | Check the file lives at `foo/bar.cljs` relative to a classpath root (cwd is on the classpath by default; add more with `--classpath`), and that the underscore/hyphen naming convention is followed. |
| Maven/Clojure dependency in `nbb.edn` fails to resolve                                     | Confirm `bb` (babashka) is installed and on `PATH` — nbb needs it for this feature specifically.                                                                                                     |
