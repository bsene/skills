# Practical Go Lessons (Maximilien Andile) — Study Notes

Original condensed notes (not a reproduction) from the online book [Practical Go Lessons](https://www.practical-go-lessons.com/) (42 chapters, last updated July 2022, so Go 1.18-era). It is a beginner-to-intermediate walk-through; use it as a chapter-to-skill map. Complements [GOPL Book Notes](gopl-book-notes.md) (tighter reference) and [The Way to Go Notes](the-way-to-go-notes.md). The book predates `slog`, `errors.Join`, `slices`/`maps`, and newer APIs — see [Modern Go Releases](modern-go-releases.md).

## Chapter Map

| Ch     | Topic                                       | Read here instead / next                                                                                                                         |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1–7    | Computing basics, terminal, setup, encoding | Skip; use [go.dev/doc/install](https://go.dev/doc/install)                                                                                       |
| 8–9    | Variables, constants, control statements    | [Go Idioms](idioms.md)                                                                                                                           |
| 10     | Functions                                   | [Functions, Methods & Pointers](functions-methods-pointers.md)                                                                                   |
| 11–12  | Packages, imports, initialization           | [modules-deep-dive](../packages-and-modules/references/modules-deep-dive.md), [Go Idioms](idioms.md)                                             |
| 13–16  | Types, methods, pointers, interfaces        | [structs-composition](../types-and-interfaces/references/structs-composition.md), [interfaces](../types-and-interfaces/references/interfaces.md) |
| 17–18  | Modules, module proxies                     | [modules-deep-dive](../packages-and-modules/references/modules-deep-dive.md)                                                                     |
| 19     | Unit tests                                  | [testing-patterns](../testing/references/testing-patterns.md)                                                                                    |
| 20–22  | Arrays, slices, maps                        | [collections-generics](../types-and-interfaces/references/collections-generics.md)                                                               |
| 23     | Errors                                      | [error-patterns](../error-handling/references/error-patterns.md)                                                                                 |
| 24     | Anonymous functions, closures               | [Functions, Methods & Pointers](functions-methods-pointers.md)                                                                                   |
| 25–26  | JSON/XML, basic HTTP server                 | [json-templates](../web/references/json-templates.md), [http-server](../web/references/http-server.md)                                           |
| 27     | Enum, iota, bitmask                         | [Go Idioms](idioms.md)                                                                                                                           |
| 28–29  | Dates/time, files and databases             | below                                                                                                                                            |
| 30     | Concurrency                                 | [goroutines-channels](../concurrency/references/goroutines-channels.md), [sync-context](../concurrency/references/sync-context.md)               |
| 31–33  | Logging, templates, configuration           | [json-templates](../web/references/json-templates.md), below                                                                                     |
| 34, 36 | Benchmarks, profiling                       | [testing-patterns](../testing/references/testing-patterns.md); `b.Loop` in [Modern Go Releases](modern-go-releases.md)                           |
| 35     | HTTP client                                 | [http-server](../web/references/http-server.md)                                                                                                  |
| 37     | Context                                     | [sync-context](../concurrency/references/sync-context.md)                                                                                        |
| 38     | Generics                                    | [collections-generics](../types-and-interfaces/references/collections-generics.md)                                                               |
| 39     | Is Go object oriented?                      | [structs-composition](../types-and-interfaces/references/structs-composition.md) — composition over inheritance                                  |
| 40     | Upgrading/downgrading Go                    | [Modern Go Releases](modern-go-releases.md)                                                                                                      |
| 41     | Design recommendations                      | below                                                                                                                                            |
| 42     | Cheatsheet                                  | Skip                                                                                                                                             |

## Ch 41 · Design Recommendations (the high-value chapter)

The author compiles community advice (notably Dave Cheney's _Practical Go_ talk) and says not to follow it religiously. Treat the numbers as heuristics.

**Package names** — they appear at every call site (`pkg.Func()`), so:

- Short, one word, lowercase, singular, named for the service provided (`net`, `os`).
- Avoid `models`, `utils`, `userManagement`. Put the user type and user behaviour in a `user` package; put helpers where they are used, or group by type like `strings`/`bytes`.

**Interfaces**

- Accept interfaces in parameters and fields to declare the minimum behaviour you use. `Decrypt(io.Reader)` serves files, TCP and UDP; `Decrypt([]byte)` does not.
- Keep them small (1–3 methods like `io.Reader`/`io.Writer`). Implementation is implicit, so a 7-method interface is hard to implement and hard to find implementers of.

**Source files**

- One file named after the package for shared types/consts (`fruit/fruit.go`).
- One responsibility per file (`net/http/cookie.go` holds cookie handling); about 600 lines is an arbitrary ceiling.

**Errors**

- Add context when passing errors up: `fmt.Errorf("reading config: %w", err)`. A bare `open x: no such file` forces you to trace the call path by hand.
- Never ignore an error: return it or handle it.
- `log.Fatal` calls `os.Exit(1)`: deferred cleanup does not run. Reserve it for `main`.
- Classify errors as recoverable (network blip → retry, fall back) vs not (wrong URL, 301 → needs a human). See [Microservice Resilience](microservice-resilience.md).

**Functions and methods**

- One function, one goal (`saveAndAuthorize` → `create` + `authorize`); easier to test because failures have one source.
- Don't repeat the receiver type in method names: `user.save()`, not `user.saveUser()`.
- Length: author suggests ≤ 30 lines (fits an IDE window); the chapter lists 100 as the hard maximum.
- Cyclomatic complexity: paths through a function = decisions + 1; each path wants a test. Flatten nesting by extracting the inner branch into a helper (or return early).
- Halstead metrics (vocabulary, volume, effort) are covered but the author says take them cautiously; the lesson is "more code, more complexity: prefer short and simple".

## Other Chapters Worth Remembering

- **Ch 12 init order** — package-level vars are initialised in dependency order, then `init()` functions run per file in filename order as presented to the compiler. Avoid side-effecting `init()` (see [Go Idioms](idioms.md)).
- **Ch 27 iota** — typed constants with `iota` for enums; `1 << iota` for bitmasks; add a `String()` method so values print readably.
- **Ch 28 time** — use `time.Duration` arithmetic, not raw ints; `time.Parse` layouts use the reference time `Mon Jan 2 15:04:05 MST 2006`; store UTC.
- **Ch 29 storage** — `database/sql` is an interface layer: `defer rows.Close()`, check `rows.Err()`, use placeholders (never string-built SQL), and pass `context.Context` (`QueryContext`).
- **Ch 33 configuration** — layer sources: defaults → file → env → flags, parse once in `main`, pass a config struct down.
- **Ch 39 OOP?** — Go has no inheritance; get reuse via embedding and polymorphism via interfaces.

## Stale Parts

- Examples use `ioutil.ReadFile` (deprecated since 1.16: use `os.ReadFile`).
- Logging chapter predates `log/slog`.
- Generics chapter predates `slices`, `maps`, `cmp` and later inference improvements.
- Cheatsheet and setup chapters add little over [go.dev/doc](https://go.dev/doc/).
