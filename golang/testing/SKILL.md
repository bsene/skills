---
name: golang-testing
description: >
  Go testing — table-driven tests, test helpers, benchmarks, fuzz testing, profiling, and testify.
  TRIGGER when: user asks about Go testing, go test, testing package, table-driven tests in Go,
  Go test helpers, t.Helper, t.Run, Go benchmarks, Go profiling, pprof, Go fuzz testing,
  Go test coverage, testify, Go mock, Go test patterns, Go test organization, TestMain,
  t.Cleanup, t.Parallel, Go golden files, Go httptest.
  DO NOT USE when: user needs general testing philosophy (not Go-specific) — use `testing` skill instead.
user-invocable: false
---

# Go Testing

Go has a built-in test framework — no external library needed. Files end in `_test.go`, functions start with `Test`, and `go test` runs everything.

**Always run `go test -race ./...` in CI** — the race detector catches data races that otherwise ship to production.

---

## Test File Conventions

| Convention | Rule |
|---|---|
| File name | `*_test.go` — same package, same directory |
| Test function | `func TestXxx(t *testing.T)` — uppercase after `Test` |
| Benchmark | `func BenchmarkXxx(b *testing.B)` |
| Fuzz test | `func FuzzXxx(f *testing.F)` |
| Example | `func ExampleXxx()` — with `// Output:` comment |
| Test package | Same package (white-box) or `package foo_test` (black-box) |

---

## Table-Driven Tests

The canonical Go testing pattern:

```go
func TestParseSize(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int64
        wantErr bool
    }{
        {name: "bytes", input: "100B", want: 100},
        {name: "kilobytes", input: "2KB", want: 2048},
        {name: "megabytes", input: "1MB", want: 1048576},
        {name: "empty", input: "", wantErr: true},
        {name: "invalid", input: "abc", wantErr: true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseSize(tt.input)
            if tt.wantErr {
                if err == nil {
                    t.Fatal("expected error, got nil")
                }
                return
            }
            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }
            if got != tt.want {
                t.Errorf("ParseSize(%q) = %d, want %d", tt.input, got, tt.want)
            }
        })
    }
}
```

---

## Testing Decision Table

| Need | Tool / Approach |
|---|---|
| Multiple cases for one function | Table-driven tests with `t.Run` |
| Shared setup / teardown | `TestMain(m *testing.M)` or `t.Cleanup(func())` |
| Mark helpers (clean stack traces) | `t.Helper()` as first line of helper function |
| Run tests in parallel | `t.Parallel()` at start of test/subtest |
| Measure performance | `go test -bench=. -benchmem` |
| Find edge-case inputs | `go test -fuzz=FuzzXxx` |
| Profile CPU/memory | `go test -cpuprofile cpu.prof` → `go tool pprof` |
| Assert with richer API | `testify/assert` or `testify/require` |
| Test HTTP handlers | `httptest.NewRecorder()` + `httptest.NewServer()` |
| Snapshot testing | Golden files in `testdata/` |
| Build tags for integration tests | `//go:build integration` |

---

## t.Parallel() Loop-Variable Capture

Before Go 1.22, a parallel subtest in a `range` loop captures the loop variable by reference — all subtests see the final iteration's value. Pin it per iteration:

```go
for _, tt := range tests {
    tt := tt // pin (unnecessary on Go 1.22+, where range vars are per-iteration)
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // ...
    })
}
```

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Testing implementation, not behavior | Tests break on refactor | Assert on outputs, not internal state |
| Excessive mocking | Mocks pass while real code fails | Use interfaces + fakes; integration-test boundaries |
| No `t.Helper()` in helpers | Error points to wrong line | Add `t.Helper()` as first line |
| Benchmark without `b.ResetTimer()` | Setup time skews results | Call `b.ResetTimer()` after setup |

---

## Read On Demand

| Read When | File |
|---|---|
| Full examples: table-driven, TestMain, parallel, golden files, httptest, testify, benchmarks, fuzz, pprof | [Testing Patterns](references/testing-patterns.md) |
