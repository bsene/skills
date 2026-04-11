---
name: tcrdd
description: >
  Test-Commit-Revert + TDD: a disciplined red/green/refactor loop where each phase auto-commits on success
  and auto-reverts on failure via `git gamble`. A reliable way to add "clean code that works" (Ron Jeffries).
  Use when the user asks to start a TCRDD / TCR / TDD cycle, mentions red-green-refactor, wants to use
  `git-gamble`, or wants to pair on TDD. Implementation is done pair-programming style between the agent
  and the user.
---

## Workflow

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

> `git-gamble --<phase>` runs the tests and auto-commits when the result matches the phase's expectation, or auto-reverts otherwise. No git-gamble installed? Do it manually: run the tests, `git commit` on the expected result, `git reset --hard` on the unexpected one.

---

## The Three Rules

- http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd
- https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html

---

## How to write code

> Note: each phase has **two user checkpoints** — (1) state your plan and get approval **before writing any code**, then (2) show the diff and get approval **before running `git-gamble`**. The gamble is irreversible (auto-commit or auto-revert), so both checkpoints must happen while the change is still mutable.
>
> Keep cycles short. If you feel stuck for more than a few minutes, the test increment is too big — break it down further.

### RED — Write a failing test

- Ask user the **smallest next behaviour** he/she want to add.
- Write _only enough_ of a test to fail. As soon as it won't compile, or an assertion fails — stop.
- Do not write the full test scenario at once; get it to a red state first.

After that, run: `git-gamble --red`

Post actions:

- **Tests pass** → revert (your test wasn't really new/failing), write another test, repeat
- **Tests fail** → commit, move to GREEN

### GREEN — Write the minimum production code

- Write _only_ the code that makes the currently failing test pass. Nothing more.
- Resist the urge to generalise, add helpers, or handle future cases — those are for later tests.
- If the simplest passing implementation feels like a "cheat" (e.g., returning a hardcoded value), that's fine. The next test will force you to generalise.

After that, run: `git-gamble --green`

Post actions:

- **Tests fail** → revert, try something else, repeat
- **Tests pass** → commit, move to Refactor

### REFACTOR

- With all tests green, clean up both production and test code freely.
- The tests act as a safety net; you can refactor without fear of breaking behaviour.

After that, run: `git-gamble --refactor`

Post actions:

- **Tests fail** → revert, try a different refactor, repeat
- **Tests pass** → commit, then:
  - **refactor opportunities found** → repeat REFACTOR
  - **more features to add** → back to RED
  - **feature done** → move to REPEAT

### REPEAT

- Ask the user whether the overall feature or fix is done.
  - **Not done** → back to RED
  - **Done** → squash the intermediate commits into one clean commit

---

## How to Guide Users Through TCRDD

When helping someone practice TCRDD:

1. **Identify their current phase.** Ask what they just did. Are they about to write a test (Red), about to make it pass (Green), or about to clean up (Refactor)?

2. **Coach the correct constraint for that phase.**
   - Red: "Write only one test. Don't write any implementation yet."
   - Green: "Write the minimum code — no more than needed to pass the test."
   - Refactor: "Only restructure. If you're adding behaviour, that's a new Red cycle."

3. **Remind about the gamble step.** Before running tests, the user should declare their expectation with `git-gamble --<phase>`. This is what triggers the automatic commit or revert.

4. **When they get a surprise result**, help them understand why:
   - Unexpected pass in Red → their test didn't capture a real missing behaviour. Revert and rethink the test.
   - Unexpected fail in Green/Refactor → their change introduced a regression. Revert and try something smaller.

5. **Encourage baby steps.** If a user wants to implement a big chunk, help them break it into the smallest possible increment that would change the test outcome.

## Resources

- [git-gamble theory page](https://git-gamble.is-cool.dev/theory.html) — full visual flowcharts for each phase
- [TCR original post by Kent Beck](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864)
- [TDD (Wikipedia)](https://en.wikipedia.org/wiki/Test-driven_development)
