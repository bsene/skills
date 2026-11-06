# 100 Go Mistakes — Checklist

Source: _100 Go Mistakes and How to Avoid Them_ (Teiva Harsanyi) — [100go.co](https://100go.co/). Condensed review checklist; numbers match the book. Details live in the leaf skills.

## Organization (#1–16)

- Shadowed variables in inner scopes (#1); return early instead of nesting (#2).
- `init()` only for trivial, side-effect-free setup (#3). No reflexive getters/setters (#4).
- Interfaces: discover them, don't pre-create (#5); define on the consumer side (#6); accept interfaces, return structs (#7); avoid `any` (#8); generics only after real duplication (#9).
- Embedding promotes everything exported, including unwanted methods (#10).
- Functional options for configurable constructors (#11). No `util`/`common` packages (#13); avoid package/identifier collisions (#14). Document exports (#15); run linters (#16).

## Data types (#17–41)

- Octal literals (`010` = 8) (#17); integer overflow is silent (#18); floats need tolerance comparisons (#19).
- Slices: length vs capacity (#20); preallocate (#21); nil vs empty (#22); test `len(s) == 0` (#23); `copy` copies `min(len)` (#24); `append` may mutate a shared array (#25, use `s[:n:n]`); sub-slicing pins the whole array (#26).
- Maps: size hint (#27); never shrink, rebuild to release memory (#28). `==` for comparable types, `reflect.DeepEqual` is slow (#29).
- Range: value is a copy (#30); range expression evaluated once (#31); Go 1.22+ per-iteration loop vars (#32); map order is random (#33); `break` in `switch`/`select` exits only that block (#34); no `defer` in loops (#35).
- Strings: rune ≠ byte (#36–37); `Trim` takes a cutset, not a prefix (#38); `strings.Builder` for concatenation in loops (#39); `bytes` vs `string` conversions (#40); substrings pin the original (#41).

## Functions and errors (#42–54)

- Receiver choice (#42); named results rarely, watch shadowing and side effects (#43–44).
- Never return a typed nil pointer as an interface `error` (#45).
- Accept `io.Reader`, not a filename (#46). `defer` args evaluate immediately; use a closure for late binding (#47).
- `panic` only for programmer errors (#48). Wrap to add context or to mark; `%w` exposes the cause (#49). `errors.As` for types (#50), `errors.Is` for values (#51).
- Handle an error once: log **or** return (#52). Ignore explicitly with `_ =` (#53). Don't drop deferred `Close` errors on writes (#54).

## Concurrency (#55–74)

- Concurrency is structure, parallelism is execution; not always faster (#55–56).
- Mutexes protect shared resources; channels coordinate goroutines or hand over ownership (#57).
- Data race = unsynchronized access with a write; race condition = timing-dependent behavior. A program can have the second without the first (#58).
- Workload type sizes the pool: CPU-bound ≈ `GOMAXPROCS`, I/O-bound depends on the external system (#59).
- Context carries deadline, cancel, values; functions callers wait on should accept one (#60). A request context is canceled once the response is written, so use `context.WithoutCancel` (1.21+) for async work that outlives it (#61).
- Every goroutine needs a stop plan, and you must wait until its resources are closed (#62). Loop-var capture is fixed in Go 1.22+ (#63).
- `select` picks randomly among ready cases (#64). `chan struct{}` for signals (#65). A nil channel disables a `select` case, e.g. when merging (#66). Unbuffered gives sync guarantees; buffer size needs a reason, otherwise 1 (#67).
- `String()`/formatting called under a lock can deadlock or race (#68). Concurrent `append` on a shared slice races (#69). Hold the lock for the whole slice/map operation, or clone under lock (#70).
- `wg.Add` before `go`, never inside the goroutine (#71). `sync.Cond` for repeated broadcast (#72). `errgroup` for goroutine groups with errors and context (#73). Never copy `sync` types (#74).

## Standard library (#75–81)

- `time.Duration` literals: `time.Duration(n) * time.Second`, not bare ints (#75).
- `time.After` leak in loops: fixed in Go 1.23+; on older versions use `time.NewTimer` + `Stop` (#76).
- JSON: an embedded `time.Time` hijacks marshaling, `==` on `time.Time` compares the monotonic clock (use `Equal`), `any` numbers decode as `float64` (#77).
- SQL: `sql.Open` doesn't connect (`Ping`), use prepared statements, handle `NULL`, check `rows.Err()` (#78).
- Close transient resources: bodies, rows, files (#79). `return` after `http.Error` (#80). Default `http.Client`/`Server` have no timeouts (#81).

## Testing (#82–90)

- Build tags, env vars or `-short` to separate unit/integration/long tests (#82). `-race` in CI (#83); `-parallel` and `-shuffle` (#84). Table-driven (#85).
- No `time.Sleep` in tests: synchronize, retry only as fallback (#86); inject time as a dependency (#87).
- `httptest` for HTTP, `iotest` for reader errors (#88). Benchmarks: control timer, raise benchtime / `benchstat`, stop the compiler eliminating the work (#89).
- Coverage, external test package, `*testing.T` helpers, setup/teardown, fuzzing (#90).

## Optimization (#91–100)

- Cache lines are 64 bytes: favor spatial locality and predictable access (#91); avoid false sharing across cores (#92); avoid data hazards to allow instruction-level parallelism (#93).
- Order struct fields by size, descending, to cut padding (#94).
- Stack is nearly free, heap needs GC (#95). Cut allocations via API design, compiler optimizations, `sync.Pool` (#96). Fast-path inlining lowers call cost (#97).
- Profile and trace before optimizing (#98). GC tuning helps absorb load spikes (#99).
- Containers: `GOMAXPROCS` is container-aware from Go 1.25; earlier versions need it set manually (#100).
