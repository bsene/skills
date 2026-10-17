# Errors, Traits, Generics

Source: _Rust in Action_, ch. 3 (structs, enums, traits, errors) and ch. 8 (trait objects, error handling for libraries).

## Error handling

| Tool               | Use                               |
| ------------------ | --------------------------------- |
| `Option<T>`        | absence is normal                 |
| `Result<T, E>`     | failure the caller can handle     |
| `?`                | propagate; converts via `From<E>` |
| `panic!`/`unwrap`  | bug or broken invariant only      |
| `expect("reason")` | documented invariant              |

Choosing an error type:

| Context               | Choose                                         |
| --------------------- | ---------------------------------------------- |
| Binary / prototype    | `Box<dyn std::error::Error>` (or `anyhow`)     |
| Library               | own enum implementing `Error` (or `thiserror`) |
| One call, one failure | the underlying error type                      |

Library error enum with `?` conversion:

```rust
use std::{fmt, io, num};

#[derive(Debug)]
pub enum LoadError {
    Io(io::Error),
    Parse(num::ParseIntError),
}

impl fmt::Display for LoadError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(e) => write!(f, "io: {e}"),
            Self::Parse(e) => write!(f, "parse: {e}"),
        }
    }
}

impl std::error::Error for LoadError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self { Self::Io(e) => Some(e), Self::Parse(e) => Some(e) }
    }
}
impl From<io::Error> for LoadError { fn from(e: io::Error) -> Self { Self::Io(e) } }
impl From<num::ParseIntError> for LoadError { fn from(e: num::ParseIntError) -> Self { Self::Parse(e) } }

pub fn load(p: &str) -> Result<i32, LoadError> {
    Ok(std::fs::read_to_string(p)?.trim().parse()?)
}
```

Rules: wrap, do not erase, the source error; do not return `Result<T, String>` from libraries; add context at boundaries; derive `Debug` always.

## Modeling data

- `struct` for "and", `enum` for "or". Put state-machine states in an enum so illegal states cannot be built.
- `match` exhaustively; avoid `_ =>` when new variants should force a review.
- `impl` blocks hold methods; `new()` constructors for invariants; keep fields private, expose accessors.

## Traits and generics

| Need                                                 | Use                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| Fast, monomorphized, one concrete type per call site | generics: `fn f<T: Trait>(x: T)` / `impl Trait`               |
| Heterogeneous collection or runtime choice           | trait object: `Box<dyn Trait>`, `&dyn Trait`                  |
| Default behavior shared across types                 | default methods in the trait                                  |
| Extend foreign types                                 | extension trait (orphan rule: need local trait or local type) |
| Conversions                                          | `From`/`Into`, `TryFrom`, `AsRef`, `FromStr`                  |

```rust
trait Read { fn read(&self, buf: &mut [u8]) -> usize; }
fn total<R: Read>(r: &R) -> usize { /* static dispatch */ 0 }
fn dynamic(rs: &[Box<dyn Read>]) { /* vtable dispatch */ }
```

- Trait objects need object-safe traits (no generic methods, no `Self` return).
- Prefer `where` clauses for long bounds. Derive common traits (`Debug, Clone, PartialEq, Default`) liberally.
- Implement `Display` for user-facing text, `Debug` for diagnostics.
- `impl Trait` in argument position is sugar for a generic; in return position it hides a single concrete type.
