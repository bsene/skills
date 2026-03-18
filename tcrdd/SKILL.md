---
name: tcrdd
description: Guide users through TCRDD (Test && Commit || Revert + Test Driven Development) — a disciplined TDD workflow that combines TCR's baby-step discipline with TDD's red-green-refactor cycle. Use this skill whenever a user mentions TCRDD, TCR, "test commit revert", "git gamble", or wants help with a strict TDD workflow using automatic commits and reverts. Also trigger when a user asks how to do TDD with automatic rollback, how to enforce baby steps in TDD, how to use git gamble, or how to combine TCR and TDD. Even if they just describe the pattern (write a failing test → commit on fail → make it pass → commit on pass → refactor → commit) without naming it, use this skill.
---

# TCRDD

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
