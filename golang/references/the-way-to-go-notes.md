# The Way to Go (Ivo Balbaert) — Study Notes

Original condensed notes (not a reproduction) from _The Way to Go: A Thorough Introduction to the Go Programming Language_ (2012, Go 1.0 era). Complements [GOPL Book Notes](gopl-book-notes.md): GOPL is the tighter language reference; this book adds beginner walk-throughs, I/O, networking, and a pitfalls/patterns/performance catalogue. Several parts are **dated** — see [Stale Parts](#stale-parts).

## Chapter Map

| Ch    | Topic                            | Read here instead / next                                                                                                                         |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1–3   | Origins, install, editors        | Skip; use [go.dev/doc/install](https://go.dev/doc/install)                                                                                       |
| 4–5   | Basic types, control structures  | [Go Idioms](idioms.md)                                                                                                                           |
| 6     | Functions                        | [Functions, Methods & Pointers](functions-methods-pointers.md)                                                                                   |
| 7–8   | Arrays, slices, maps             | [collections-generics](../types-and-interfaces/references/collections-generics.md)                                                               |
| 9     | Packages                         | [modules-deep-dive](../packages-and-modules/references/modules-deep-dive.md)                                                                     |
| 10–11 | Structs, methods, interfaces     | [structs-composition](../types-and-interfaces/references/structs-composition.md), [interfaces](../types-and-interfaces/references/interfaces.md) |
| 12    | Reading and writing              | below                                                                                                                                            |
| 13    | Error handling and testing       | [error-patterns](../error-handling/references/error-patterns.md), [testing-patterns](../testing/references/testing-patterns.md)                  |
| 14    | Goroutines and channels          | [goroutines-channels](../concurrency/references/goroutines-channels.md)                                                                          |
| 15    | Networking, templates, web apps  | [http-server](../web/references/http-server.md), [json-templates](../web/references/json-templates.md)                                           |
| 16    | Pitfalls                         | below + [100 Go Mistakes](100-go-mistakes.md)                                                                                                    |
| 17    | Language patterns                | below                                                                                                                                            |
| 18    | Snippets, performance advice     | below                                                                                                                                            |
| 19–21 | Sample app, App Engine, adopters | Skip (dated)                                                                                                                                     |

## Ch 12 · Reading and Writing

- Wrap sources in `bufio.Reader`/`Scanner` for line- or word-wise input; `bufio.Writer` needs a final `Flush()`.
- Always `defer f.Close()` after a successful `os.Open`; check the `os.Open` error first so you never close a nil file.
- Use `io.Copy` to stream between a `Reader` and `Writer`; don't read whole large files into memory.
- `encoding/json`, `xml`, `gob` and `encoding/csv` cover structured formats; `flag` for CLI arguments; `compress/*` and `crypto/*` hashes work over the same `io.Reader`/`Writer` interfaces — compose them.
- Paths: `path/filepath` for OS paths, `path` for slash-only (URLs).

## Ch 13 · Errors and Tests

- Errors are values; custom error types carry data, and callers branch on them with a type switch. Prefer wrapping with context over bare returns.
- `panic` for unrecoverable conditions; `recover` in a deferred closure to keep a server alive and report the failure. Don't let panics cross package boundaries.
- Tests: `_test.go` files, `TestXxx`; table-driven cases; benchmark with `testing.B`; profile before optimising.

## Ch 15 · Networking and Web

- `net` for raw TCP/UDP; `net/http` for servers/clients; `net/rpc` and `websocket` also appear (now external/legacy).
- Handlers: validate input, set content type, and recover from panics in a wrapper so one bad request can't kill the server.
- Templates: parse once (`template.Must`), cache, and use `html/template` so output is auto-escaped.

## Ch 16 · Pitfalls Checklist (the book's list, reworded)

1. **Shadowing** with `:=` in an inner scope (especially `err`/results) — the outer var stays unchanged.
2. **Strings are immutable**: build with `strings.Builder`/`bytes.Buffer`, not repeated `+=`.
3. **`defer f.Close()` in a loop** holds every file until the function returns; close in a helper or an explicit scope.
4. **`new` vs `make`**: `make` for slice/map/chan (initialised), `new` returns a zero pointer.
5. **Don't pass `*[]T`**: a slice is already a reference-like header; use a pointer only to reassign the caller's slice.
6. **No pointer to an interface** — it almost never means what you want.
7. **Pointer to a value type used needlessly** (`*int`, `*string`) adds indirection and nil risk.
8. **Goroutine/channel overuse**: use them only when concurrency pays; a mutex or plain call is often simpler.
9. **Closures in goroutines** capture the loop variable (pre-1.22): pass it as an argument.
10. **Bad error handling**: don't return a bool when an `error` can say why; don't clutter code with repeated checks — use helper functions or a sticky-error type.

## Ch 17 · Patterns

- **Comma-ok**: `v, ok := m[k]`, `x.(T)`, `<-ch` — use `ok` instead of sentinel values.
- **Defer**: pair acquire/release (`Lock`/`Unlock`, `Open`/`Close`), plus tracing and recovering.
- **Visibility**: expose behaviour via exported funcs/methods; keep fields and helpers unexported.
- **Operators**: implement as plain functions or methods on a type; use an interface when several concrete types need the same operation.

## Ch 18 · Performance Advice (use with measurement)

- Prefer `:=` in functions; `[]byte` over `string` for heavy mutation; slices over arrays.
- Preallocate: `make([]T, 0, n)` and `make(map[K]V, n)`.
- Arrays/slices beat maps when keys are dense small ints; a map is leaner for sparse data.
- `for _, v := range` when the index is unused. Pointer receivers for large structs. Cache templates and large allocations.
- **Profile first** (`pprof`, `-bench`); these are heuristics, not laws.

## Stale Parts

Treat these as history, not guidance: `GOROOT`/`GOPATH`-first setup, `goinstall`/`gofix`, Go 1.0 tool names, Windows/Cygwin install, Gedit/LiteIDE editor setup, `ioutil` (use `os`/`io`), `net/rpc`/`websocket` from the stdlib, Google App Engine (ch 20), and the era's third-party adopter list (ch 21). For modules, generics, `errors.Is/As`, `slices`/`maps`, and `context`, see [Modern Go Releases](modern-go-releases.md).
