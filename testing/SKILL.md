---
name: testing
description: >
  Master testing strategy skill — the unified entry point for all testing questions,
  philosophy, approach, and practical tactics. Use this skill when the user asks about testing strategy,
  testing approach, testing philosophy, what kind of tests to write, testing best practices,
  testing methodology, or testing mindset. Also trigger on: "how should I test this?",
  "what's the best way to test?", "unit vs integration vs e2e", "what makes a good test?",
  "how do I know my tests are good?", "test quality", "my tests are brittle",
  "tests break when I refactor", "tests are flaky", "tests are too slow", "tests are hard
  to maintain", "testing a legacy codebase", "adding tests to existing code",
  "when to use mocks", "mocking strategy", "mocks vs fakes", "test doubles",
  "should I write tests first?", "test-driven", "testing anti-patterns", "how much to test",
  "test design", "testing architecture", "testing layers", "check my tests", "review my test suite",
  "do these follow BDD?", "help me name my tests", "test desiderata", "12 properties",
  "determinism", "behavioral sensitivity", "structural insensitivity", "smoke test", "smoke testing",
  "sanity check", "critical path test", "fast CI gate", "regression gate", "quick validation",
  "run smoke tests", "identify smoke tests", or when the user shares test code asking for feedback.
---

# Testing — Strategy & Philosophy

Testing is not verification after the fact. It is feedback on design. A test that is hard to write reveals coupling in production code. A test that is hard to name reveals unclear thinking about behavior. The test suite is the living specification of the system—what the code is actually supposed to do.

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

### Unit Tests (Most)

Test a single behavior in isolation. Zero or minimal setup; no I/O, no network, no database. When unit tests require heavy mocking, that is a design signal—the code under test has too many dependencies. The solution is refactoring, not better mocks.

Specialist guidance: Use `tcrdd` for TDD workflow practice; see TestDesiderata section below to audit quality.

### Integration / Collaboration Tests (Some)

Test that two real components work together. Prefer real collaborators over mocks at this layer. It is acceptable to hit a real database or file system if using a test container or in-memory variant. Smoke tests live here—they validate critical-path integration scenarios without testing every permutation.

Specialist guidance: See the Smoke Tests section below for the CI gate pattern and practical implementation.

### End-to-End Tests (Few)

Validate the full user-facing workflow. Expensive to maintain; reserve for highest-value flows only. Flakiness at this layer is a system design problem (non-deterministic I/O, timing dependencies), not a test problem.

| Layer | Count | Speed | Purpose | Fragility |
|-------|-------|-------|---------|-----------|
| **Unit** | Many | ms | Behavior specification | Low if behavior-focused |
| **Integration** | Some | seconds | Collaboration contracts | Medium |
| **E2E / Smoke** | Few | seconds–minutes | User journey confidence | High — minimize |

---

## The Four Cross-Cutting Principles

### Principle 1: Testability is a Design Signal

If code is hard to test, the test is telling you something real about the design. The correct response is not to add more mocks—it is to change the design.

```typescript
// Anti-pattern: hard to test because of hidden dependency
class OrderProcessor {
  process(order: Order): void {
    const db = new Database();          // hard dependency — requires mocking Database
    const emailer = new Emailer();      // same
    db.save(order);
    emailer.send(order.customer, "Confirmed");
  }
}

// Preferred: inject dependencies — testable without any mocks
class OrderProcessor {
  constructor(
    private readonly db: OrderRepository,
    private readonly emailer: Notifier,
  ) {}

  process(order: Order): void {
    this.db.save(order);
    this.emailer.send(order.customer, "Confirmed");
  }
}

// In tests: pass in a fake (not a mock)
const db = new InMemoryOrderRepository();
const emailer = new SpyNotifier();
const processor = new OrderProcessor(db, emailer);
processor.process(order);
expect(db.find(order.id)).toBeDefined();
```

