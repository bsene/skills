---
name: testing
description: >
  Master testing strategy skill — the unified entry point for all testing questions,
  philosophy, and approach. Use this skill when the user asks about testing strategy,
  testing approach, testing philosophy, what kind of tests to write, testing best practices,
  testing methodology, or testing mindset. Also trigger on: "how should I test this?",
  "what's the best way to test?", "unit vs integration vs e2e", "what makes a good test?",
  "how do I know my tests are good?", "test quality", "my tests are brittle",
  "tests break when I refactor", "tests are flaky", "tests are too slow", "tests are hard
  to maintain", "testing a legacy codebase", "adding tests to existing code",
  "when to use mocks", "mocking strategy", "mocks vs fakes", "test doubles",
  "should I write tests first?", "test-driven", "testing anti-patterns", "how much to test",
  "test design", "testing architecture", "testing layers".
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

Specialist skill: Use `tcrdd` to practice TDD cycles; use `testdesiderata` to audit quality.

### Integration / Collaboration Tests (Some)

Test that two real components work together. Prefer real collaborators over mocks at this layer. It is acceptable to hit a real database or file system if using a test container or in-memory variant. Smoke tests live here—they validate critical-path integration scenarios without testing every permutation.

Specialist skill: Use `smoke-test` for the CI gate pattern.

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

Use this table to determine which approach fits your situation, then route to the specialist skill if needed.

| Situation | Recommended approach | Specialist skill |
|-----------|---------------------|-----------------|
| Starting a new feature from scratch | Write the test first (Red-Green-Refactor cycle) | `tcrdd` |
| Reviewing existing tests for quality | Audit against 12 properties (Isolation, Speed, Readability, Behavioral Sensitivity, etc.) | `testdesiderata` |
| Tests have vague names or unclear intent | Audit against BDD naming conventions and one-behavior-per-test principle | `bdd-unit-test-reviewer` |
| Setting up a CI gate for fast feedback | Smoke test suite pattern | `smoke-test` |
| Code is too hard to test | Apply Principle 1: refactor for dependency injection, pure cores | This skill (Principle 1) |
| Heavy mocking in tests | Apply Principle 2: replace mocks with fakes; redesign if needed | This skill (Principle 2) |
| Tests are slow | Apply Principle 3: push I/O to edges, unit-test the pure core | This skill (Principle 3) |
| Tests break on every refactor | Apply Principle 4; also `testdesiderata` property: Structural Insensitivity | `testdesiderata` |
| Untested legacy code, need to add tests | Mikado Method + Test Data Builders pattern | `mikado-method` |

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

## Specialist Skills

This skill covers *why* and *when*. For the *how* and deep dives, route to the specialist skills below:

```
testing/                    ← you are here (strategy & philosophy)
├── testdesiderata          ← test quality review (12 properties)
├── bdd-unit-test-reviewer  ← test naming, structure, BDD audit
├── tcrdd                   ← TDD workflow, red/green/refactor, TCRDD
└── smoke-test              ← CI smoke test suite, critical path validation
```

| If the user says... | Route to |
|---------------------|----------|
| "Review my tests", "are these tests good?" | `testdesiderata` (all 12 properties) or `bdd-unit-test-reviewer` (naming/structure) |
| "Help me name my tests", "follow BDD?", "unclear what the test does" | `bdd-unit-test-reviewer` |
| "Walk me through TDD", "write tests first", "red/green/refactor" | `tcrdd` |
| "Set up a smoke test", "fast CI feedback", "critical-path validation" | `smoke-test` |
| "What's wrong with my test strategy?", "my tests feel wrong" | This skill — diagnose using Principles 1–4 and the anti-patterns table, then route |

---

## How to Use This Skill

### 1. Describe Your Situation

"I'm about to add a feature — how should I approach testing it?" This skill gives you a strategy. If you need a detailed TDD walkthrough, it routes to `tcrdd`.

### 2. Paste Code for Diagnosis

"Here's my test suite — something feels off." This skill applies the four principles and the anti-patterns table to diagnose the issue, then routes to a specialist skill for the detailed fix.

### 3. Ask About a Pain Point

"My tests break every time I refactor." This skill identifies the root cause (Structural Insensitivity in testdesiderata terms), explains the fix (test behavior, not implementation), and routes to `testdesiderata` for the full framework.

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
