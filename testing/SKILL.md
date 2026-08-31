---
name: testing
description: >
  Testing strategy and philosophy — design feedback, test quality audit, BDD review, architecture decisions,
  and test strategy for AI coding agents.

  TRIGGER when: strategy (testing approach, philosophy, methodology, how should I test, what tests to write),
  portfolio (unit, integration, component, contract, E2E, testing layers, how much to test),
  quality (brittle/flaky/slow/hard-to-maintain tests, testing anti-patterns, can I trust this test),
  mocking (when to use mocks, test doubles, stubs, fakes), review (review my test suite, BDD review),
  context (testing legacy codebase, adding tests to existing code),
  production (QA in production, synthetic monitoring, observability, exploratory testing),
  LLM applications (testing LLM systems, prompts, retrieval, evaluation suites),
  AI agents (testing strategy for AI-generated code, should the AI write its own tests, multi-agent testing).
  DO NOT USE for interactive TDD cadence with red/green/refactor loops — use `tcrdd` instead.
  DO NOT USE for smoke tests specifically — use `smoke-tests` instead.
---

# Testing — Strategy & Philosophy

Testing is not verification after the fact. It is feedback on design. A test that is hard to write reveals coupling in production code. A test that is hard to name reveals unclear thinking about behavior. The test suite is the living specification of the system — what the code is actually supposed to do. That's true whether a human or an AI agent wrote the code.

---

## Core Beliefs

| Belief                                    | What it means in practice                                                                                                         | Anti-pattern it prevents                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Hard to test = design problem             | Refactor the design, not the test                                                                                                 | Mocking everything to force testability                                                                           |
| Tests are specification, not verification | Name tests as sentences describing behavior                                                                                       | Tests named after implementation details                                                                          |
| Mocks are a smell, not a strategy         | Prefer real collaborators or fakes                                                                                                | Mock-heavy suites that survive bugs                                                                               |
| Pure functions are the testability ideal  | Push I/O to the edges; keep business logic pure                                                                                   | Business logic tangled with side effects                                                                          |
| Green must mean releasable                | A failing build is a stop-the-line signal, not noise                                                                              | Retrying flaky tests until the suite happens to pass                                                              |
| Test behavior, not design principles      | SRP and other architectural rules guide _how_ code is structured; assert _what_ the code does, not whether it obeys a design rule | Tests that count methods, check class responsibilities, or assert SOLID compliance instead of observable outcomes |

---

## The Test Portfolio

The test pyramid describes a useful default distribution, not a law. Unit tests form the base because they are fast and precise. Higher-level tests are valuable because they exercise wiring, collaboration, and user journeys. The portfolio rule is: choose the cheapest layer that gives the scenario the confidence it needs.

| Layer           | Count   | Speed           | Purpose                                              | Fragility                      |
| --------------- | ------- | --------------- | ---------------------------------------------------- | ------------------------------ |
| **Unit**        | Many    | ms              | Pure behavior specification                          | Low if behavior-focused        |
| **Component**   | Some    | ms–seconds      | One deployable service through its public interface  | Low–medium                     |
| **Integration** | Some    | seconds         | Real collaborators in one process/system             | Medium                         |
| **Contract**    | Some    | ms–seconds      | Consumer/provider expectations at a service boundary | Low if contract-focused        |
| **E2E / UI**    | Few     | seconds–minutes | First-of-its-kind user journey                       | High — minimize                |
| **Production**  | Ongoing | near-real-time  | Synthetic monitoring and domain observability        | Operational — not a substitute |

When a high-level test finds a bug, reproduce it at the lowest useful level before fixing it. The focused regression test is the permanent guardrail; the high-level test is the discovery mechanism.

---

## Decision Guide

| Question                                                 | Answer → Action                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Is this pure behavior or a wiring concern?               | Pure behavior → unit test; wiring → component/integration test                                |
| Does the scenario cross a service boundary?              | Yes → contract test for consumer/provider expectations; keep E2E for one journey              |
| Is this a critical user journey?                         | Write one E2E test, then push variations to lower layers                                      |
| Do I need mocks, or can I use real collaborators?        | Real collaborators preferred; mocks only when the outgoing interaction itself is the behavior |
| Is the test hard to write?                               | Treat that as design feedback; refactor before adding more doubles                            |
| Does the test depend on timing or non-deterministic I/O? | Fix the design; fast tests must be deterministic                                              |
| Have I seen this test fail when it should?               | No → inject an obvious bug, confirm the failure, revert it                                    |
| Would production behavior surprise us?                   | Add synthetic monitoring, domain observability, or exploratory investigation                  |
| Who's driving — human or AI agent?                       | Human → `tcrdd` micro-steps; Agent → test-first batches with separate trust signals           |

---

## Testing With AI Coding Agents

Strict red/green/refactor exists to manage _human_ short-term memory. Agents have the opposite profile — large working memory, but prone to hallucination and to gaming the test rather than satisfying it. The cadence and trust model both need to adapt.

| Old assumption                               | Agent-era adjustment                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| Force micro-step TDD for tight feedback      | Let the agent write tests first, then implement in larger batches                 |
| The author can test their own code           | Separate test-writer from coder roles to avoid tests that codify the bug          |
| Code review is the primary catch-all         | Combine coverage, mutation testing, complexity metrics, and targeted human review |
| Acceptance tests are ordinary code artifacts | Treat them as immutable guardrails for the coding agent                           |
| Smaller diff is always better                | Prefer coherent test grouping over scattering tests for a smaller diff            |
| Production checks are optional               | Monitor prompt/output quality, drift, latency, and failure modes continuously     |

