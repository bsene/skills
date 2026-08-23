# Async Functions (`^:async` / `await`)

ClojureScript added **native async/await** support in **v1.12.145** as a
lighter-weight alternative to `core.async` for promise-based code. It compiles
down to JS `async function`s and `await` expressions, so the runtime semantics
are exactly JS's — the CLJS additions are the surface syntax and the guarantees
the compiler enforces.

Reach for this when the code is already promise-shaped (`js/Promise`, `fetch`,
`.then` chains) and you want linear, read-top-to-bottom control flow instead of
`core.async`'s `go`/`<!` blocks. If the codebase already uses `core.async`
(`go`, `<!`, channels) for async control flow, **stay consistent with that
style** rather than mixing in `^:async`/`await` unless asked to migrate.

## Syntax: where the metadata goes

`^:async` goes on the **function itself** (the `fn`/`defn`/named-fn head),
**never on the arg vector**. This is the #1 beginner mistake — putting the
metadata on the arg vector compiles but does *not* make the function async, so
`await` inside it fails silently or throws.

```clojure
;; Correct — metadata on the function head
(defn ^:async fetch-user [id]
  (let [resp (js/await (js/fetch (str "/api/users/" id)))]
    (.json resp)))

;; Also correct — on an anonymous fn
(let [f (fn ^:async [x]
          (js/await (do-async-thing x)))])
```

## The `await` macro

`await` is a **macro**, not a function — it must be written as `js/await` (or
`await` if `cljs.core` is aliased accordingly) and must appear in **tail or
expression position** inside an `^:async` function. It desugars to a JS `await`,
so it only accepts a thenable (a `js/Promise` or any `.then`-able value); a plain
value is awaited to itself.

```clojure
(defn ^:async load-all []
  (let [user (js/await (fetch-user 1))
        posts (js/await (fetch-posts (:id user)))]
    {:user user :posts posts}))
```

## Return semantics: always a Promise

An `^:async` function **always returns a `js/Promise`**, even when the body
looks like it returns a plain value. This follows directly from JS `async
function` semantics — the return value is auto-wrapped in `Promise.resolve`.
Callers must `await` (or `.then`) the result to get the inner value.

```clojure
(defn ^:async quick [] 42)

(quick)            ;; => #object[Promise [object Promise]]  (NOT 42)
(js/await (quick)) ;; => 42
```

This is the second most common mistake: treating an `:async` function's return
as a plain value in a non-async caller.

## Nested `fn` does not inherit `^:async`

`^:async` is per-function. A nested `fn` inside an `^:async` function is a
**separate** function that is *not* async unless it carries its own `^:async`.
`await` in the nested fn will fail unless that fn is also marked `^:async`.

```clojure
(defn ^:async outer []
  (let [f (fn ^:async [x]           ;; nested fn needs its own ^:async
            (js/await (do-async x)))]
    (js/await (f 1))))
```

If you forget `^:async` on the inner `fn`, `js/await` there either won't compile
(await outside an async fn) or the inner fn returns a non-Promise that the
outer `await` wraps awkwardly.

## Awaiting many promises: `js/Promise.all` via `mapv`

To await a *collection* of promises in parallel (fan-out, then join), use
`js/Promise.all` — not a `map` of `await`ed calls (which would serialize). The
idiomatic shape is to build the promises with `mapv` (a vector, since
`js/Promise.all` wants an array-like), then `await` the joined promise:

```clojure
(defn ^:async fetch-all-users [ids]
  (let [promises (mapv fetch-user ids)           ;; vector of Promises
        results (js/await (.all js/Promise promises))]
    results))
```

Prefer `mapv` over `map` here — `js/Promise.all` iterates the input as a JS
array, and a CLJS lazy seq is not array-like; `mapv` produces a vector that
interop-converts cleanly. `pmap` is the JVM-Clojure tool for this and does
*not* exist in CLJS (single-threaded event loop).

## Mixing with `core.async`

`^:async`/`await` and `core.async` channels are two different models. Don't
mix them in the same control-flow path unless migrating:

- `core.async`'s `go` block is a state machine the CLJS compiler rewrites;
  `<!`/`>!` only work inside `go`, and a `go` returns a channel, not a Promise.
- `^:async` is a JS `async function`; `await` only works inside it, and it
  returns a Promise.

To bridge, convert at the boundary: `(<p! (async/promise-chan ...))` to pull a
Promise into a channel, or wrap a channel's single value in a Promise with a
take callback. Prefer picking **one** model per module.

## Common pitfalls (quick list)

| Symptom | Likely cause | Fix |
|---|---|---|
| `await` not recognized / compiles wrong | `^:async` on the arg vector, not the fn head | Move `^:async` to the `fn`/`defn` head |
| Caller gets a `Promise` instead of the value | Forgetting an `:async` fn always returns a Promise | `await` the call (or `.then` it) |
| `await` throws inside a nested `fn` | Nested `fn` not marked `^:async` | Add `^:async` to the nested `fn` |
| Serialized instead of parallel awaits | `await` in a `map`/loop body, one-by-one | Build promises with `mapv`, `await` `js/Promise.all` |
| "Works in dev, breaks in prod" | Awaiting a non-thenable under `:advanced` renaming | Use `js/await` (macro), not a hand-written `.then`; ensure externs for hand-rolled JS interop |

## Minimum version note

`^:async`/`await` requires **ClojureScript ≥ 1.12.145**. Older toolchains (or a
pinned older CLJS) won't recognize the metadata/await macro. Check
`shadow-cljs.edn` / `deps.edn` for the CLJS version before assuming the feature
is available.
