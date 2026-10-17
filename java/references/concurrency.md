# Concurrency

Source: _Effective Java_, 3rd ed. (concurrency chapter), paraphrased; updated for Java 21 (JEP 444 virtual threads, JEP 453/480 structured concurrency preview). Verify preview status against https://openjdk.org/jeps/ for your JDK.

## Decision table

| Need                               | Use                                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Run tasks asynchronously           | `ExecutorService` — never raw `Thread` management                                                           |
| Many blocking I/O tasks (Java 21+) | `Executors.newVirtualThreadPerTaskExecutor()`; do **not** pool virtual threads                              |
| CPU-bound parallel work            | Fixed pool sized to cores, or `ForkJoinPool`/parallel streams (after measuring)                             |
| Compose async results              | `CompletableFuture` (always handle exceptions, supply an executor)                                          |
| Shared map / queue / counter       | `ConcurrentHashMap`, `BlockingQueue`, `AtomicLong` / `LongAdder`                                            |
| Wait for N events / hand-off       | `CountDownLatch`, `Semaphore`, `Phaser`, `BlockingQueue` — not `wait`/`notify`                              |
| Mutual exclusion                   | `synchronized` or `ReentrantLock`; keep critical sections small                                             |
| Visibility of a flag only          | `volatile` (not enough for compound ops like `i++`)                                                         |
| Once-only lazy init                | Initialization-on-demand holder class, or plain `static final`; double-checked locking only with `volatile` |
| Timing                             | `System.nanoTime()` for intervals                                                                           |
| Per-thread state                   | Avoid `ThreadLocal` with virtual threads at scale; prefer passing context (or `ScopedValue` when final)     |

## Rules

1. **Synchronize all access** to shared mutable data — reads too. Unsynchronized reads can see stale or torn state; `Thread.stop` and busy-wait loops on non-volatile fields are bugs.
2. **Avoid excessive synchronization**: never call alien code (overridable methods, callbacks) while holding a lock — deadlock and corruption. Use `CopyOnWriteArrayList` for listener lists, or snapshot under lock and call outside it.
3. **Prefer executors, tasks, streams** to threads; tasks are what you write, executors decide how they run.
4. **Prefer concurrency utilities** to `wait`/`notify`; if you must use them, always call `wait` in a `while (!condition)` loop and prefer `notifyAll`.
5. **Document thread safety** level: immutable, unconditionally thread-safe, conditionally thread-safe, not thread-safe, thread-hostile.
6. **Lock encapsulation**: hold a private final lock object (`private final Object lock`) for classes meant for extension, so clients cannot interfere.
7. **Avoid thread groups; use `Thread.ofVirtual()` / `Thread.ofPlatform()` builders** and name threads for diagnostics.
8. **Handle interruption**: restore the flag (`Thread.currentThread().interrupt()`) when you catch `InterruptedException` and cannot propagate it.
9. **Keep immutable objects as the default** sharing strategy; "effectively immutable" objects must be safely published (final field, `volatile`, lock, concurrent collection).

## Virtual threads: what changes

| Old advice                                     | With virtual threads (21+)                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Size pools to protect scarce threads           | One virtual thread per task; limit concurrency with `Semaphore`                     |
| Async callback chains for I/O scalability      | Plain blocking code is fine and simpler to debug                                    |
| `synchronized` around blocking I/O is harmless | Pins the carrier on 21 (fixed in 24, JEP 491); prefer `ReentrantLock` on older JDKs |
| Parallel streams for I/O fan-out               | Use a virtual-thread executor instead                                               |

CPU-bound work gets nothing from virtual threads.

```java
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
  var futures = urls.stream().map(u -> exec.submit(() -> fetch(u))).toList();
  for (var f : futures) results.add(f.get());
}
```
