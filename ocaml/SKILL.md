---
name: ocaml
description: Write, review, debug, and explain OCaml code and dune projects. Use whenever the user mentions OCaml, .ml/.mli files, dune, dune-project, opam, Alcotest, qcheck, mutaml, camelot, dead_code_analyzer, property-based testing, mutation testing, katas or exercises written in OCaml, or asks to convert JS/TS/PHP logic into OCaml. Trigger even if the user just pastes OCaml code with a compiler error and asks "what's wrong here", asks to set up a new dune project, or asks for the OCaml idiom for something they already know how to do in JS/TS. The user is an experienced JS/TS/PHP developer but a genuine OCaml beginner — explanations should assume strong general programming skill and zero OCaml-specific knowledge, never the reverse.
---

# OCaml

OCaml is a statically-typed, mostly-functional language with a strong type inference engine (Hindley-Milner). Coming from JS/TS/PHP, the biggest mental shift is not syntax — it's that **the compiler is a design partner, not a linter**: exhaustive pattern matching and a sound type system catch entire classes of bugs (null checks, missed cases) at compile time that you're used to catching at runtime or not at all.

Default to explaining _why_ something is idiomatic, not just _that_ it is — the user is learning the language, not just translating syntax.

## Type inference: don't annotate unless asked

OCaml infers types from usage, almost always correctly and often more precisely than a human would bother to write. Unless the user explicitly asks for type annotations (or a `.mli` signature requires them), write bindings and function definitions **without** type annotations:

```ocaml
(* Prefer *)
let total_ttc price_ht tax_rate = price_ht *. (1. +. tax_rate)

(* Not, unless asked *)
let total_ttc (price_ht : float) (tax_rate : float) : float = price_ht *. (1. +. tax_rate)
```

If the user is confused about what type something is, the answer is to ask the tools, not to preemptively annotate everything: `ocamlc -i file.ml` prints the full inferred signature of a file without touching it, `dune utop <dir>` / `dune build @check` do the same interactively, and the `ocaml` toplevel (or `utop`) reports the inferred type after every expression you enter.

When reading an inference error, trace the expression the way the compiler does:

- Start from the most generic type (`'a`), add one constraint per construct: function application pins an arrow type, `if` pins its branches to the same type, arithmetic pins its operands to `int` or `float`.
- The reported error is the _last_ constraint that couldn't be satisfied, not the actual mistake site — locate the real one by walking constraints in order.
- A message saying a variable "occurs inside" a type it's supposed to equal means an infinite/recursive type — walk the constraints back in order rather than staring at the flagged line.

## Core language cheat sheet

- **`let` bindings are immutable by default.** `let x = 5` cannot be reassigned. Mutation needs an explicit `ref`: `let x = ref 5 in x := !x + 1`. This is the single biggest habit-break coming from JS — reach for immutable rebinding / recursion before reaching for `ref`.
- **`;;` is a REPL-only separator**, not a statement terminator. In `.ml` files, `let`/`in` chains and top-level `let` definitions don't need it.
- **`;` sequences unit-typed expressions**: `print_string "a"; print_string "b"` — only the _left_ side must be `unit`, and the whole sequence takes the right side's type. A common beginner compile error is forgetting a value is non-unit and needs `ignore` or a `let _ = ... in`. When an imperative sequence sits inside `if ... then`/`else` or a `match` arm, parenthesize it — or use `begin ... end` for the same effect, more readably.
- **Pattern matching (`match ... with`) is exhaustive-checked by the compiler.** Adding a case to a variant type and forgetting to handle it somewhere produces a compiler warning/error, not a silent runtime bug — this is the direct analogue of TypeScript's discriminated-union exhaustiveness checks, except OCaml doesn't need a `never`-typed default branch to get it.
- **Variant types replace TS union types / enums**, and are usually the right tool where a JS dev would reach for a string literal union or a class hierarchy:
  ```ocaml
  type shape =
    | Circle of float           (* radius *)
    | Rectangle of float * float (* width, height *)

  let area = function
    | Circle r -> Float.pi *. r *. r
    | Rectangle (w, h) -> w *. h
  ```
