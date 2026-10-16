---
name: ocaml
description: Write, review, debug, and explain OCaml code and dune projects. Use whenever the user mentions OCaml, .ml/.mli files, dune, dune-project, opam, Alcotest, qcheck, shrinking, counterexamples, property-based testing, mutation testing, katas or exercises written in OCaml, or asks to convert JS/TS/PHP logic into OCaml. Trigger even if the user just pastes OCaml code with a compiler error and asks "what's wrong here", asks to set up a new dune project, or asks for the OCaml idiom for something they already know how to do in JS/TS. The user is an experienced JS/TS/PHP developer but a genuine OCaml beginner — explanations should assume strong general programming skill and zero OCaml-specific knowledge, never the reverse. DO NOT USE for F#, ReasonML/ReScript, Standard ML, or other ML-family languages unless the user is explicitly comparing them to OCaml.
---

# OCaml

OCaml is a statically-typed, mostly-functional language with a strong type inference engine (Hindley-Milner). Coming from JS/TS/PHP, the biggest mental shift is not syntax — it's that **the compiler is a design partner, not a linter**: exhaustive pattern matching and a sound type system catch entire classes of bugs (null checks, missed cases) at compile time that you're used to catching at runtime or not at all.

Default to explaining _why_ something is idiomatic, not just _that_ it is — the user is learning the language, not just translating syntax.

## Type inference: don't annotate unless asked

OCaml infers types almost always correctly. Unless the user asks for annotations (or a `.mli` requires them), write bindings and functions **without** type annotations, e.g. `let total_ttc price_ht tax_rate = price_ht *. (1. +. tax_rate)`. To see inferred types, use `ocamlc -i file.ml`, `dune utop`, or the toplevel. When reading an inference error, walk the constraints in order: the reported error is the _last_ unsatisfiable constraint, not necessarily the mistake site. Examples and the full method: [type inference and compiler errors](references/inference-and-compiler-errors.md).

## Core language essentials

- `let` is immutable; mutation needs an explicit `ref` — prefer rebinding/recursion first.
- `match` is exhaustiveness-checked; variants replace TS unions/enums, records replace object interfaces, `option` replaces null, `result` replaces exceptions-as-control-flow.
- Exceptions are untracked by the type system; default to `option`/`result` for expected failure.
- Every function is curried; `|>` pipes; `rec` is required for recursion; prefer tail recursion with an accumulator wrapper, and never `acc @ [x]` in a loop.
- `=` is structural, `==` is physical identity — the reverse of a JS dev's instinct; `=` is almost always right.
- `int` is 63-bit and wraps silently; `int` and `float` never mix (`+.`, `-.`, `*.`, `/.`).
- Modules plus `.mli` signatures are the interface/privacy mechanism; prefer modules + records + functions over classes.
- Evaluation order of arguments is unspecified; force order with `let ... in`.

Full cheat sheet with examples (folds, `;` sequencing, exceptions, currying, tail recursion): [core language cheat sheet](references/core-language-cheat-sheet.md).

## Runtime model (use this when explaining equality or mutation)

Ground any answer about `=` vs `==`, mutation, or "why is it like that" in this model, and state it explicitly — it is not optional background:

- An OCaml value is either an unboxed integer or a pointer to a heap **block** (a header word + N value words).
- Tuples, arrays, records, and non-constant variant constructors are all just blocks — `{ x = 1.; y = 2. }` is a pointer to a 2-word block, so two records with identical fields are still two separately allocated blocks.
- A `ref` is just a one-field mutable record, a `list` is a chain of 2-word `::` cells, a closure is a block with a code pointer plus its captured environment — which is why `ref`/`:=`/`!` compose with everything else instead of being a distinct language feature.
- Consequence for equality: `==` compares only the two words (constant time, even on cyclic values); `=` walks into the blocks and can loop forever on a cycle.

Full walkthrough: [references/runtime-model.md](references/runtime-model.md).

## Project structure and testing

- New project: `dune init proj <name>` (prefix `opam exec --` if needed), then validate with `dune build @check` and a plain `dune build`. `dune build` compiles, `dune runtest` runs tests, `dune exec ./foo.exe` runs executables. Never hand-edit the generated `.opam`; edit `dune-project`.
- Unit tests use Alcotest; real projects add property-based testing (qcheck) and mutation testing (mutaml). Setup, stanzas, and Alcotest shape: [dune and Alcotest](references/dune-and-alcotest.md); test-type selection: [testing and quality](references/testing-and-quality.md).

## Debugging

Treat `dune build` output as ground truth: type errors usually point at a real logic gap. Canonical messages, warnings (8, 10, 11), and core typing rules: [type inference and compiler errors](references/inference-and-compiler-errors.md).

## Style defaults

- Favor small, composable functions over long imperative bodies — `List.map`/`List.filter`/`List.fold_left` over hand-rolled loops with `ref` accumulators, unless performance or clarity genuinely calls for the latter.
- Favor pattern matching over `if`/`else` chains once there are more than two cases, especially over a variant type — it's both more idiomatic and gets exhaustiveness checking for free.
- Keep functions total where reasonable (return `option`/`result` for partiality) rather than raising exceptions for expected failure cases; reserve exceptions for genuinely exceptional/programmer-error conditions.

## Representation and algorithm guidance

- For arrays containing mutable values, check aliasing: `Array.make n value` shares the same initializer. Use `Array.init` when each element needs a fresh object.
- For enforced invariants, use an abstract type; use a private record or variant when clients should inspect values but construction must stay controlled. Read [references/representation-and-invariants.md](references/representation-and-invariants.md) for examples, persistence contracts, comparator pitfalls, and signed remainders.
- For custom collections, recursive memoization, dynamic programming, or graph algorithms, read [references/data-structures-and-algorithms.md](references/data-structures-and-algorithms.md). Explain the representation invariant, algorithm preconditions, and worst-case versus amortized costs.

## Read On Demand

| Read when                                                       | Link                                                                         |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Reading inference errors, compiler messages, or typing rules    | [Inference and compiler errors](references/inference-and-compiler-errors.md) |
| Explaining a syntax or semantic idiom coming from JS/TS/PHP     | [Core language cheat sheet](references/core-language-cheat-sheet.md)         |
| Explaining `=` vs `==`, mutation, or value layout               | [Runtime model](references/runtime-model.md)                                 |
| Scaffolding dune projects or writing Alcotest suites            | [Dune and Alcotest](references/dune-and-alcotest.md)                         |
| Choosing qcheck, mutation testing, linting, or dead-code tools  | [Testing and quality](references/testing-and-quality.md)                     |
| Katas, exercises, or a beginner-to-real-programs learning path  | [Learning resources](references/learning-resources.md)                       |
| Concrete programs, data structures, or algorithms from the book | [Learn Programming with OCaml](references/learn-programming-with-ocaml.md)   |
| Benchmark results                                               | [Benchmarks](references/benchmarks.md)                                       |
