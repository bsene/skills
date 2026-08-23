# External Resources

## Clojurian Thought (Janet A. Carr)

Blog: https://blog.janetacarr.com/

A JVM-Clojure-focused blog (not CLJS-specific, but directly relevant since CLJS shares Clojure's language, idioms, and community conventions). Useful as background/idiom reading when a question is really about "how would an experienced Clojurian think about this," rather than about CLJS-specific compiler/interop mechanics — don't treat it as a source of CLJS-specific facts (compiler flags, JS interop, npm/nbb behavior), which belong in this skill's other reference files instead.

### Particularly relevant posts

- **["Fix your Clojure code: Clojure comes with design patterns" (Part 1](https://blog.janetacarr.com/software-design-patterns-in-clojure/) / [Part 2)](https://blog.janetacarr.com/fix-your-clojure-code-clojure-comes-with-design-patterns-part-2/)** — how classic OO design patterns (Singleton, Command, Observer, Visitor, State, Builder, Chain of Responsibility, Strategy, etc.) map onto idiomatic Clojure constructs (multimethods, protocols, plain functions/maps, `atom`s) instead of class hierarchies. Good grounding for the "data over classes" guidance in this skill's Working Style section — useful when a user is translating an OO codebase and reaching for a pattern that has a simpler idiomatic Clojure/CLJS equivalent.
- **["Mindset Shifts for Functional Programming (with Clojure)"](https://blog.janetacarr.com/mindset-shifts-for-functional-programming-with-clojure/)** — general FP-mindset framing (immutability, data-first thinking) for developers coming from imperative/OO backgrounds.
- **["Thoughts on Clojurescript and BigDecimal"](https://blog.janetacarr.com/thoughts-on-clojurescript-and-bigdecimal/)** — directly CLJS-relevant: discusses the lack of arbitrary-precision numeric types in CLJS (see this skill's "no BigDecimal/ratios, only JS `number`" note) and the tradeoffs involved.
- **["Dead simple core.async job system in Clojure"](https://blog.janetacarr.com/dead-simple-core-async-job-system-in-clojure/)** — a worked example of building an async job/worker system with `core.async` (go-loops, channels, a functions-as-states FSM pattern). Useful as a real-world `core.async` design reference; written for JVM Clojure (uses JDBC/PostgreSQL, JVM threads via `core.async/thread`), so if the user is on CLJS, translate the channel/go-loop logic and drop the JVM-thread-pool assumptions.
- **[Top Articles index](https://blog.janetacarr.com/top/)** — browse for more; the author also runs a paid course (`clojureforpros.com`) and live-coding stream, referenced from the site if a user wants deeper/structured learning beyond blog posts.

### How to use this in practice

- Point the user to a specific post rather than paraphrasing it wholesale — this is external, copyrighted content; summarize the idea briefly (per the working style in this skill) and link out for the full read.
- Treat it as one Clojurian's opinionated take, not an authoritative spec — cross-check anything that sounds like a hard technical claim (numeric semantics, compiler behavior) against `references/compiler-options.md`, `references/dependencies-and-interop.md`, or official docs before restating it as fact.

## Community & example projects

- **[awesome-clojurescript](https://github.com/hantuzun/awesome-clojurescript)** — community-curated list of CLJS frameworks, libraries, and wrappers (DOM/templating, React interop, state management, routing, testing, data viz, etc.), plus a books/learning-resources section. Good first stop when a user asks "is there a library for X" and the answer isn't in this skill's own scope — point them here rather than guessing at package names.
- **[Logseq](https://github.com/logseq/logseq)** — a large, real-world production CLJS application (outliner/note-taking tool, built on re-frame-style state management and Datascript). Useful when a user wants to see idiomatic CLJS at application scale — namespace organization, larger-scale state management, and Datascript usage — rather than toy examples. Point to specific files/directories rather than treating the whole repo as something to summarize wholesale.
- **[clojurescript-amplified](https://github.com/DavidVujic/clojurescript-amplified)** — a worked example of wiring a CLJS app into JS-ecosystem build tooling (Webpack, Storybook, AWS Amplify) via shadow-cljs. Directly relevant to `references/dependencies-and-interop.md` and `references/compiler-options.md` questions about combining shadow-cljs with a JS bundler rather than relying on CLJS's own build alone — a concrete pattern to point to instead of describing the setup from scratch.
- **[Babashka/nbb examples](https://github.com/babashka/nbb/tree/main/examples)** — **not for this skill.** These are nbb (SCI-interpreted, no Closure Compiler) scripts, out of scope here for the same reason nbb itself is (see the note at the top of `SKILL.md`). If a user's task is actually an nbb script, point them at this folder and the `clojurescript-nbb` skill instead of trying to adapt the examples to a Closure-Compiler CLJS project.