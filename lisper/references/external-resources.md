# External Resources

## Clojurian Thought (Janet A. Carr)

Blog: https://blog.janetacarr.com/

A JVM-Clojure-focused blog (not CLJS-specific, but directly relevant since CLJS shares Clojure's language, idioms, and community conventions). Useful as background/idiom reading when a question is really about "how would an experienced Clojurian think about this," rather than about CLJS-specific compiler/interop mechanics — don't treat it as a source of CLJS-specific facts (compiler flags, JS interop, npm/nbb behavior), which belong in this skill's other reference files instead.

### Particularly relevant posts

- **["Fix your Clojure code: Clojure comes with design patterns" (Part 1](https://blog.janetacarr.com/software-design-patterns-in-clojure/) / [Part 2)](https://blog.janetacarr.com/fix-your-clojure-code-clojure-comes-with-design-patterns-part-2/)** — how classic OO design patterns (Singleton, Command, Observer, Visitor, State, Builder, Chain of Responsibility, Strategy, etc.) map onto idiomatic Clojure constructs (multimethods, protocols, plain functions/maps, `atom`s) instead of class hierarchies. Good grounding for the "data over classes" guidance in this skill's Working Style section — useful when a user is translating an OO codebase and reaching for a pattern that has a simpler idiomatic Clojure/CLJS equivalent.
- **["Mindset Shifts for Functional Programming (with Clojure)"](https://blog.janetacarr.com/mindset-shifts-for-functional-programming-with-clojure/)** — general FP-mindset framing (immutability, data-first thinking) for developers coming from imperative/OO backgrounds.
- **["Thoughts on Clojurescript and BigDecimal"](https://blog.janetacarr.com/thoughts-on-clojurescript-and-bigdecimal/)** — directly CLJS-relevant: discusses the lack of arbitrary-precision numeric types in CLJS (see this skill's "no BigDecimal/ratios, only JS `number`" note) and the tradeoffs involved.
- **["Dead simple core.async job system in Clojure"](https://blog.janetacarr.com/creating-a-dead-simple-asynchronous-job-system-in-clojure/)** — a worked example of building an async job/worker system with `core.async` (go-loops, channels, a functions-as-states FSM pattern). Useful as a real-world `core.async` design reference; written for JVM Clojure (uses JDBC/PostgreSQL, JVM threads via `core.async/thread`), so if the user is on CLJS, translate the channel/go-loop logic and drop the JVM-thread-pool assumptions.
- **["A Primer on Clojure Macros"](https://blog.janetacarr.com/a-primer-on-clojure-macros/)** — when a macro is justified over a plain function; background for macro questions in JVM Clojure and CLJS (CLJS macros additionally live in `.clj`/`.cljc` files — see [compiler options](compiler-options.md)).
- **["Clojure Transducers: Your Composable Data Pipelines"](https://blog.janetacarr.com/clojure-transducers-your-composable-big-data-pipelines/)** — transducers as composable transformations over reducing functions; pairs with [core function index](core-function-index.md) and [monoids](monoids.md) for `reduce`/`transduce` questions.
- **["Ports and Adapters Architecture for Functional Programmers"](https://blog.janetacarr.com/ports-and-adapters-architecture-for-the-functional-programmer/)** — hexagonal architecture in idiomatic Clojure (protocols/functions as ports, plain data at the boundaries).
- **["wtf is Clojure inlining anyway"](https://blog.janetacarr.com/clojure-inline-explained/)** — explains the `:inline` metadata seen in `clojure.core`; relevant to [idioms and performance](clojure-idioms-and-performance.md).
- **[Top Articles index](https://blog.janetacarr.com/top/)** — browse for more; the author also runs a paid course (`clojureforpros.com`) and live-coding stream, referenced from the site if a user wants deeper/structured learning beyond blog posts.

### How to use this in practice

- Point the user to a specific post rather than paraphrasing it wholesale — this is external, copyrighted content; summarize the idea briefly (per the working style in this skill) and link out for the full read.
- Treat it as one Clojurian's opinionated take, not an authoritative spec — cross-check anything that sounds like a hard technical claim (numeric semantics, compiler behavior) against [compiler options](compiler-options.md), [dependencies and interop](dependencies-and-interop.md), or official docs before restating it as fact.

## Eric Normand (PurelyFunctional.tv)

Site: https://ericnormand.me/clojure

Free guides, mini-guides, and essays on JVM Clojure and ClojureScript by the author of _Grokking Simplicity_. Mostly beginner-to-intermediate idiom reading; link the specific page rather than paraphrasing it, and verify hard technical claims against official docs.

- **[Clojure Data Structures](https://ericnormand.me/guide/clojure-collections)**, **[Clojure Atom](https://ericnormand.me/mini-guide/clojure-atom)**, **[All about clojure.set](https://ericnormand.me/mini-guide/clojure-set)** — core-collection and state primitives; pairs with [core function index](core-function-index.md).
- **[Clojure Concurrency](https://ericnormand.me/guide/clojure-concurrency)** and **[core.async Code Style](https://ericnormand.me/mini-guide/core-async-code-style)** — JVM concurrency primitives and `go`-block conventions; complements [async functions](async-functions.md) for the CLJS side.
- **[When To Use a Macro in Clojure](https://ericnormand.me/mini-guide/when-to-use-a-macro-in-clojure)** and **[Data > Functions > Macros](https://ericnormand.me/article/data-functions-macros-why)** — macro-restraint guidance.
- **[ClojureScript Tutorial (shadow-cljs)](https://ericnormand.me/guide/clojurescript-tutorial)**, **[Knowing this one ClojureScript gotcha](https://ericnormand.me/article/clojurescript-externs)** — CLJS setup and externs; cross-check with [compiler options](compiler-options.md).
- **[Re-frame Tutorial](https://ericnormand.me/guide/re-frame-building-blocks)**, **[Re-frame Database Best Practices](https://ericnormand.me/guide/database-structure-in-re-frame)**, **[Where to Store State in Re-frame?](https://ericnormand.me/guide/state-in-re-frame)** — re-frame structure and state placement.
- **[deftype vs defrecord](https://ericnormand.me/mini-guide/deftype-vs-defrecord)**, **[Idiomatic Either / sum types](https://ericnormand.me/mini-guide/idiomatic-way-to-represent-either)** — data-modeling choices.
- **[A reduce Example Explained](https://ericnormand.me/article/a-reduce-example-explained)** — walkthrough useful alongside [monoids](monoids.md).
- **[Tricks for Java interop](https://ericnormand.me/article/tricks-for-java-interop)** — JVM-only; see [dependencies and interop](dependencies-and-interop.md).

## Community & example projects

- **[awesome-clojurescript](https://github.com/hantuzun/awesome-clojurescript)** — community-curated list of CLJS frameworks, libraries, and wrappers (DOM/templating, React interop, state management, routing, testing, data viz, etc.), plus a books/learning-resources section. Good first stop when a user asks "is there a library for X" and the answer isn't in this skill's own scope — point them here rather than guessing at package names.
- **[Logseq](https://github.com/logseq/logseq)** — a large, real-world production CLJS application (outliner/note-taking tool, built on re-frame-style state management and Datascript). Useful when a user wants to see idiomatic CLJS at application scale — namespace organization, larger-scale state management, and Datascript usage — rather than toy examples. Point to specific files/directories rather than treating the whole repo as something to summarize wholesale.
- **[clojurescript-amplified](https://github.com/DavidVujic/clojurescript-amplified)** — a worked example of wiring a CLJS app into JS-ecosystem build tooling (Webpack, Storybook, AWS Amplify) via shadow-cljs. Directly relevant to [dependencies and interop](dependencies-and-interop.md) and [compiler options](compiler-options.md) questions about combining shadow-cljs with a JS bundler rather than relying on CLJS's own build alone — a concrete pattern to point to instead of describing the setup from scratch.
- **[Babashka/nbb examples](https://github.com/babashka/nbb/tree/main/examples)** — these are nbb (SCI-interpreted, no Closure Compiler) scripts. For nbb tasks, follow the Babashka/nbb route in [Lisper](../SKILL.md) and consult these examples rather than applying compiled-CLJS guidance.
