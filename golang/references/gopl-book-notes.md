# The Go Programming Language (Donovan & Kernighan) — Study Notes

Original condensed notes (not a reproduction) from _The Go Programming Language_ (Addison-Wesley, 2015). Use as a chapter-to-skill map and a checklist of the book's core rules. Go 1.5-era book: for generics, `slices`/`maps`, `errors.Join`, and newer APIs see [Modern Go Releases](modern-go-releases.md) and [types-and-interfaces](../types-and-interfaces/SKILL.md).

## Chapter Map

| Ch  | Topic                       | Read here instead / next                                                           |
| --- | --------------------------- | ---------------------------------------------------------------------------------- |
| 1   | Tutorial                    | [Go Idioms](idioms.md)                                                             |
| 2   | Program structure           | [Go Idioms](idioms.md), [Project Layout](project-layout.md)                        |
| 3   | Basic data                  | below                                                                              |
| 4   | Composite types             | [collections-generics](../types-and-interfaces/references/collections-generics.md) |
| 5   | Functions                   | [Functions, Methods & Pointers](functions-methods-pointers.md)                     |
| 6   | Methods                     | [Functions, Methods & Pointers](functions-methods-pointers.md)                     |
| 7   | Interfaces                  | [interfaces](../types-and-interfaces/references/interfaces.md)                     |
| 8   | Goroutines and channels     | [goroutines-channels](../concurrency/references/goroutines-channels.md)            |
| 9   | Shared-variable concurrency | [sync-context](../concurrency/references/sync-context.md)                          |
| 10  | Packages and the go tool    | [modules-deep-dive](../packages-and-modules/references/modules-deep-dive.md)       |
| 11  | Testing                     | [testing-patterns](../testing/references/testing-patterns.md)                      |
| 12  | Reflection                  | below                                                                              |
| 13  | Low-level programming       | below                                                                              |

## Core Rules by Chapter

### 2–3 · Structure and basic data

- Short names in small scopes, longer names for wide scope; `:=` only for locals; redeclaring with `:=` reuses vars from the same scope and **shadows** in inner scopes (common bug with `err`).
- `new(T)` is just `&T{}` zero-valued; escape analysis decides stack vs heap — don't reason about it by hand.
- Integer overflow wraps silently; `len` returns signed `int` on purpose. Floats: compare with tolerance, never `==`.
- Strings are immutable UTF-8 bytes. `len(s)` counts bytes; `range s` yields runes. Convert to `[]rune` only when you need indexing by character.
- Constants are untyped until used; `iota` builds enums. Untyped constant arithmetic is arbitrary-precision.

### 4 · Composite types

- Arrays are values (copied on assign/pass); slices are (ptr, len, cap) views — **appending may or may not alias** the original; always `s = append(s, ...)`.
- Slice-in-place idioms (filter, remove, dedupe) reuse the backing array; copy first if the original must survive.
- Maps: unordered, nil map reads fine but writes panic, elements not addressable (`m[k].f = v` illegal), keys must be comparable. Sort keys explicitly for deterministic output.
- Struct comparison works when all fields comparable (so structs can be map keys). Embedding promotes fields/methods — composition, not inheritance.
- JSON: exported fields only; use tags (`json:"name,omitempty"`). Templates (`text/template`, `html/template`): use `html/template` for anything user-facing (auto-escaping).

### 5 · Functions and errors

- Multiple returns; `(value, error)` is the convention; error is the **last** return. Return early on `err != nil`; keep the success path unindented.
- Error messages: lowercase, no trailing punctuation, add context at each layer (`fmt.Errorf("parse %s: %w", name, err)`).
- Expected failures are values (EOF, not-found); `panic` is for programmer bugs and impossible states.
- Closures capture variables, not values: loop-variable capture was the classic bug (fixed per-iteration in Go 1.22).
- `defer` runs LIFO at function exit, arguments evaluated at the defer statement; use it for unlock/close and put it right after acquiring. Don't `defer` inside long loops.
- `recover` only works inside a deferred function; use it at package boundaries to convert internal panics into errors, never to swallow arbitrary ones.

### 6 · Methods

