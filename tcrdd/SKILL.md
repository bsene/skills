---
name: tcrdd
description: >
  Guide users through TDD and TCRDD (Test && Commit || Revert + Test Driven Development).
  Use this skill whenever a user mentions TDD, test-driven development, writing tests before
  code, red-green-refactor cycles, or unit testing workflows. Also trigger when a user asks
  about TCRDD, TCR, "test commit revert", "git gamble", or wants a strict TDD workflow with
  automatic commits and reverts. Trigger when the user asks to implement a feature, fix a bug,
  or write a class/function and mentions tests, TDD, or "test first". If the user shares code
  and asks for a review with any testing angle, consult this skill.
---

# TDD — Test Driven Development

## The Three Rules (Uncle Bob)

Sources:
- http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd
- https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html

1. **You are not allowed to write any production code unless it is to make a failing unit test pass.**
2. **You are not allowed to write any more of a unit test than is sufficient to fail; and compilation failures are failures.**
3. **You are not allowed to write any more production code than is sufficient to pass the one failing unit test.**

## The Four Nested Cycles

The Three Rules operate at the finest granularity, but TDD is structured as four nested cycles at different timescales. Understanding all four prevents the most common failure modes.

| Cycle   | Timescale   | Name                         | What you do                                                                        |
| ------- | ----------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| Nano    | Seconds     | **Three Rules**              | Write one failing line → pass it → repeat                                          |
| Micro   | Minutes     | **Red / Green / Refactor**   | Complete one unit test → make it pass → clean up                                   |
| Milli   | ~10 minutes | **Specific / Generic**       | Check that production code is growing more general, not mirroring the tests        |
| Primary | ~1 hour     | **Architectural Boundaries** | Step back and verify you haven't crossed or blurred a major architectural boundary |

### Nano-cycle (seconds) — The Three Rules

The rules create a tight loop measured in _seconds_. At no point does the system stop compiling or all tests stop passing for more than a minute. If you walked up to any developer at any random moment, their code worked **a minute ago**.

### Micro-cycle (minutes) — Red / Green / Refactor

Once a full unit test is in place, apply RGR:

1. **Red** — Have a failing test.
2. **Green** — Write the minimum code to make it pass. Don't worry about structure yet.
3. **Refactor** — Clean up the mess. The tests are your safety net.

Refactoring is not a phase at the end of the project — it happens _every few minutes_, continuously.

### Milli-cycle (~10 min) — Specific / Generic

> _As the tests get more specific, the code gets more generic._

Watch for the symptom of over-specificity: production code that starts to resemble the test data. A healthy sign is that tests you _haven't written yet_ would already pass. An unhealthy sign is that each new test forces a narrowly targeted `if` or special case.

If you get **stuck** — meaning the next test would require a large out-of-cycle rewrite — backtrack. Delete recent tests, find an earlier branching point, and approach it with smaller, more general increments.

### Primary cycle (~1 hour) — Architectural Boundaries

Every hour or so, zoom out. Ask: are we drifting across a boundary we should be protecting? The nano and micro cycles are too fine-grained to catch architectural drift. Use this cycle to check alignment with the intended clean architecture, and let those decisions guide the next hour's nano/micro/milli work.

---

## How to Apply the Rules When Writing Code

### Step 1 — Write a failing test (Rule 1 + Rule 2)

- Pick the **smallest next behaviour** you want to add.
- Write _only enough_ of a test to fail. As soon as it won't compile, or an assertion fails — stop.
- Do not write the full test scenario at once; get it to a red state first.

### Step 2 — Write the minimum production code (Rule 3)

- Write _only_ the code that makes the currently failing test pass. Nothing more.
- Resist the urge to generalise, add helpers, or handle future cases — those are for later tests.
- If the simplest passing implementation feels like a "cheat" (e.g., returning a hardcoded value), that's fine. The next test will force you to generalise.

### Step 3 — Refactor

- With all tests green, clean up both production and test code freely.
- The tests act as a safety net; you can refactor without fear of breaking behaviour.

### Step 4 — Repeat

