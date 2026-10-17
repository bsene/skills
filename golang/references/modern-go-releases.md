# Modern Go Releases (1.24 – 1.27)

Prefer these over older idioms when `go.mod` targets the matching version. Authoritative notes: [go.dev/doc/devel/release](https://go.dev/doc/devel/release) · [1.24](https://go.dev/doc/go1.24) · [1.25](https://go.dev/doc/go1.25) · [1.26](https://go.dev/doc/go1.26) · [1.27](https://go.dev/doc/go1.27).

Run `go fix ./...` (modernizers, Go 1.26+) to apply many of these automatically.

## Use This, Not That

| Need                         | Modern (since)                                   | Instead of                                    |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------- |
| Benchmark loop               | `for b.Loop() { … }` (1.24)                      | `for i := 0; i < b.N; i++`                    |
| Split/iterate lines          | `strings.SplitSeq`, `strings.Lines` (1.24)       | `strings.Split` + range                       |
| Omit zero struct/time fields | `json:",omitzero"` (1.24)                        | `omitempty` (misses `time.Time`)              |
| Pinned dev tools             | `tool` directive + `go tool x` (1.24)            | `tools.go` blank imports                      |
| Sandboxed file access        | `os.OpenRoot` / `os.Root` (1.24)                 | manual path prefix checks                     |
| Cleanup after GC             | `runtime.AddCleanup` (1.24)                      | `runtime.SetFinalizer`                        |
| Generic alias                | `type Set[T comparable] = map[T]struct{}` (1.24) | —                                             |
| Spawn tracked goroutine      | `wg.Go(func() { … })` (1.25)                     | `wg.Add(1); go func(){ defer wg.Done() … }()` |
| Time-dependent tests         | `synctest.Test` fake clock (1.25)                | real `time.Sleep` / injected clocks           |
| CSRF defense                 | `http.CrossOriginProtection` (1.25)              | token/cookie middleware                       |
| Pointer to computed value    | `new(expr)` (1.26)                               | temp variable + `&v`                          |
| Typed error extraction       | `errors.AsType[*MyErr](err)` (1.26)              | `errors.As` with pre-declared var             |
| Fan-out logging              | `slog.NewMultiHandler` (1.26)                    | hand-rolled fan-out handler                   |
| Reverse proxy rewrite        | `ReverseProxy.Rewrite` (1.26)                    | deprecated `Director`                         |
| Type-parameterised method    | method with own type params (1.27)               | free generic function wrapper                 |
| Last-separator split         | `strings.CutLast` / `bytes.CutLast` (1.27)       | `LastIndex` + slicing                         |
| Clone URL / query values     | `URL.Clone`, `Values.Clone` (1.27)               | manual copy                                   |

## Runtime & Tooling Highlights

| Version | Change                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1.24    | Swiss-table `map`; vet `tests` analyzer; `printf` flags non-constant format strings                                            |
| 1.25    | Container-aware `GOMAXPROCS` (cgroup limit) — drop `automaxprocs`; `runtime/trace.FlightRecorder`; vet `waitgroup`, `hostport` |
| 1.26    | Green Tea GC default (10–40% less GC overhead); `go fix` modernizers and `//go:fix inline`; cgo calls ~30% faster              |
| 1.27    | `goroutineleak` pprof profile GA; goroutine labels in tracebacks; `go test` runs vet `stdversion`; `go doc pkg@version`        |

## Watch Out

- **`encoding/json` is backed by v2 in 1.27**: same API, but error text may differ; opt out with `GOEXPERIMENT=nojsonv2`. `encoding/json/v2` rejects invalid UTF-8 and duplicate names by default.
- **Timer channels are always unbuffered (1.27)**: `asynctimerchan` is gone.
- **Nil-check fix (1.25)**: using a result before checking `err` now panics correctly.
- **`ServeMux` redirects (1.26)**: trailing-slash redirects use 307, not 301.
- **HTTP/1 body drain on close (1.27)**: improves connection reuse; keep `defer resp.Body.Close()`.
- **Stay on supported patches**: 1.26.9 and 1.27.2 (2026-10-08) carry security fixes for `crypto/tls`, `net/http`, `html/template`, `os`.
- **Experimental, do not recommend for production**: `simd`, `simd/archsimd`, `runtime/secret`.
