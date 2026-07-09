# nbb Tooling: Running, REPLs, Main Function, Reader Conditionals

Source: https://github.com/babashka/nbb

## Installing and running

```bash
npm install nbb -g          # global install; omit -g for local
nbb -e '(+ 1 2 3)'          # one-off expression
nbb script.cljs             # run a script file
nbb -m my.namespace         # run a namespace's -main function
```

Requirements: Node.js v14+. Startup is fast (~170ms baseline on typical hardware); invoking via `npx` adds ~300ms on top, so for latency-sensitive use prefer a global/local install invoked directly over `npx nbb`.

## `-main` as an entry point

```clojure
(ns example)

(defn -main
  [& args]
  (prn "print in -main"))
```

```bash
nbb -m example
```

Use this when the script needs to behave like a "real" CLI with argument handling and a clear entry point, rather than just running top-level forms on load.

## Detecting "am I the entry script"

`nbb.core/*file*` is the path of the file currently executing; `nbb.core/invoked-file` is the path of the script nbb was originally invoked with. Comparing them gives the equivalent of Python's `if __name__ == "__main__":`:

```clojure
(ns foo
  (:require [nbb.core :refer [*file*]]))

(prn *file*)                 ;; e.g. "/private/tmp/foo.cljs"
(defn f [])
(prn (:file (meta #'f)))     ;; also available on var metadata

(= nbb.core/*file* (nbb.core/invoked-file))  ;; true only in the entry script
```

## Reader conditionals

nbb supports two platform tags: `:org.babashka/nbb` and `:cljs`. **Whichever appears first in the reader-conditional form wins** — this is nbb-specific ordering behavior, not the usual "most specific tag wins" assumption:

```clojure
#?(:org.babashka/nbb 1 :cljs 2) ;;=> 1
#?(:cljs 2 :org.babashka/nbb 1) ;;=> 2
```

Use `:org.babashka/nbb` when code needs to branch specifically on "running under nbb" (e.g. to work around an SCI language-subset limitation) as opposed to CLJS generally.

## REPL options

- **Console REPL**: `nbb` with no arguments.
- **Socket REPL**: `nbb socket-repl :port 1337` — for generic socket-REPL clients (e.g. `lein repl :connect PORT`).
- **nREPL**: `nbb nrepl-server :port 1337`, optionally `:host 0.0.0.0` (e.g. for running inside Docker). Still has some rough edges per the project's own docs.
- **Programmatic REPL** via `nbb.repl`:
  ```clojure
  (ns example
    (:require [nbb.repl :as repl]
              [promesa.core :as p]))

  (p/do!
   (repl/repl)
   (println "The end"))
  ```
- **From plain JavaScript**, use `loadString`/`loadFile` (see "Calling nbb from JavaScript" below) to boot a REPL or nREPL server from a `.mjs`/`.js` entry point.

### Editor integration

- **Calva**: "Connect to a Running REPL Server not in Project" → ClojureScript nREPL server.
- **CIDER**: `cider-jack-in-cljs` as usual, or start `nbb nrepl-server` manually and `cider-connect-cljs` with REPL type `nbb`. CIDER before v1.6.0 needs a documented workaround.
- **vim-fireplace**: run `:CljEval (ns cljs.user)` after connecting to tell it this is a ClojureScript REPL.

## Calling nbb from JavaScript

nbb itself is importable as a Node library, exposing `loadFile`, `loadString`, `addClassPath`, `getClassPath`, and `printErrorReport`:

```js
import { loadFile } from "nbb";

const { foo } = await loadFile("example.cljs"); // destructure JS object returned from the script
foo();
```

For error reporting from the JS side:

```js
import { loadString, printErrorReport } from "nbb";

try {
  await loadString(`(assoc :foo :bar)`);
} catch (e) {
  printErrorReport(e);
  process.exit(1);
}
```

This pattern (embedding nbb inside a JS host script) is common for AWS Lambda handlers, Google Cloud Functions, and other JS-first deployment targets where the platform expects a JS entry point.

## Testing

For a single script/file, `cljs.test` is built in and self-running is the norm: `:require [cljs.test :as t :refer [is testing deftest]]`, define `deftest`s, and call `(cljs.test/run-tests)` as a top-level form so `nbb my_test.cljs` runs the suite directly — see `references/example-namespaces-and-testing.md` for a full worked example. For multi-namespace suites, reach for a community test-runner (`nbb-test-runner`, a `cognitect-labs/test-runner`-style runner adapted for nbb) rather than hand-writing a fan-out script — see the project's `doc/testing` docs for the current setup.

## Deployment notes

- **AWS Lambda / Google Cloud Functions**: supported via a JS entry point that calls into the nbb script (see project docs `doc/aws_lambda.md`, `doc/gcloud_functions.md`).
- **Standalone executables**: possible via `caxa` (see project docs `doc/caxa/README.md`).
- **Publishing an nbb project to npm**: see project docs `doc/publish/README.md`.
- **Deno**: nbb has Deno support (`deno run -A jsr:@babashka/nbb@<version> script.cljs`), including `npm:`/`jsr:` import specifiers, though Node-compatibility gaps in Deno can affect some features.

## Migrating to shadow-cljs

If a script outgrows nbb's scope (needs advanced compilation, a browser bundle, full-language-surface features like `deftype`, etc.), there is a documented migration path from an nbb script/project to shadow-cljs — point the user at it rather than trying to force nbb to do compiled-CLJS things it isn't designed for.
