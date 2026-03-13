---
name: bdd-unit-test-reviewer
description: >
  Review existing unit tests against BDD (Behaviour-Driven Development) principles
  and provide concrete improvement suggestions. Use this skill whenever the user
  shares test code and asks for a review, feedback, or improvements. Also trigger
  when the user says "check my tests", "are these tests good?", "review my test suite",
  "do these follow BDD?", or pastes test code in any language. Even for passing tests,
  use this skill to audit naming, structure, and behaviour coverage — good tests can
  almost always be made clearer.
---

# BDD Unit Test Reviewer

Audit existing unit tests against Dan North's BDD principles and produce
**actionable, prioritised suggestions**. The goal is not to rewrite everything —
it's to surface the most impactful changes that make tests read as behaviour
specifications, not just code coverage.

---

## Review Workflow

### Step 1 — Read All Tests First

Before commenting on anything, read the entire test file. Build a mental model of:

- What class or module is under test?
- What behaviours are covered?
- What patterns repeat across tests?

### Step 2 — Run the BDD Audit (see checklist below)

Check each test against all five BDD principles. Mark each finding with a
**severity** (see scale below) and note the specific test name or line.

### Step 3 — Produce a Structured Review

Output the review in this format:

```
## BDD Review: <ClassName or filename>

### Summary
<2–3 sentence overall assessment. What's the biggest win available?>

### Findings

#### 🔴 Critical — <Principle violated>
**Test:** `<test name>`
**Problem:** <What BDD principle is broken and why it matters>
**Suggestion:** <Specific rename or restructure. Show the improved version in code.>

#### 🟡 Minor — <Principle violated>
...

#### 🟢 Looks Good
<List test names that are already strong BDD examples. Briefly explain why.>

### Missing Behaviours (optional)
<If the test names, read together, leave obvious gaps in the class's specification,
call them out here. Don't invent requirements — only flag gaps implied
by the existing tests.>
```

### Step 4 — Offer the Rewritten Version (if asked)

If the user wants improved tests, rewrite only the tests that had Critical or
Minor findings. Keep tests that already pass as-is.

---

## Severity Scale

| Level | Label      | Meaning                                                                  |
| ----- | ---------- | ------------------------------------------------------------------------ |
| 🔴    | Critical   | Violates a core BDD principle; actively misleads readers or hides intent |
| 🟡    | Minor      | Weakens the test as documentation; easy to fix                           |
| 🟢    | Looks Good | Follows BDD well — acknowledge it explicitly                             |

---

## The Five BDD Principles to Check

### Principle 1 — Test Names Are Sentences

Read the method name aloud (replace underscores/camelCase with spaces). Does it form
a clear English sentence describing a behaviour? A non-developer should understand it.

**Violations to flag:**

- Names starting with `test_`, `test`, `check_`, `verify_` with no behaviour description
- Single-word or vague names: `test_error`, `test2`, `testEdgeCase`
- Names describing _how_ code works rather than _what_ it does: `test_calls_repository`

**Suggested fix pattern:** Rename to `should_<outcome>_when_<condition>`

---

### Principle 2 — Use the "should" Template

Every test name should fit: **"The `<ClassName>` should `<do something>`."**

This is the canonical BDD signal. `should` implicitly allows you to challenge the
test's validity: _"Should it? Really?"_ — which helps identify tests that are outdated
vs. tests that caught a real regression.

**Violations to flag:**

- Missing `should` prefix
- Names using `will`, `shall`, `must`, `does` — these feel certain; `should`
  invites healthy questioning
- Names with `and` in them — likely covering two behaviours in one test

**Suggested fix pattern:** Split compound tests; prefix each with `should_`

---

### Principle 3 — One Behaviour Per Test

A single `should_` sentence can only describe one thing. If a test asserts multiple
unrelated outcomes, or its name requires "and", it is covering more than one behaviour.

**Violations to flag:**

- Multiple unrelated `assert` / `expect` calls without a single coherent behaviour tying them together
- Test names containing `_and_` to join two outcomes
- Large setup blocks suggesting the test is verifying an entire workflow

**Suggested fix pattern:** Split into two (or more) focused tests, each with its
own `should_` name.

---

### Principle 4 — Given / When / Then Structure

The test body should have three clearly separated phases:

- **Given** — initial context / setup
- **When** — the single action under test
- **Then** — the outcome(s) being verified

**Violations to flag:**

- Setup and assertion mixed together with no visual separation
- Multiple `When` actions (act → assert → act again)
- Missing `# Given` / `# When` / `# Then` comments in complex tests
- The "When" buried inside setup code
- The words `GIVEN` or `THEN` appearing literally in `describe()` or `it()` messages — these are structural concepts, not label prefixes. Writing `describe('GIVEN the order exists', ...)` is noise; write `describe('the order exists', ...)` instead.

**Suggested fix:** Add section comments and restructure so each phase is visually
distinct. Show before/after side by side. Strip `GIVEN`/`THEN` prefixes from
`describe`/`it` labels.

---

### Principle 5 — Tests Collectively Document the Class

Read all test names in sequence. Do they tell a coherent story about what the class
does? Would a new team member understand the class's behaviour from the test names
alone?

**Violations to flag:**

- Gaps: obvious behaviours untested, given what existing tests imply
- Overlap: two tests describing the same behaviour with different names
- Order chaos: unrelated tests interleaved with no logical grouping

**Suggested fix:** Reorder tests to group by scenario or feature area. Suggest names
for any obvious missing behaviours (clearly labelling them as suggestions, not requirements).

---

## Misplaced Behaviour Signal

If a test name cannot fit the template **"The `<CurrentClass>` should …"** without
sounding unnatural, the behaviour may belong in a different class.

Flag this as a **design smell**, not just a naming issue. Suggest introducing a
new class and injecting it via the constructor (dependency injection). This is a
common BDD-driven path to better separation of responsibilities.

---

## Quick Reference: Common Violations

| What you see                           | BDD violation            | Suggested fix                                                |
| -------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| `def test_calculation():`              | No behaviour described   | `def should_return_zero_for_empty_input():`                  |
| `def test_error_case():`               | Vague — what error?      | `def should_raise_when_input_is_negative():`                 |
| `def test_save_and_notify():`          | Two behaviours in one    | Split into `should_persist_entity` + `should_notify_on_save` |
| No `# Given/When/Then` in complex test | Structure unclear        | Add phase comments                                           |
| 10 asserts in one test                 | Multiple behaviours      | Split into focused tests                                     |
| `testDoSomething` (camelCase)          | No sentence; no `should` | `should_do_something_when_condition`                         |
| Test name describes implementation     | Tests _how_, not _what_  | Rename to describe the observable outcome                    |

---

## Tone of Suggestions

- **Be specific:** always show the improved test name or code snippet, not just the principle.
- **Be proportional:** a file with one naming issue doesn't need a full rewrite.
- **Acknowledge what works:** explicitly name tests that are already strong BDD examples.
- **Avoid over-engineering:** if a simple test is clear and focused, don't add structure for its own sake.
