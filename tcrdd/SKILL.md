---
name: tcrdd
description: >
  Test-Commit-Revert + TDD (TCRDD): red/green/refactor with per-phase auto-commit on success
  and auto-revert on failure, gated by user approval before code and before committing.

  TRIGGER when: user says TCRDD, TCR, TDD, red-green-refactor, "test-first", "write the test
  first", "let's TDD this", "baby steps", "commit on green", "revert on failure", "go step by
  step with tests"; user mentions `git-gamble`; user wants approval-gated pair programming on
  a feature; user wants disciplined test-then-code cadence with automatic commits.

  DO NOT USE when: retrofitting tests onto existing code without behaviour change (use
  `testing` instead); one-off bug fix where per-phase commits add noise; no runnable test
  command available.

  Prefer this over `testing` when cadence and commit discipline matter, not just test
  authoring.
---

# TCRDD

Red/green/refactor driven by `git-gamble`: each phase runs the tests and auto-commits on the expected result or auto-reverts otherwise.

## Mode

- **Interactive** (a human is in the loop): use the approval gates below — plan approval, then diff approval before each `git-gamble`.
- **Autonomous** (no human available to approve, e.g. running unattended): **just run the loop.** Approval gates are optional — skip them and proceed. Still commit per phase and still take one baby step at a time. Do **not** freeze waiting for an approval that will never come.

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

Before each phase (**interactive mode only** — skip in autonomous mode, see Mode):

- [ ] Plan approved by user
- [ ] Diff approved by user before running `git-gamble`

> **One step at a time — never one-shot.** Each phase advances by exactly one baby step:
> one failing test, then the minimum code to pass it. Do **not** write the whole test
> suite or the full implementation in a single pass, even in autonomous mode. One pass =
> wrong. Loop instead.

### RED — Write a failing test

- Ask the user for the **smallest next behaviour** they want to add (in autonomous mode, pick the smallest next behaviour yourself).
- Write _only enough_ of a test to fail — stop at the first compile error or failed assertion.

### GREEN — Write the minimum production code

- Write _only_ the code that makes the currently failing test pass. Nothing more.
- Resist the urge to generalise, add helpers, or handle future cases — those are for later tests.
- No `@Injectable`, no logger, no Zod — unless the failing test explicitly requires it.

### REFACTOR

- With all tests green, clean up both production and test code freely.

### REPEAT

- Ask the user whether the overall feature or fix is done.
  - **Not done** → back to RED
  - **Done** → squash the intermediate commits into one clean commit

---

## Example: baby step vs one-shot

Feature: a `Cart.total()` that sums line items and applies a discount code.

✅ **Correct (one baby step):**

```
RED:   write a test asserting total() of an empty cart is 0 → fails (no method) → commit
GREEN: add total() returning 0 → passes → commit
RED:   write a test for one item → fails → commit
GREEN: sum the items → passes → commit
... (discount handled by a later RED/GREEN, not now)
```

❌ **Wrong (one-shot — what breaks weaker models):**

```
Write all five tests at once, then a complete Cart with summing + discount logic,
then a single squashed commit. No red/green cadence, no revert safety.
```

The skill is the loop. If you produce a finished feature in one turn, you did not run TCRDD.

---

## Error handling

| Situation                            | Action                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| `git-gamble` reverts your change     | The step was too large — split it into smaller increments and try again               |
| Tests are flaky (pass/fail randomly) | Fix or isolate the flaky test before continuing the cycle                             |
| `git-gamble` is not installed        | Run tests manually; `git commit` on expected result, `git reset --hard` on unexpected |

---

## Read On Demand

| Read when                             | Link                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Need visual flowcharts for each phase | [git-gamble theory page](https://git-gamble.is-cool.dev/theory.html)                                  |
| Want the original TCR rationale       | [TCR — Kent Beck](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864)                  |
| Want deeper TDD cycle theory          | [The Cycles of TDD — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) |

## Upstream

| Before starting TCRDD                        | Skill         | Why                                                                |
| -------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| Unsure whether the feature is worth building | `kano`        | Classify the feature before investing in red/green/refactor cycles |

---

## Benchmark

Scenario: `.benchmarks/scenarios/tcrdd-001-red-green.md`

| Model             | Without | With (pre-fix) | With (post-fix) | Delta (post-fix) |
| ----------------- | ------- | -------------- | --------------- | ---------------- |
| claude-opus-4-8   | 100%    | 100%           | 100%            | +0%              |
| claude-sonnet-4-6 | 100%    | 33% (-67%)     | 100%            | +0%              |
| claude-haiku-4-5  | 83%     | 17% (-66%)     | 83%             | +0%              |

> **Pre-fix: FAIL** (run 2026-06-14) — heavy approval-gating froze sonnet and made haiku one-shot.
> **Post-fix: regression CLEARED** (run 2026-06-25) — after the **Mode** (autonomous path) + **one-step-at-a-time** guard, every model ran a proper RED→GREEN loop in autonomous mode: sonnet no longer freezes, haiku no longer one-shots. No negative delta remains.
> The skill is now behavior-neutral on this task (models already do TCRDD well unaided); the fix removes the harm. Gate per `skill-optimizer/release-gates.md`: **PASS** (no negative delta on the critical scenario).
> Caveat: single-run, graded from agent self-reports; freeze/one-shot/revert signals directly observed.
