# Concurrency

| Workload             | Tool                                          |
| -------------------- | --------------------------------------------- |
| Many network waits   | `asyncio` (or threads for blocking libraries) |
| Blocking I/O, simple | `concurrent.futures.ThreadPoolExecutor`       |
| CPU-bound            | `ProcessPoolExecutor` / `multiprocessing`     |

- The GIL lets one thread run Python bytecode at a time: threads do not speed up CPU work (free-threaded builds, 3.13+, are opt-in and experimental; check the project).
- Entry: `asyncio.run(main())` once. Run concurrent work with `asyncio.TaskGroup` (3.11+) or `gather`; keep references to tasks you create.
- Never call blocking code in a coroutine: use `await asyncio.to_thread(fn, ...)`.
- Always set timeouts (`asyncio.timeout`, 3.11+) and handle `CancelledError` by cleaning up and re-raising.
- Bound parallelism with `asyncio.Semaphore` or executor `max_workers`.
- Share state minimally: queues (`queue.Queue`, `asyncio.Queue`) over locks; guard shared mutables with `threading.Lock` in a `with`.
- Use `async with` / `async for` for async resources and streams; don't mix event loops across threads.