- Go back to Step 1. Pick the next smallest behaviour.
- Keep cycles short. If you feel stuck for more than a few minutes, the test increment is too big — break it down further.

## Key Principles

**Tests are the design.** Following TDD forces decoupling. Code that is testable in isolation is, by definition, decoupled. If a module is hard to test, that is a design signal — not a testing problem.

**Tests are living documentation.** Each test is a precise, executable example of how the system works. They are more useful than prose documentation because they cannot go out of sync with the production code.

**"Untestable code" is not a valid excuse.** If something seems hard to test, the answer is: (a) find a way to test it as-is, or (b) change the design so it becomes testable. Accepting untestable code is a slippery slope toward abandoning the discipline entirely.

**Bug fixing follows the same rules.** Before fixing a bug, write a failing test that reproduces it. The fix is only the code needed to make that test pass.

## Reviewing Code for TDD Compliance

When reviewing code or a PR with TDD in mind, check:

- [ ] Is there a test for every piece of production behaviour?
- [ ] Does each test assert one specific behaviour (not a giant integration scenario)?
- [ ] Could any production code be deleted without a test failing?
- [ ] Is the production code over-engineered relative to what the tests require?
- [ ] Are there any untested paths that suggest production code was written without a test first?
- [ ] Is the code decoupled enough to be tested in isolation (no hidden global state, hard-coded dependencies, etc.)?

## Common Pitfalls

| Pitfall                                       | What the rules say                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Writing the whole test before running it      | Stop as soon as the test fails to compile or an assertion fails (Rule 2)               |
| Writing more production code "while I'm here" | Only write what makes the current failing test pass (Rule 3)                           |
| Skipping tests for "obvious" code             | No production code without a failing test first (Rule 1)                               |
| Writing tests after the fact                  | Tests written after give you false confidence; the design wasn't shaped by them        |
| Large test increments                         | If an increment takes >10 minutes, break it into smaller steps                         |
| Getting stuck on the next test                | Production code is too specific — backtrack, delete recent tests, generalise           |
| Production code mirrors test data             | Tests are getting specific faster than code is getting general (milli-cycle violation) |

## Example Skeleton (TypeScript)

```typescript
// 1. Write a failing test — stops here: Stack doesn't exist yet
describe("Stack", () => {
  it("is empty on creation", () => {
    const stack = new Stack<number>();
    expect(stack.isEmpty()).toBe(true); // RED: Stack is undefined
  });
});

// 2. Write minimum production code to pass
class Stack<T> {
  isEmpty(): boolean {
    return true; // trivially passes — that's fine for now
  }
}

// 3. Refactor if needed, then write the next failing test
it("is not empty after push", () => {
  const stack = new Stack<number>();
  stack.push(1);
  expect(stack.isEmpty()).toBe(false); // RED: push doesn't exist, forces real impl
});

// 4. Minimum production code to pass the new test
class Stack<T> {
  private items: T[] = [];

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  push(item: T): void {
    this.items.push(item);
  }
}
```

Each test drives the next tiny increment of real behaviour.

---

# TCRDD — TCR + TDD

TCRDD = **TCR** (test && commit || revert) + **TDD** (Test Driven Development).

It blends the two disciplines so that:

- You always develop the _right_ thing (TDD's guarantee)
- You're encouraged to take _baby steps_, because reverting wipes out wrong work fast (TCR's guarantee)