### Principle 2: Mocks are a Smell — Prefer Fakes

Mocks assert on implementation details (which methods were called, in what order). Fakes implement the real interface with in-memory behavior. Mock-heavy tests survive bugs because they only check that methods were invoked, not what actually happened.

```typescript
// Anti-pattern: mock asserts HOW (implementation), breaks on refactor
const mockRepo = { save: jest.fn() };
processor.process(order);
expect(mockRepo.save).toHaveBeenCalledWith(order); // fails if method renames

// Preferred: fake asserts WHAT (behavior), survives refactors
class InMemoryOrderRepository implements OrderRepository {
  private store: Order[] = [];
  save(order: Order): void { this.store.push(order); }
  find(id: string): Order | undefined { return this.store.find(o => o.id === id); }
}

processor.process(order);
expect(db.find(order.id)).toBeDefined(); // tests actual behavior
```

### Principle 3: Pure Functions are the Testability Ideal

The more a function depends only on its arguments and produces only a return value, the easier it is to test and reason about. Push side effects (I/O, network, DB, time) to the edges. Keep business logic pure.

```typescript
// Anti-pattern: mixed logic and I/O, hard to test in isolation
async function calculateAndSaveDiscount(userId: string): Promise<void> {
  const user = await db.getUser(userId);              // I/O
  const discount = user.isPremium ? 0.2 : 0.05;      // logic
  await db.saveDiscount(userId, discount);            // I/O
}

// Preferred: pure core isolated from I/O
function calculateDiscount(isPremium: boolean): number {
  return isPremium ? 0.2 : 0.05;
}
// Trivially tested: expect(calculateDiscount(true)).toBe(0.2)

// I/O wired at the edges (integration-tested separately)
async function applyDiscount(userId: string): Promise<void> {
  const user = await db.getUser(userId);
  await db.saveDiscount(userId, calculateDiscount(user.isPremium));
}
```

### Principle 4: Tests are Specification — Name Them Accordingly

Test names are the living documentation of behavior. Read the test names in a file: do they tell the story of what the module does? If test names use implementation terminology ("handleClick", "test_error"), the behavior is not yet understood.

```typescript
// Anti-pattern: names describe implementation or are vague
test("processOrder", ...);
test("test1", ...);
test("handles errors", ...);

// Preferred: names describe behavior from the user's perspective
it("should confirm the order when payment succeeds", ...);
it("should reject the order when the cart is empty", ...);
it("should notify the customer by email after confirmation", ...);
```

---

## Decision Guide

Use this table to determine which approach fits your situation.

| Situation | Recommended approach |
|-----------|---------------------|
| Starting a new feature from scratch | Write the test first (Red-Green-Refactor cycle) — see `tcrdd` specialist skill |
| Reviewing existing tests for quality | Audit against 12 properties (Isolation, Speed, Readability, Behavioral Sensitivity, etc.) — see TestDesiderata section below |
| Tests have vague names or unclear intent | Audit against BDD naming conventions and one-behavior-per-test principle — see BDD Review section below |
| Setting up a CI gate for fast feedback | Smoke test suite pattern — see Smoke Tests section below |
| Code is too hard to test | Apply Principle 1: refactor for dependency injection, pure cores |
| Heavy mocking in tests | Apply Principle 2: replace mocks with fakes; redesign if needed |
| Tests are slow | Apply Principle 3: push I/O to edges, unit-test the pure core |
| Tests break on every refactor | Apply Principle 4; audit TestDesiderata property: Structural Insensitivity |
| Untested legacy code, need to add tests | Mikado Method + Test Data Builders pattern — see `mikado-method` specialist skill |

---

## Testing Anti-Patterns

