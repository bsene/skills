# ReScript testing & tooling (incl. the 11→12 migration)

Test-framework landscape with maintenance status, and the mechanical migration checklist for old ReScript codebases. Loaded on demand from SKILL.md.

## Framework comparison

| Framework                              | State (Aug 2026)                                                  | When to reach for it                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@glennsl/rescript-jest` 0.13.x        | Maintained, ReScript-12-ready                                     | **Default for JS devs** — real Jest underneath: watch mode, snapshots, existing CI/monorepo wiring all work unchanged |
| `rescript-test` 8.x (runner: `retest`) | Maintained (bloodyowl); v12 compat spot-check before recommending | ReScript-native minimalism, no Jest dependency                                                                        |
| `@dusty-phillips/rescript-zora` 5.x    | Documented against ReScript 11, looks stale                       | Don't start new projects on it                                                                                        |

Rescript-jest is the default recommendation not because Jest is best but because zero muscle memory changes: the user already knows `describe`/`expect`, their CI already runs Jest, and the test _language_ is the interesting part.

## rescript-jest setup

```
npm install --save-dev @glennsl/rescript-jest jest
```

rescript.json needs the test sources compiled to CommonJS for Jest unless the project has an ESM-jest setup already — the minimal addition:

```json
"sources": [{ "dir": "src", "subdirs": true }, { "dir": "tests", "type": "dev" }]
```

Test shape — declarative `describe`/`test`/`expect`, one assertion per test (the binding rewrites assertion chaining into focused cases, so a JS dev's `expect(a).toBe(b)` instincts survive verbatim):

```rescript
open Jest
open Expect

describe("totalTtc", () => {
  test("applies tax to a positive net", () => {
    expect(totalTtc(100, 0.2))->toBe(120)
  })
  test("rejects a negative rate", () => {
    expect(totalTtc(100, -0.2))->toThrow()
  })
})
```

Runs with plain `jest`; `jest --watch` works while `rescript watch` rebuilds in the other terminal — two watchers, no orchestration needed. Custom types: rescript-jest derives printers from whatever `toString`-shaped function you pass (`expect(x)->toBe` compares structurally for records/variants by construction — the runtime representation is small enough that printing gives you real diff output).

## retest (rescript-test) shape

```rescript
open Retest

let () = run(makeSuite("totalTtc", [
  test("applies tax to a positive net", () => assertEqual(totalTtc(100, 0.2), 120)),
]))
```

Runner is `retest` (ships with the package). Leaner output, no snapshot support — that's the trade against Jest.

## The 11→12 migration checklist

For a codebase the user hands you at ReScript 11 / bsconfig.json era. Run the codemods **before** any hand edits — the flags moved too, and mixing "some migrated, some not" states is what makes the compiler output unreadable.

1. `npx rescript-tools migrate-all` — mechanical codemods first (config rename, dependency keys, JSX v3→4 components, operator unification edits).
2. **Config**: `bsconfig.json` → `rescript.json`; rename keys: `bs-dependencies` → `dependencies`, `bs-dev-dependencies` → `dev-dependencies`, `bsc-flags` → `compiler-flags`. `package-specs` must be the object form `{"module": "esmodule", "in-source": true}` — the `es6`/`es6-global` string forms are gone.
3. **JSX**: only `"jsx": {"version": 4}` is valid. Components using `...children` spread or v3 `mode` need rewrites, covered by the codemod for common shapes — verify each `make` still receives its props after.
4. **`@rescript/core`**: bundled into the compiler since v12 (internally `Stdlib`). Delete the dependency and every `-open RescriptCore` — the stdlib is now implicit.
5. **Uncurried is unconditional**: partial application by _omitting_ an argument is now a compile error, not a value. Sites that relied on under-application need explicit closures: `(a, b) => f(a, b)` or partial-app helpers.
6. **Operators**: `+.`/`*.` etc. are gone — unified `+ - * / % **` (the codemod handles these). `/` on ints is still integer division; `^` for string concat is superseded by `+` (also string) — prefer `+` in new code.
7. **Node ≥ 20.11.0** and rewatch (default `rescript build`) — the old Ninja builder is `rescript legacy` (`bsb` scripts in package.json need pointing at the new CLI).
8. Expect breakage concentrated in: handwritten `external` callbacks whose types assumed currying, and JSX components (per above). Everything else is usually the codemod.
