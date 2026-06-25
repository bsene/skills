---
name: golang-concurrency
description: >
  Go concurrency — goroutines, channels, select, sync primitives, context, and data race prevention.
  TRIGGER when: user asks about goroutines, Go channels, Go select, sync.Mutex, sync.WaitGroup,
  sync.Once, Go context, context.WithCancel, context.WithTimeout, Go data race, race condition in Go,
  Go concurrency patterns, fan-in fan-out, worker pool, Go channel direction, buffered channel,
  Go deadlock, -race flag, errgroup, Go concurrent map, Go goroutine leak.
user-invocable: false
---

# Go Concurrency

"Don't communicate by sharing memory; share memory by communicating."

Concurrency is not parallelism. Goroutines structure concurrent code; the runtime decides parallelism.

---

## Channel vs Mutex Decision Table

| Need | Tool | Why |
|---|---|---|
| Transfer ownership of data | Channel | Data flows, no shared state |
| Protect shared state (cache, counter) | `sync.Mutex` | Simpler than channel for guarding |
| Wait for N goroutines to finish | `sync.WaitGroup` | Counting semaphore |
| One-time initialization | `sync.Once` | Thread-safe lazy init |
| Cancellation / deadline propagation | `context.Context` | Hierarchical cancellation |
| Collect errors from goroutines | `errgroup.Group` | WaitGroup + first error capture |
| Rate limiting | `time.Ticker` + channel | Ticker feeds a channel at fixed intervals |

---

## Goroutine Lifecycle Rules

1. **Always know how a goroutine ends.** Every goroutine must have an exit path — a done channel, context cancellation, or input channel closing.

2. **Never fire and forget.** If you can't answer "how does this goroutine stop?", you have a leak.

3. **The caller decides concurrency.** Don't start goroutines inside library functions — let the caller choose.

```go
// Bad: library starts goroutine — caller can't control lifecycle
func FetchAll(urls []string) []Result {
    for _, u := range urls {
        go fetch(u) // who waits? who cancels?
    }
}

// Good: caller controls concurrency
func Fetch(ctx context.Context, url string) (Result, error) { ... }
```

---

## Channel Direction Annotations

Annotate direction in function signatures for compile-time safety: `chan<- T` is send-only, `<-chan T` is receive-only, plain `chan T` is bidirectional. The producer owns and `close`s the channel; consumers `range` over it.

---

## Buffered vs Unbuffered

| Type | Behavior | Use when |
|---|---|---|
| Unbuffered `make(chan T)` | Send blocks until receiver is ready | Synchronization — both sides must be present |
| Buffered `make(chan T, n)` | Send blocks only when buffer is full | Decoupling producer/consumer speeds, known bound |

**Default to unbuffered.** Add a buffer only when you can justify the size.

---

## Select Statement

Multiplexes across multiple channel operations:

```go
select {
case msg := <-msgCh:
    handle(msg)
case err := <-errCh:
    log.Error(err)
case <-ctx.Done():
    return ctx.Err()
case <-time.After(5 * time.Second):
    return errors.New("timeout")
}
```

`select` with `default` makes a non-blocking check:

```go
select {
case msg := <-ch:
    handle(msg)
default:
    // ch not ready, do something else
}
```

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Goroutine leak (no exit path) | Memory/CPU grows forever | Use `ctx.Done()`, done channel, or close input channel |
| Unbounded goroutine creation | OOM under load | Use worker pool with bounded concurrency |
| Channel as mutex | Overcomplicates simple state protection | Use `sync.Mutex` for shared state |
| Ignoring context cancellation | Goroutine runs long after caller gave up | Check `ctx.Done()` in loops and before expensive ops |
| Missing `-race` in tests | Data races go undetected | Always run `go test -race ./...` in CI |

---

## Read On Demand

| Read When | File |
|---|---|
| Goroutine lifecycle, channel patterns, fan-in/fan-out, pipeline, worker pool | [Goroutines & Channels](references/goroutines-channels.md) |
| sync.Mutex, WaitGroup, Once, sync.Map, context, errgroup, -race flag | [Sync & Context](references/sync-context.md) |

---

## Benchmark

Scenario: `.benchmarks/scenarios/golang-concurrency-001-goroutine-leak.md`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 83%  | +0%   |
| claude-sonnet-4-6 | 83%     | 83%  | +0%   |
| claude-haiku-4-5  | 50%     | 50%  | +0%   |

> **NEUTRAL** (run 2026-06-25) — no regression, but zero lift on every model and haiku stuck at 50%. Baselines already catch the leak/race basics; the skill adds nothing measurable on the points they miss (errgroup propagation, unbuffered coupling). Does NOT meet SOFT PASS (no gain on the weak model). **Action:** raise salience of errgroup + bounded-pool guidance, or harden the scenario. Gate per `skill-optimizer/release-gates.md`.
