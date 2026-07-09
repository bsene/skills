# Promises and First-Class Macros in nbb

Source: https://github.com/babashka/nbb

## Why this matters in nbb specifically

Most nbb scripts glue together npm libraries that return `Promise`s (fetch, filesystem, browser automation, etc.). Two nbb features make that pleasant: bundled **promesa**, and **first-class macros defined directly in a `.cljs` script**.

## First-class macros

Unlike typical self-hosted CLJS setups, nbb lets you `defmacro` right inside the same `.cljs` file you're using the macro in — no separate `.clj`/`.cljc` file, no `:require-macros` juggling. This is one of nbb's headline features and is worth reaching for whenever repeated boilerplate (especially promise-chaining) shows up in a script.

Canonical illustrative example — a `plet` macro that turns a `let`-like binding form into a chain of `.then` calls, making async code read like sync code:

```clojure
(defmacro plet
  [bindings & body]
  (let [binding-pairs (reverse (partition 2 bindings))
        body (cons 'do body)]
    (reduce (fn [body [sym expr]]
              (let [expr (list '.resolve 'js/Promise expr)]
                (list '.then expr (list 'clojure.core/fn (vector sym)
                                        body))))
            body
            binding-pairs)))
```

Before, with raw `.then` chains:

```clojure
(-> (.launch puppeteer)
    (.then (fn [browser]
             (-> (.newPage browser)
                 (.then (fn [page]
                          (-> (.goto page "https://clojure.org")
                              (.then #(.screenshot page #js{:path "screenshot.png"}))
                              (.catch #(js/console.log %))
                              (.then #(.close browser)))))))))
```

After, with `plet`:

```clojure
(plet [browser (.launch puppeteer)
       page (.newPage browser)
       _ (.goto page "https://clojure.org")
       _ (-> (.screenshot page #js{:path "screenshot.png"})
             (.catch #(js/console.log %)))]
      (.close browser))
```

**In practice, prefer `promesa.core`'s `p/let`/`p/do!` over writing your own `plet`** — nbb bundles promesa specifically so scripts don't need to reinvent this, and it's more battle-tested. Recognize the `plet`-style pattern when you see it in existing/older nbb code, but don't introduce a new hand-rolled version in new code.

## `promesa.core`

Bundled since nbb v0.0.36. Two macros cover most use cases:

### `p/let` — sequential bindings over promises

```clojure
(ns prom
  (:require [promesa.core :as p]))

(defn sleep [ms]
  (js/Promise.
   (fn [resolve _]
     (js/setTimeout resolve ms))))

(defn do-stuff []
  (p/do!
   (println "Doing stuff which takes a while")
   (sleep 1000)
   1))

(p/let [a (do-stuff)
        b (inc a)
        c (do-stuff)
        d (+ b c)]
  (prn d))
```

Each binding is awaited before the next is evaluated, and non-promise values pass through unchanged — you don't need to know in advance which steps are async.

### `p/do!` — sequential side effects, awaiting any promises along the way

Behaves like `do`, but if a step returns a promise, it's awaited before moving to the next step. Useful for a sequence of mixed sync/async side effects (as in `do-stuff` above).

## REPL convenience for promises

At the REPL, it's convenient to bind a promise's resolved value to a var once it settles:

```clojure
(defmacro defp [binding expr]
  `(-> ~expr (.then (fn [val]
                     (def ~binding val)))))

(defp browser (.launch puppeteer #js {:headless false}))
(defp page (.newPage browser))
(.goto page "https://clojure.org")
```

This is a REPL-workflow trick, not something to put in a finished script — prefer `p/let`/`p/do!` there.

## Don't assume native `^:async`/`await`

Mainline ClojureScript added native `^:async` function support with an `await` macro in recent (1.12.x) releases. Because nbb interprets a subset of the language via SCI rather than tracking every compiler release, **don't assume this is available in nbb** unless you've confirmed it against the current nbb README/CHANGELOG. Default to `promesa.core`'s `p/let`/`p/do!` for async control flow in nbb scripts.