| Anti-pattern | Symptom | Root cause | Fix |
|---|---|---|---|
| Mock everything | Tests pass; bugs slip through into production | Low behavioral sensitivity; mocks assert implementation, not behavior | Replace mocks with fakes or real collaborators |
| Test the implementation | Tests break on rename/refactor; fragile suite | Structural sensitivity too high; tests couple to how the code works, not what it does | Test observable behavior only, not internals |
| Giant setup blocks | 40 lines of `beforeEach`, 1 assertion; tests hard to understand | Tangled code with no seams for testing; no dependency injection | Redesign for injection; use Test Data Builder pattern |
| One giant test | Hard to know what failed when test breaks | Multiple behaviors crammed into one test | Split — one behavior per test (BDD Principle 3) |
| Vague test names | `test_error`, `handleCase2`, `test123`; spec is unclear | Tests written as afterthought, not part of design | Rename using `should_<behavior>_when_<condition>` pattern |
| Tests written after the fact | False confidence; design not shaped by tests; missed edge cases | Tests seen as QA step, not design feedback | Practice TDD: write failing test first, then code |
| Flaky tests | Intermittent failures, ignored in CI; low confidence | Non-deterministic state (time, DB order, async timing, network) | Control time with test doubles; isolate state; use fakes instead of real I/O |

---

## TestDesiderata — Quality Audit

TestDesiderata identifies twelve properties that tests _should_ have. These properties don't exist in isolation—some support each other, while others compete. The goal is to consciously choose which matter most for your context.

### The Twelve Properties

| Property | What it means |
|----------|---------------|
| **Isolation** | Tests run independently; one test's failure doesn't affect others |
| **Composability** | Test logic can be reused & combined; patterns extracted into helpers |
| **Determinism** | Tests produce consistent results every time; no flakiness |
| **Speed** | Tests run quickly; feedback is immediate |
| **Readability** | Test intent is obvious; a reader understands it without deep investigation |
| **Behavioral Sensitivity** | Tests fail when actual code behavior changes; they catch real bugs |
| **Structural Insensitivity** | Tests survive refactoring; implementation changes don't break them |
| **Automation** | Tests run automatically in CI/CD without manual steps |
| **Specificity** | Each test validates one focused thing |
| **Predictiveness** | Passing tests give confidence the code works in production |
| **Inspirational Confidence** | Test results make developers want to refactor without fear |
| **Clarity of Purpose** | The "why" of the test is evident |

### How to Review Against TestDesiderata

When a user shares test code and asks for a review, provide:

1. **Quick Assessment** — brief overview of test health against the 12 properties
2. **Property-by-Property Breakdown** — for relevant properties:
   - ✅ **Strength** — what the test does well
   - ⚠️ **Concern** — where it could improve
   - 💡 **Suggestion** — concrete improvement (with code examples)
3. **Trade-offs** — acknowledge when improving one property affects another (e.g., speed vs. behavioral sensitivity), and point out design wins where multiple properties can improve simultaneously
4. **Priority Improvements** — ranked by impact and effort—quick wins first

### Key Principles

#### Properties Support Each Other
- **Isolation** + **Speed** — independent tests run in parallel
- **Composability** + **Behavioral Sensitivity** — reusable helpers catch real behavior changes
- **Readability** + **Specificity** — focused tests are easier to understand

#### Properties Can Conflict
- **Speed** vs. **Behavioral Sensitivity** — fast tests often mock more (reducing sensitivity)
- **Structural Insensitivity** vs. **Specificity** — broad tests might ignore critical details
- **Composability** vs. **Readability** — helper abstractions sometimes hide test intent

#### Design Wins Exist
Smart design can resolve apparent conflicts. For example:
- **Composability + Speed:** Extract setup into reusable, fast helper builders
- **Behavioral Sensitivity + Structural Insensitivity:** Test behavior at the API boundary, not internals
- **Readability + Specificity:** Name tests so they clearly state what one thing they validate

### Common Test Smells

#### Determinism Issues
- Tests that pass/fail randomly
- Async tests with arbitrary waits (`setTimeout(500)`)
- Tests depending on external state (time, filesystem, database)

