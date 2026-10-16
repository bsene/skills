# Dune, opam, and Alcotest

Detail for [OCaml](../SKILL.md).

## Initializing a new project

Don't hand-write `dune-project`/`dune` files from scratch when scaffolding a new project — use dune's own generator, then adjust:

```
dune init proj <name>
```

(prefix with `opam exec --` if the user hasn't run `eval $(opam env)` in the current shell). This creates a `<name>/` directory with `bin/`, `lib/`, and `test/` subdirectories (each with their own `dune` file), a top-level `dune-project`, and a generated `<name>.opam`. `bin/main.ml` is the entry point and is runnable immediately with `dune exec <name>`, `dune build` compiles, `dune runtest`/`dune test` runs the Alcotest suite already wired up in `test/`. This is the right default when the user asks to "set up a new dune project" — it gives them the conventional three-directory layout (below) for free, rather than the minimal single-file setup.

For a throwaway single-file project, or to show what dune actually requires under the hood, the bare minimum is two files: a `dune-project` with just `(lang dune 3.6)` (or later), and a `dune` file with an `executable` stanza, e.g. `(executable (name foo))`, sitting next to `foo.ml`. No `bin`/`lib`/`test` split is required — dune only needs a `dune` file in each directory containing something to build.

A typical dune project the user will hand you:

```
dune-project        ; project-wide config: dune lang version, package metadata
<lib>.opam           ; generated from dune-project when (generate_opam_files true) — don't hand-edit, edit dune-project instead
lib/
  dune               ; library stanza: (library (name foo) (libraries ...))
  foo.ml
test/
  dune               ; test stanza: (test (name test_foo) (libraries alcotest foo))
  test_foo.ml
```

- **`dune build`** compiles. **`dune runtest`** (or `dune test`) runs the test suite. **`dune exec <target>.exe`** runs an executable stanza directly — dune always names the built executable with a `.exe` suffix, even for native binaries on Linux/macOS, so `dune exec ./foo.exe` is correct even when there's no `foo.exe` file to be found by hand (it lives under `_build/default/`).
- **After scaffolding or editing a `dune-project` file (or any `dune` stanza), validate it before moving on.** Dune has no standalone `dune validate` subcommand — the practical check is `dune build @check`, the built-in alias that builds just enough (`.cmi`/`.cmt`/`.cmti` files) to catch stanza and syntax errors without paying for full linking, making it the fast, cheap way to confirm a fresh `dune-project`/`dune` setup is well-formed. Follow up with a plain `dune build` (and `dune runtest` if tests exist), since `@check` alone won't surface every downstream issue (e.g. link-time errors). See the [dune manual](https://dune.readthedocs.io/en/stable/#) for the full alias reference.
- An `executable` stanza spanning multiple modules needs a `(modules ...)` field listing them explicitly, e.g. `(executable (name main) (modules util main) (libraries ...))` — dune compiles any `.mli` for a module before its `.ml`, mirroring the manual `ocamlc -c` order a `.mli`-then-`.ml` pair requires.
- The `.opam` file at the project root is generated output when `dune-project` has `(generate_opam_files true)` — if the user asks you to change the synopsis, authors, or dependencies, edit `dune-project`, then regenerate with `dune build`, never hand-edit the `.opam` file.
- If the user is working outside a dune project (a one-off script, or debugging in isolation), the underlying tools are still worth knowing: `ocamlc file.ml` compiles to a portable bytecode `a.out` (or `-o name` for a chosen name), `ocamlopt` does the same to native code, and `ocaml` (or `utop`) drops into a REPL — the toplevel conventions (the `;;` terminator, `#quit;;`/Ctrl-D to exit) apply there, per the cheat sheet above.
- **Alcotest** ([mirage/alcotest](https://github.com/mirage/alcotest)) is the standard test framework in this kind of setup. Shape:
  ```ocaml
  let test_area_of_circle () =
    Alcotest.(check (float 0.001)) "area" 12.566 (Foo.area (Foo.Circle 2.))

  let () =
    Alcotest.run "foo"
      [ ("area", [ Alcotest.test_case "circle" `Quick test_area_of_circle ]) ]
  ```
  `Alcotest.check` takes a **testable** (`Alcotest.float epsilon`, `Alcotest.int`, `Alcotest.string`, `Alcotest.(list int)`, etc.) — for custom types you either derive one with `Alcotest.testable pp equal` or compare projected primitive fields. Alcotest test names show up in `dune runtest` output, so name them for what they assert, not generic ("area of a zero-radius circle is zero", not "test1"). Asserting that a function _raises_ needs a thunk (a `unit -> unit`, never an already-called value): `Alcotest.check_raises "division by zero" Division_by_zero (fun () -> 1 / 0)`. Pick test cases two ways: **black-box** (cases from the spec, no implementation knowledge) and **glass-box**/white-box (cases from each implementation branch) — cover both; black-box catches spec mismatches, glass-box catches missed branches.

The Alcotest shape above is **unit testing** — fixed examples you hand-pick. Real dune projects layer two more test types on top of it: **property-based testing** ([qcheck](https://github.com/c-cube/qcheck), random inputs + shrinking to prove invariants) and **mutation testing** ([mutaml](https://github.com/jmid/mutaml), inject faults to prove your tests would catch a bug). Two adjacent quality tools — style linting (camelot) and dead-code analysis (dead_code_analyzer) — fill gaps the compiler doesn't. When to reach for each and the one-line idiom: [testing-and-quality.md](testing-and-quality.md).
