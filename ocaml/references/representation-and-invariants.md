# Representation and invariants

Adapted and condensed from _Learn Programming with OCaml_ by Sylvain Conchon and Jean-Christophe Filliâtre, English translation by Urmila Nair: [sections 2.5, 2.11, 2.14, 5.1, and 10.3](https://usr.lmf.cnrs.fr/lpo/lpo.pdf). This adaptation changes the explanations and examples and is licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Array initialization can share mutable values

`Array.make n value` evaluates `value` once and repeats it. With a mutable value, the cells alias the same object. `Array.copy` also copies only the outer array.

```ocaml
let shared = Array.make 2 (Array.make 3 0)
let () = shared.(0).(0) <- 7
let () = assert (shared.(1).(0) = 7)

let separate = Array.init 2 (fun _ -> Array.make 3 0)
let () = separate.(0).(0) <- 7
let () = assert (separate.(1).(0) = 0)
```

Use `Array.make_matrix rows cols 0` for a matrix of integers. If each cell needs its own mutable object, use nested `Array.init`; `Array.make_matrix rows cols (ref 0)` still shares the reference stored in its cells. Sharing an immutable initializer such as `[]` is safe.

## Hide construction to enforce an invariant

A public `type t = int` alias cannot enforce a range. An abstract `type t` in a `.mli` or module signature requires clients to use the module's constructors. Adapt expected validation failures to `option`/`result`.

```ocaml
module Percentage : sig
  type t
  val make : int -> t option
  val value : t -> int
end = struct
  type t = int
  let make n = if n >= 0 && n <= 100 then Some n else None
  let value n = n
end
```

If clients should inspect fields or pattern-match but cannot construct values, expose a private record or variant, such as `type t = private { value : int }`. Enforce the invariant inside the module. Private records also prevent clients from assigning their mutable fields, but do not make nested mutable objects immutable.

For abstract collections, expose the needed `iter` or `fold` so callers can traverse them without knowing the representation.

## Persistence is a behavioral promise

`add : elt -> t -> t` suggests a persistent collection; `add : elt -> t -> unit` suggests mutation. These signatures are conventions, not proof: returning the original object after mutating it also type-checks.

Persistence means existing versions remain observably unchanged. Structural sharing is safe for immutable nodes. For rollback-sensitive work, build a new persistent value, then assign it to the state reference once construction succeeds. This only preserves that reference's old value on failure; it does not undo unrelated side effects.

## Comparison and remainder traps

- A comparator returns a negative integer, zero, or a positive integer; do not assume exactly `-1` or `1`. Prefer `Int.compare x y` over `x - y`, which can overflow. A collection's comparator must consistently define its ordering and equality.
- OCaml's remainder has the dividend's sign: `(-1) mod 5 = -1`. For positive `m`, normalize with `let r = x mod m in if r < 0 then r + m else r`. Applying `mod` after multiplication does not repair integer overflow that already occurred.
