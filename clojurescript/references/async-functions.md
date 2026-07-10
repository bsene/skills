# Async Functions (`^:async` / `await`)

Since ClojureScript v1.12.145, hinting a function with `^:async` makes the compiler emit a native JavaScript `async` function, with an `await` macro for suspending on `Promise`s. This is distinct from, and much lighter-weight than, `core.async`'s `go`/channel model — no channel plumbing, just direct promise sequencing.

## Defining async functions

`^:async` goes on the `fn` symbol or on the function's name — nowhere else.

```clojure
(defn ^:async foo [n]
  (let [x (await (Promise/resolve 10))]
    (+ n x)))

;; anonymous form
(^:async fn [n]
  (let [x (await (Promise/resolve 10))]
    (+ n x)))
```

Invalid placements (will not compile):

```clojure
(defn foo ^:async [urls] ,,,)   ;; wrong: on the arg vector
^:async (fn [urls] ,,,)         ;; wrong: on the whole form
```

## Error handling

`await` can be used anywhere in the body, including inside `try`/`catch`, so async error handling has the same shape as sync code:

```clojure
(defn ^:async fetch-json [url]
  (try
    (let [resp (await (fetch url))]
      (await (.json resp)))
    (catch :default e
      (.log js/console "fetch failed" e)
      nil)))
```

If `await` isn't wrapped in a `try`/`catch` inside the function, the rejection propagates to the caller (the function's own returned `Promise` rejects).

## Testing

`cljs.test/deftest` supports `:async` metadata on the test name:

```clojure
(require '[cljs.test :refer [deftest is]])

(deftest ^:async my-test
  (let [v (await (foo 10))]
    (is (= 20 v))))
```

## Caveats — read before writing async CLJS

1. **`await` only works inside an `:async` function.** Calling it elsewhere is a compile error.
2. **An `:async` function always returns a JS `Promise`**, even if the body looks like it returns a plain value.
3. **No top-level `await`.**
4. **Multi-arity functions can't mix sync and async arities** — this is precisely why `:async` can't be placed on individual arg vectors, only on the whole `fn`/name.
5. **Nested `fn`s are sync by default.** Marking the outer function `^:async` does NOT make inner `fn`s async:

   ```clojure
   ;; BROKEN: map's callback isn't async, so `await` inside it is illegal
   (defn ^:async fetch-statuses [urls]
     (map (fn [url] (.-status (await (fetch url)))) urls))
   ;; => compile error: "Assert failed: await can only be used in async contexts"
   ```

   Marking the inner fn `^:async` compiles, but changes the semantics in a way that's usually not what you want:

   ```clojure
   ;; COMPILES, but now returns a Promise resolving to a seq of Promises
   (defn ^:async fetch-statuses [urls]
     (map (^:async fn [url] (.-status (await (fetch url)))) urls))
   ```

   The idiomatic fix is `Promise/all` to run the promises in parallel and await them together:

   ```clojure
   (defn ^:async fetch-statuses [urls]
     (let [resps (await (Promise/all (mapv fetch urls)))]
       (map #(.-status %) resps)))
   ```

6. **This `await` is unrelated to JVM Clojure's `await` (agents).** CLJS has no agents; don't reach for agent-style APIs.

## When to prefer this over `core.async`

- Straightforward request/response chains around `Promise`-returning JS APIs (`fetch`, most npm libs) → `^:async`/`await` is usually simpler and reads closer to the equivalent JS.
- Coordinating multiple independent streams/events, backpressure, or CSP-style concurrency → `core.async` channels are still the better tool.
- If a codebase already commits to one style, stay consistent with it rather than mixing both in the same namespace unless asked to migrate.