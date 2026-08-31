---
id: rescript-001-v12-migration
skill: rescript
---

# Prompt

Our repo is on ReScript 11 and we're migrating to ReScript 12. Here are the relevant files:

bsconfig.json:

```json
{
  "name": "shop",
  "bs-dependencies": ["@rescript/core"],
  "bsc-flags": ["-open RescriptCore"],
  "package-specs": "es6",
  "jsx": { "version": 3 }
}
```

src/Price.res:

```rescript
let withTax = (base, rate) => base *. (1.0 +. rate)

let label = n => "Total: " ^ Js.Float.toString(n)

let add = (a, b) => a + b
let inc = add(1)   // partial application

@react.component
let make = (~price, ~children) => {
  <div> {children} <span> {label(price)->React.string} </span> </div>
}
```

Give me a migration plan: the order to do things in, exactly what changes in the config, and what breaks in Price.res. Assume Node 20.

# Criteria

- [ ] Response says to run the codemods first (`npx rescript-tools migrate-all`) BEFORE any manual edits
- [ ] Response renames the config to `rescript.json` and renames the keys: `bs-dependencies` → `dependencies`, `bs-dev-dependencies` → `dev-dependencies`, `bsc-flags` → `compiler-flags`, and switches `package-specs` to the object form `{"module": "esmodule", "in-source": true}` (the `"es6"` string form is gone)
- [ ] Response rewrites the float operators `+.`/`*.` to the unified `+`/`*` (no `*.` or `+.` left in the v12 code) and notes `+`/string concat supersedes `^`
- [ ] Response says `@rescript/core` is bundled into the compiler since v12 — drop the dependency and the `-open RescriptCore` flag
- [ ] Response flags `inc = add(1)` as now a compile error (uncurried is unconditional in v12: omitted argument = error, not partial application) and rewrites it with an explicit closure like `(b) => add(1, b)`
- [ ] Response addresses the JSX: `"jsx": {"version": 4}` is the only valid setting and the v3 `~children`/`...children` spread needs rewriting (a new `"preserve": true` mode exists for esbuild/SWC pipelines) — and does NOT propose keeping `bsconfig.json` or any `bs-`-prefixed config keys