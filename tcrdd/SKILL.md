---
name: test-commit-reverting
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

# TCRDD

Red/green/refactor driven by `git-gamble`: each phase runs the tests and auto-commits on the expected result or auto-reverts otherwise.

## Workflow

```
RED   → plan test → approval? → write test → diff approval? → git-gamble --red
        fail? commit → GREEN
        pass? revert → try again

GREEN → plan code → approval? → write code → diff approval? → git-gamble --green
        pass? commit → REFACTOR
        fail? revert → try again

REFACTOR → plan cleanup → approval? → refactor → diff approval? → git-gamble --refactor
           pass? commit → (loop or done or back to RED)
           fail? revert → try again
```

> No git-gamble installed? Do it manually: run the tests, `git commit` on the expected result, `git reset --hard` on the unexpected one.

---

## How to write code

Before each phase:

- [ ] Plan approved by user
- [ ] Diff approved by user before running `git-gamble`

### RED — Write a failing test

- Ask the user for the **smallest next behaviour** they want to add.
- Write _only enough_ of a test to fail — stop at the first compile error or failed assertion.

### GREEN — Write the minimum production code

- Write _only_ the code that makes the currently failing test pass. Nothing more.
- Resist the urge to generalise, add helpers, or handle future cases — those are for later tests.

### REFACTOR

- With all tests green, clean up both production and test code freely.

### REPEAT

- Ask the user whether the overall feature or fix is done.
  - **Not done** → back to RED
  - **Done** → squash the intermediate commits into one clean commit

---

## Error handling

| Situation                            | Action                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| `git-gamble` reverts your change     | The step was too large — split it into smaller increments and try again               |
| Tests are flaky (pass/fail randomly) | Fix or isolate the flaky test before continuing the cycle                             |
| `git-gamble` is not installed        | Run tests manually; `git commit` on expected result, `git reset --hard` on unexpected |

---

## Resources

| Read when                             | Link                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Need visual flowcharts for each phase | [git-gamble theory page](https://git-gamble.is-cool.dev/theory.html)                                  |
| Want the original TCR rationale       | [TCR — Kent Beck](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864)                  |
| Want deeper TDD cycle theory          | [The Cycles of TDD — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) |

## Upstream

| Before starting TCRDD                        | Skill         | Why                                                                |
| -------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| Unsure whether the feature is worth building | `kano-triage` | Classify the feature before investing in red/green/refactor cycles |
