# Goroutines & Channels

## Goroutine Lifecycle

A goroutine runs until its function returns. If nothing causes it to return, it leaks.

### Done Channel Pattern

```go
func worker(done <-chan struct{}, jobs <-chan Job) {
    for {
        select {
        case <-done:
            return
        case job, ok := <-jobs:
            if !ok {
                return  // channel closed
            }
            process(job)
        }
    }
}

func main() {
    done := make(chan struct{})
    jobs := make(chan Job, 10)

    go worker(done, jobs)

    // ... send jobs ...

    close(done)  // signal worker to stop
}
```

### Context Cancellation (preferred)

```go
func worker(ctx context.Context, jobs <-chan Job) {
    for {
        select {
        case <-ctx.Done():
            return
        case job, ok := <-jobs:
            if !ok {
                return
            }
            process(ctx, job)
        }
    }
}
```

---

## Unbuffered vs Buffered Channels

### Unbuffered (synchronous)

```go
ch := make(chan int)

go func() {
    ch <- 42    // blocks until someone receives
}()

v := <-ch       // blocks until someone sends
```

Both sides must be present at the same time. Acts as a synchronization point.

### Buffered (asynchronous up to capacity)

```go
ch := make(chan int, 3)

ch <- 1  // doesn't block (buffer has space)
ch <- 2  // doesn't block
ch <- 3  // doesn't block
ch <- 4  // BLOCKS — buffer full, waits for receiver
```

---

## Fan-Out / Fan-In

### Fan-Out: one channel, multiple workers

```go
func fanOut(ctx context.Context, in <-chan Job, workerCount int) <-chan Result {
    out := make(chan Result)
    var wg sync.WaitGroup

    for i := 0; i < workerCount; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range in {
                select {
                case <-ctx.Done():
                    return
                case out <- process(job):
                }
            }
        }()
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}
```

### Fan-In: multiple channels into one

```go
func fanIn(ctx context.Context, channels ...<-chan Result) <-chan Result {
    out := make(chan Result)
    var wg sync.WaitGroup

    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan Result) {
            defer wg.Done()
            for v := range c {
                select {
                case <-ctx.Done():
                    return
                case out <- v:
                }
            }
        }(ch)
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}
```

---

## Pipeline Pattern

Chain stages, each running in its own goroutine:

```go
func generate(ctx context.Context, nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            select {
            case <-ctx.Done():
                return
            case out <- n:
            }
        }
    }()
    return out
}

func square(ctx context.Context, in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            select {
            case <-ctx.Done():
                return
            case out <- n * n:
            }
        }
    }()
    return out
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    nums := generate(ctx, 2, 3, 4)
    squares := square(ctx, nums)

    for v := range squares {
        fmt.Println(v) // 4, 9, 16
    }
}
```

---

## Worker Pool

Bounded concurrency for processing jobs:

```go
func workerPool(ctx context.Context, jobs <-chan Job, results chan<- Result, workers int) {
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                select {
                case <-ctx.Done():
                    return
                case results <- process(job):
                }
            }
        }()
    }
    go func() {
        wg.Wait()
        close(results)
    }()
}
```

### Semaphore Pattern (simpler bounded concurrency)

```go
sem := make(chan struct{}, maxConcurrency)

for _, job := range jobs {
    sem <- struct{}{}  // acquire
    go func(j Job) {
        defer func() { <-sem }()  // release
        process(j)
    }(job)
}

// Wait for all to finish
for i := 0; i < cap(sem); i++ {
    sem <- struct{}{}
}
```

---

## Channel Axioms

| Operation | nil channel | closed channel | open channel |
|---|---|---|---|
| Send `ch <-` | Block forever | **Panic** | Send or block |
| Receive `<-ch` | Block forever | Zero value, `ok=false` | Receive or block |
| Close `close(ch)` | **Panic** | **Panic** | Close |

These rules explain many deadlocks and panics. Memorize them.
