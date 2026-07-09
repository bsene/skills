# Worked Example: Namespaces + `cljs.test` in nbb

Two small files, bundled verbatim in `assets/examples/` for copy-paste/study: `recursion.cljs` (a module) and `recursion_test.cljs` (its test). This is the minimal, idiomatic shape of a two-namespace nbb script pair — use it as the template when a user asks for "an nbb module with tests" and doesn't already have their own convention to follow.

## The module: `assets/examples/recursion.cljs`

```clojure
(ns recursion)

(defn scheme-sum [vals]
  (loop [xs vals
         acc 0]
    (if (empty? xs)
      acc
      (recur (rest xs) (+ acc (first xs))))))
```

Points worth calling out when writing or reviewing code like this:

- **File name ↔ namespace name.** `recursion.cljs` declares `(ns recursion)` — a one-segment namespace matches a top-level file of the same name on the classpath (nbb adds the current directory to the classpath automatically; see `references/npm-interop.md` for the general `foo.bar` → `foo/bar.cljs`, hyphen→underscore rule for multi-segment namespaces).
- **`loop`/`recur` for accumulation.** This is the correct idiomatic choice here (not a `reduce`-worthy oversight) precisely because it's demonstrating manual accumulation — in real code, `(reduce + 0 vals)` or plain `(apply + vals)` would be the more idiomatic way to sum a collection. Point this out if a user pastes similar code asking for a review: `loop`/`recur` is right when the accumulation logic is non-trivial (multiple accumulators, early termination, non-`reduce`-shaped traversal); prefer `reduce`/`transduce` for simple linear folds like this one.

## The test: `assets/examples/recursion_test.cljs`

```clojure
(ns recursion-test
  (:require [recursion :refer [scheme-sum]]
            [cljs.test :as t :refer [is testing deftest]]))

(deftest scheme-sum-test
   (testing "1+2+3=6"
     (is (= (scheme-sum [1 2 3]) 6)))

   (testing "5+6+7=18"
     (is (= (scheme-sum [5 6 7]) 18)))

   (testing "empty list = 0"
     (is (= (scheme-sum []) 0))))

(cljs.test/run-tests)
```

Points worth calling out:

- **`cljs.test` is built in — no extra dependency needed.** nbb ships `cljs.test` as part of the runtime; a script can `:require` it directly like any other CLJS namespace, with no `nbb.edn`/`package.json` entry required for it specifically.
- **Namespace naming: `recursion-test`, filename `recursion_test.cljs`.** This is the standard Clojure/CLJS hyphen-in-namespace ↔ underscore-in-filename convention, applied to test namespaces the same as any other. Requiring the namespace under test is a normal `:require` — `[recursion :refer [scheme-sum]]` — exactly like requiring any local module (see `references/npm-interop.md`); there's nothing test-framework-special about it.
- **`deftest` + nested `testing` + `is`** is the standard `cljs.test` shape: one `deftest` per logical unit of behavior, `testing` blocks to label sub-cases (shown in failure output), `is` for the actual assertions. This works identically to Clojure/JVM `clojure.test` — same API surface, just the `cljs.test` namespace.
- **`(cljs.test/run-tests)` at the bottom of the file is the key nbb-specific pattern.** Unlike a shadow-cljs/browser test setup where a separate test runner boots the suite, an nbb test script is self-running: just call `run-tests` (optionally `(run-tests 'recursion-test)` for a specific namespace, or bare `(run-tests)` to run tests in the current namespace) as a top-level form, then execute the file directly:
  ```bash
  nbb recursion_test.cljs
  ```
  No separate test-runner invocation needed for a single file like this. `run-tests` prints a pass/fail summary and returns nonzero via `cljs.test/*testing-vars*`-driven exit behavior on failure, which is enough for a script to be wired into CI as-is.
- **Scaling up to multiple test namespaces**: for anything beyond a single test file, reach for a community test-runner project (e.g. `nbb-test-runner`) rather than hand-writing a fan-out script that requires and runs every test namespace — see `references/tooling-and-repl.md`'s Testing note. The pattern in this example (one file, self-running) is the right building block either way: a multi-file runner is just automating "require each test ns, then call `run-tests` across all of them."

## Quick checklist when reviewing nbb test code against this example

- [ ] Test namespace name uses `-test` suffix, file name uses `_test.cljs` suffix, consistent with the module it's testing.
- [ ] `cljs.test` required with `:refer [is testing deftest]]` (or a subset) — no external test-framework dependency declared for this.
- [ ] Module under test required by its actual namespace name, not its file path.
- [ ] `(cljs.test/run-tests)` (or a namespaced `run-tests` call) present as a top-level form if the file is meant to be run directly with `nbb`.