- Pointer receiver if the method mutates, the struct is large, or any sibling method needs a pointer; **be consistent per type**. Value receivers on map elements/non-addressable values can't call pointer methods.
- Nil is a valid receiver — design methods (e.g., linked list/tree) to handle it deliberately.
- Method values (`f := x.Method`) bind the receiver at evaluation time; method expressions (`T.Method`) take it as first arg.
- Encapsulation is per-package, not per-type: unexported fields hide state; getters/setters are rarely needed.

### 7 · Interfaces

- Interfaces are satisfied implicitly — define them at the **consumer**, keep them tiny (1–3 methods), accept interfaces and return concrete types.
- An interface value is (dynamic type, value): a nil `*T` stored in an interface is **not** `== nil`. Return a literal `nil`, never a typed nil pointer, as `error`.
- Type assertions (`v, ok := x.(T)`) and type switches discriminate dynamic types; asserting to another interface probes optional behaviours (e.g., `io.WriterTo`).
- Key stdlib contracts worth memorising: `io.Reader`/`Writer`, `fmt.Stringer`, `sort.Interface`, `http.Handler`, `error`, `flag.Value`.
- Don't add an interface until two implementations exist (or a test seam demands one).

### 8–9 · Concurrency

- Share memory by communicating: goroutines + channels first, mutexes when guarding simple state.
- Unbuffered channels synchronise; buffered decouple. Only the **sender** closes; receiving from a closed channel yields zero values (use `v, ok`). A nil channel blocks forever — useful in `select` to disable a case.
- Know who ends every goroutine. Leaks come from blocked sends/receives with no cancel path; use a `done`/`context` channel, closed to broadcast.
- Bound parallelism with a counting semaphore (buffered channel) or worker pool; use `sync.WaitGroup` to join; `Add` before `go`.
- Data race = two goroutines touching a variable, one writing, no ordering. Fixes: confine to one goroutine, immutability, or a mutex. Run `go test -race` routinely.
- `sync.Mutex` is not reentrant; `RWMutex` only pays off with read-heavy loads. `sync.Once` for lazy init. Memoizing cache pattern: mutex-guarded map of entries with a `ready` channel for in-flight work.
- Goroutines are cheap (small growable stacks, runtime-multiplexed on `GOMAXPROCS` threads), but not free.

### 10 · Packages and tooling

- Package name = last import-path element, short, singular, no stutter (`bytes.Buffer`, not `bytes.BytesBuffer`).
- Blank import (`_ "image/png"`) is for registration side effects, only in `main` or tests.
- `internal/` directories enforce import boundaries. Key tools: `go build/run/test/vet/doc/list`, `gofmt`.

### 11 · Testing

- Tests are `TestXxx(t *testing.T)` in `_test.go`; table-driven tests with named subtests; use `t.Errorf` (keep going) vs `t.Fatalf` (stop).
- Error messages say what was done, got, and wanted: `f(x) = got, want want`.
- External test packages (`pkg_test`) test the public API and break import cycles; export test seams via `export_test.go`.
- Avoid brittle tests: assert on properties/behaviour, not exact output of unstable things. Prefer fakes/stubs via small interfaces over mocks.
- Benchmarks (`BenchmarkXxx`, loop to `b.N` — or `b.Loop()` in new Go), `-benchmem`, CPU/memory profiles via `-cpuprofile`/`-memprofile` + `go tool pprof`. **Measure before optimising.**
- Example functions (`ExampleXxx` with `// Output:`) are doc and test in one.

### 12–13 · Reflection, unsafe, cgo

- Reflection (`reflect.TypeOf/ValueOf`) powers `fmt`, `encoding/json`, templates. It's slow, bypasses type safety, and panics at runtime: reach for it only when static types can't express the problem, and keep it out of exported APIs.
- Struct tags are read via `reflect.StructField.Tag.Get`.
- `unsafe`/cgo: last resort for interop or measured hot spots; code stops being portable and GC-safe by guarantee. The book's own advice: don't, unless forced.

## Book's Closing Advice (Ch 7.15)

Don't design interfaces first — write concrete code, then extract an interface when a real second use appears. Keep them small and consumer-owned.
