# ReasonML — OCaml with a JS-Friendly Syntax

Condensed from the official [Reason documentation](https://reasonml.github.io/docs/en/what-and-why). Reason is **a different syntax for the same language**: same compiler, type system, opam, dune and ocaml-lsp. Everything in this skill about types, inference, the runtime model and testing applies unchanged. Only the surface syntax differs.

| Target          | Toolchain                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| Native/bytecode | opam + dune (dune compiles `.re`/`.rei` once `reason` is installed)                                       |
| JavaScript      | [Melange](https://melange.re/), the backend Reason recommends; JS interop is documented there             |
| Not Reason      | **ReScript** (`.res`), a separate language that forked from Reason/BuckleScript; use the `rescript` skill |

## Setup

From the official [installation guide](https://reasonml.github.io/docs/en/installation). For a JS target, start from the Melange team's `melange-opam-template` instead.

```sh
opam init -y && eval $(opam env)         # once per machine
opam switch create . 5.1.0 --deps-only   # local switch; any recent OCaml 5.x works
eval $(opam env)
opam install reason dune                 # reason provides refmt and rtop
```

A project is the usual dune layout with `.re` sources:

```
hello.re      print_endline("Hello world!");
dune          (executable (name hello) (public_name hello))
dune-project  (lang dune 3.6)
hello.opam    (empty; public_name needs a package)
```

`dune exec hello` builds and runs; `dune build @fmt` formats with refmt.

## refmt

| Task                      | Command                               |
| ------------------------- | ------------------------------------- |
| Format in place           | `refmt --in-place file.re`            |
| OCaml → Reason            | `refmt --parse ml --print re file.ml` |
| Reason → OCaml            | `refmt --parse re --print ml file.re` |
| Interface (`.rei`/`.mli`) | add `--interface=true`                |
| Print width               | `-w 100` (or `REFMT_PRINT_WIDTH`)     |

Use the OCaml → Reason conversion to translate any OCaml example from this skill's references instead of rewriting it by hand. REPL: `rtop`.

## Syntax Map (OCaml → Reason)

| Concept             | OCaml                                 | Reason                                                    |
| ------------------- | ------------------------------------- | --------------------------------------------------------- |
| Binding             | `let x = 5 in …`                      | `let x = 5;` (blocks `{ … }` return the last expression)  |
| Function            | `let add a b = a + b`                 | `let add = (a, b) => a + b;` (still curried)              |
| Call                | `add 1 2`                             | `add(1, 2)`                                               |
| Partial application | `let add5 = add 5`                    | `let add5 = add(5);` · skip a position: `divide(_, 2)`    |
| Labeled / optional  | `~x` / `?y` / `?(y = 0)`              | `~x` / `~y=?` / `~y=0`, then end with `()`                |
| Pass an option on   | `?y` at the call site                 | `~y=?value`                                               |
| Recursion           | `let rec f x = …`                     | `let rec f = x => …;`                                     |
| Type params         | `int list`, `'a option`               | `list(int)`, `option('a)`                                 |
| Annotation          | `let f (x : int) : int = …`           | `let f = (x: int): int => …;`                             |
| Function type       | `int -> int -> int`                   | `(int, int) => int`                                       |
| Match               | `match x with A -> … \| B n -> …`     | `switch (x) { \| A => … \| B(n) => … }`                   |
| Variant             | `type t = A \| B of int`              | `type t = \| A \| B(int);`                                |
| Record              | `{ x : int; mutable y : int }`        | `{x: int, mutable y: int}`, update with `{...p, x: 1}`    |
| Tuple               | `(1, "a")`                            | `(1, "a")`                                                |
| List / array        | `[1; 2]` / `[\|1; 2\|]`               | `[1, 2]` / `[\|1, 2\|]`, cons with `[x, ...rest]`         |
| String concat       | `^`                                   | `++` (double quotes only; `'a'` is a char)                |
| Float ops           | `+.` `*.`                             | `+.` `*.` (unchanged)                                     |
| Equality            | `=` structural, `==` physical         | `==` structural, `===` physical                           |
| Ref                 | `let r = ref 0 in r := !r + 1`        | `let r = ref(0); r := r^ + 1;`                            |
| Loops               | `for i = 0 to 10 do … done`           | `for (i in 0 to 10) { … }` · `downto` · `while (c) { … }` |
| Exceptions          | `raise (E x)` / `try … with E -> …`   | `raise(E(x))` / `try (expr) { \| E => … }` (no `finally`) |
| Module              | `module M = struct … end`             | `module M = { … };`                                       |
| Signature           | `module type S = sig val x : int end` | `module type S = { let x: int; };`                        |
| Comments            | `(* … *)`                             | `/* … */`, `//`                                           |
| Pipe                | `x \|> f`                             | `x \|> f` (pipe last) or `x->f(y)` (pipe first)           |

## Rules Worth Remembering

- **Equality operators are renamed:** Reason `==` is OCaml's structural `=`, and `===` is physical `==`. This is a common source of bugs when porting code.
- **Optional arguments need a trailing positional argument** (usually `()`) so the compiler can tell "use the defaults" apart from partial application.
- Passing an `option` straight to an optional argument is a type error; use `~arg=?value`.
- No `return`, no variadic functions (take a list instead), and no `null`: use `option` and `switch`.
- **`->` (pipe first)** inserts the value as the **first** argument and works with labeled arguments: `data->foo(~two, ~three)`. `|>` inserts it as the **last** argument. Use one style per codebase, following the stdlib you call: Stdlib/`List` functions are data-last, so they pair with `|>`.
- Destructuring arrays (`let [|a, b|] = arr`) is non-exhaustive and warns; use `switch` instead.
- JSX is built in: `<Foo bar />` puns `bar=bar`, and props without a value are not allowed (`checked=true`). Children go between tags.

## Also on the Official Site

Language basics (records, variants, options, destructuring, mutable bindings, modules), advanced features (`external`, objects, JSX), Melange JS interop and promises, "Converting from JS", the FAQ and editor plugins. Start from the [docs root](https://reasonml.github.io/docs/en/what-and-why).
