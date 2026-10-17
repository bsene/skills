# JavaScript Runtime Mechanics

Source: _Secrets of the JavaScript Ninja_ (2nd ed.) and _Beginning Node.js_. Read when debugging behavior that types cannot explain.

## Functions, `this`, closures

| Topic             | Rule                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `this` binding    | Decided at call site: method call, plain call, `new`, `call/apply/bind`. Arrow functions inherit lexically  |
| Closures          | Capture **bindings**, not values; a long-lived closure keeps everything it references alive                 |
| Loop closures     | `let` per iteration gives a fresh binding; `var` shares one                                                 |
| Private state     | Closure over a local, or `#field`; both beat underscore conventions                                         |
| `arguments`       | Avoid; use rest parameters (`...args`)                                                                      |
| Function identity | Functions are objects; attaching properties (e.g. a memo cache) works but hides state, prefer a closure Map |
| Hoisting / TDZ    | `function` declarations hoist fully; `let`/`const` throw before initialization                              |

Memoize with a closure:

```typescript
export function memoize<A extends readonly unknown[], R>(
  fn: (...args: A) => R,
  key: (...args: A) => string = (...a) => JSON.stringify(a),
): (...args: A) => R {
  const cache = new Map<string, R>();
  return (...args) => {
    const k = key(...args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k) as R;
  };
}
```

Unbounded caches leak; bound them (LRU) or key with `WeakMap` when keys are objects.

## Prototypes and classes

- Every object has a prototype chain; property reads walk it, writes land on the object itself.
- `class` is syntax over prototypes: methods live once on the prototype, arrow-function fields are per instance (costly, but bound).
- Use `Object.hasOwn(obj, k)` instead of `obj.hasOwnProperty(k)`.
- `instanceof` checks the prototype chain and fails across realms/duplicated packages; prefer a discriminant field for cross-boundary data.
- Do not extend built-ins like `Array` casually; subclass-aware methods (`map`) construct the subclass.

## Iteration protocols and generators

| Construct              | Use                                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| `Symbol.iterator`      | Make a class usable in `for...of`, spread, destructuring                |
| Generator `function*`  | Lazy sequences; pause/resume; cheaper than building intermediate arrays |
| Async generator        | Pull-based async streams (`for await`); pairs with Node streams         |
| `return()` on iterator | Runs cleanup (`finally`) when the consumer `break`s early               |

## Collections and Proxy

- `Map`/`Set` over plain objects for dynamic keys; `WeakMap`/`WeakSet` for metadata about objects you do not own (no leak).
- `Proxy` + `Reflect` for validation, logging, defaults; each trap costs performance, so keep it off hot paths.
- `Object.freeze` is shallow; freeze nested data or use `readonly` types at compile time.

## Timers and the event loop

Order within one turn: synchronous code, then `process.nextTick` (Node), then microtasks (promise callbacks, `queueMicrotask`), then macrotasks (`setTimeout`, `setImmediate`, I/O).

| Rule                                                                          |
| ----------------------------------------------------------------------------- |
| `setTimeout(fn, 0)` is "not before 1ms", never "now"; timers are not precise  |
| A microtask loop that re-queues itself starves I/O                            |
| Split long loops with `setImmediate` or a worker to keep the loop responsive  |
| Clear timers (`clearTimeout`, `unref()`) so they do not hold the process open |

## Promises

- A promise settles once; late `then` handlers still run (microtask).
- Throwing in `then`/`async` rejects; unhandled rejections crash modern Node.
- `new Promise(executor)` only to wrap callback APIs; never wrap an existing promise.
- `Promise.race` for timeouts leaves the loser running; pass an `AbortSignal` (`AbortSignal.timeout(ms)`) to actually stop it.

## Feature detection and compatibility

Detect capabilities, not browsers/versions: `typeof structuredClone === "function"`, `"fetch" in globalThis`. Use `try/catch` around optional syntax via dynamic `import()`.

## Testing and debugging

- Deterministic tests: inject clocks and timers (fake timers) instead of sleeping.
- Assert on async behavior by awaiting the promise, never with arbitrary timeouts.
- Node: `node --inspect`, `--cpu-prof`, `--heapsnapshot-signal=SIGUSR2` for leaks; watch `process.memoryUsage()` trends.
