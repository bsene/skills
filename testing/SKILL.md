---
name: testing
description: >
  Testing strategy and philosophy — design feedback, test quality audit, BDD review, and architecture decisions.

  TRIGGER when: strategy (testing strategy, testing approach, testing philosophy, testing methodology, how should I test, what tests to write, testing best practices),
  quality (test quality, brittle tests, flaky tests, slow tests, hard-to-maintain tests, testing anti-patterns),
  scope (unit vs integration vs e2e, testing layers, testing architecture, how much to test),
  mocking (when to use mocks, mocking strategy, test doubles),
  review (review my test suite, check my tests, BDD review, test desiderata),
  context (testing legacy codebase, adding tests to existing code).
  DO NOT USE when: user needs interactive TDD cadence with red/green/refactor loops — use `tcrdd` instead.
  DO NOT USE when: user asks about smoke tests specifically — use `smoke-tests` instead.
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

## Integrated Example

**Before — hard to test (the design is the problem):**

```js
function sendOverdueReminders() {
  const users = db.query("SELECT * FROM users WHERE balance < 0"); // I/O
  for (const u of users) {
    if (Date.now() - u.lastReminded > WEEK) {                       // hidden clock
      emailClient.send(u.email, "You owe us money");                // I/O
    }
  }
}
```

To test this you must mock the DB, freeze the clock, and stub the email client — three mocks
for one rule. The difficulty is feedback: the business logic (*who* gets reminded) is tangled
with I/O.

**Diagnosis:** the decision lives inside the side effects. Push I/O to the edges; keep the rule pure.

**After — pure core, I/O at the edge:**

```js
// Pure: trivially testable, no mocks
function usersToRemind(users, now) {
  return users.filter(u => u.balance < 0 && now - u.lastReminded > WEEK);
}

// Thin shell: wires real collaborators together
function sendOverdueReminders() {
  for (const u of usersToRemind(db.allUsers(), Date.now()))
    emailClient.send(u.email, "You owe us money");
}
```

`usersToRemind([...], fixedNow)` is a one-line unit test with no test doubles. The shell that
remains is a thin integration concern, tested sparingly. Hard-to-test became easy-to-test by
fixing the design, not the test.

---

## Read On Demand

| Read When | File |
|---|---|
| Understanding the four cross-cutting testing principles | [Testing Principles](references/principles.md) |
| Auditing test quality against the 12 desiderata properties | [TestDesiderata — Quality Audit](references/testdesiderata.md) |
| Reviewing tests for BDD compliance and structure | [BDD Test Review](references/bdd-review.md) |
| Identifying and writing smoke tests for CI gates | Dedicated `smoke-tests` skill (was `references/smoke-tests.md`) |

---

## Specialist Skills

For deeper dives into specific testing contexts, route to these specialized skills:

| Situation | Specialist Skill | Why |
|-----------|------------------|-----|
| Need to practice TDD workflow interactively | `tcrdd` | Hands-on kata-style practice with immediate feedback |
| Identifying or writing smoke tests specifically | `smoke-tests` | Dedicated triggers, template, CI integration |