- **Records replace plain-object interfaces**: `type point = { x : float; y : float }`. Fields are immutable unless declared `mutable`. Update via functional update syntax: `{ p with x = 0. }`.
- **`option` replaces null/undefined**, `result` replaces exceptions-as-control-flow: `type 'a option = None | Some of 'a`, `type ('a, 'e) result = Ok of 'a | Error of 'e`. There is no `null` in OCaml — an `option` has to be pattern-matched or explicitly unwrapped, so "forgot to check for null" is not a category of bug that exists.
- **Exceptions exist but the type system doesn't track them.** `raise Not_found`, `try ... with Not_found -> ...`, and custom `exception NotPrime of int` all work, but a function's type says _nothing_ about what it raises — that invisible side-channel is exactly why the style default below is `option`/`result` for expected failure. Under the hood `exn` is an **extensible variant**: you can grow it with new `exception` declarations, and `failwith s` is literally `raise (Failure s)`. Exceptions also pattern-match in a plain `match`, not just `try ... with`: `| exception (Failure s) -> s`. And a `try` arm that raises an unmatched exception silently re-propagates the _original_ one — `try` can catch but not rewrap. Built-ins worth knowing: `Not_found` (lookup misses), `Invalid_argument` (bad arguments), `End_of_file` (channel reads), `Sys_error` (file errors), `Division_by_zero`.
- **`|>` is the pipe operator**, directly analogous to a JS `.then`/method chain but for plain functions: `xs |> List.filter is_even |> List.map square`.
- **Folds are where list iteration lands.** `List.fold_left` threads an accumulator left-to-right, `List.fold_right` right-to-left, and the function's argument order flips: `f acc h` for `fold_left` vs `f h acc` for `fold_right`. `fold_left` is tail-recursive (safe on huge lists), `fold_right` is not. The order flip bites on non-commutative operators: `List.fold_left ( - ) 0 [1;2;3]` = `((0-3)-2)-1` = `-6`, but `List.fold_right ( - ) [1;2;3] 0` = `3-(2-(1-0))` = `2`. `ListLabels` variants take labeled args (`~f ~init:`) to remove the ambiguity. And short-circuit: `List.for_all`/`List.exists` stop at the first non-passing element, while a `fold_left` over `&&`/`||` visits everything.
- **Evaluation order is unspecified** for tuple and function arguments, and the current implementation evaluates right-to-left — so `(raise A, raise B)` raises `B`, not `A`. Don't rely on it; if order matters, force it with `let a = ... in let b = ... in`.
- **Every function is curried.** `let add x y = x + y` is shorthand for `fun x -> fun y -> ...` — `add 6` is itself a value (`int -> int`), and partial application composes everywhere: `List.map (add 6) xs`. Operators become functions with parentheses — `( * )` has type `int -> int -> int`, so `List.map (( * ) 2)` doubles. But sections keep argument order, which bites on non-commutative operators: `( / ) 2` is `fun x -> 2 / x`, so `List.map (( / ) 2)` does _not_ halve a list — write `fun x -> x / 2` for that.
- **`rec` is required for recursive functions**: `let rec fact n = if n = 0 then 1 else n * fact (n - 1)`. Without `rec`, the function name inside the body refers to a shadowed outer binding (or doesn't exist), which is a common source of "unbound value" errors for beginners.
- **Non-tail recursion grows the stack; tail recursion doesn't.** `1 + f (n - 1)` builds a pending expression of the whole call chain before any `+` runs — that's what "Stack overflow during evaluation (looping recursion?)" means. Fix it with an accumulator and wrap it so callers can't pass a bad initial value:
  ```ocaml
  let length l =
    let rec go acc = function [] -> acc | _ :: t -> go (acc + 1) t in
    go 0 l
  ```
  List costs matter here too: `::` is O(1), but `@` walks its whole left argument — `acc @ [x]` inside a fold/loop makes it O(n²). Cons onto the front and `List.rev` at the end instead.
- **Structural vs physical equality**: `=`/`<>` compare structurally (like a deep-equal), `==`/`!=` compare physical identity (like JS `===` on objects, i.e. same box/reference). This is the _reverse_ of what a JS/PHP dev's fingers expect — `=` is almost always the one you want. The asymmetry matters beyond style: `==` always finishes in constant time, while `=` walks the whole structure and can hang forever on a cyclic value (e.g. a value built with `let rec`) — if a structural comparison seems to hang, cyclic data is a real suspect, not just a slow machine.
- **`int` is not arbitrary width.** It's a native machine word minus one tag bit — 63-bit on a 64-bit machine, 31-bit on a 32-bit machine — because OCaml represents an unboxed `int` as an odd machine integer (`2n+1`) so the runtime can tell integers and pointers apart at a glance. This is narrower than a JS `Number`'s safe integer range in the 32-bit case, and it means overflow wraps silently rather than promoting to a bigger representation (there's no automatic bignum). For arbitrary-precision arithmetic, reach for `Int64`/`Int32` (fixed-width, boxed) or the `zarith` library, not the default `int`.
- **`int` and `float` never mix, and their operators differ.** Floats use `+. -. *. /.` (plus `**` for powers); using `+` on a float is a type error, not a coercion — convert explicitly with `float_of_int`/`int_of_float`/`Float.of_int`. Literal floats always need a decimal point (`1.`, not `1`). Unlike integer division, float division never raises: `1. /. 0.` is `infinity` (with `neg_infinity` and `nan` as the other special values), so "divide by zero" shows up as a wrong answer rather than an exception.
- **Modules (`module Foo = struct ... end`) and signatures (`.mli` files or `module type`)** are the OCaml analogue of TS interfaces + implementation, but enforced at compile time with no structural escape hatch. A `.mli` file next to a `.ml` file restricts what's visible outside the module — the closest OCaml equivalent to `export`/`private`.
- **No classes-by-default culture.** OCaml has an object system (`class`, `object ... end`) but idiomatic OCaml reaches for modules + records + functions first, objects/classes rarely. Don't default to translating a JS class into an OCaml class — translate it into a module exposing functions over a record type instead.

## Runtime model (use this when explaining equality or mutation)

Ground any answer about `=` vs `==`, mutation, or "why is it like that" in this model, and state it explicitly — it is not optional background:

- An OCaml value is either an unboxed integer or a pointer to a heap **block** (a header word + N value words).
- Tuples, arrays, records, and non-constant variant constructors are all just blocks — `{ x = 1.; y = 2. }` is a pointer to a 2-word block, so two records with identical fields are still two separately allocated blocks.
- A `ref` is just a one-field mutable record, a `list` is a chain of 2-word `::` cells, a closure is a block with a code pointer plus its captured environment — which is why `ref`/`:=`/`!` compose with everything else instead of being a distinct language feature.
- Consequence for equality: `==` compares only the two words (constant time, even on cyclic values); `=` walks into the blocks and can loop forever on a cycle.

Full walkthrough: [references/runtime-model.md](references/runtime-model.md).

## Project structure: dune, opam, Alcotest

### Initializing a new project

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
- **Alcotest** is the standard test framework in this kind of setup. Shape:
  ```ocaml
  let test_area_of_circle () =
    Alcotest.(check (float 0.001)) "area" 12.566 (Foo.area (Foo.Circle 2.))

  let () =
    Alcotest.run "foo"
      [ ("area", [ Alcotest.test_case "circle" `Quick test_area_of_circle ]) ]
  ```
  `Alcotest.check` takes a **testable** (`Alcotest.float epsilon`, `Alcotest.int`, `Alcotest.string`, `Alcotest.(list int)`, etc.) — for custom types you either derive one with `Alcotest.testable pp equal` or compare projected primitive fields. Alcotest test names show up in `dune runtest` output, so name them for what they assert, not generic ("area of a zero-radius circle is zero", not "test1"). Asserting that a function _raises_ needs a thunk (a `unit -> unit`, never an already-called value): `Alcotest.check_raises "division by zero" Division_by_zero (fun () -> 1 / 0)`. Pick test cases two ways: **black-box** (cases from the spec, no implementation knowledge) and **glass-box**/white-box (cases from each implementation branch) — cover both; black-box catches spec mismatches, glass-box catches missed branches.

The Alcotest shape above is **unit testing** — fixed examples you hand-pick. Real dune projects layer two more test types on top of it: **property-based testing** (qcheck, random inputs + shrinking to prove invariants) and **mutation testing** (mutaml, inject faults to prove your tests would catch a bug). Two adjacent quality tools — style linting (camelot) and dead-code analysis (dead_code_analyzer) — fill gaps the compiler doesn't. When to reach for each and the one-line idiom: [references/testing-and-quality.md](references/testing-and-quality.md).

## Debugging & compiler errors

- Treat `dune build` output as ground truth, not a nuisance to silence — the type errors it produces are usually pointing at a real logic gap (a missed pattern match arm, a type mismatch that reveals a wrong assumption), not a syntax nit.
- `Printf.printf "%d\n" x` / `Printf.printf "%s\n" x` for quick print-debugging (`%d` int, `%s` string, `%f` float, `%b` bool — printf format specifiers are type-checked at compile time, so a mismatched specifier is itself a compile error, not a runtime surprise).
- Canonical messages (verify against these before guessing):
  - _This expression has type X but an expression was expected of type Y_ — read the _inferred_ type first, then find where your usage disagrees with it; the error location is often the second use site, not the actual mistake. Apply the left-to-right constraint walk from the type inference section above.
  - _The function ... is applied to too many arguments_ — usually a missing `;` between two side-effecting calls in a sequence, so the second call is parsed as an extra argument to the first.
  - _Warning 8 [partial-match]: this pattern-matching is not exhaustive_ — compiles, then raises `Match_failure` at runtime on the missed case. The warning prints an example unmatched value; handle it. Promote warnings to errors in the dune stanza for real projects, and never assume "it compiled" means every case is handled.
  - _Warning 10: this expression should have type unit_ — you discarded a non-unit value in a sequence; make it explicit with `ignore e` or `let _ = e in ...`.
  - _Warning 11 [redundant-case]: this match case is unused_ — an earlier arm (often `_`) already covers this case, so this one is dead code; reorder or delete.
  - _Stack overflow during evaluation (looping recursion?)_ — either unbounded recursion (missing/wrong base case) or a non-tail-recursive function on a huge argument; fix the base case or add an accumulator (see the tail-recursion bullet above).
- Core typing rules (fixed — don't re-derive):
  - `if e1 then e2 else e3` requires `e1 : bool` and `e2`/`e3` the same type; `if e1 then e2` (no `else`) requires `e2 : unit`.
  - `while`/`for` loop bodies must be `unit`.
  - Sequence `e1; e2` requires `e1 : unit` — if it isn't, write `ignore e1; e2` or `let _ = e1 in e2`.
  - `match`/`try-with`: every branch's right-hand side shares one type; every `match` pattern shares the scrutinee's type.

## Style defaults

- Favor small, composable functions over long imperative bodies — `List.map`/`List.filter`/`List.fold_left` over hand-rolled loops with `ref` accumulators, unless performance or clarity genuinely calls for the latter.
- Favor pattern matching over `if`/`else` chains once there are more than two cases, especially over a variant type — it's both more idiomatic and gets exhaustiveness checking for free.
- Keep functions total where reasonable (return `option`/`result` for partiality) rather than raising exceptions for expected failure cases; reserve exceptions for genuinely exceptional/programmer-error conditions.

For katas and exercises, or when the user wants a structured path from beginner to writing real programs, _OCaml from the Very Beginning_ (John Whitington, free online: [johnwhitington.net/ocamlfromtheverybeginning](https://johnwhitington.net/ocamlfromtheverybeginning/ocamlfromtheverybeginning.html)) teaches the language no-prerequisites with worked questions per chapter — a good source of practice tasks and a canonical explanation order to mirror. A heavier, more rigorous companion is the Cornell CS 3110 textbook _OCaml Programming: Correct + Efficient + Beautiful_ (Fall 2026 edition, free online: [cs3110.github.io/textbook](https://cs3110.github.io/textbook/cover.html)) — an entire university course with 200+ embedded lecture videos and per-chapter exercises.

---

## Benchmark

Scenario: `.benchmarks/scenarios/ocaml-001-equality-semantics.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/ocaml-001-equality-semantics.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 83%  | −17%  |
| claude-sonnet-4-6 | 83%     | 83%  | +0%   |
| claude-haiku-4-5  | 83%     | 83%  | +0%   |

