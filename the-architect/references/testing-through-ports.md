# Testing Through Ports

Test the application's behaviour through its inbound boundary, with fakes for the
outbound boundary. Structure-coupled tests (one test class per production class, every
collaborator mocked) break on every refactor and prove little about requirements.

## Test the contract, not the structure

| Question                          | Behaviour-coupled test (prefer)                       | Structure-coupled test (avoid) |
| --------------------------------- | ----------------------------------------------------- | ------------------------------ |
| What is the unit?                 | A use case / module behind its inbound port           | One class                      |
| What is replaced with a double?   | Only shared or slow dependencies (DB, clock, network) | Every collaborator             |
| What forces the test to change?   | A requirement change                                  | Any redesign of internals      |
| Refactor with unchanged behaviour | No test edits                                         | Many test edits                |

Rule of thumb: new behaviour means a new test, changed behaviour means an edited test,
a pure refactor means no test change. If a refactor breaks tests, the tests were coupled
to structure.

## Where to spend tests (test gears)

| Level                            | Count / role                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| End-to-end through the real edge | About one per feature: proves the wiring. One extra for unhappy paths.                             |
| Use-case (service layer) tests   | The bulk. Fakes for I/O, cover edge cases and branches here.                                       |
| Domain-model tests               | A small, fast core for tricky invariants. Delete them freely once a use-case test covers the rule. |
| Adapter integration tests        | One set per real adapter (DB mapping, HTTP client) against the real technology.                    |

- High gear: use-case tests, cheap to write and refactor-proof. Low gear: domain tests
  when a rule is subtle and you want sub-second feedback.
- Express use-case inputs and outputs in primitives or DTOs, not domain objects, so tests
  survive model changes. If a test must reach into a repository or SQL to set up state,
  the use case is missing an operation (for example "add batch").
- Error handling is a feature: route all failures to the edge in one way, test the happy
  path per use case, and keep a few tests for the shared error mapping.
- If use-case tests cause a combinatorial explosion, drop down to the collaborating domain
  objects for those cases.

## Fakes over mocks for driven ports

- Write a small in-memory implementation per driven port (repository, unit of work, clock,
  message bus). It is reusable, behaves like the real thing, and asserts on state rather
  than call sequences.
- Keep the fake honest: run the same contract tests against the fake and the real adapter.
- Patching internals of the module under test is a smell; it means a seam is missing.

## Development sequence for a new component

1. Write the use-case test against the inbound port.
2. Satisfy it with in-memory fakes for the outbound ports.
3. Add the real inbound adapter (HTTP, CLI, job).
4. Add the real outbound adapters last, each with its own integration test.

The system works with no UI and no database from step 2, which is the point of the
pattern; the infrastructure choice is deferred until the behaviour is proven.

## Same shape, different names

Hexagonal, Onion and Clean Architecture describe one structure for testing purposes:

| Role                    | Hexagonal        | Onion                | Clean                   |
| ----------------------- | ---------------- | -------------------- | ----------------------- |
| Inbound API under test  | Driving port     | Application services | Use case input boundary |
| Business core           | Application core | Domain model         | Entities                |
| Outbound contract       | Driven port      | Domain services      | Gateway interface       |
| Outbound implementation | Driven adapter   | Infrastructure       | Gateway implementation  |

Source: Optivem, "TDD and Clean Architecture Driven by Behaviour"; Percival and Gregory,
"Architecture Patterns with Python" (test pyramid, fakes); Cockburn, "Hexagonal
Architecture" (2023 talk, test-first sequence).