The tool that automates this workflow is [`git-gamble`](https://git-gamble.is-cool.dev/).

---

## The Three Phases

TCRDD cycles through three phases. Each phase ends in either a **commit** (success) or a **revert** (failure → retry).

### 🔴 Red Phase — Write one failing test

Goal: produce exactly one new failing test.

1. Write a single test
2. Run `git gamble --red` — this _gambles_ that tests will fail
3. Actually run tests
4. **Tests pass** → revert (your test wasn't really new/failing), write another test, repeat
5. **Tests fail** → commit, move to Green

The revert-on-pass is the key TCR twist: if your "new" test passes immediately, you probably didn't add real coverage. Revert and try again.

### 🟢 Green Phase — Make all tests pass

Goal: write the _minimum_ code to make the failing test pass.

1. Write the minimum code
2. Run `git gamble --green` — gambles that tests will pass
3. Actually run tests
4. **Tests fail** → revert, try something else, repeat
5. **Tests pass** → commit, move to Refactor

Write only enough code to go green. No gold-plating.

### 🔵 Refactor Phase — Clean up without changing behaviour

Goal: improve code structure while keeping all tests green.

1. Rewrite/restructure code (behaviour must stay identical)
2. Run `git gamble --refactor` — gambles tests will pass
3. Actually run tests
4. **Tests fail** → revert, try a different refactor, repeat
5. **Tests pass** → commit
   - More to refactor? Loop within Refactor
   - More features to add? Go back to Red
   - Done? Finish

---

## Why the Revert Discipline Matters

TCR alone has a weakness: you never see a test fail, so:

- You might forget an `assert` (test always passes vacuously)
- You might assert the wrong thing (wrong variable)

TCRDD fixes this: the Red phase _requires_ a failing test before you can commit. If the tests don't fail, the work gets reverted. This forces you to confirm the test actually catches the missing behaviour.

---

## git-gamble Commands

| Command                 | Phase    | What it gambles     |
| ----------------------- | -------- | ------------------- |
| `git gamble --red`      | Red      | That tests **fail** |
| `git gamble --green`    | Green    | That tests **pass** |
| `git gamble --refactor` | Refactor | That tests **pass** |

Under the hood: `test && commit || revert` (TCR), but with the pass/fail expectation flipped for the Red phase.

---

## How to Guide Users Through TCRDD

When helping someone practice TCRDD:

1. **Identify their current phase.** Ask what they just did. Are they about to write a test (Red), about to make it pass (Green), or about to clean up (Refactor)?

2. **Coach the correct constraint for that phase.**
   - Red: "Write only one test. Don't write any implementation yet."
   - Green: "Write the minimum code — no more than needed to pass the test."
   - Refactor: "Only restructure. If you're adding behaviour, that's a new Red cycle."

3. **Remind about the gamble step.** Before running tests, the user should declare their expectation with `git gamble --<phase>`. This is what triggers the automatic commit or revert.

4. **When they get a surprise result**, help them understand why:
   - Unexpected pass in Red → their test didn't capture a real missing behaviour. Revert and rethink the test.
   - Unexpected fail in Green/Refactor → their change introduced a regression. Revert and try something smaller.

5. **Encourage baby steps.** If a user wants to implement a big chunk, help them break it into the smallest possible increment that would change the test outcome.

---

## Common Mistakes and How to Address Them

**"I'll write all the tests first, then implement"**
→ TCRDD requires one test at a time, one Red-Green-Refactor cycle at a time. This ensures each test has a clear purpose and that you see it fail.

**"I added the implementation while writing the test"**
→ The test and implementation must be separate commits. Write the test → commit on red → then write implementation → commit on green.

**"My refactor changed some behaviour slightly"**
→ If tests break, that's a sign behaviour changed. Revert the refactor. Either update the test first (new Red cycle) or find a purer structural refactor.

**"The revert erased too much work"**
→ This is intentional! It means the step was too big. Take a smaller step next time. This is how TCRDD enforces baby steps.

---

## Quick Reference Card

```
RED   → write 1 test → git gamble --red
        fail? commit → GREEN
        pass? revert → try again

GREEN → write min code → git gamble --green
        pass? commit → REFACTOR
        fail? revert → try again

REFACTOR → clean code → git gamble --refactor
           pass? commit → (loop or done or back to RED)
           fail? revert → try again
```

---

## Resources

- [git-gamble theory page](https://git-gamble.is-cool.dev/theory.html) — full visual flowcharts for each phase
- [git-gamble slides](https://git-gamble.is-cool.dev/slides_theory) — presentation version of the theory
- [TCR original post by Kent Beck](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864)
- [TDD (Wikipedia)](https://en.wikipedia.org/wiki/Test-driven_development)
