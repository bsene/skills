---
name: cpp-expert
description: >
  Expert C++ — value semantics,
  initialization vs assignment, const/constexpr, pointers/arrays/references,
  and the direct mapping of language constructs to hardware.

  TRIGGER when: language (C++, .cpp/.hpp/.h/.cc files, g++, clang++, CMake, compile, link, object files),
  core concepts (value semantics, copy vs reference, initialization vs assignment, narrowing conversion,
  const, constexpr, compile-time evaluation, scope, lifetime, object lifetime, RAII),
  memory (pointer, array, reference, nullptr, dereference, address-of, stack, heap, machine address),
  control flow (if-statement with initializer, switch, case-label, range-for, while, for),
  functions (declaration, definition, overloading, ambiguous call, const reference parameter, return type),
  idioms (prefer {} initialization, use auto, avoid narrowing, minimize scope, package operations as functions),
  ask (idiomatic C++, C++ best practices, C++ code review, how to write C++, explain this C++).
  DO NOT USE when: user mentions "C" only (see c-programming skill), or C++ is incidental to a
  different-language question.
metadata:
  user-invocable: "false"
---

# C++ Expert

C++ is a **statically typed, compiled** language whose fundamental constructs map **directly to hardware** — that direct mapping is the source of its raw performance and also the source of most of its foot-guns. Write C++ that leans on the standard library, uses value semantics deliberately, and lets the compiler catch mistakes at compile time instead of at 3am.

The mental model to hold throughout: **an object is memory holding a value of some type; a variable is a named object; a pointer is a machine address; a reference is an alias that cannot be reseated.** Everything else follows from these.

## The two rules that prevent most bugs

1. **Prefer `{}` initialization over `=`.** `int i2 {7.8}` is a compile error (narrowing), while `int i1 = 7.8` silently truncates to `7`. The `=` form is C legacy and allows implicit narrowing conversions (`double`→`int`, `int`→`char`). When in doubt, use `{}`.
2. **Initialization ≠ assignment.** Initialization turns uninitialized memory into a valid object; assignment requires the target to already hold a value. Reading/writing an uninitialized variable is **undefined behavior**. A reference must be initialized at declaration — `int& r2;` is an error.

## Core language cheat sheet

### Types, variables, arithmetic

- Fundamental types map to hardware and have implementation-defined sizes: `sizeof(char)==1`, `sizeof(int)` is often 4. Get sizes with `sizeof`, never assume.
- Integer literals: `42` decimal, `0b10101010` binary, `0xBAD1234` hex, `0334` octal. Use `'` as a digit separator for readability: `3.14159'26535'89793`.
- Arithmetic: `+ - * / %`; comparison `== != < > <= >=`; bitwise `& | ^ ~`; logical `&& || !`. `=` is assignment, `==` tests equality.
- **Usual arithmetic conversions** compute at the highest precision of the operands (`double + int` → double arithmetic). Beware truncation when assigning back to a narrower type.
- Compound assignment: `x+=y`, `++x`, `x-=y`, `--x`, `x*=y`, `x/=y`, `x%=y`.
- Evaluation order of function arguments is **unspecified** — don't rely on it.

### Initialization

| Form | Notes |
| ---- | ----- |
| `double d1 = 2.3;` | C-style; allows narrowing |
| `double d2 {2.3};` | Preferred; rejects narrowing |
| `double d3 = {2.3};` | `=` optional with `{}` |
| `auto b = true;` | Type deduced from initializer; use `=` with `auto` |

Use `auto` unless you have a specific reason to name the type (large scope where clarity matters, or you need to pin range/precision like `double` over `float`). Don't introduce a name until you have a value for it.

### Scope and lifetime

- **Local scope**: from declaration to end of enclosing `{ }` block. Function arguments are local.
- **Class scope**: member names, from the class's opening `{` to its end.
- **Namespace scope**: namespace members; a name in no other construct is a **global name**.
- An object is constructed before use and destroyed at end of scope. Namespace objects die at program end; `new`-created objects live until `delete`.
- **Minimize scope** — declare names where needed, not before. Use `if (auto n = v.size(); n != 0)` to keep a test variable scoped to the branch.

### Constants

- `const`: "I promise not to change this." Enforced by the compiler; value may be computed at **run time**. Used to pass data by reference without fear of modification.
- `constexpr`: "evaluated at **compile time**." Used for constants, read-only memory placement, and performance. The value must be computable by the compiler.
- A `constexpr` function must be simple: no side effects, can only use its arguments (but may loop and use local variables). It can still be called with non-constant arguments — then the result just isn't a constant expression.
- Constant expressions are required for array bounds, case labels, and template value arguments.

