# Test Styles, Architecture & Integration Boundaries

Gap-filler for design-level decisions that `mocks-and-fragility.md` only touches. Source: _Unit Testing: Principles, Practices, and Patterns_ (Khorikov), paraphrased.

## Three test styles (best to worst)

| Style         | Asserts on                          | Refactoring resistance | Maintainability | Use                                 |
| ------------- | ----------------------------------- | ---------------------- | --------------- | ----------------------------------- |
| Output-based  | Return value only                   | Highest                | Highest         | Default for pure logic              |
| State-based   | State after the operation           | Medium                 | Medium          | When output is not enough           |
| Communication | Calls between SUT and collaborators | Lowest                 | Lowest          | Only at the system edge (see below) |

State-based traps: do not widen visibility of private state just to assert it. Tame size with helper methods and value objects.

## Functional core, mutable shell

Move decisions into side-effect-free code; keep I/O in a thin shell.

```text
shell:  read inputs  ->  core.decide(inputs) -> decision  ->  apply decision as side effects
core:   pure, no hidden inputs (clock, DB, globals) or outputs (writes, exceptions)
```

- A function with hidden inputs or outputs cannot be tested output-based; pass the hidden input in as an argument.
- Hexagonal architecture tolerates side effects inside the domain layer; functional architecture pushes them all out. Choose per project: functional costs some performance for maintainability, and is not worth it for simple or low-value code.

## Four kinds of code

| Complexity / domain significance | Collaborators | Kind             | Test with                      |
| -------------------------------- | ------------- | ---------------- | ------------------------------ |
| High                             | Few           | Domain/algorithm | Many unit tests (best ROI)     |
| Low                              | Few           | Trivial          | Nothing                        |
| Low                              | Many          | Controller       | Few integration tests          |
| High                             | Many          | Overcomplicated  | Split into controller + domain |

Code is deep (complex) or wide (many collaborators), never both. Test preconditions only if they carry domain meaning.

## Splitting overcomplicated code: pick two of three

| Attribute                 | Push all I/O to edges | Inject I/O into domain | Split decisions into steps |
| ------------------------- | --------------------- | ---------------------- | -------------------------- |
| Domain testability        | Kept                  | Lost                   | Kept                       |
| Controller simplicity     | Kept                  | Kept                   | Lost                       |
| Performance (fewer calls) | Lost                  | Kept                   | Kept                       |

Usually take the third and offset controller growth with:

- **CanExecute/Execute**: each `do()` has a `canDo()` that is its precondition, so the controller cannot forget the check.
- **Domain events**: the domain records what changed; the controller turns events into external calls.

## Observable behavior vs implementation detail

A member is observable behavior only if it is an operation or state the client needs to reach its goal. Everything else is an implementation detail and must not be public. If the public API exceeds observable behavior, encapsulation leaks and tests start coupling to internals.

- Intra-system calls (class to class) are implementation details: never mock them.
- Inter-system calls are observable behavior only when the side effect is visible to outsiders.

## Managed vs unmanaged dependencies

| Kind               | Example                        | In integration tests                            |
| ------------------ | ------------------------------ | ----------------------------------------------- |
| Managed (private)  | Your app's own database        | Use the real one; assert final state, not calls |
| Unmanaged (shared) | SMTP, message bus, partner API | Replace with a mock/spy                         |
| Mixed (shared DB)  | DB other apps read             | Mock the observable part, real for the rest     |

- Integration tests go through every layer that touches the managed dependency and verify its state independently of the input data.
- Cover edge cases with unit tests; use integration tests for one happy path plus edge cases units cannot reach.
- An interface with one implementation is not an abstraction; its only legitimate use is enabling a mock of an unmanaged dependency.
- Keep indirection low: domain model, application services (controllers), infrastructure. Break callback cycles by returning a value object.
- One act per test. Multiple acts belong only in end-to-end tests with hard-to-reset out-of-process state.
- Support logging (business requirement) is behavior: route it through an explicit domain logger fed by domain events and test it. Diagnostic logging is a detail: do not test it, keep it sparse.
- Inject all dependencies, loggers included, explicitly.

## Mocking at the edge

| Rule                                                  | Why                                                     |
| ----------------------------------------------------- | ------------------------------------------------------- |
| Mock the last type before the unmanaged dependency    | More code under test, less coupling to internals        |
| Prefer handwritten spies at the edge                  | Reusable assertions, shorter tests                      |
| Own the type you mock: wrap third-party clients       | Stable seam, you control the contract                   |
| Assert both expected calls and absence of extra calls | Catches accidental duplicates                           |
| Use literals in tests, not production constants       | Avoids tautological tests                               |
| Mocks only in controller/integration tests            | Unit tests of the domain never need them                |
| Number of mocks is irrelevant                         | It equals the number of unmanaged dependencies involved |

Exception: if only the existence and content of a message matter (logging), exact edge-level format need not be pinned.

## Database tests

| Practice                                                                      | Note                                          |
| ----------------------------------------------------------------------------- | --------------------------------------------- |
| Schema and reference data in source control                                   | No "model database" that is diffed at release |
| One database instance per developer                                           | Avoids shared-state flakiness                 |
| Migration-based delivery over state-based comparison                          | Explicit, ordered, data-preserving changes    |
| Clean data at the start of a test, not the end                                | A crashed run cannot poison the next one      |
| Do not share DB state across tests; do not wrap in the production transaction | Reproduce real commit behavior                |
| Use separate connections/units of work for arrange, act, assert               | Verifies persistence, not cache               |
| Hide noise behind builders; keep only data that matters                       | Short, readable tests                         |

## Anti-patterns to flag in review

| Smell                                                | Fix                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| Test re-implements the algorithm (leaking the logic) | Assert hard-coded expected values                                   |
| Testing private methods                              | Test via public behavior; extract a class if the logic is important |
| Exposing private state for assertions                | Assert on observable outcome                                        |
| Mocking concrete in-process collaborators            | Use real objects; mock only unmanaged edges                         |
| Time read from a static/ambient context              | Inject a clock or pass the time as a value                          |
| Asserting calls on stubs                             | Assert end results; stubs only feed inputs                          |
