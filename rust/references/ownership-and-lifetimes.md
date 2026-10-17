# Ownership, Borrowing, Lifetimes

Source: _Rust in Action_, ch. 4 (lifetimes, ownership, borrowing) and ch. 6 (memory).

## Model

- Every value has one owner; when the owner goes out of scope the value is dropped.
- Assignment, passing by value, and returning **move** non-`Copy` values; the old binding is unusable.
- Any number of `&T` **or** exactly one `&mut T` at a time.
- A reference may not outlive its referent.

## Fixing "use of moved value"

| Option                             | Example                                       | Cost                                  |
| ---------------------------------- | --------------------------------------------- | ------------------------------------- |
| Borrow                             | `fn show(s: &Sat)`                            | none                                  |
| Narrow the scope                   | do the work in a block so the borrow ends     | none                                  |
| Return ownership back              | `fn tick(s: Sat) -> Sat`                      | awkward; prefer `&mut`                |
| Derive `Copy` for small plain data | `#[derive(Clone, Copy)]`                      | copy per use                          |
| `clone()`                          | `show(s.clone())`                             | allocation; use sparingly             |
| Shared ownership                   | `Rc<T>` / `Arc<T>`                            | refcount, runtime checks if `RefCell` |
| Wrap in a different type           | `Option<T>` + `.take()` to move out of `&mut` | small                                 |

## Borrow-checker patterns

```rust
// Move a field out of &mut self without cloning
let old = std::mem::take(&mut self.buf);        // leaves Default
let prev = std::mem::replace(&mut self.state, State::Idle);
let item = self.slot.take();                    // Option<T>

// Mutate while reading: split the borrow
let (a, b) = v.split_at_mut(mid);

// Avoid iterator invalidation
v.retain(|x| x.alive);
```

## Lifetimes

| Rule               | Meaning                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Elision            | one input reference: output gets its lifetime; `&self` method: output gets self's          |
| `'a` on a function | relates inputs to outputs: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str`             |
| `'a` on a struct   | the struct cannot outlive what it borrows                                                  |
| `'static`          | lives for the whole program (literals) or owns everything; do not add it to silence errors |
| `T: 'a`            | type contains no references shorter than `'a`                                              |

Decision: if a struct stored in a long-lived place needs a reference, prefer owning (`String`, `Vec<T>`, `Arc<T>`). Use borrowed fields only for short-lived views/parsers.

```rust
struct Parser<'a> { input: &'a str }          // short-lived view: fine
struct Config { name: String }                // long-lived: own it
```

## Memory facts that explain the rules

| Region | Holds                          | Notes                     |
| ------ | ------------------------------ | ------------------------- |
| Stack  | locals, fixed-size values      | fast, freed on scope exit |
| Heap   | `Box`, `Vec`, `String` buffers | freed when owner drops    |
| Static | literals, `static` items       | whole program             |

`String`/`Vec` are (pointer, length, capacity) on the stack pointing to the heap; `&str`/`&[T]` are (pointer, length) views.
