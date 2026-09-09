# Acceptance-Testing Workflow (Clojure)

A workflow for building behavior from plain-text acceptance scenarios, then keeping the
code honest with mutation testing.

## The pipeline

Acceptance tests are `.txt` files in Given/When/Then format. They flow through a
three-stage automated pipeline into executable Speclj specs:

```bash
.txt -> Parser -> .edn -> Generator -> .clj -> Speclj runner
```

1. **Parse** — read `.txt` scenarios, produce `.edn` intermediate representations.
2. **Generate** — read `.edn`, produce Speclj spec files.
3. **Run** — execute the generated specs.

The parser and generator are the two places that translate the directive catalog; keep
their pattern catalogs in sync whenever you add a pattern. Read the parser-pattern
catalog *before* touching any parser source file.

## Rules

- **Never modify an acceptance test `.txt` file without explicit permission.** Ask before
  changing existing scenarios; write new ones freely.
- **Always run the full pipeline** after any change to scenarios or the parser/generator.
- **Reset global state before each test** (e.g. `(reset-all-atoms!)`) so tests are isolated.
- **Generated specs and intermediate files are gitignored** — do not commit them.
- **If a scenario can't be translated to a spec**, report which test and why to the user,
  but still generate the spec as a *failing* test documenting the desired behavior.
- **Mock non-determinism** (e.g. `(with-redefs [rand ...])`) for tests with random
  conditions.

## Workflow

For every new or changed behavior:

1. **Write acceptance scenarios.** Confirm they fail.
2. **Write failing unit tests** and make them pass until the scenarios pass.
3. **Run tests first.**
4. **Check structure** before running changed specs.
5. **Refactor** each changed module until crap is ≤ 8.
6. **Run differential mutation tests** one module at a time: cover uncovered sites, kill
   survivors, then move to the next module.

## Quality gates

### crap (complexity + coverage)

For every changed module, run crap and refactor until crap is 8 or less. crap combines
cyclomatic complexity with test coverage — a high score means the code is both complex
and under-tested.

### Differential mutation testing

Run one module at a time. For each module: cover uncovered sites, kill surviving mutants,
then move on. Keep `max-workers` low (e.g. 3) to avoid resource contention.

- **Never run crap or mutation concurrently with any other command** — including another
  crap or mutation run. They are exclusive.
- **Batch runs:** let the first run generate fresh coverage, then use `--reuse-lcov` for
  the rest of the batch to save time.
- **Manifest updates:** differential mutation updates the manifest automatically. Do not
  run `--update-manifest` afterward unless there's a separate reason. `--update-manifest`
  is a manifest rewrite only — it should not run coverage at all.
- **Splitting a module:** if an unchanged file with a manifest is split, do not copy the
  parent manifest into the daughters. Run tests first; if green, update daughter
  manifests; then CRAP and differential mutation should be a no-op for a
  semantics-preserving split.

## Module size

When asked to check module size, measure the number of mutation sites per module. Flag
any module over 50 and offer to split it.

## Test utilities

When adding new global state (atoms), remember to update the reset helper so tests stay
isolated.

## Tooling

The workflow assumes a Clojure CLI (`deps.edn`) project with Speclj plus three helper
tools:

- `clj-mutate` — differential mutation testing
- `speclj-structure-check` — structural validation of specs before running
- `crap4clj` — complexity/coverage gate
