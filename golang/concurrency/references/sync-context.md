# Sync & Context

## sync.Mutex / sync.RWMutex

Protect shared state from concurrent access:

```go
type Cache struct {
    mu    sync.RWMutex
    items map[string]Item
}

func (c *Cache) Get(key string) (Item, bool) {
    c.mu.RLock()         // multiple readers allowed
    defer c.mu.RUnlock()
    item, ok := c.items[key]
    return item, ok
}

func (c *Cache) Set(key string, item Item) {
    c.mu.Lock()          // exclusive write access
    defer c.mu.Unlock()
    c.items[key] = item
}
```

**Rules:**
- Always `defer Unlock()` immediately after `Lock()` — prevents forgetting unlock on early return
- Use `RWMutex` when reads vastly outnumber writes
- Never copy a mutex (pass by pointer, embed by value only in structs used by pointer)

---

## sync.WaitGroup

Wait for a group of goroutines to finish:

```go
var wg sync.WaitGroup

for _, url := range urls {
    wg.Add(1)
    go func(u string) {
        defer wg.Done()
        fetch(u)
    }(url)
}

wg.Wait()  // blocks until all Done() calls match Add() count
```

**Rules:**
- Call `Add` before starting the goroutine, not inside it
- Match every `Add(1)` with exactly one `Done()`
- `Add` with a negative value panics if counter goes below zero

---

## sync.Once

Execute a function exactly once, regardless of how many goroutines call it:

```go
var (
    instance *Database
    once     sync.Once
)

func GetDB() *Database {
    once.Do(func() {
        instance = connectToDatabase()
    })
    return instance
}
```

Thread-safe lazy initialization. The function runs on the first call; subsequent calls return immediately.

---

## sync.Map

Concurrent-safe map optimized for two patterns:
1. Key written once, read many times (append-only)
2. Multiple goroutines read/write disjoint key sets

```go
var m sync.Map

m.Store("key", "value")

v, ok := m.Load("key")
if ok {
    fmt.Println(v.(string))
}

m.Delete("key")

m.Range(func(key, value any) bool {
    fmt.Println(key, value)
    return true  // continue iteration
})
```

For most use cases, a regular map + `sync.RWMutex` is simpler and faster. Use `sync.Map` only for the patterns above.

---

## context.Context

Carries cancellation signals, deadlines, and request-scoped values across API boundaries.

### Creation

```go
// Root context (never cancelled)
ctx := context.Background()

// With manual cancellation
ctx, cancel := context.WithCancel(parent)
defer cancel()

// With deadline (absolute time)
ctx, cancel := context.WithDeadline(parent, time.Now().Add(5*time.Second))
defer cancel()

// With timeout (relative duration)
ctx, cancel := context.WithTimeout(parent, 5*time.Second)
defer cancel()

// With value (request-scoped data — use sparingly)
ctx = context.WithValue(parent, requestIDKey, "abc123")
```

### Always defer cancel

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()  // releases resources even if operation completes before timeout
```

### Checking cancellation

```go
func longOperation(ctx context.Context) error {
    for i := 0; i < 1000; i++ {
        select {
        case <-ctx.Done():
            return ctx.Err()  // context.Canceled or context.DeadlineExceeded
        default:
        }
        doWork(i)
    }
    return nil
}
```

### Context Rules

| Rule | Rationale |
|---|---|
| First parameter, named `ctx` | Convention — every Go developer expects it |
| Don't store in a struct | Context is request-scoped, not object-scoped |
| Don't pass `nil` — use `context.TODO()` | Nil causes panics in some callers |
| Values for request-scoped data only | Not a general key-value store |
| Cancel functions must be called | Prevents goroutine and resource leaks |

---

## errgroup.Group

WaitGroup that captures the first error:

```go
import "golang.org/x/sync/errgroup"

g, ctx := errgroup.WithContext(context.Background())

for _, url := range urls {
    g.Go(func() error {
        return fetch(ctx, url)
    })
}

if err := g.Wait(); err != nil {
    log.Fatal(err)  // first error from any goroutine
}
```

With bounded concurrency:

```go
g, ctx := errgroup.WithContext(ctx)
g.SetLimit(10)  // max 10 concurrent goroutines

for _, job := range jobs {
    g.Go(func() error {
        return process(ctx, job)
    })
}
```

---

## Race Detector

Go's race detector finds data races at runtime:

```bash
go test -race ./...
go run -race main.go
go build -race -o myapp
```

**Always run tests with `-race` in CI.** It adds ~2-10x overhead but catches real bugs.

### Common Data Races

```go
// Race: multiple goroutines writing to shared map
m := map[string]int{}
for i := 0; i < 10; i++ {
    go func() { m["key"] = i }()  // DATA RACE
}

// Race: read and write to shared variable
var count int
go func() { count++ }()
fmt.Println(count)  // DATA RACE

// Fix: use atomic, mutex, or channel
var count atomic.Int64
go func() { count.Add(1) }()
fmt.Println(count.Load())
```
