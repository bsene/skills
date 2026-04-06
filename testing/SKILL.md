---
name: testing
description: Master testing strategy — philosophy, approach, architecture decisions, test quality audit, and BDD review practices.
triggers:
  - testing strategy
  - testing approach
  - testing philosophy
  - testing methodology
  - testing mindset
  - how should I test
  - what tests to write
  - testing best practices
  - unit vs integration vs e2e
  - what makes a good test
  - test quality
  - brittle tests
  - flaky tests
  - slow tests
  - hard to maintain tests
  - testing legacy codebase
  - adding tests to existing code
  - when to use mocks
  - mocking strategy
  - test doubles
  - test-driven development
  - testing anti-patterns
  - how much to test
  - testing architecture
  - testing layers
  - review my test suite
  - check my tests
  - BDD testing
  - test desiderata
  - smoke test
  - smoke testing
  - sanity check
  - critical path test
  - fast CI gate
---

# Testing — Strategy & Philosophy

Testing is not verification after the fact. It is feedback on design. A test that is hard to write reveals coupling in production code. A test that is hard to name reveals unclear thinking about behavior. The test suite is the living specification of the system—what the code is actually supposed to do.

---

## Core Beliefs

| Belief | What it means in practice | Anti-pattern it prevents |
|--------|---------------------------|-------------------------|
| Hard to test = design problem | Refactor the design, not the test | Mocking everything to force testability |
| Tests are specification, not verification | Name tests as sentences describing behavior | Tests named after implementation details |
| Mocks are a smell, not a strategy | Prefer real collaborators or fakes | Mock-heavy suites that survive bugs |
| Pure functions are the testability ideal | Push I/O to the edges; keep business logic pure | Business logic tangled with side effects |

---

## The Testing Hierarchy

The test pyramid describes *how many* of each type to write and *why*. Unit tests form the base (many, fast, isolated). Integration tests in the middle (some, slower, collaborative). End-to-end tests at the top (few, slowest, highest value but hardest to maintain).

| Layer | Count | Speed | Purpose | Fragility |
|-------|-------|-------|---------|-----------|
| **Unit** | Many | ms | Behavior specification | Low if behavior-focused |
| **Integration** | Some | seconds | Collaboration contracts | Medium |
| **E2E / Smoke** | Few | seconds–minutes | User journey confidence | High — minimize |

---

## Decision Guide

When deciding what tests to write:

| Question | Answer → Action |
|----------|-----------------|
| Is this a behavior specification or a verification check? | Behavior → write a unit test; Verification → consider integration test |
| Can I test this in isolation, or does it require collaboration? | Isolation → unit test; Collaboration → integration test with real collaborators |
| Is this a critical user journey? | Yes → also write e2e test (sparingly) |
| Do I need mocks, or can I use real collaborators? | Real collaborators preferred; mocks only if I/O is unavoidable |
| Is the test hard to write? | Yes → your design has coupling issues; refactor first, then test |
| Does the test depend on timing or non-deterministic I/O? | Yes → fix the design; tests must be deterministic |

---

## Testing Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Over-mocking | Mocks hide integration bugs | Prefer real collaborators or fakes |
| Testing implementation | Tests break on refactor | Test behavior, not methods |
| Brittle/flaky tests | Tests are unreliable | Design for determinism; check coupling |
| Slow unit tests | Design is too coupled | Refactor, not test |
| Skip legacy testing | Risk increases over time | Start with integration tests for safety |

---

## Reference Files

| Read When | File |
|---|---|
| Understanding the four cross-cutting testing principles | [Testing Principles](references/principles.md) |
| Auditing test quality against the 12 desiderata properties | [TestDesiderata — Quality Audit](references/testdesiderata.md) |
| Reviewing tests for BDD compliance and structure | [BDD Test Review](references/bdd-review.md) |
| Identifying and writing smoke tests for CI gates | [Smoke Tests](references/smoke-tests.md) |

---

## Specialist Skills

For deeper dives into specific testing contexts, route to these specialized skills:

| Situation | Specialist Skill | Why |
|-----------|------------------|-----|
| Need to practice TDD workflow interactively | `tcrdd` | Hands-on kata-style practice with immediate feedback |
| Want to explore reactive programming testing patterns | `reactive-test` | Specialized patterns for streams and async scenarios |
| Debugging flaky or non-deterministic tests | `test-determinism` | Focused patterns for timing, state, and concurrency issues |
| Improving test names and clarity | `test-naming` | Domain-specific patterns for readable test suites |

---

## Key Takeaway

The goal of testing is **clarity, not coverage**. A test is good if it:
- Clearly expresses the expected behavior (not implementation details)
- Fails when the behavior changes (not when code is refactored)
- Is easy to understand and maintain
- Runs fast and deterministically
- Lives with the code it tests

Tests are the interface between the developer's intent and the reader's understanding. Write them as if you are documenting the system to future maintainers—because you are.