### Pointers, arrays, references

- `T a[n]` — array of `n` Ts; `T* p` — pointer to T; `T& r` — reference to T; `T f(A)` — function. In declarations, `[ ]` = "array of", `*` = "pointer to", `&` = "reference to".
- Arrays are 0-indexed (`v[0]`..`v[5]` for `char v[6]`); the size must be a constant expression.
- Prefix `*` = "contents of", prefix `&` = "address of". `char* p = &v[3]; char x = *p;`
- **Reference vs pointer**: a reference needs no `*` to access the value, and **cannot be reseated** after initialization. Use references for function arguments to avoid copying; use `const T&` when you don't want to modify the argument.
- **`nullptr`** is the null pointer, shared by all pointer types. `int x = nullptr;` is an error (it's a pointer, not an integer). Prefer `nullptr` over `0`/`NULL` to avoid int/pointer confusion. There is **no null reference** — a reference must refer to a valid object.
- A test of a pointer (`if (p)`) is equivalent to `if (p != nullptr)`; a test of a numeric value (`while (*p)`) is equivalent to `while (*p != 0)`.

### Functions

- A function must be **declared before it's called**. Declaration = return type + name + argument types. Argument passing has the semantics of **initialization** — types are checked and implicit conversions applied.
- **Overloading**: same name, different argument types. The compiler picks the best match; if neither is better, the call is **ambiguous** and errors. Overloaded functions should implement the same semantics.
- A function's type is its return type plus argument types: `double get(const vector<double>&, int)` has type `double(const vector<double>&, int)`.
- Package meaningful operations as carefully named functions; keep functions short and single-purpose. More, shorter functions correlate with fewer errors.

### Control flow

- `if`/`else`, `switch` (tests a value against distinct `case` labels; `default` catches the rest; `break` exits), `while`, `for`, and **range-for** (`for (auto x : v)` iterates a copy; `for (auto& x : v)` iterates references so you can modify elements).
- `if (auto n = v.size(); n != 0)` — declare-and-test in the condition; the name is in scope on both branches. Prefer the terser `if (auto n = v.size())` when testing against 0/nullptr.

## Mapping to hardware (ground answers about value semantics here)

- A pointer is represented in memory as a **machine address**. An array is C++'s abstraction of "a contiguous sequence of objects in memory."
- **Assignment of a built-in type is a machine copy** — the two objects are independent. `x = y` copies the value; changing `y` later does not change `x`. This is true for **all** types (unlike Java/C#), unless you explicitly share via pointers/references.
- **Assignment to a reference does not reseat the reference** — it assigns through it to the referenced object: `r = r2` reads through `r2` and writes through `r`, so `x` becomes `y`'s value.
- After `x = y`, `x == y` for every built-in type and well-designed user-defined type offering `=` and `==`.

## Anti-patterns

| Anti-pattern | Problem | Fix |
| ------------ | ------- | --- |
| `int i = 7.8;` | Silent narrowing truncation | Use `{}` init: `int i {7.8}` errors |
| Uninitialized variable | Undefined behavior on read/write | Always initialize; use `{}` |
| `int& r2;` | Uninitialized reference is an error | Bind at declaration |
| `0`/`NULL` for null pointers | Int/pointer confusion | Use `nullptr` |
| Relying on argument evaluation order | Unspecified behavior | Sequence explicitly |
| Reaching for raw pointers/arrays by default | Manual lifetime, no bounds safety | Prefer `vector`, `string`, references, standard algorithms |
| Overloading with different semantics | Surprising dispatch | Same name ⇒ same semantics |

## Read On Demand

| Read When | File |
| --------- | ---- |
| Full worked examples for every construct above | [references/basics-worked-examples.md](references/basics-worked-examples.md) |
| The complete advice list (§1.10) | [references/advice.md](references/advice.md) |

## Specialist Skills

| Situation | Skill | Why |
| --------- | ----- | --- |
| C (not C++) | `c-programming` | C-specific idioms and tooling |
| General testing philosophy | `testing` | Language-agnostic testing strategy |
| OOP design principles | `object-oriented-programming` | SOLID, design patterns |
| Hexagonal architecture | `ports-adapters-architecture` | Ports and adapters pattern |
