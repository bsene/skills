---
name: composition
description: Functional programming composition in JavaScript/TypeScript — pipe/compose, currying, point-free, pure functions, factories, functional mixins, monoids. Reference bundle for the `typescript` skill; not independently triggered. For class-based OOP architecture or SOLID principles, the parent routes to `object-oriented-programming`.
metadata:
  role: reference-bundle
  parent-skill: typescript
---

# Composing Software in JavaScript & TypeScript

Source: Eric Elliott's [Composing Software](https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc) series.

## Workflow

1. **Identify the coupling** — is the problem inheritance, shared mutable state, or entangled side effects? See Composition Hierarchy below.
2. **Choose the composition tool** — pure function → factory → functional mixin → class (last resort). Use the Checklist below.
3. **Apply the pattern** — read the matching reference file for the concrete technique.
4. **Verify** — can the new unit be tested without mocks? Can it be reused without importing its collaborators?


**Central thesis**: all software design is composition — breaking problems down into small pieces and composing solutions back up. The choice of *how* to compose shapes everything about maintainability, testability, and flexibility.

---

## Core Vocabulary

| Term | Definition |
|---|---|
| **Pure function** | Same input → same output, no side effects |
| **Composition** | Combining small functions into a larger one by feeding each output as the next input |
| **Currying** | Transform `(a, b) => c` into `a => b => c` |
| **Partial application** | Fix some arguments, return a function for the rest |
| **Point-free** | Define functions without mentioning their arguments |

---

## Read On Demand

| Read When | File |
|---|---|
| Writing pure functions, composing with pipe/compose, debugging pipelines | [Pure Functions & Composition](references/pure-functions-and-composition.md) |
| Currying, partial application, data-last convention, point-free style | [Currying & Point-Free](references/currying-and-point-free.md) |
| Factory functions, functional mixins, object composition patterns | [Object Composition & Factories](references/object-composition-and-factories.md) |
| Aggregating/merging/reducing data — merge, combine, shopping carts, permissions, counters | [Monoids](references/monoids.md) |

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
| Chaining array methods for large data | Intermediate allocations at each step | Single-pass `reduce`, but never with a spread accumulator — see `../rules/avoid-intermediate-arrays.md` |

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

---

## Benchmark

Scenario: `.benchmarks/scenarios/composing-software-001-compose-vs-inherit.md`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 17%     | 100% | +83%  |
| claude-sonnet-4-6 | 33%     | 100% | +67%  |
| claude-haiku-4-5  | 0%      | 83%  | +83%  |

> **PASS** (run 2026-06-25, strongest signal). Decisive — haiku 0→83, opus 17→100. Baselines reach for `extends`; the skill enforces composition (factory/mixin) and correctly DEFERS the SRP follow-up to `object-oriented-programming` (anti-trigger holds). Gate per `skill-optimizer/release-gates.md`.
