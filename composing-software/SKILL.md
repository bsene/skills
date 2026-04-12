---
name: composing-software
description: >
  Apply functional programming composition techniques in JavaScript. Use this skill
  whenever the user asks about function composition, pipe, compose, currying, partial
  application, point-free style, pure functions, immutability, functors, monads, lenses,
  functional mixins, factory functions, or object composition. Also trigger when the user
  asks how to avoid class inheritance, how to build reusable abstractions in JavaScript,
  how to compose async operations, or how to reduce coupling through FP patterns. Even if
  they just say "compose these functions", "pipe this data", or "make this more functional",
  use this skill.
---

# Composing Software in JavaScript

Source: Eric Elliott's [Composing Software](https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc) series.

**Central thesis**: all software design is composition — breaking problems down into small pieces and composing solutions back up. The choice of *how* to compose shapes everything about maintainability, testability, and flexibility.

---

## Core Vocabulary

| Term | Definition |
|---|---|
| **Pure function** | Same input → same output, no side effects |
| **Composition** | Output of one function becomes input of the next |
| **Currying** | Transform `(a, b) => c` into `a => b => c` |
| **Partial application** | Fix some arguments, return a function for the rest |
| **Point-free** | Define functions without mentioning their arguments |
| **Functor** | A container with a `.map()` method that obeys functor laws |
| **Monad** | A functor that also flattens nested contexts via `.chain()` |
| **Lens** | A composable getter/setter pair for immutable nested state |

---

## Read On Demand

| Read When | File |
|---|---|
| Writing pure functions, composing with pipe/compose, debugging pipelines | [Pure Functions & Composition](references/pure-functions-and-composition.md) |
| Currying, partial application, data-last convention, point-free style | [Currying & Point-Free](references/currying-and-point-free.md) |
| Factory functions, functional mixins, object composition patterns | [Object Composition & Factories](references/object-composition-and-factories.md) |
| Working with functors, monads, or lenses | [Functors, Monads & Lenses](references/functors-monads-lenses.md) |
| Optimizing data pipelines, avoiding intermediate allocations | [Transducers](references/transducers.md) |

---

## Composition vs. Inheritance Checklist

When designing a new abstraction, ask:

- [ ] Is this a **has-a** / **can-do** relationship? → use composition / functional mixin
- [ ] Is this a strict **is-a** relationship at the type system level? → composition still preferred; classes only if framework requires it
- [ ] Does the calling code need `new`? → switch to a factory
- [ ] Do you use `instanceof` for branching? → use duck-typing or tagged union instead
- [ ] Does a mixin import another mixin? → avoid implicit dependency chains; prefer explicit composition
- [ ] Is a class extending a custom class? → stop; compose instead

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Class inheritance | Tight coupling, fragile base class, gorilla/banana | Functional mixins or factory composition |
| Mutation of shared state | Hidden bugs, concurrency issues | Return new objects; use spread |
| Side effects mixed with logic | Hard to test, unpredictable | Isolate effects to system edges |
| Multi-argument functions in pipelines | Can't compose without wrapper | Curry + data-last convention |
| Writing tests after the fact with mocks | Mocks reveal coupling; tests don't shape design | Write pure functions; integration-test I/O |
| Chaining array methods for large data | Intermediate allocations at each step | Transducers for performance-critical paths |

---

## Composition Hierarchy (simplest → most complex)

Always use the simplest tool that solves the problem:

```
Pure functions
    ↓
Factory functions
    ↓
Functional mixins
    ↓
Classes (only when a framework forces it)
```
