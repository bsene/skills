---
id: ocaml-002-reasonml-port
skill: ocaml
---

# Prompt

I'm a TS developer. Our native OCaml service is moving its sources to Reason syntax (`.re`) so the frontend team can read them. Port this file to Reason, tell me how to do the bulk conversion for the other 40 files, and flag anything that silently changes meaning:

```ocaml
type point = { x : float; y : float }

let same a b = a = b
let same_block a b = a == b

let scale ?(factor = 2.) p = { x = p.x *. factor; y = p.y *. factor }

let describe p = "(" ^ string_of_float p.x ^ ", " ^ string_of_float p.y ^ ")"
```

A teammate says we should just use ReScript instead since it's "the same thing". Is it?

# Criteria

- [ ] Response maps equality correctly: OCaml `=` becomes Reason `==` and OCaml `==` becomes Reason `===`, and explicitly warns this rename is a porting trap
- [ ] Response writes the optional argument as `(~factor=2., p) =>` (or equivalent labeled-optional syntax) and keeps a positional argument after it so defaults can apply
- [ ] Response uses `++` for string concatenation in the Reason code (no `^` left) and keeps the float operators `*.` unchanged
- [ ] Response recommends `refmt` for the bulk conversion (e.g. `refmt --parse ml --print re file.ml`, with `--interface=true` for `.mli`) instead of hand-porting
- [ ] Response states ReScript is a separate language (forked from Reason/BuckleScript, `.res`, JS-only toolchain) and not a drop-in for a native OCaml/dune service
- [ ] Response does NOT claim the type system, dune build, or runtime semantics change under Reason syntax — only the surface syntax differs
