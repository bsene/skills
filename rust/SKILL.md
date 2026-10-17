---
name: rust
description: >
  Write, review, and debug idiomatic Rust and systems-level Rust code.

  TRIGGER when: Rust, .rs files, Cargo.toml, cargo build/test/clippy/fmt,
  ownership, borrowing, lifetimes, borrow checker errors (E0382, E0499, E0502, E0597, E0106),
  Result, Option, the ? operator, custom error types, From/Into, Box<dyn Error>,
  traits, generics, trait objects, impl Trait, Box, Rc, Arc, RefCell, Cell, Mutex, RwLock,
  threads, channels, closures, move, unsafe, raw pointers, FFI, extern "C",
  bit manipulation, endianness, floating point, file I/O, BufReader, TCP, std::net,
  reqwest, time/chrono, memory layout, virtual memory, Rust systems programming.

  DO NOT USE for Rust game engines or web framework specifics (axum, actix, bevy)
  beyond the language and std patterns here.
---

# Rust

Source: _Rust in Action_ (Tim McNamara, Manning). Guidance below is a paraphrased working summary, not book text.

Let the compiler lead. Model data with types, make invalid states unrepresentable, and prefer borrowing and `Result` over cloning and panics.

## Route to references

| Need                                                              | Reference                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Move/borrow errors, lifetimes, who owns what                      | [ownership-and-lifetimes](references/ownership-and-lifetimes.md)               |
| `Result`, `?`, custom errors, traits, generics, trait objects     | [errors-traits-generics](references/errors-traits-generics.md)                 |
| `Box`, `Rc`, `Arc`, `Cell`, `RefCell`, threads, channels, `Mutex` | [smart-pointers-and-concurrency](references/smart-pointers-and-concurrency.md) |
| `unsafe`, raw pointers, FFI, `transmute`                          | [unsafe-and-ffi](references/unsafe-and-ffi.md)                                 |
| Bits, floats, memory, files, TCP/HTTP, time                       | [systems-topics](references/systems-topics.md)                                 |
| cargo, clippy, rustfmt, tests, docs                               | [cargo-workflow](references/cargo-workflow.md)                                 |

## Core workflow

1. Read the compiler error fully; it usually names the fix. Fix the first error first.
2. Decide ownership before writing signatures (table below).
3. Return `Result<T, E>`; use `?` to propagate. No `unwrap()` outside tests, examples, or proven invariants (use `expect("why this holds")`).
4. Start with concrete types; add generics or trait objects only when a second use appears.
5. Run the check gate (below) before declaring done.

## Ownership decision guide

| Situation                                               | Choose                                                 |
| ------------------------------------------------------- | ------------------------------------------------------ |
| Function only reads                                     | `&T` (`&str`, `&[T]` over `&String`, `&Vec<T>`)        |
| Function mutates caller's value                         | `&mut T`                                               |
| Function consumes/stores the value                      | `T` (take ownership)                                   |
| Cheap `Copy` type (ints, small structs deriving `Copy`) | pass by value                                          |
| Several owners, single thread                           | `Rc<T>` (+ `RefCell<T>` for mutation)                  |
| Several owners, many threads                            | `Arc<T>` (+ `Mutex`/`RwLock`)                          |
| Heap allocation, recursive type, or `dyn Trait`         | `Box<T>`                                               |
| Might own or borrow                                     | `Cow<'a, T>`                                           |
| Struct holds a reference                                | add lifetime; if it gets painful, own the data instead |

Resolve move errors in this order: borrow instead of move, shorten the borrow's scope, restructure so one owner mutates, `clone()` (last resort, and note the cost), smart pointer.

## Check gate

```sh
cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test
```

## Common traps

| Trap                                                                  | Fix                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------ |
| Returning a reference to a local                                      | return the owned value                                       |
| Mutating a collection while iterating it                              | collect indices first, or use `retain`/`drain`               |
| `unwrap()` on I/O or parsing                                          | propagate with `?`                                           |
| `as` casts silently truncating                                        | `try_from`/`try_into`, or `checked_*` arithmetic             |
| Integer overflow differs by profile (panic in debug, wrap in release) | use `checked_`/`wrapping_`/`saturating_` explicitly          |
| `Rc<RefCell<T>>` everywhere                                           | redesign ownership first; it hides cycles and runtime panics |
| Comparing floats with `==`                                            | compare within an epsilon; never use floats as map keys      |
