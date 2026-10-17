# Unsafe and FFI

Source: _Rust in Action_, ch. 6 (raw pointers, memory), ch. 5 (data representation), ch. 11 (low-level/kernel).

## What `unsafe` allows

Dereference raw pointers, call `unsafe` functions, access mutable statics, implement `unsafe` traits, access union fields. It does not turn off the borrow checker; you promise the invariants hold.

## Rules

| Rule                                                                            | Why                    |
| ------------------------------------------------------------------------------- | ---------------------- |
| Smallest possible `unsafe` block                                                | easy audit             |
| `// SAFETY:` comment on each block stating the invariant                        | reviewable             |
| Wrap in a safe API that enforces the invariant                                  | callers stay safe      |
| Try safe alternatives first (`split_at_mut`, `mem::swap`, `u32::from_le_bytes`) | most needs are covered |
| Test under Miri (`cargo +nightly miri test`)                                    | catches UB             |

## Pointer types

| Type                         | Notes                                                |
| ---------------------------- | ---------------------------------------------------- |
| `&T`, `&mut T`               | safe, valid, aligned, non-null                       |
| `*const T`, `*mut T`         | may be null/dangling; creating is safe, deref is not |
| `NonNull<T>`                 | non-null raw pointer                                 |
| `Box::into_raw` / `from_raw` | hand off / reclaim ownership; pair them exactly once |

```rust
let x = 5;
let p = &x as *const i32;
// SAFETY: p points to a live, aligned i32.
let y = unsafe { *p };
```

## Conversions

| Task               | Prefer                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Bytes to integer   | `u32::from_le_bytes`, `from_be_bytes`                                                                 |
| Float bits         | `f32::to_bits`, `from_bits`                                                                           |
| Reinterpret memory | `bytemuck`/`zerocopy`; `transmute` only as last resort and with `#[repr(C)]` or equal-size guarantees |

## FFI with C

```rust
use std::ffi::{CStr, CString, c_char, c_int};

unsafe extern "C" { fn abs(x: c_int) -> c_int; }   // older editions: extern "C" { ... }

#[repr(C)]
pub struct Point { x: f64, y: f64 }

#[unsafe(no_mangle)]                                // older editions: #[no_mangle]
pub extern "C" fn add(a: c_int, b: c_int) -> c_int { a + b }
```

- Use `#[repr(C)]` on any struct crossing the boundary; use `c_*` aliases for C types.
- Strings: `CString::new` (adds NUL, rejects interior NUL) out, `CStr::from_ptr` in; never free Rust memory with C `free` or vice versa.
- Never let a panic unwind across the boundary (`catch_unwind` or `extern "C"` abort semantics).
- Generate bindings with `bindgen`; use `cc`/`build.rs` to compile C sources.
- `#![no_std]` / bare-metal: no allocator or OS; supply panic handler and entry point, and use volatile access for memory-mapped registers.
