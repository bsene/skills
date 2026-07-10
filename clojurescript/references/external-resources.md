# External Resources: Clojurian Thought (Janet A. Carr)

Blog: https://blog.janetacarr.com/

A JVM-Clojure-focused blog (not CLJS-specific, but directly relevant since CLJS shares Clojure's language, idioms, and community conventions). Useful as background/idiom reading when a question is really about "how would an experienced Clojurian think about this," rather than about CLJS-specific compiler/interop mechanics — don't treat it as a source of CLJS-specific facts (compiler flags, JS interop, npm/nbb behavior), which belong in this skill's other reference files instead.

## Particularly relevant posts

- **["Fix your Clojure code: Clojure comes with design patterns" (Part 1](https://blog.janetacarr.com/software-design-patterns-in-clojure/) / [Part 2)](https://blog.janetacarr.com/fix-your-clojure-code-clojure-comes-with-design-patterns-part-2/)** — how classic OO design patterns (Singleton, Command, Observer, Visitor, State, Builder, Chain of Responsibility, Strategy, etc.) map onto idiomatic Clojure constructs (multimethods, protocols, plain functions/maps, `atom`s) instead of class hierarchies. Good grounding for the "data over classes" guidance in this skill's Working Style section — useful when a user is translating an OO codebase and reaching for a pattern that has a simpler idiomatic Clojure/CLJS equivalent.
- **["Mindset Shifts for Functional Programming (with Clojure)"](https://blog.janetacarr.com/mindset-shifts-for-functional-programming-with-clojure/)** — general FP-mindset framing (immutability, data-first thinking) for developers coming from imperative/OO backgrounds.
- **["Thoughts on Clojurescript and BigDecimal"](https://blog.janetacarr.com/thoughts-on-clojurescript-and-bigdecimal/)** — directly CLJS-relevant: discusses the lack of arbitrary-precision numeric types in CLJS (see this skill's "no BigDecimal/ratios, only JS `number`" note) and the tradeoffs involved.
- **["Dead simple core.async job system in Clojure"](https://blog.janetacarr.com/dead-simple-core-async-job-system-in-clojure/)** — a worked example of building an async job/worker system with `core.async` (go-loops, channels, a functions-as-states FSM pattern). Useful as a real-world `core.async` design reference; written for JVM Clojure (uses JDBC/PostgreSQL, JVM threads via `core.async/thread`), so if the user is on CLJS, translate the channel/go-loop logic and drop the JVM-thread-pool assumptions.
- **[Top Articles index](https://blog.janetacarr.com/top/)** — browse for more; the author also runs a paid course (`clojureforpros.com`) and live-coding stream, referenced from the site if a user wants deeper/structured learning beyond blog posts.

## How to use this in practice

- Point the user to a specific post rather than paraphrasing it wholesale — this is external, copyrighted content; summarize the idea briefly (per the working style in this skill) and link out for the full read.
- Treat it as one Clojurian's opinionated take, not an authoritative spec — cross-check anything that sounds like a hard technical claim (numeric semantics, compiler behavior) against `references/compiler-options.md`, `references/dependencies-and-interop.md`, or official docs before restating it as fact.