> **NEG (run 2026-08-31)**. Opus −17 (100→83): runtime-model grounding missed — the Runtime Model section is a one-liner punting to references. Sonnet/haiku unchanged. Follow-up: expand the one-liner (cap reached this cycle). Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/ocaml-001-equality-semantics.md` · Run: 2026-09-01 (salience re-run `wf_aae2e0cb`) · Log: `.benchmarks/runs/2026-09-01/ocaml-001-equality-semantics.triage-rerun.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 83%  | +0%   |
| claude-sonnet-4-6 | 83%     | 83%  | +0%   |
| claude-haiku-4-5  | 83%     | 100% | +17%  |

> **PASS (run 2026-09-01)**. Salience re-run (runtime-model one-liner promoted to an imperative inline section, wf_aae2e0cb): the 2026-08-31 opus regression is gone (−17 → +0) and the universal c5 grounding criterion cleared with-skill on haiku (83→100). Opus/sonnet still miss c5 in both conditions; opus without-skill also dropped 100→83 this run, so some baseline noise is in play. Follow-up: next cycle, check whether opus/sonnet need the grounding tied directly into the equality cheat-sheet bullet rather than its own section. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

> **PENDING (2026-09-02)**. Content update sourced from _OCaml from the Very Beginning_ (float operators, currying, exceptions, tail recursion, canonical error messages, `;`-sequence fix) and the CS 3110 textbook (folds, exception patterns / `exn` extensibility, evaluation order, Alcotest raise-testing, black-box vs glass-box test selection, resource link). Equality/runtime-model content unchanged, so ocaml-001 should be unaffected — rerun ocaml-001 before merging per release-gates.
