# Testing Patterns

## TestMain — Global Setup/Teardown

```go
func TestMain(m *testing.M) {
    // Setup
    db := setupTestDatabase()

    // Run all tests
    code := m.Run()

    // Teardown
    db.Close()

    os.Exit(code)
}
```

Use for expensive one-time setup (database connections, test containers). Prefer `t.Cleanup` for per-test cleanup.

---

## Golden Files

Compare output against expected files in `testdata/`:

```go
func TestRender(t *testing.T) {
    got := render(input)

    golden := filepath.Join("testdata", t.Name()+".golden")

    if *update {
        os.WriteFile(golden, []byte(got), 0644)
        return
    }

    want, err := os.ReadFile(golden)
    if err != nil {
        t.Fatal(err)
    }

    if got != string(want) {
        t.Errorf("output mismatch.\ngot:\n%s\nwant:\n%s", got, want)
    }
}

var update = flag.Bool("update", false, "update golden files")
```

Run `go test -update` to regenerate golden files after intentional changes.

---

## HTTP Testing

### Testing Handlers with httptest.NewRecorder

```go
func TestHealthHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    w := httptest.NewRecorder()

    HealthHandler(w, req)

    res := w.Result()
    defer res.Body.Close()

    if res.StatusCode != http.StatusOK {
        t.Errorf("status = %d, want %d", res.StatusCode, http.StatusOK)
    }

    body, _ := io.ReadAll(res.Body)
    if string(body) != `{"status":"ok"}` {
        t.Errorf("body = %s", body)
    }
}
```

### Integration Testing with httptest.NewServer

```go
func TestAPIIntegration(t *testing.T) {
    srv := httptest.NewServer(NewRouter())
    defer srv.Close()

    resp, err := http.Get(srv.URL + "/api/users")
    if err != nil {
        t.Fatal(err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        t.Errorf("status = %d", resp.StatusCode)
    }
}
```

---

## Testify

### assert vs require

```go
import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUser(t *testing.T) {
    user, err := GetUser("123")

    require.NoError(t, err)          // stops test on failure (Fatal)
    require.NotNil(t, user)

    assert.Equal(t, "Alice", user.Name)  // continues on failure (Error)
    assert.Equal(t, 30, user.Age)
}
```

Use `require` for preconditions (test can't continue without them). Use `assert` for independent checks (report all failures).

### Common Assertions

```go
assert.Equal(t, expected, actual)
assert.NotEqual(t, a, b)
assert.Nil(t, err)
assert.NotNil(t, result)
assert.True(t, condition)
assert.Contains(t, "hello world", "hello")
assert.Len(t, slice, 3)
assert.ErrorIs(t, err, ErrNotFound)
assert.ErrorAs(t, err, &target)
assert.JSONEq(t, expectedJSON, actualJSON)
```

---

## Benchmarks

```go
func BenchmarkSort(b *testing.B) {
    data := generateData(1000)
    b.ResetTimer()  // exclude setup from timing

    for i := 0; i < b.N; i++ {
        sorted := make([]int, len(data))
        copy(sorted, data)
        sort.Ints(sorted)
    }
}
```

Run:
```bash
go test -bench=BenchmarkSort -benchmem -count=5
```

Output:
```
BenchmarkSort-8    50000    25400 ns/op    8192 B/op    1 allocs/op
```

### Sub-benchmarks

```go
func BenchmarkMap(b *testing.B) {
    for _, size := range []int{10, 100, 1000, 10000} {
        b.Run(fmt.Sprintf("size=%d", size), func(b *testing.B) {
            m := make(map[int]int, size)
            for i := 0; i < size; i++ {
                m[i] = i
            }
            b.ResetTimer()
            for i := 0; i < b.N; i++ {
                _ = m[size/2]
            }
        })
    }
}
```

---

## Fuzz Testing (Go 1.18+)

```go
func FuzzParseJSON(f *testing.F) {
    // Seed corpus
    f.Add([]byte(`{"name": "Alice"}`))
    f.Add([]byte(`{}`))
    f.Add([]byte(`null`))

    f.Fuzz(func(t *testing.T, data []byte) {
        var result map[string]any
        err := json.Unmarshal(data, &result)
        if err != nil {
            return  // invalid input is fine — no crash is the goal
        }

        // Round-trip: marshal back and unmarshal again
        encoded, err := json.Marshal(result)
        if err != nil {
            t.Fatalf("marshal failed after successful unmarshal: %v", err)
        }

        var result2 map[string]any
        if err := json.Unmarshal(encoded, &result2); err != nil {
            t.Fatalf("round-trip failed: %v", err)
        }
    })
}
```

Run:
```bash
go test -fuzz=FuzzParseJSON -fuzztime=30s
```

---

## Profiling with pprof

```bash
# CPU profile
go test -cpuprofile cpu.prof -bench=.
go tool pprof cpu.prof

# Memory profile
go test -memprofile mem.prof -bench=.
go tool pprof mem.prof

# Inside pprof
(pprof) top 10
(pprof) web          # opens flame graph in browser
(pprof) list FuncName  # annotated source
```

### HTTP pprof (for running servers)

```go
import _ "net/http/pprof"

// Then visit http://localhost:6060/debug/pprof/
go func() { log.Println(http.ListenAndServe("localhost:6060", nil)) }()
```

---

## Build Tags for Test Categories

```go
//go:build integration

package myapp_test

func TestDatabaseIntegration(t *testing.T) {
    // requires running database
}
```

```bash
go test ./...                           # skips integration tests
go test -tags=integration ./...         # includes them
```

---

## Test Organization

| Pattern | When |
|---|---|
| Same package `package foo` | White-box: test unexported functions |
| External package `package foo_test` | Black-box: test only the public API |
| `testdata/` directory | Fixture files (Go toolchain ignores this dir) |
| `internal/testutil/` | Shared test helpers across packages |
| `_test.go` next to source | Always — never a separate `tests/` directory |
