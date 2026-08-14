---
name: ocaml
description: Write, review, debug, and explain OCaml code and dune projects. Use whenever the user mentions OCaml, .ml/.mli files, dune, dune-project, opam, Alcotest, katas or exercises written in OCaml, or asks to convert JS/TS/PHP logic into OCaml. Trigger even if the user just pastes OCaml code with a compiler error and asks "what's wrong here", asks to set up a new dune project, or asks for the OCaml idiom for something they already know how to do in JS/TS. The user is an experienced JS/TS/PHP developer but a genuine OCaml beginner — explanations should assume strong general programming skill and zero OCaml-specific knowledge, never the reverse.
---

# OCaml

OCaml is a statically-typed, mostly-functional language with a strong type inference engine (Hindley-Milner). Coming from JS/TS/PHP, the biggest mental shift is not syntax — it's that **the compiler is a design partner, not a linter**: exhaustive pattern matching and a sound type system catch entire classes of bugs (null checks, missed cases) at compile time that you're used to catching at runtime or not at all.

Default to explaining *why* something is idiomatic, not just *that* it is — the user is learning the language, not just translating syntax.

## Type inference: don't annotate unless asked

OCaml infers types from usage, almost always correctly and often more precisely than a human would bother to write. Unless the user explicitly asks for type annotations (or a `.mli` signature requires them), write bindings and function definitions **without** type annotations:

```ocaml
(* Prefer *)
let total_ttc price_ht tax_rate = price_ht *. (1. +. tax_rate)

(* Not, unless asked *)
let total_ttc (price_ht : float) (tax_rate : float) : float = price_ht *. (1. +. tax_rate)
```

If the user is confused about what type something is, the answer is to ask the tools, not to preemptively annotate everything: `ocamlc -i file.ml` prints the full inferred signature of a file without touching it, `dune utop <dir>` / `dune build @check` do the same interactively, and the `ocaml` toplevel (or `utop`) reports the inferred type after every expression you enter.

When reading an inference error, use the same left-to-right method the compiler uses: trace the expression from the outside in, starting from the most generic possible type (`'a`), and add one constraint at a time as each construct is encountered (a function application pins down an arrow type, an `if` pins its branches to the same type, an arithmetic operator pins its operands to `int` or `float`, etc.). The reported error is usually the *last* constraint that couldn't be satisfied, not the first place something looks wrong — so when a message says a variable "occurs inside" a type it's supposed to equal (an infinite/recursive type), walk back through the constraints in order rather than staring at the flagged line.

## Core language cheat sheet

