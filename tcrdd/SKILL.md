---
name: tcrdd
description: >
  Test-Commit-Revert + TDD (TCRDD): red/green/refactor with per-phase auto-commit on success
  and auto-revert on failure, gated by user approval before code and before committing.

  TRIGGER when: user says TCRDD, TCR, TDD, red-green-refactor, "test-first", "write the test
  first", "let's TDD this", "baby steps", "commit on green", "revert on failure", "go step by
  step with tests"; user mentions `git-gamble`; user wants approval-gated pair programming on
  a feature; user wants disciplined test-then-code cadence with automatic commits.

  DO NOT use when: retrofitting tests onto existing code without behaviour change (use
  `testing` instead); one-off bug fix where per-phase commits add noise; no runnable test
  command available.

  Prefer this over `testing` when cadence and commit discipline matter, not just test
  authoring.
---

## Workflow

```
RED   → write 1 test → request approval from user → git-gamble --red
        fail? commit → GREEN
        pass? revert → try again

GREEN → write min code → request approval from user → git-gamble --green
        pass? commit → REFACTOR
        fail? revert → try again

REFACTOR → clean code → request approval from user → git-gamble --refactor
           pass? commit → (loop or done or back to RED)
           fail? revert → try again
```

> `git-gamble --<phase>` runs the tests and auto-commits when the result matches the phase's expectation, or auto-reverts otherwise. No git-gamble installed? Do it manually: run the tests, `git commit` on the expected result, `git reset --hard` on the unexpected one.

---

## How to write code

> Note: each phase has **two user checkpoints** — (1) state your plan and get approval **before writing any code**, then (2) show the diff and get approval **before running `git-gamble`**. The gamble is irreversible (auto-commit or auto-revert), so both checkpoints must happen while the change is still mutable.
>
> Keep cycles short. If you feel stuck for more than a few minutes, the test increment is too big — break it down further.

### RED — Write a failing test

- Ask the user for the **smallest next behaviour** they want to add.
- Write _only enough_ of a test to fail — stop at the first compile error or failed assertion. Don't write the full scenario upfront.

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
- **Tests pass** → commit, move to REFACTOR

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

## Coaching tips

- **Surprise pass in RED** → the test didn't capture new behaviour. Revert, rewrite the test.
- **Surprise fail in GREEN or REFACTOR** → the change regressed something. Revert, take a smaller step.
- **Stuck for more than a few minutes?** The increment is too big. Break the test down further.

## Resources

- [git-gamble theory page](https://git-gamble.is-cool.dev/theory.html) — full visual flowcharts for each phase
- [TCR original post by Kent Beck](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864)
- [The Three Rules of TDD — Uncle Bob](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)
- [The Cycles of TDD — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html)
- [TDD (Wikipedia)](https://en.wikipedia.org/wiki/Test-driven_development)
- [Test Desiderata — Kent Beck](https://testdesiderata.com/)
- [unit test — M. Fowler](https://martinfowler.com/bliki/UnitTest.html)