For the full pipeline and trust model, see [Testing With AI Coding Agents](references/ai-agent-testing.md). For LLM applications, also read [Martin Fowler's Testing Canon](references/martin-fowler-testing.md).

---

## Testing Anti-Patterns

| Anti-pattern                           | Problem                                             | Fix                                                                     |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| Over-mocking                           | Mocks hide integration bugs                         | Prefer real collaborators or fakes                                      |
| Testing implementation                 | Tests break on refactor                             | Test observable behavior, not method call graphs                        |
| Brittle/flaky tests                    | Results become noise                                | Isolate state; control time, randomness, and async completion           |
| Slow unit tests                        | Design is too coupled                               | Refactor the design, not the test                                       |
| Top-heavy E2E suite                    | Diminishing returns; every variation pays full cost | Keep one E2E path and push variations to lower layers                   |
| Service boundary tested only by E2E    | Expensive and fragile                               | Add consumer-driven contract tests                                      |
| Logic inside tests                     | The test can carry the same bug it should catch     | Use hardcoded expected values and no control flow                       |
| Coverage treated as quality            | High coverage can still mean weak assertions        | Use coverage to find gaps; use mutation/contract tests to test strength |
| No production feedback loop            | Unknown failure modes remain invisible              | Add observability, synthetic monitoring, and exploratory testing        |
| Skip legacy testing                    | Risk grows while refactoring                        | Build a characterization net before changing behavior                   |
| AI agent tests its own code            | Tests codify the bug                                | Separate test-writer and coder roles                                    |
| Agent weakens acceptance tests to pass | The guardrail is defeated                           | Make acceptance tests immutable for the coding agent                    |
| Testing architecture rules as behavior | Structural rules are not user-visible behavior      | Enforce architecture with static analysis; test observable outcomes     |

---

## Integrated Example

**Before — hard to test (the design is the problem):**

```js
function sendOverdueReminders() {
  const users = db.query("SELECT * FROM users WHERE balance < 0");
  for (const user of users) {
    if (Date.now() - user.lastReminded > WEEK) {
      emailClient.send(user.email, "You owe us money");
    }
  }
}
```

This function forces a test to control a database, a clock, and an email client. The business rule — _who should be reminded_ — is buried inside the side effects.

**Diagnosis:** push I/O to the edges and keep the rule pure.

**After — pure core, I/O at the edge:**

```js
function usersToRemind(users, now) {
  return users.filter(
    (user) => user.balance < 0 && now - user.lastReminded > WEEK,
  );
}

function sendOverdueReminders() {
  for (const user of usersToRemind(db.allUsers(), Date.now())) {
    emailClient.send(user.email, "You owe us money");
  }
}
```

`usersToRemind([...], fixedNow)` is a one-line unit test with no doubles. The remaining shell is a thin integration concern. Hard-to-test became easy-to-test by changing the design, not by adding mocks.

---

## Read On Demand

| Read when                                                                        | File                                                                 |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Understanding the four cross-cutting testing principles                          | [Testing Principles](references/principles.md)                       |
| Auditing test quality against the 12 desiderata properties                       | [TestDesiderata — Quality Audit](references/testdesiderata.md)       |
| Reviewing tests for BDD compliance and structure                                 | [BDD Test Review](references/bdd-review.md)                          |
| Directing an AI coding agent: cadence, pipeline, trust model                     | [Testing With AI Coding Agents](references/ai-agent-testing.md)      |
| Choosing what to mock and what to assert                                         | [Mocks & Fragility](references/mocks-and-fragility.md)               |
| Auditing trustworthiness, maintainability, and readability                       | [Trustworthy & Maintainable Tests](references/trustworthy-tests.md)  |
| Distributing scenarios across test layers; test recipes; legacy triage           | [Test Strategy & Legacy Code](references/test-strategy.md)           |
| Testing async code, timers, events, or faking modules                            | [Async, Time & Module Faking](references/async-and-time.md)          |
| Applying Fowler-style portfolio, doubles, production feedback, and LLM practices | [Martin Fowler's Testing Canon](references/martin-fowler-testing.md) |
| Identifying and writing smoke tests for CI gates                                 | Dedicated `smoke-tests` skill                                        |

---

## Specialist Skills

| Situation                                  | Specialist skill | Why                                                |
| ------------------------------------------ | ---------------- | -------------------------------------------------- |
| Need interactive, human-paced TDD practice | `tcrdd`          | Red/green/refactor cadence with immediate feedback |
| Identifying or writing smoke tests         | `smoke-tests`    | Dedicated triggers, template, and CI integration   |

---


## Benchmark

Scenario: `.benchmarks/scenarios/testing-001-agent-test-strategy.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/testing-001-agent-test-strategy.json`

| Model             | Without | With  | Delta |
| ----------------- | ------- | ----- | ----- |
| claude-opus-4-8   | 67%     | 100%    | +33%   |
| claude-sonnet-4-6 | 100%    | 100%    | +0%   |
| claude-haiku-4-5  | 67%     | 100%    | +33%   |

> **PASS (run 2026-08-31)**. Opus and haiku +33; sonnet at ceiling. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
