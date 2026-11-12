# Go Books — Curated Reading Map

A short list taken from the [Go wiki book list](https://go.dev/wiki/Books). These notes are condensed and original: each book gets a few takeaways and a pointer to the sub-skill that owns the topic. Books that already have their own notes are listed under [Covered Elsewhere](#covered-elsewhere).

**Selection rule:** books still worth reading in the generics era that teach how to write Go well. Not included: pre-2017 web/framework books, App Engine, ML, GUI, video courses, early-access titles that never shipped, and translations.

## By Topic

| Topic          | Book                                                                                                       | Sub-skill                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Idiomatic core | _Learning Go_ (Bodner) · _Go 101_ / _Go Details & Tips 101_ (Liu, free at [go101.org](https://go101.org/)) | [Go Idioms](idioms.md), [types-and-interfaces](../types-and-interfaces/SKILL.md)   |
| Concurrency    | _Concurrency in Go_ (Cox-Buday)                                                                            | [concurrency](../concurrency/SKILL.md)                                             |
| Testing / TDD  | _Learn Go with Tests_ (James, free) · _The Power of Go: Tests_ (Arundel)                                   | [golang-testing](../testing/SKILL.md)                                              |
| Performance    | _Efficient Go_ (Plotka & Branczyk) · _Go Optimizations 101_ (Liu)                                          | [testing-patterns](../testing/references/testing-patterns.md) (benchmarks)         |
| Web apps       | _Let's Go_ / _Let's Go Further_ (Edwards)                                                                  | [web](../web/SKILL.md)                                                             |
| Networking     | _Network Programming with Go_ (Woodbeck)                                                                   | [http-server](../web/references/http-server.md)                                    |
| Services       | _Cloud Native Go_ (Titmus) · _Distributed Services with Go_ (Jeffery)                                      | [Microservice Resilience](microservice-resilience.md)                              |
| CLI tools      | _Powerful Command-Line Applications in Go_ (Gerardi)                                                       | [Project Layout](project-layout.md)                                                |
| Generics       | _Know Go: Generics_ (Arundel) · _Go Generics 101_ (Liu)                                                    | [collections-generics](../types-and-interfaces/references/collections-generics.md) |

## Takeaways

**Learning Go (Bodner).** Accept interfaces and return structs. Use pointers only for mutation or large values, not by default. Watch for shadowed `err` in nested blocks. Slices share backing arrays: use the full slice expression `s[a:b:c]` to stop `append` from overwriting the caller's data. Run `go vet` plus `staticcheck`/`golangci-lint` in CI. Implicit interfaces give you dependency injection without a framework.

**Go 101 / Details & Tips 101.** Spec-level gotchas. An interface holding a typed `nil` pointer is not `nil`. `defer` and `go` evaluate their arguments immediately. `range` copies arrays (not slices) before iterating. Assigning a large struct copies all of it.

**Concurrency in Go (Cox-Buday).** Prefer confinement (one owner per value) to locks. Whoever starts a goroutine is responsible for stopping it: pass a `done` channel or `context.Context`. Use the `for { select { case <-ctx.Done(): return; … } }` loop. Send errors back together with results instead of logging them inside workers. Build pipelines from stages, fan out to workers and fan back in. Use heartbeats to detect stuck workers. Throttle with a token bucket (`golang.org/x/time/rate`).

**Learn Go with Tests (James).** Red, green, refactor, and watch the failure message before writing code. Inject `io.Writer` or a small interface so you can test without globals. Use spies instead of heavy mocks, and add acceptance tests at the edges. Free at [quii.gitbook.io/learn-go-with-tests](https://quii.gitbook.io/learn-go-with-tests).

**The Power of Go: Tests (Arundel).** Tests are executable specifications, so name them as sentences describing behaviour. Compare with `cmp.Diff`. Use `testscript` for CLI end-to-end tests. Test behaviour, not implementation details.

**Efficient Go (Plotka & Branczyk).** Write efficiency requirements (latency and resource budgets) before optimising. Follow test → fix → benchmark → optimise. Benchmark with `-benchmem -count=N`, compare runs with `benchstat`, and find hot spots with `pprof` instead of guessing. Use metrics and traces for production performance.

**Go Optimizations 101 (Liu).** Check escape analysis with `-gcflags=-m`. Preallocate slices and maps when the size is known. Know the cost of `string`↔`[]byte` conversions. Bounds-check elimination is a micro-optimisation: do it only after profiling.

**Let's Go / Let's Go Further (Edwards).** Standard-library web apps: `cmd/web` plus `internal/`. Put dependencies in an `application` struct whose methods are the handlers. Centralise error helpers (`serverError`, `clientError`). Wrap the mux in middleware for panic recovery, secure headers and request logging. Cache parsed templates. Wrap `database/sql` in model types behind an interface so tests can swap them. Test end to end with `httptest`. _Further_ adds JSON APIs, validation, rate limiting, graceful shutdown and configuration from flags.

**Network Programming with Go (Woodbeck).** Every network operation needs a deadline (`SetDeadline`, `http.Server` `ReadHeaderTimeout`/`ReadTimeout`/`WriteTimeout`/`IdleTimeout`); with no deadline a connection can hang forever. Stream with `io.Copy`. Use `net.Pipe` or loopback listeners in tests. Configure TLS explicitly.

**Cloud Native Go (Titmus).** Stability patterns: circuit breaker, debounce, retry with backoff, throttle, timeout. Concurrency patterns: fan-in/out, future, sharded locks. Follow twelve-factor configuration and instrument with OpenTelemetry. Overlaps [Microservice Resilience](microservice-resilience.md); read that file first.

**Distributed Services with Go (Jeffery).** Builds a distributed commit log step by step: gRPC with protobuf, mTLS plus ACL authorisation, Serf membership, Raft replication, client-side load balancing and Kubernetes deployment. Use it as a worked example of how those parts fit together.

**Powerful Command-Line Applications in Go (Gerardi).** Write `run(args []string, stdout io.Writer) error` and keep `main` to parsing input and calling `os.Exit`, so the CLI is testable. Use `flag` before reaching for Cobra. Use golden files for output tests. Run `os/exec` with a context timeout.

**Know Go: Generics / Go Generics 101.** Use type parameters for containers and algorithms that work the same over many types. Use interfaces when callers need behaviour. Keep constraints minimal (`comparable`, `cmp.Ordered`).

## Covered Elsewhere

- _The Go Programming Language_ → [GOPL Book Notes](gopl-book-notes.md)
- _The Way to Go_ → [The Way to Go Notes](the-way-to-go-notes.md)
- _Practical Go Lessons_ → [Practical Go Lessons Notes](practical-go-lessons-notes.md)
- _100 Go Mistakes and How to Avoid Them_ → [100 Go Mistakes](100-go-mistakes.md)
