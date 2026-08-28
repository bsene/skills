# OCaml runtime model

Background for "why is it like that" questions about mutation, equality, and value representation. Not needed for day-to-day task work — loaded on demand.

## Values are integers or pointers to blocks

An OCaml value is either an unboxed integer or a pointer to a heap-allocated **block**. Tuples, arrays, records, and non-constant variant constructors are all just blocks (a header word + N value words) — `(1, 2)`, `[| 1; 2 |]`, and `{ a = 1; b = 2 }` all have the same underlying shape, a pointer to a 2-word block.

A `ref` is nothing special either — it's a one-field mutable record, which is why `ref`/`:=`/`!` compose with everything else instead of being a distinct language feature.

A `list` is exactly the linked list you'd hand-roll in JS or Java (each `::` cell is a 2-word block), except the type system guarantees it's well-formed, so there's no null-pointer case to check for — pattern matching on `[]` vs `x :: xs` forces you to handle the empty case at compile time.

A function that closes over outer variables is represented the same way — a block containing a code pointer plus the captured environment — which is why closures in OCaml aren't a special runtime object, just another pointer-to-block value like everything else.

## Why `==` and `=` differ

`==` just compares the two words (pointer or unboxed int) in constant time; `=` has to walk into the blocks and can loop forever on a value that points back into itself (e.g. a value built with `let rec`).