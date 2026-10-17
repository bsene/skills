# Clojure Idioms, Laziness, and Performance

Sources: _The Joy of Clojure_, 2nd Edition (Fogus, Houser) and _Living Clojure_ (Gilmour). Paraphrased; complements `clojure.md` (not repeated here). Verify against current Clojure docs.

## Laziness pitfalls

| Pitfall                            | Guidance                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Holding the head of a big lazy seq | Do not keep a reference while consuming; the whole realized seq stays in memory                                             |
| Chunked sequences                  | `map`/`filter` over vectors and ranges realize 32 elements at a time; side effects and `take` may run further than expected |
| `rest` vs `next`                   | `rest` returns `()` (lazy-safe); `next` returns `nil` and realizes one more element                                         |
| Lazy effects                       | Never rely on laziness for effects; force with `run!`, `doseq`, `doall`                                                     |
| Infinite sequences                 | Build with `lazy-seq`/`iterate`/`repeatedly`; always bound with `take` or `take-while`                                      |
| Mutual recursion depth             | Use `trampoline` (return thunks) or `loop`/`recur`; JVM has no general tail-call elimination                                |

## Persistent data and identity

- Collections are immutable with structural sharing: "updates" return new values cheaply; old versions stay valid.
- Choose by access pattern: vector (index, append), list (stack, code), map (lookup), set (membership), sorted collections (ordered ranges), `PersistentQueue` (FIFO).
- Values are compared by value (`=`); identities (`atom`, `ref`, `agent`, `var`) hold successive values over time.
- Prefer `update`, `update-in`, `assoc-in` over rebuilding nested maps by hand.

## Concurrency choices

| Need                               | Tool                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| One independent, synchronous value | `atom` + `swap!` (function must be pure; it may retry)                              |
| Several values changed together    | `ref` + `dosync` (no side effects inside; they retry)                               |
| Asynchronous, serialized updates   | `agent` + `send` / `send-off` (use `send-off` for blocking work)                    |
| Compute once on demand, shared     | `delay`; `promise` for one-shot cross-thread delivery; `future` for background work |
| Thread-local override              | Dynamic var with `binding`; keep scope narrow, avoid for ordinary data flow         |

## Performance, only after measuring

1. Measure first (a benchmark library such as criterium, not one-off timings).
2. Batch builds with `transient`/`persistent!`; use the returned value, not the original reference.
3. Use `reduce` with `into`/transducers to avoid intermediate sequences; consider `clojure.core.reducers` (`fold`) for large, associative, parallel work.
4. Set `*warn-on-reflection*` and add type hints only where reflection shows up on a hot path.
5. Pure expensive functions can be wrapped with `memoize`; it grows unbounded, so use a bounded cache for open key spaces.

## Macros and code as data

- Prefer functions; write a macro only to control evaluation or add syntax.
- Use syntax-quote with auto-gensyms (`x#`) to avoid variable capture; unquote (`~`, `~@`) only what must be evaluated at expansion.
- Evaluate macro arguments once; bind them in a `let` if used repeatedly.
- Check output with `macroexpand-1`; keep macros thin and delegate to functions.

## Idioms from Living Clojure

- Treat `->` / `->>` pipelines as the default shape for data transformation.
- Destructure maps with `:keys` and defaults via `:or`; use sequence destructuring for positional data.
- Use `case` for constant dispatch, `cond` for predicates, multimethods for open dispatch, protocols for type-based dispatch.
- Learn the sequence library (`partition`, `group-by`, `frequencies`, `interleave`, `mapcat`, `reductions`) before hand-rolling loops.
