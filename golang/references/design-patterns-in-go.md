# Design Patterns in Go

Source: _Go Design Patterns for Real-World Projects_ (and _An Introduction to Programming in Go_ for fundamentals). Go replaces many GoF patterns with functions, small interfaces, and channels. Reach for a pattern only after the third occurrence of the need.

## Pattern to Go idiom

| GoF pattern             | Idiomatic Go                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Singleton               | Package-level var guarded by `sync.Once`; better, build once in `main` and pass it              |
| Factory                 | `NewX(...)` returning a concrete type, or an interface when the impl is chosen by input         |
| Builder                 | Functional options (`WithTimeout(d)`) or a config struct; chain builder only if staged          |
| Prototype               | Copy method (`func (c Config) Clone() Config`); mind shared slices/maps (deep copy)             |
| Adapter                 | Small struct wrapping a foreign type and satisfying your interface                              |
| Bridge                  | Interface field holding the implementation; swap at construction                                |
| Composite               | Interface implemented by both leaf and container (container holds `[]Node`)                     |
| Decorator               | Function or struct that wraps an interface value and returns the same interface                 |
| Proxy                   | Wrapper with same interface adding caching, lazy load, or access control                        |
| Facade                  | Package-level API hiding several internal packages                                              |
| Strategy                | Function-typed field or small interface; pass the function, no struct needed                    |
| Chain of Responsibility | Middleware: `func(next Handler) Handler`                                                        |
| Template method         | Embed nothing; pass step functions in, or accept an interface with the varying steps            |
| Memento                 | Snapshot struct returned by `Save()` and accepted by `Restore()`                                |
| Visitor                 | Type switch over a closed set, or generics; avoid double dispatch ceremony                      |
| State                   | `type State interface { Next(*Machine) State }`, or a `state` enum with a `switch`              |
| Mediator                | Central coordinator struct or a channel hub; components know only the mediator                  |
| Observer                | Channels per subscriber or callback slices; guard with `sync.RWMutex`; always allow unsubscribe |
| Interpreter             | Parse to AST of small types; evaluate with a `switch`; prefer an existing parser lib            |

## Examples

Decorator and middleware share one shape:

```go
type Handler func(ctx context.Context, req Request) (Response, error)

func WithLogging(l *slog.Logger) func(Handler) Handler {
    return func(next Handler) Handler {
        return func(ctx context.Context, req Request) (Response, error) {
            start := time.Now()
            resp, err := next(ctx, req)
            l.Info("handled", "dur", time.Since(start), "err", err)
            return resp, err
        }
    }
}
```

Strategy as a function type (no interface needed):

```go
type Discount func(total int) int

func Checkout(total int, d Discount) int { return d(total) }
```

State with closed enum:

```go
type state int

const (
    idle state = iota
    running
    stopped
)

func (m *Machine) Handle(ev Event) {
    switch m.state {
    case idle:
        if ev == Start { m.state = running }
    case running:
        if ev == Stop { m.state = stopped }
    }
}
```

Observer without leaking goroutines:

```go
type Bus struct {
    mu   sync.RWMutex
    subs map[int]chan Event
    next int
}

func (b *Bus) Subscribe() (<-chan Event, func()) {
    b.mu.Lock()
    defer b.mu.Unlock()
    id := b.next
    b.next++
    ch := make(chan Event, 16)
    b.subs[id] = ch
    return ch, func() {
        b.mu.Lock()
        defer b.mu.Unlock()
        delete(b.subs, id)
        close(ch)
    }
}
```

Publish with a non-blocking send (`select { case ch <- ev: default: }`) so a slow subscriber cannot stall the publisher; decide explicitly whether to drop or block.

## Concurrency patterns beyond pipelines

Fan-in/out, pipeline, and worker pool are in `concurrency/references/goroutines-channels.md`. Additional ones:

| Pattern                | Go implementation                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Future                 | Function returns `<-chan Result` (buffered 1) or a struct with `Await(ctx)`; sender closes |
| Barrier                | `sync.WaitGroup` for "all done"; `errgroup` when any failure must cancel the rest          |
| Pub/Sub                | Subscribe returns a channel plus a cancel func (above); one owner closes each channel      |
| Generator              | Function returning `<-chan T` that stops on `ctx.Done()`, or `iter.Seq[T]` in Go 1.23+     |
| Worker pool dispatcher | Jobs channel + N workers; results channel closed after `wg.Wait()` in a separate goroutine |

```go
func Async(ctx context.Context, f func(context.Context) (int, error)) <-chan struct {
    V   int
    Err error
} {
    out := make(chan struct {
        V   int
        Err error
    }, 1) // buffered: sender never leaks if nobody receives
    go func() {
        defer close(out)
        v, err := f(ctx)
        out <- struct {
            V   int
            Err error
        }{v, err}
    }()
    return out
}
```

## Fundamentals worth double-checking (Intro to Programming in Go)

| Topic            | Reminder                                                                       |
| ---------------- | ------------------------------------------------------------------------------ |
| Slices           | Share backing arrays; `append` may or may not reallocate; copy before mutating |
| Maps             | Nil map reads fine, writes panic; iteration order is random                    |
| Arrays vs slices | Arrays are values (copied on assignment); slices are headers                   |
| `defer` in loops | Runs at function exit, not loop iteration; wrap the body in a func             |
| Strings          | Immutable bytes; `range` yields runes; use `strings.Builder` for concatenation |
| `panic`          | For programmer errors only; recover at API boundaries (HTTP server, workers)   |