**TestDesiderata lens:** Determinism problem. Solution: Control time, use fakes, isolate state.

#### Behavioral Sensitivity Issues
- Mocking the entire system under test
- Tests that pass when code is broken
- Changes to code behavior don't trigger test failures

**TestDesiderata lens:** Behavioral sensitivity too low. Solution: Hit real code paths, minimize mocks.

#### Structural Insensitivity Issues
- Tests break when you refactor variable names
- Tests fail when you move code from one file to another
- Tests coupled to class structure or private methods

**TestDesiderata lens:** Structural insensitivity too low. Solution: Test behavior, not implementation.

#### Readability Issues
- 50-line test setup; actual assertion is 1 line
- Test names that don't describe what's being tested
- Unclear what inputs matter vs. boilerplate

**TestDesiderata lens:** Readability problem. Solution: Extract setup, name clearly, show intent.

### Reference: Kent Beck's Vision

Kent Beck emphasizes that great tests:
1. Distinguish signal (important behaviors) from noise (implementation details)
2. Build confidence through quick feedback
3. Enable fearless refactoring
4. Document behavior, not implementation

TestDesiderata operationalizes this by giving you twelve properties to consciously balance.

---

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

## Smoke Tests

Smoke tests are minimal, rapid tests that validate critical user-facing functionality and core workflows. They run quickly and catch major failures before slower integration or performance tests.

### What Are Smoke Tests?

A smoke test verifies that:

1. **Core features work** — the application starts, main entry points execute
2. **Critical paths execute** — key user workflows complete without exceptions
3. **System integration is intact** — major components communicate correctly

**Characteristics:**
- Minimal setup; no deep behavior verification
- Fast execution (seconds, not minutes)
- Broad coverage of happy paths
- High signal-to-noise ratio (if smoke tests fail, the build is broken)

### Task 1: Identify Smoke Tests

Smoke tests in Jest/Vitest can be marked several ways:

#### Pattern 1: Skip Other Tests (Run Smoke Only)

```javascript
describe('Smoke Tests', () => {
  it.only('should load the application', () => {
    expect(app.isReady()).toBe(true);
  });
});

describe('Full Feature Tests', () => {
  it('should handle edge case X', () => {
    // Skipped if smoke tests use .only above
  });
});
```

**Detection:** Look for `describe.only(...)` or `it.only(...)`

#### Pattern 2: Dedicated `smoke` Group

```javascript
describe.skip('Smoke Tests', () => {
  it('should load app', () => { ... });
  it('should initialize core service', () => { ... });
  it('should connect to database', () => { ... });
});
```

**Detection:** Look for `describe('Smoke Tests')` or comments `// @smoke` or `@critical`

#### Pattern 3: Filename Convention

```
tests/
  smoke/                    # Smoke tests directory
    load.test.js
    core-service.test.js
  unit/                     # All other tests
  integration/
```

**Detection:** Tests in a `smoke/` or `smoke-tests/` directory

#### Pattern 4: Custom Markers (Comments or Tags)

```javascript
// @smoke @critical
describe('Load Test', () => {
  it('should initialize the app', () => { ... });
});
```

**Detection:** Grep for `@smoke`, `@critical`, `@fast`, or tags in test files

### Task 2: Run Smoke Tests

#### Command: Run Smoke Tests Only

**Using `--testPathPattern` (directory-based):**
```bash
npm test -- --testPathPattern='smoke'
# or with Vitest
npm test -- --grep '@smoke'
```

**Using `--testNamePattern` (name-based):**
```bash
npm test -- --testNamePattern='Smoke Tests'
# Runs all tests in any describe/it with "Smoke Tests" in the name
```

**Using `.only` in code:**
If tests are marked with `it.only(...)`, run normally:
```bash
npm test
# Only .only tests execute; others skip automatically
```

#### Workflow: Running Smoke Tests