- **`let` bindings are immutable by default.** `let x = 5` cannot be reassigned. Mutation needs an explicit `ref`: `let x = ref 5 in x := !x + 1`. This is the single biggest habit-break coming from JS — reach for immutable rebinding / recursion before reaching for `ref`.
- **`;;` is a REPL-only separator**, not a statement terminator. In `.ml` files, `let`/`in` chains and top-level `let` definitions don't need it.
- **`;` sequences unit-typed expressions**: `print_string "a"; print_string "b"` — both sides must be `unit`. A common beginner compile error is forgetting a value is non-unit and needs `ignore` or a `let _ = ... in`.
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
- **`|>` is the pipe operator**, directly analogous to a JS `.then`/method chain but for plain functions: `xs |> List.filter is_even |> List.map square`.
- **`rec` is required for recursive functions**: `let rec fact n = if n = 0 then 1 else n * fact (n - 1)`. Without `rec`, the function name inside the body refers to a shadowed outer binding (or doesn't exist), which is a common source of "unbound value" errors for beginners.
- **Structural vs physical equality**: `=`/`<>` compare structurally (like a deep-equal), `==`/`!=` compare physical identity (like JS `===` on objects, i.e. same box/reference). This is the *reverse* of what a JS/PHP dev's fingers expect — `=` is almost always the one you want. The asymmetry matters beyond style: `==` always finishes in constant time, while `=` walks the whole structure and can hang forever on a cyclic value (e.g. a value built with `let rec`) — if a structural comparison seems to hang, cyclic data is a real suspect, not just a slow machine.
- **`int` is not arbitrary width.** It's a native machine word minus one tag bit — 63-bit on a 64-bit machine, 31-bit on a 32-bit machine — because OCaml represents an unboxed `int` as an odd machine integer (`2n+1`) so the runtime can tell integers and pointers apart at a glance. This is narrower than a JS `Number`'s safe integer range in the 32-bit case, and it means overflow wraps silently rather than promoting to a bigger representation (there's no automatic bignum). For arbitrary-precision arithmetic, reach for `Int64`/`Int32` (fixed-width, boxed) or the `zarith` library, not the default `int`.
- **Modules (`module Foo = struct ... end`) and signatures (`.mli` files or `module type`)** are the OCaml analogue of TS interfaces + implementation, but enforced at compile time with no structural escape hatch. A `.mli` file next to a `.ml` file restricts what's visible outside the module — the closest OCaml equivalent to `export`/`private`.
- **No classes-by-default culture.** OCaml has an object system (`class`, `object ... end`) but idiomatic OCaml reaches for modules + records + functions first, objects/classes rarely. Don't default to translating a JS class into an OCaml class — translate it into a module exposing functions over a record type instead.

## Why mutation and equality behave the way they do

Worth having once, since it explains several "why is it like that" questions at once rather than each looking like an arbitrary rule: an OCaml value is either an unboxed integer or a pointer to a heap-allocated **block**. Tuples, arrays, records, and non-constant variant constructors are all just blocks (a header word + N value words) — `(1, 2)`, `[| 1; 2 |]`, and `{ a = 1; b = 2 }` all have the same underlying shape, a pointer to a 2-word block. A `ref` is nothing special either — it's a one-field mutable record, which is why `ref`/`:=`/`!` compose with everything else instead of being a distinct language feature. A `list` is exactly the linked list you'd hand-roll in JS or Java (each `::` cell is a 2-word block), except the type system guarantees it's well-formed, so there's no null-pointer case to check for — pattern matching on `[]` vs `x :: xs` forces you to handle the empty case at compile time.

This also explains the equality asymmetry above: `==` just compares the two words (pointer or unboxed int) in constant time; `=` has to walk into the blocks and can loop forever on a value that points back into itself. And a function that closes over outer variables is represented the same way — a block containing a code pointer plus the captured environment — which is why closures in OCaml aren't a special runtime object, just another pointer-to-block value like everything else.

## Project structure: dune, opam, Alcotest

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
- An `executable` stanza spanning multiple modules needs a `(modules ...)` field listing them explicitly, e.g. `(executable (name main) (modules util main) (libraries ...))` — dune compiles any `.mli` for a module before its `.ml`, mirroring the manual `ocamlc -c` order a `.mli`-then-`.ml` pair requires.
- The `.opam` file at the project root is generated output when `dune-project` has `(generate_opam_files true)` — if the user asks you to change the synopsis, authors, or dependencies, edit `dune-project`, then regenerate with `dune build`, never hand-edit the `.opam` file.
- If the user is working outside a dune project (a one-off script, or debugging in isolation), the underlying tools are still worth knowing: `ocamlc file.ml` compiles to a portable bytecode `a.out` (or `-o name` for a chosen name), `ocamlopt` does the same to native code, and `ocaml` (or `utop`) drops into a REPL. The REPL needs `;;` to terminate and evaluate an expression — that's a toplevel-only convention, never used in `.ml` files — and `#quit;;` (or Ctrl-D) exits it.
- **Alcotest** is the standard test framework in this kind of setup. Shape:
  ```ocaml
  let test_area_of_circle () =
    Alcotest.(check (float 0.001)) "area" 12.566 (Foo.area (Foo.Circle 2.))

  let () =
    Alcotest.run "foo"
      [ ("area", [ Alcotest.test_case "circle" `Quick test_area_of_circle ]) ]
  ```
  `Alcotest.check` takes a **testable** (`Alcotest.float epsilon`, `Alcotest.int`, `Alcotest.string`, `Alcotest.(list int)`, etc.) — for custom types you either derive one with `Alcotest.testable pp equal` or compare projected primitive fields. Alcotest test names show up in `dune runtest` output, so name them for what they assert, not generic ("area of a zero-radius circle is zero", not "test1").

## Debugging & compiler errors

- Treat `dune build` output as ground truth, not a nuisance to silence — the type errors it produces are usually pointing at a real logic gap (a missed pattern match arm, a type mismatch that reveals a wrong assumption), not a syntax nit.
- `Printf.printf "%d\n" x` / `Printf.printf "%s\n" x` for quick print-debugging (`%d` int, `%s` string, `%f` float, `%b` bool — printf format specifiers are type-checked at compile time, so a mismatched specifier is itself a compile error, not a runtime surprise).
- "This expression has type X but an expression was expected of type Y" almost always means: read the *inferred* type first, then find where your usage disagrees with it — the error location is often the second use site, not the actual mistake. Apply the left-to-right constraint walk from the type inference section above rather than guessing.
- A common beginner trap: forgetting a `match` arm compiles with only a *warning* (non-exhaustive pattern match) unless warnings are promoted to errors in the dune stanza — don't assume "it compiled" means every case is handled; check the warning output too.
- The type-checking rules for the core constructs are fixed and worth having memorized rather than re-derived each time: `if e1 then e2 else e3` requires `e1 : bool` and `e2`/`e3` the same type; `if e1 then e2` (no `else`) requires `e2 : unit`; `while`/`for` loop bodies must be `unit`; a sequence `e1; e2` requires `e1 : unit` (if it isn't, wrap it with `ignore e1; e2` or `let _ = e1 in e2`); a `match`/`try-with` requires every branch's right-hand side to share one type and (for `match`) every pattern to share the type of the scrutinee.

## Style defaults

- Favor small, composable functions over long imperative bodies — `List.map`/`List.filter`/`List.fold_left` over hand-rolled loops with `ref` accumulators, unless performance or clarity genuinely calls for the latter.
- Favor pattern matching over `if`/`else` chains once there are more than two cases, especially over a variant type — it's both more idiomatic and gets exhaustiveness checking for free.
- Keep functions total where reasonable (return `option`/`result` for partiality) rather than raising exceptions for expected failure cases; reserve exceptions for genuinely exceptional/programmer-error conditions.
