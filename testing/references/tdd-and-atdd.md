# TDD Tactics & Acceptance TDD

Complements `principles.md` and `acceptance-testing.md` with day-to-day TDD heuristics. Source: _Test Driven_ (Koskela), paraphrased.

## Choosing the next test from the list

| Axis                         | Lean toward when                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Details-first vs big-picture | Details first when an algorithm is the main risk; shell first otherwise                                                       |
| Uncertain vs familiar        | Uncertain first when surprises could invalidate the design                                                                    |
| High value vs low-hanging    | High value first; grab cheap tests to build momentum                                                                          |
| Happy path vs errors         | Happy path first (an error-proof system that does nothing is useless); errors first only when they form a natural progression |

There is no right order; keep a written test list and add items as you discover them.

## Making a test pass

| Strategy               | Use when                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| Fake it                | Step too big or implementation unclear: return the constant, then replace it      |
| Triangulate            | Generalization unclear: add a second example that forces the hard-coded value out |
| Obvious implementation | The correct code is plain; type it, and if red, revert entirely                   |

## Three guard rails

1. Do not skip the refactor step; duplication left behind is the usual failure mode.
2. Get to green fast with the fewest edits, then clean up under green.
3. After a mistake (reverted work), shrink the step size.

## Designing for testability

- Composition over inheritance.
- Avoid statics and singletons; isolate and inject dependencies.
- Use a fake for time and other nondeterminism; see `async-and-time.md`.
- Concurrency: test for thread safety, blocking, start/stop and async completion separately; use latches/semaphores/futures instead of sleeps.

## Test-driving the awkward layers

| Layer           | Approach                                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| Web controllers | Drive with fake request/response; keep templates thin                               |
| Data access     | Unit-test mapping with test doubles; fill gaps with real-database integration tests |
| File system     | Use a temp directory per test, cleaned afterwards                                   |
| GUI             | Humble view, tested presenter/model; thin widget tests                              |

## Acceptance TDD

| Property of a good acceptance test | Meaning                                        |
| ---------------------------------- | ---------------------------------------------- |
| Owned by the customer              | They define done                               |
| Written together                   | Customer, developer, tester collaborate        |
| About what, not how                | No UI steps or technology in the statement     |
| Domain language                    | Survives refactoring, readable by the business |
| Concise and unambiguous            | A few lines, concrete examples                 |

Cycle: pick story, write examples with customer, automate them (red), TDD inner loops until green, then show. Acceptance tests are the definition of done and a living specification.

Scope decisions: run most acceptance tests below the UI against business logic, with a thin set through the UI; stub only slow or uncontrollable externals.

## Legacy code, test-first

Analyze the change, add characterization coverage around the touch point, then test-drive the change. See `test-strategy.md` and the `clean-code/refactoring` first-aid reference.