1. **Identify smoke tests** (see Task 1 above)
2. **Choose command** based on your marking strategy:
   - Directory: `npm test -- --testPathPattern='smoke'`
   - Name pattern: `npm test -- --testNamePattern='Smoke'`
   - `.only` marker: `npm test` (no args needed)
3. **Capture output**:
   ```bash
   npm test -- --testPathPattern='smoke' --verbose
   # or
   npm test -- --testPathPattern='smoke' --coverage
   ```
4. **Interpret results**:
   - ✅ All pass → critical paths are healthy
   - ❌ Any fail → the build is blocked; investigate immediately
   - ⚠️ Flaky → smoke test is unreliable; remove or fix

### Task 3: Generate Smoke Test Template

Use this template as a starting point. Adapt it to your application's architecture.

```javascript
/**
 * Smoke Tests — Critical Path Validation
 *
 * These tests verify that core features and system integration are intact.
 * Run before slower integration/performance tests.
 *
 * Run with: npm test -- --testPathPattern='smoke'
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/db';

describe('Smoke Tests', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Minimal setup for smoke tests
    db = await connectDatabase();
    app = createApp({ db });
  });

  afterAll(async () => {
    await app.close();
    await db.close();
  });

  // ===== Core System =====

  it('should initialize the application', () => {
    expect(app).toBeDefined();
    expect(app.isRunning()).toBe(true);
  });

  it('should establish database connection', () => {
    expect(db.isConnected()).toBe(true);
  });

  it('should load configuration', () => {
    const config = app.getConfig();
    expect(config).toBeDefined();
    expect(config.port).toBeDefined();
  });

  // ===== Critical User Workflows =====

  it('should authenticate a valid user', async () => {
    const result = await app.auth.login('user@example.com', 'password');
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });

  it('should create a resource (happy path)', async () => {
    const resource = await app.api.post('/resources', {
      name: 'Test Resource'
    });
    expect(resource.id).toBeDefined();
    expect(resource.name).toBe('Test Resource');
  });

  it('should retrieve created resource', async () => {
    const resource = await app.api.get('/resources/1');
    expect(resource).toBeDefined();
    expect(resource.name).toBe('Test Resource');
  });

  it('should list resources', async () => {
    const list = await app.api.get('/resources');
    expect(Array.isArray(list)).toBe(true);
  });

  // ===== System Integration =====

  it('should serve the health check endpoint', async () => {
    const health = await app.api.get('/health');
    expect(health.status).toBe('ok');
  });

  it('should return valid error responses', async () => {
    const result = await app.api.get('/resources/999');
    expect(result.statusCode).toBe(404);
    expect(result.error).toBeDefined();
  });
});
```

#### Smoke Test Guidelines

| Aspect | ✅ Do | ❌ Don't |
|--------|-------|---------|
| **Scope** | Test critical workflows | Test every edge case |
| **Setup** | Minimal, reusable fixtures | Complex multi-step setup |
| **Assertions** | 1–3 per test, focused | Many assertions per test |
| **Time** | <100ms per test | Slow, resource-heavy tests |
| **Maintenance** | Stable, rarely change | Break on implementation changes |
| **Coverage** | Broad paths, not deep | Deep internal behavior |

### Quick Reference: Smoke Test Checklist

- [ ] Identify where smoke tests live (directory, `.only`, or naming convention)
- [ ] List all critical user workflows (auth, create, read, update, list, etc.)
- [ ] Write 5–10 focused smoke tests covering happy paths
- [ ] Add a `beforeAll` setup and `afterAll` teardown
- [ ] Run smoke tests in isolation: `npm test -- --testPathPattern='smoke'`
- [ ] Ensure all smoke tests pass before running full suite
- [ ] Integrate smoke tests into CI pipeline as a first-pass gate

### Integration: Smoke Tests in CI/CD

Add this to your GitHub Actions / GitLab CI:

```yaml
# GitHub Actions example
- name: Run Smoke Tests
  run: npm test -- --testPathPattern='smoke'
  if: always()

- name: Run Full Test Suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

Smoke tests act as a **gate**: if they fail, skip the slower suite.

### Common Patterns & Pitfalls

#### ✅ Good: Broad Coverage, Minimal Depth

```javascript
it('should process payment', async () => {
  const result = await app.payments.charge({ amount: 100 });
  expect(result.success).toBe(true);
  // That's it. Don't verify internal state, audit logs, etc.
});
```

#### ❌ Bad: Too Deep, Slow, Maintenance Burden

```javascript
it('should process payment and verify all downstream effects', async () => {
  const order = await app.orders.create({ ... });
  const invoice = await app.invoices.generate(order.id);
  const notification = await app.notifications.send(order.customerId);
  const balance = await app.accounting.updateBalance(order.customerId);
  // 4 unrelated assertions in one test. Harder to debug.
});
```

#### ⚠️ Flaky Smoke Tests

If a smoke test fails inconsistently:

1. **Isolate the failure** — does it fail in isolation? (`npm test -- --testPathPattern='specific-test'`)
2. **Add a timeout** — is async/timing the issue?
3. **Remove from smoke suite** — move to integration tests
4. **Fix the root cause** — often test isolation or shared state

---

## Specialist Skills

This skill covers *why*, *when*, and *how*. For TDD workflow deep dives, route to the specialist skill below:

```
testing/    ← you are here (strategy, philosophy, BDD review, TestDesiderata, smoke tests)
└── tcrdd   ← TDD workflow, red/green/refactor, TCRDD
```

| If the user says... | What to do |
|---------------------|-----------|
| "Review my tests", "are these tests good?" | Use TestDesiderata section (above) for quality review against 12 properties |
| "Help me name my tests", "follow BDD?", "unclear what the test does" | Use BDD Review section (above) |
| "Walk me through TDD", "write tests first", "red/green/refactor" | Route to `tcrdd` specialist skill |
| "Set up a smoke test", "fast CI feedback", "critical-path validation" | Use Smoke Tests section (above) |
| "What's wrong with my test strategy?", "my tests feel wrong" | Diagnose using Principles 1–4 and the anti-patterns table, then reference relevant sections |

---

## How to Use This Skill

### 1. Describe Your Situation

"I'm about to add a feature — how should I approach testing it?" This skill gives you a strategy. If you need a detailed TDD walkthrough, it routes to `tcrdd`.

### 2. Paste Code for Diagnosis

"Here's my test suite — something feels off." This skill applies the four principles and the anti-patterns table to diagnose the issue, then routes to a specialist skill for the detailed fix.

### 3. Ask About a Pain Point

"My tests break every time I refactor." This skill identifies the root cause (Structural Insensitivity per the TestDesiderata property), explains the fix (test behavior, not implementation), and the TestDesiderata section provides the full framework.

---

## Key Takeaway

> If a test is hard to write, the test is correct—the design is wrong.  
> If a test name is hard to read, the behavior is not yet understood.  
> Tests that survive refactoring test behavior. Tests that break on refactoring test implementation.

---

## References

- Kent Beck & Kelly Sutton — TestDesiderata: https://testdesiderata.com/
- Dan North — Introducing BDD: https://dannorth.net/introducing-bdd/
- Kent Beck — Test && Commit || Revert: https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864
- Uncle Bob — The Three Rules of TDD: http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd
- Martin Fowler — Test Pyramid: https://martinfowler.com/bliki/TestPyramid.html
- Eric Elliott — Composing Software (mocks vs fakes): https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc
- Wikipedia — Smoke Testing: https://en.wikipedia.org/wiki/Smoke_testing
- Vitest CLI Options: https://vitest.dev/config/
- Jest CLI Options: https://jestjs.io/docs/cli
