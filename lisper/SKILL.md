---
name: lisper
description: Write, review, debug, and configure Lisp-family code, including Common Lisp, Scheme, Racket, JVM Clojure, ClojureScript, Emacs Lisp, Hy, Fennel, and Janet. Use for .clj/.cljc/.cljs files, deps.edn, Leiningen, shadow-cljs, JVM/JS interop, CLJS compiler configuration and async code, Clojure/CLJS monoids and partitioned aggregation, unspecified Lisp tasks, dialect comparisons, and ports between Lisps. For CHICKEN, load the dedicated skill; distinguish Babashka/nbb scripts from JVM Clojure and compiled CLJS.
---

# Lisper

Identify the dialect and implementation before applying Lisp idioms. Shared parentheses do not imply shared evaluation rules, libraries, or tooling. Read only the specialist guidance needed for the task.

## Identify and route

Inspect source headers, imports, project manifests, and the documented run command. A `.lisp` or `.scm` extension alone does not establish the implementation. Ask which runtime is intended when the available evidence cannot resolve a consequential choice.

| Dialect or runtime           | Evidence to inspect                                                           | Guidance to load                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JVM Clojure / ClojureScript  | `.clj`, `.cljs`, `.cljc`, `deps.edn`, `project.clj`, `shadow-cljs.edn`        | [Clojure & ClojureScript guidance](references/clojure.md); for promises or async code, also read [Async functions](references/async-functions.md)              |
| Babashka / nbb               | `bb.edn`, `nbb.edn`, script shebang or invocation                             | [Babashka](https://babashka.org/) or [nbb documentation](https://github.com/babashka/nbb); check interpreter support before assuming JVM or compiled CLJS APIs |
| CHICKEN Scheme               | CHICKEN imports, eggs, `csi`, `csc`, `chicken-install`                        | [CHICKEN Scheme skill](../chicken-scheme/SKILL.md)                                                                                                             |
| Other Scheme implementations | Imports, library declarations, executable name, required Scheme report        | [Scheme implementation reference](#scheme-implementation-reference), then the implementation's manual                                                          |
| Racket                       | `.rkt`, `#lang`, `info.rkt`                                                   | [Racket Guide](https://docs.racket-lang.org/guide/); honor the actual `#lang`, including teaching and typed languages                                          |
| Common Lisp                  | `.lisp`, `.cl`, `.asd`, `defpackage`, `in-package`, implementation invocation | [Common Lisp guidance](#common-lisp)                                                                                                                           |
| Emacs Lisp                   | `.el`, file-local variables, `require`, `provide`                             | [Emacs Lisp manual](https://www.gnu.org/software/emacs/manual/html_node/elisp/); inspect lexical binding and the supported Emacs version                       |
| Hy                           | `.hy`, Python project configuration                                           | [Hy documentation](https://hylang.org/); preserve Python runtime and interop constraints                                                                       |
| Fennel                       | `.fnl`, Lua host configuration                                                | [Fennel reference](https://fennel-lang.org/reference); preserve Lua host constraints                                                                           |
| Janet                        | `.janet`, project run command                                                 | [Janet documentation](https://janet-lang.org/); use Janet's own collection and runtime semantics                                                               |

For another Lisp dialect, identify its implementation and consult its language manual before proposing dialect-specific code. Do not silently substitute Common Lisp or Scheme.

For Clojure/ClojureScript aggregation, merging, `reduce`/`fold`, empty collections, or partitioned/parallel summaries, read [Monoids](references/monoids.md). Check associativity and a natural identity before using partitioned reduction; prefer core functions over a new abstraction. For TypeScript monoids, use [TypeScript composition](../typescript/composition/SKILL.md#monoids).

## Scheme implementation reference

Use [Scheme Implementations — get.scheme.org](https://get.scheme.org/) to discover implementations and their reported R5RS, R6RS, or R7RS support. It includes CHICKEN, Chez, Chibi, Gambit, Gauche, Guile, MIT/GNU Scheme, Racket, and others.

- Preserve the project's implementation and required report. For a new project, use the user's deployment, embedding, and library needs to narrow the choices.
- Follow the directory's implementation link for exact module syntax, package tooling, extensions, and standards limitations; the directory is a starting point, not a compatibility guarantee.
- Distinguish report features, SRFIs, and implementation extensions. Do not assume a library or import form from one Scheme works in another.
- Load the CHICKEN skill only when CHICKEN is the target; Racket's `#lang` also determines which language rules apply.

## Common Lisp

Use the [Common Lisp HyperSpec](https://www.lispworks.com/documentation/HyperSpec/Front/index.htm) for standard behavior and the implementation manual for extensions, compiler options, and deployment; for SBCL, use its [manual](https://www.sbcl.org/manual/).

- Preserve existing ASDF systems, packages, dependencies, and test conventions. A Lisp package manages symbol names; it is not a dependency installer.
- Respect separate function and value namespaces: use `funcall` for a function held in a variable and `#'` for a function reference.
- Use `let` for parallel bindings, `let*` for sequential bindings, `flet` for local functions, and `labels` when local functions need recursive bindings.
- `nil` is both false and the empty list; every other value is true. Preserve multiple values where callers expect them.
- Preserve condition and restart behavior. Use `unwind-protect` or resource macros such as `with-open-file` for cleanup.
- Prefer ordinary functions until evaluation control requires a macro. Inspect expansions and prevent accidental variable capture or repeated argument evaluation.
- Do not rely on portable tail-call elimination. Use an iteration construct for unbounded work unless the target implementation guarantees the required behavior.

## Work across dialects

- Confirm reader syntax, quoting, evaluation order, truthiness, equality, scoping, mutation, and numeric behavior when porting. Translate intent rather than replacing function names mechanically.
- Use the project's REPL for small experiments when available, then retain the result in source. Account for stale definitions; a working interactive image does not prove a clean process can load the project.
- Check macro expansion with the dialect's tools. Common Lisp macros, Scheme hygienic macros, and Clojure macros have different binding and expansion rules.
- Keep input validation and error handling when porting code. Never use `eval` to parse untrusted data; check reader safety separately, since reading may itself execute code in some dialects.
- Report the dialect, implementation, and checks actually performed. Separate portable language behavior from implementation-specific assumptions.

## Book-derived guidance

Read only the relevant section of [Lisp programming from the bookshelf](references/book-derived-guidance.md) when the task involves:

- Recursive lists or trees: base cases, progress, accumulators, and teaching-language assumptions from _The Little Schemer_ and _SICP_.
- Common Lisp collections: equality, shared structure, destructive operations, and representation choices from _ANSI Common Lisp_.
- Common Lisp macros: functions versus macros, variable capture, evaluation count/order, and expansion-time effects from _On Lisp_.
- State, delayed evaluation, or interpreters: environment models and abstraction boundaries from _SICP_.
- Portable Scheme: truthiness, operand order, proper tail calls, and hygienic macros checked against R7RS-small.
