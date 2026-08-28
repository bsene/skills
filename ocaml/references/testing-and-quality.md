# OCaml testing & quality tooling

Background on the three test types and two quality tools a real dune project reaches for. The unit-testing framework (Alcotest) is covered inline in SKILL.md; this reference covers the rest and ties them together. Loaded on demand.

The mental model: **unit tests** prove specific examples work, **property-based tests** prove invariants hold over a space of inputs, **mutation tests** prove your tests would *catch* a bug if one were introduced. They are layered, not interchangeable — each catches what the layer above misses.

## Unit tests — Alcotest

See the Alcotest shape in SKILL.md (`Alcotest.run` + `Alcotest.test_case ... `Quick`). Unit tests assert fixed input → expected output on hand-picked cases. They are fast and live in the per-edit verification loop (`dune runtest`). Their weakness is coverage: you only test the cases you thought to write, so a branch you didn't consider is silently untested. That gap is exactly what property-based and mutation testing target.

## Property-based testing — qcheck

qcheck ([c-cube/qcheck](https://github.com/c-cube/qcheck)) generates random inputs from an **arbitrary** (a generator + printer + shrinker bundled together), runs a *property* (a predicate that should hold for every input), and on failure **shrinks** the counterexample down to the minimal failing case. Reach for it when:

- You can state an **invariant** (`List.rev (List.rev l) = l`, `sort l` has the same elements as `l`).
- You want a **round-trip** check (encode then decode returns the original).
- Hand-writing edge cases feels like guessing — let the generator find the empty list, the single element, the negative, the overflow.

Minimal shape (classic `QCheck` API):

```ocaml
let test_rev_rev =
  QCheck.Test.make ~count:1000 ~name:"rev_rev_is_involutive"
    QCheck.(list int)
    (fun l -> List.rev (List.rev l) = l)
```

`QCheck.(list int)` builds the arbitrary; `count` is how many random cases to run; the property is `('a -> bool)`. Wire the resulting `QCheck.Test.t` into your Alcotest suite via `Alcotest.with_tests`/the qcheck-alcotest shim, or run directly with `QCheck_base_runner.run_tests [test]`.

The newer `QCheck2` API takes a `QCheck2.Gen.t` generator directly and shrinks automatically (no hand-written shrinker) — useful for recursive/structured data like trees. It is less battle-tested than classic `QCheck`; prefer classic unless shrinking is painful to write by hand.

Property tests are slower than unit tests but still fast enough for `dune runtest` at a modest `~count`. They do **not** measure test quality — a passing property suite says nothing about whether your tests would catch a mutated operator. That is mutation testing's job.

## Mutation testing — mutaml

mutaml ([jmid/mutaml](https://github.com/jmid/mutaml)) injects small faults into your source (turns `+` into `-`, flips `<` to `<=`, drops a branch, negates a guard), rebuilds, and reruns your test suite. A mutation your tests still pass against is a **surviving mutant** — a bug your suite would not catch. It measures test-suite quality, not code quality.

Integration is via dune instrumentation. Add a backend to the library under test:

```
(library
 (name foo)
 (instrumentation (backend mutaml)))
```

Then build instrumented and run the suite against each mutant:

```sh
dune build test --instrument-with mutaml   # emits .muts files + mutaml-mut-files.txt
mutaml-runner _build/default/test/test_foo.exe   # loops mutations, reruns suite each time
mutaml-report                                   # prints diffs for surviving mutants
```

Keep the build and runner steps **separate** — the preprocessor writes files the runner reads, so a combined one-liner won't work; run `dune clean` if state goes stale. Tune with `MUTAML_SEED` (reproducibility) and `MUTAML_MUT_RATE` (0–100, mutation frequency).

Mutation testing is **slow** (it rebuilds and reruns once per mutant) — it does not belong in the per-edit loop. Run it as a final gate before considering a feature done, after unit and property tests already pass.

## Style linting — camelot

camelot ([upenn-cis1xx/camelot](https://github.com/upenn-cis1xx/camelot)) is a style linter built on `compiler-libs`. It flags non-idiomatic constructs the compiler itself won't warn about. Run it as a separate quality pass, not a build gate:

```sh
opam exec --switch camelot -- camelot <file>
```

## Dead-code analysis — dead_code_analyzer

dead_code_analyzer ([LexiFi/dead_code_analyzer](https://github.com/LexiFi/dead_code_analyzer)) reports unused values, functions, and modules — the OCaml compiler warns on unused locals but not on unused public bindings or modules, so this tool catches what the compiler misses.

```sh
opam exec --switch dead_code -- dead_code_analyzer <dir>
```

## The compiler-libs switch caveat

camelot and dead_code_analyzer are `compiler-libs`-based tools, and `compiler-libs` tools frequently **pin to a specific OCaml compiler version**. When a tool's required version differs from the project's own opam switch, they cannot share one switch — install the tool in its own named switch and invoke it through `opam exec --switch <name> -- <tool>`. Do not try to collapse a `compiler-libs` tool into the project's local switch; the version conflict is real, not a setup mistake.