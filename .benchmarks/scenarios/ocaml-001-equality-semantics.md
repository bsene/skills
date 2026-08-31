---
id: ocaml-001-equality-semantics
skill: ocaml
---

# Prompt

I'm an experienced JavaScript developer, new to OCaml. This program prints `false`, then `true`, then hangs forever. Explain each result, why the semantics differ from what my JS fingers expect, and how to fix the hang:

```ocaml
type point = { x : float; y : float }

let a = { x = 1.0; y = 2.0 }
let b = { x = 1.0; y = 2.0 }

let () = Printf.printf "%b\n" (a == b)      (* prints false — why? *)
let () = Printf.printf "%b\n" (a = b)       (* prints true *)

let rec ones = 1 :: ones
let rec more_ones = 1 :: ones

let () = Printf.printf "%b\n" (ones = more_ones)   (* hangs forever — why? *)
```

# Criteria

- [ ] Response explains `a == b` is false because `==` is physical/reference identity and `a`/`b` are two separately allocated heap blocks despite equal contents
- [ ] Response explains `a = b` is true because `=` compares structurally (deep walk of the record fields)
- [ ] Response states this is the reverse of JS reflexes (`===` is reference-y, `==` is loose) and that `=` is almost always the one you want in OCaml
- [ ] Response explains the hang: structural `=` traverses cyclic values (built with `let rec`) and never terminates, while `==` is constant-time because it only compares the two words
- [ ] Response grounds the explanation in the runtime model: values are untagged ints or pointers to heap blocks, and records/refs/lists are all blocks (a ref is a one-field mutable record)
- [ ] Response does NOT claim `==` performs structural/deep equality, and does NOT recommend `==` as the fix for the content comparison