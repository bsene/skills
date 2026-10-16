# Type Inference and Compiler Errors

Detail for [OCaml](../SKILL.md).

## Type inference

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

## Debugging and compiler errors

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
