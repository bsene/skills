# Testing With AI Coding Agents — Uncle Bob's 2026 View

## When This Applies

Use this reference when the user is directing an AI coding agent (not writing code by hand) and asks about test strategy, TDD cadence for agents, whether to trust AI-generated tests, or how to structure a multi-agent build pipeline.

**Trigger phrases:** "should I TDD with an AI agent", "can I trust AI-written tests", "testing strategy for AI-generated code", "multi-agent testing pipeline", "should the AI write its own tests", "vibe coding test strategy".

---

## Core Shift: TDD Is a Human Discipline, Not an Agent Loop

Strict red-green-refactor exists to compensate for human short-term memory limits. AI agents have the opposite profile — large short-term memory, but absent-mindedness, hallucination, and a tendency to cheat toward "passing" rather than "correct." The cadence should change accordingly.

| | Human TDD | Agent-era testing |
|---|---|---|
| **Cadence** | Micro-step red-green-refactor | Test-first, then implement in larger batches |
| **Why** | Compensates for limited working memory | Large context window tolerates bigger steps |
| **Confidence signal** | Watching each test go green | Coverage, cyclomatic complexity / CRAP score, mutation kill-rate |
| **Failure mode guarded against** | Losing track of the next small step | Hallucinated correctness, self-serving tests |

Do not force the three laws of TDD onto an agent in micro-steps — it's fighting the tool's strengths for no benefit. Do still write tests first; just let the agent write more of them before switching to implementation.

---

## Don't Let an AI Grade Its Own Homework

Asking an agent to "write a test for this function" it just wrote produces tests that codify the bug, not detect it. Two mitigations:

1. **Separation of powers** — the agent that writes tests is not the agent that writes the code under test. Distinct roles: specifier, test-writer, coder, refactorer, architect.
2. **Semantic distance** — insert translation layers between spec and implementation so an agent can't shortcut straight from "make the test pass" to "hardcode the expected output." Example chain: Gherkin → parser → intermediate representation → generator.

---

## Multi-Agent Pipeline

```
Informal human spec
      ↓ (human review)
Refined spec / tasks
      ↓
Gherkin (specifier agent)
      ↓
Acceptance tests
      ↓
Unit tests
      ↓
Code (coder agent)
      ↓
Refactorer agent — reduce complexity/duplication, add property tests
      ↓
Architect agent — mutation testing, kill survivors, run full suite
```

Humans stay in the loop at spec approval and spot-checks of Gherkin/code — not line-by-line code review. Keep each pass small; multi-agent doesn't excuse Big Up-Front Design.

---

## Acceptance Tests as Guardrails, Not Suggestions

- Gherkin/BDD acceptance tests should be human-readable, ideally by non-developers — this is where "holding the shape" of desired behavior lives, since prompts and plans fade from context but tests persist.
- Treat acceptance tests as **immutable by the coding agent**. An agent "fixing" a failing acceptance test by loosening its assertion is not a fix — it's the fragility protection being defeated. Flag this if you see it in a diff.
- For the internal structure of individual scenarios (Given/When/Then, one behavior per test, naming), this skill's `bdd-review.md` still applies unchanged — Gherkin discipline didn't get looser, it got more load-bearing.

---

## Metrics Replace Manual Code Review

Uncle Bob's stated practice: he no longer reads most AI-written code, and relies on the "gauntlet" of tests and metrics instead — coverage, mutation testing, cyclomatic complexity, module size/dependency constraints. Human attention moves up a level: architecture, specs, constraints.

- **Coverage** — necessary, not sufficient. A codebase can be 100% covered with zero real assertions.
- **Mutation testing** — plugs exactly that leak (missing/weak assertions) by injecting small code mutations and checking the suite kills them. CPU-intensive; run it on critical modules or as a CI/nightly gate, not on every save.
- **Cyclomatic complexity / CRAP score** — automated constraint on the coder agent, replacing "does this look clean" review.

---

## What Doesn't Change

These hold regardless of who's typing:

- Testability is a design signal, not a checkbox.
- Mocks are still a smell; fakes are still preferred.
- Pure functions are still the testability ideal — push I/O to the edges.
- Tests are still specification, not verification after the fact — arguably *more* true now, since tests outlive the prompt that produced the code.

---

## Gotchas

- Trusting a coverage percentage alone as the confidence signal — Goodhart's law applies; pair it with mutation testing.
- Running mutation testing on every commit — too slow for inner-loop feedback; reserve for gated/nightly runs.
- Letting the coding agent edit acceptance tests to make them pass — always a red flag, not a fix.
- Skipping Gherkin review entirely because "the agent wrote it" — spec drift is exactly what acceptance tests are supposed to catch, so an unreviewed spec is an unverified guardrail.
- Applying agent-era batch cadence to a human pairing session, or vice versa — the two cadences solve different memory problems; match the cadence to who's driving.
