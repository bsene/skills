# BDD Test Review

## BDD Test Review

When a user shares test code and asks for a review, feedback, or improvements—especially if they mention vague test names, unclear intent, or want to know "if these follow BDD?"—use this section to audit against Dan North's BDD principles and produce actionable suggestions.

**Trigger phrases:** "check my tests", "are these tests good?", "review my test suite", "do these follow BDD?", "help me name my tests", or any paste of test code asking for feedback.

### Review Workflow

1. **Read All Tests First** — Build a mental model of what class or module is under test, what behaviors are covered, and what patterns repeat.

2. **Run the BDD Audit** — Check each test against all five BDD principles (see below). Mark each finding with severity.

3. **Produce a Structured Review** — Output findings organized by severity (🔴 Critical, 🟡 Minor, 🟢 Looks Good), with specific test names and improvement suggestions.

4. **Offer Rewritten Tests (if asked)** — Only rewrite tests with Critical or Minor findings; acknowledge tests that already pass.

### Severity Scale

| 🔴 Critical | Violates a core BDD principle; actively misleads readers or hides intent |
| 🟡 Minor | Weakens the test as documentation; easy to fix |
| 🟢 Looks Good | Follows BDD well — acknowledge it explicitly |

### The Five BDD Principles

#### Principle 1 — Test Names Are Sentences

A clear English sentence that a non-developer understands. Read the test name aloud (replace underscores/camelCase with spaces).

**Violations:** Names starting with `test_`, single-word vague names (`test_error`), or names describing _how_ code works rather than _what_ it does (`test_calls_repository`).

**Fix pattern:** Rename to `should_<outcome>_when_<condition>`

---

#### Principle 2 — Use the "should" Template

Every test name should fit: **"The `<ClassName>` should `<do something>`."**

The `should` prefix invites healthy questioning: _"Should it? Really?"_ — which helps identify outdated tests.

**Violations:** Missing `should` prefix, or using `will`, `shall`, `must`, `does` (which sound more certain).

**Fix pattern:** Prefix each test with `should_`

---

#### Principle 3 — One Behaviour Per Test

A single `should_` sentence describes one thing only. Multiple unrelated assertions or a test name with `_and_` signals it's covering more than one behaviour.

**Violations:** Multiple unrelated assertions, test names containing `_and_` to join outcomes, large setup blocks suggesting an entire workflow in one test.

**Fix pattern:** Split into focused tests, each with its own `should_` name.

---

#### Principle 4 — Given / When / Then Structure

The test body should have three clearly separated phases:
- **Given** — initial context / setup
- **When** — the single action under test
- **Then** — the outcome(s) being verified

**Violations:** Setup and assertion mixed together, multiple actions, missing structural comments, or using `GIVEN`/`THEN` as literal prefixes in test labels (noise).

**Fix:** Add section comments and restructure so each phase is visually distinct.

---

#### Principle 5 — Tests Collectively Document the Class

Read all test names in sequence. Do they tell a coherent story of what the class does?

**Violations:** Gaps (obvious untested behaviours), overlap (duplicate behaviours with different names), or order chaos (unrelated tests scattered).

**Fix:** Reorder tests by scenario or feature area; flag obvious missing behaviours.

---

### Misplaced Behaviour Signal

If a test name cannot fit the template **"The `<CurrentClass>` should …"** without sounding unnatural, the behaviour may belong in a different class.

Flag this as a **design smell** (not just a naming issue). Suggest introducing a new class and injecting it via the constructor (dependency injection).

---

### Quick Reference: Common Violations

| What you see | BDD violation | Suggested fix |
|---|---|---|
| `def test_calculation():` | No behaviour described | `def should_return_zero_for_empty_input():` |
| `def test_error_case():` | Vague — what error? | `def should_raise_when_input_is_negative():` |
| `def test_save_and_notify():` | Two behaviours in one | Split into `should_persist_entity` + `should_notify_on_save` |
| No `# Given/When/Then` in complex test | Structure unclear | Add phase comments |
| 10 asserts in one test | Multiple behaviours | Split into focused tests |
| Test name describes implementation | Tests _how_, not _what_ | Rename to describe the observable outcome |

---

