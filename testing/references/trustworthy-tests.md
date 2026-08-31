# Trustworthy & Maintainable Tests

Distilled from Osherove & Khorikov, _The Art of Unit Testing_, 3rd ed. (chapters 7, 8, 9).
Reviews a _test_ (not the production code) for trustworthiness, maintainability, and readability —
the book's three pillars. A test failing one pillar wastes everyone's time regardless of how the
production code looks.

## Why tests fail — and when to trust the failure

Only the first of these reasons is a test doing its job. Everything else is the test telling you
it can't be trusted in its current form:

| Failure reason              | Signal                                                                  | Remedy                                                                                              |
| --------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Real bug in production code | The good case                                                           | Fix the bug                                                                                         |
| Buggy test                  | False failure — wrong assert, wrong input, wrong entry-point invocation | Fix the test, then **prove it can fail** (below)                                                    |
| Out of date                 | New functionality (e.g. 2FA replaced login)                             | Adapt the test to the new behavior, or write a new test and delete the old one — don't disable it   |
| Conflicts with another test | Two tests pass/fail contradictorily                                     | One of them is now irrelevant — decide _which behavior is correct_ (product call), delete the other |
| Flaky                       | Passes and fails with no code change                                    | Fix or quarantine — see [flaky tests](#flaky-tests)                                                 |

Trust itself is behavioral: you trust a test when a failure makes you worry about the code, and a
pass lets you stop debugging. Anything less is a broken test, however green the build.

## Prove the test can fail

Never trust a test you haven't seen fail. After fixing a buggy test (or writing a new one):

1. Inject an obvious production bug (flip a Boolean, change a return value).
2. Run the test — it must fail. If it doesn't, the test has a bug; repeat.
3. Revert the bug, run again — it must pass.

TDD gets this for free (red comes before green); otherwise this 30-second ritual is the check.
Agents writing code and its tests together skip red for speed — this procedure restores the
guarantee after the fact. (See also [AI-agent testing](ai-agent-testing.md): the author's own
tests may codify the bug.)

## No logic in tests

The probability of bugs in a test grows with the logic it contains — and bugs in tests are the
worst kind because nobody suspects the test. Remove (or minimize) these from test bodies:

- `if` / `else` / `switch`, loops, `try`/`catch`, concatenation — any control flow or computation.

The most common instance is a dynamically computed expected value, which re-implements the rule
under test — the test carries the same bug it exists to catch:

```js
// Bad: the test repeats the algorithm — the same bug lives in both
expect(trust.makeGreeting(name)).toBe("hello" + name);

// Good: the expected value is hardcoded data
expect(trust.makeGreeting("abc")).toBe("hello abc");
```

(Extended version of the "leaking domain knowledge" rule in
[mocks-and-fragility](mocks-and-fragility.md); there the fix is one line — here the rule is
wholesale: tests contain `if`-free, loop-free, hardcoded expecteds.)

## Flaky tests

A test that fails with no production change destroys the meaning of every other red build. Once
found: fix the root cause (usually shared state, timing, or a real hidden race), or delete the
test — leaving it intermittently passing trains people to ignore red. For higher-level tests,
prevent flakiness up front: control time (fake timers — see [async-and-time](async-and-time.md)),
isolate state, and never rely on arbitrary sleeps (see [TestDesiderata](testdesiderata.md)'s
determinism smell).

## Maintainability refactorings (ch. 8)

| Practice                                   | Rule                                                                                                                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Factory/helper functions over `beforeEach` | Setup blocks invite abuse: initializing most-tests-relevant-only objects, hiding mocks, no parameters or return values. A factory function called in the arrange section keeps context in the test body where the reader is |
| Parameterized tests                        | If tests read alike, collapse with `test.each`-style tables — inputs/expecteds as data, one `it` per scenario class                                                                                                         |
| One exit point per test                    | A test with two mocks is two requirements in one; split by exit point (see [exit points](mocks-and-fragility.md))                                                                                                           |
| Avoid testing private/protected methods    | Already an anti-pattern in `SKILL.md`'s table — testing an internal contract that refactors freely while behavior stays put                                                                                                 |

Rule of three applies to test-code DRY too: extract setup/assert helpers once duplication
actually hurts, but not so far that the test body stops telling its own story (ch. 9's warning —
DRY taken too far hides intent).

## Readability (ch. 9)

- **Name = behavior**: test names read as sentences of what the system does, not which method was hit (see [principles.md](principles.md) Principle 4).
- **No magic values**: literals in assertions need a story — a constant named `MAX_RETRIES` beats a bare `5`.
- **Asserts separate from actions**: the assert section should contain only assertions.

## Anti-patterns (ch. 7, 8, 9)

| Anti-pattern                                                  | Why it hurts                                                         | Fix                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Test asserts nothing (or you wouldn't notice the assert gone) | Test passes on broken code — false sense of trust                    | Every test has at least one assert tied to the scenario's exit point |
| Tests that keep changing with the implementation              | You're paying per refactor with zero protection                      | Move asserts from method names/order to observable behavior          |
| Tests with branching/loops or dynamic expected values         | Test may carry the same bug it exists to catch                       | Hardcoded expected values; remove control flow                       |
| Multiple exit points in one test                              | Failure doesn't say which requirement broke                          | One concern per test, one mock max per test if any                   |
| Mixing unit and flaky integration tests in the same suite     | The unit suite goes red for reasons unrelated to behavior under test | Separate suites; keep the delivery-blocking tier deterministic       |
