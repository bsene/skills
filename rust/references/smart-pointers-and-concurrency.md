# Smart Pointers and Concurrency

Source: _Rust in Action_, ch. 6 (pointer types), ch. 10 (closures, threads, concurrency).

## Smart pointer chooser

| Type         | Ownership         | Threads      | Mutation                  | Notes                               |
| ------------ | ----------------- | ------------ | ------------------------- | ----------------------------------- |
| `Box<T>`     | single            | if `T: Send` | via owner                 | heap, recursion, `dyn Trait`        |
| `Rc<T>`      | shared            | no           | none                      | refcount; cycles leak (use `Weak`)  |
| `Arc<T>`     | shared            | yes          | none                      | atomic refcount                     |
| `Cell<T>`    | in `&`            | no           | copy in/out               | for `Copy` data, no borrow tracking |
| `RefCell<T>` | in `&`            | no           | runtime-checked borrows   | panics on violation                 |
| `Mutex<T>`   | in `&`            | yes          | one at a time             | `lock()` returns guard              |
| `RwLock<T>`  | in `&`            | yes          | many readers / one writer |                                     |
| `Cow<'a, T>` | borrowed or owned | -            | clone on write            | avoid needless copies               |

Combos: `Rc<RefCell<T>>` (single-thread shared mutable), `Arc<Mutex<T>>` (multi-thread). Reach for them after trying plain borrowing.

## Closures

| Trait    | Captures         | Callable   |
| -------- | ---------------- | ---------- |
| `Fn`     | by shared ref    | many times |
| `FnMut`  | by mutable ref   | many times |
| `FnOnce` | by value (moves) | once       |

`move |..|` forces capture by value; required for threads. Accept `impl Fn...` or generics; return `Box<dyn Fn...>` when types differ.

## Threads

```rust
use std::{sync::{Arc, Mutex, mpsc}, thread};

let counter = Arc::new(Mutex::new(0));
let hs: Vec<_> = (0..4).map(|_| {
    let c = Arc::clone(&counter);
    thread::spawn(move || { *c.lock().unwrap() += 1; })
}).collect();
for h in hs { h.join().unwrap(); }

let (tx, rx) = mpsc::channel();
thread::spawn(move || tx.send(42).unwrap());
let v = rx.recv().unwrap();
```

| Goal                     | Tool                                     |
| ------------------------ | ---------------------------------------- |
| Borrow locals in threads | `std::thread::scope`                     |
| Pass messages            | `mpsc` channel (clone `tx` per producer) |
| Shared counter/flag      | atomics (`AtomicUsize`, `Ordering`)      |
| Shared state             | `Arc<Mutex<T>>` / `RwLock`               |
| CPU data parallelism     | `rayon` (`par_iter`)                     |
| Many I/O tasks           | async runtime (e.g. tokio)               |

Rules: keep lock scopes short; never hold a guard across `.await` or a blocking call; take locks in a consistent order; `Send` = movable to another thread, `Sync` = `&T` shareable. Threads are OS resources: use a pool or fixed worker count for large fan-out. A panicking thread poisons its `Mutex`; decide whether to recover or propagate.
