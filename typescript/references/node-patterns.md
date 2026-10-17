# Node.js Design Patterns

Source: _Node.js Design Patterns_ (3rd ed.) and _Beginning Node.js_. Complements `deno.md`, `rules/`, and the `node` skill. Examples are TypeScript for Node 22+ with ESM.

## Async control flow

| Need                         | Use                                                         | Trap                                                  |
| ---------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| Run tasks one after another  | `for (const t of tasks) await t()`                          | `array.forEach(async ...)` fires all, awaits none     |
| Run all, fail fast           | `Promise.all(tasks.map(run))`                               | Unbounded fan-out exhausts sockets/fds/DB pool        |
| Run all, collect each result | `Promise.allSettled`                                        | Must inspect `status`; rejections are not thrown      |
| Bounded parallelism          | Small task queue / semaphore (`p-limit`) with fixed workers | Limit must be global per resource, not per call site  |
| Return a promise from `try`  | `return await p` inside `try/catch`                         | Bare `return p` skips the local `catch`               |
| Callback API to promise      | `util.promisify` / `node:fs/promises`                       | Callbacks must be error-first for `promisify` to work |

Bounded-concurrency queue (the minimum that works):

```typescript
export function createLimiter(concurrency: number) {
  let active = 0;
  const waiting: Array<() => void> = [];
  const release = (): void => {
    active--;
    waiting.shift()?.();
  };
  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (active >= concurrency) await new Promise<void>((r) => waiting.push(r));
    active++;
    try {
      return await task();
    } finally {
      release();
    }
  };
}
```

Long `async` recursion that returns a promise per step can build an ever-growing chain of pending promises; loop instead, or resolve each step before the next.

## Never release Zalgo

An API must be **always sync or always async**. A function that calls back synchronously on a cache hit and asynchronously otherwise makes listener-registration order unpredictable. Fix by deferring the sync branch (`queueMicrotask` / `process.nextTick`) or making it `async`.

## Events and EventEmitter

- Callback = one result, one consumer. `EventEmitter` = repeated or multiple notifications.
- Emitting `'error'` with no listener throws and can crash the process; always attach one.
- Every `on` needs an `off` (or `once`) on long-lived emitters; the MaxListeners warning is a leak signal, not noise to silence.
- Emitting synchronously inside a constructor loses events: nobody can subscribe yet. Emit on a later tick.
- Type events with generics: `class Bus extends EventEmitter<{ done: [Result]; fail: [Error] }>` (`@types/node` 20+).

## Streams

Use streams when data is large, unbounded, or arrives over time; buffering fits only small bounded payloads.

| Rule                                                   | Why                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| Connect with `stream.pipeline` (or `pipeline` promise) | `.pipe()` neither forwards errors nor destroys the other streams |
| Respect `write()` returning `false`; wait for `drain`  | Otherwise memory grows without bound (backpressure)              |
| Prefer `for await (const chunk of readable)`           | Handles backpressure and errors for you                          |
| Use `Transform` for per-chunk logic                    | Composable; set `objectMode` for non-Buffer chunks               |
| Tune `highWaterMark` only with a measurement           | Default 16 KB (64 KB for fs) fits most workloads                 |

```typescript
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

await pipeline(
  createReadStream(src),
  createGzip(),
  createWriteStream(`${src}.gz`),
);
```

Stream shapes: **combine** (pipeline exposed as one duplex), **fork** (one source, many destinations), **merge** (many sources, one destination), **mux/demux** (many logical channels over one stream).

## Creational and structural patterns in Node

| Pattern               | Node idiom                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Factory               | Function returning an object/closure; hides class and enables private state                 |
| Builder               | Chained setters ending in `build()`; use when a constructor takes many optional args        |
| Revealing constructor | `new Thing((mutators) => { ... })` exposes mutation only during construction (immutability) |
| Singleton             | Module cache gives one instance per resolved path; duplicates under `node_modules` break it |
| Dependency injection  | Pass dependencies as parameters at the composition root; no container needed for most apps  |
| Proxy                 | Built-in `Proxy` for validation/observation; composition for explicit wrappers              |
| Decorator             | Wrap with the same interface to add behavior (logging, caching, retry)                      |
| Adapter               | Present one API through another (e.g. key-value store behind a filesystem-like API)         |

Prefer injecting a dependency over importing a singleton when tests need to swap it.

## Behavioral patterns

- **Strategy**: select an algorithm by key (`const parsers = { json, yaml }`); easy to type with `Record<Format, Parser>`.
- **State**: replace `if (connected)` flags with a state object per phase (failsafe socket queues writes while offline).
- **Template**: base module defines the flow, subclasses/options supply steps.
- **Iterator/async iterator**: expose sequences as `Symbol.iterator` / `Symbol.asyncIterator` or async generators; they integrate with streams and `for await`.
- **Middleware**: ordered list of `(ctx, next)` functions; compose once, not per request. The same shape works for message queues, not only HTTP.
- **Command**: serialize an action as data (`{ type, payload }`) so it can be queued, retried, logged, or undone.

## Advanced recipes

| Problem                                     | Pattern                                                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Component needs async init (DB, socket)     | Expose `ready()` promise, or queue calls until init finishes; avoid an `init()` callers can forget   |
| Same expensive request arrives concurrently | Request **batching**: share the in-flight promise per key; add a TTL cache keyed the same way        |
| Cache invalidation                          | Delete the entry on settle (batching) or on TTL; never cache rejected promises                       |
| Cancel async work                           | Accept `AbortSignal`; pass it to `fetch`, timers, streams; check `signal.throwIfAborted()` in loops  |
| CPU-bound work blocks the loop              | Chunk with `setImmediate`, or move to `worker_threads` (shared memory) / `child_process` (isolation) |

```typescript
const inflight = new Map<string, Promise<Report>>();
export function getReport(key: string): Promise<Report> {
  const hit = inflight.get(key);
  if (hit) return hit;
  const p = loadReport(key).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
```

## Scaling and operations

| Concern                  | Guidance                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Use more cores           | `cluster` or one process per core behind a reverse proxy / orchestrator               |
| Keep servers stateless   | Sessions, caches, and locks in Redis or the DB, not process memory                    |
| Restart without downtime | Rolling restart one worker at a time; on `SIGTERM` stop accepting, drain, then `exit` |
| Split by function        | Microservices only where deploy cadence or scaling differs; cut along data ownership  |
| Service-to-service calls | Timeouts, retries with backoff, and idempotency keys on every outbound call           |
| Messaging                | Pub/sub for fan-out, task queues for work distribution; make consumers idempotent     |

## Philosophy checklist (from both Node books)

- Small modules with a small public surface; one job each.
- Do not block the event loop: no sync fs/crypto/JSON.parse of huge payloads in request paths.
- Handle `unhandledRejection`/`uncaughtException` by logging and exiting; do not continue in unknown state.
- Keep errors error-first in callbacks; `throw` only for programmer errors in async code.
- Pin the Node version (`engines`, `.nvmrc`) and use `node:`-prefixed imports for built-ins.
