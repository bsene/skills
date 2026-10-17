# TCRDD

Red/green/refactor driven by native git: each phase stages, runs the tests, and auto-commits on the expected result or auto-reverts (`git reset --hard`) otherwise. No external tool required.

**Precondition: start from a clean tree — no uncommitted changes and no untracked files.** The revert primitive (`git add -A` + `git reset --hard`) deletes untracked files with no reflog recovery, so any untracked file present when the cycle starts is lost. `git stash -u` (or a dedicated worktree) anything you want to keep before the first `add -A`.

## Mode

- **Interactive** (a human is in the loop): use the approval gates below — plan approval, then diff approval before each stage-and-test cycle.
- **Autonomous** (no human available to approve, e.g. running unattended): **just run the loop.** Approval gates are optional — skip them and proceed. Still commit per phase and still take one baby step at a time. Do **not** freeze waiting for an approval that will never come.

## Critical guardrails

- Inspect an actual full test-runner result before declaring RED/GREEN or committing. Never advance based on a prediction.
- Keep one baby step per phase, including unattended runs; never batch a full test suite or implementation.
- Stage with `git add -A` before tests so a failed step also reverts new files. Capture failure details before resetting, then append to `tcr-failure-log.md` and commit the log separately after the reset. Read [the git cycle](tcrdd/git-cycle.md) before executing a phase.
- Resolve the repository's test command once (package script, Makefile, language convention, then README/CI or ask); reuse the full CI suite every phase unless the user explicitly scopes it.
- Autonomous runs: set a budget, use an isolated worktree for concurrent agents, tag phase commits, and stop when the budget is reached. After more than two reverts of the same step, split it; if a second round of splitting stalls, halt and report a blocker. Follow [autonomous execution](tcrdd/autonomous-execution.md) for the required structured handoff.
- Skip or downgrade only for trivial code, GUI layout fiddling, trusted third-party internals, or genuine throwaway work. Extract and TCRDD lasting GUI logic; test your code at third-party boundaries. Read [pragmatics](tcrdd/pragmatics.md) for exceptions and narrow limits.

## Workflow

**GREEN: write only the minimum code needed to pass the current failing test.** Do not generalise or handle future cases; use the lowest-numbered transformation below.

```
RED   → plan test → approval? → write test → diff approval? → stage + run tests
        test FAILS (expected)?   commit [RED]      → GREEN
        test PASSES (unexpected)? log → reset --hard → try again

GREEN → plan code → approval? → write code → diff approval? → stage + run tests
        tests PASS?  commit [GREEN]      → REFACTOR
        tests FAIL?  log → reset --hard  → try again

REFACTOR → plan cleanup → approval? → refactor → diff approval? → stage + run tests
           tests PASS (no behaviour change)? commit [REFACTOR]     → (loop or done or back to RED)
           tests FAIL?                       log → reset --hard   → try again
```

## How to write code

Before each phase (**interactive mode only**): plan approved by user, then diff approved before staging and running tests.

> **One step at a time — never one-shot.** Each phase advances by exactly one baby step: one failing test, then the minimum code to pass it. Do **not** write the whole test suite or full implementation in one pass, even in autonomous mode. If you produce a finished feature in one turn, you did not run TCRDD.

- **RED** — take the smallest next behaviour; write only enough test to fail (stop at the first compile error or failed assertion).
- **GREEN** — minimum production code for the current failing test; no extra helpers, dependencies, or future cases. Use the lowest-numbered move on the transformation ladder; needing a high-numbered one means the test was too big, so split it.
- **REFACTOR** — with all tests green, clean up production and test code freely.
- **REPEAT** — ask whether the feature is done: not done goes back to RED; done squashes the intermediate commits into one clean commit.

Details, the full 12-step ladder, a baby-step vs one-shot example, and the error-handling table are in the references below.

## Read On Demand

| Read when                                                          | Link                                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| Writing a RED/GREEN/REFACTOR phase or choosing a transformation    | [Phase guide](tcrdd/phase-guide.md)                   |
| Seeing a baby-step example, or a revert/flaky/dirty-tree situation | [Example and errors](tcrdd/example-and-errors.md)     |
| Running unattended or reporting back to an orchestrator            | [Autonomous execution](tcrdd/autonomous-execution.md) |
| Implementing stage/test/commit/revert and the failure log          | [Git cycle](tcrdd/git-cycle.md)                       |
| Deciding whether to skip or downgrade the loop                     | [Pragmatics](tcrdd/pragmatics.md)                     |
| TCR/TDD/TPP theory and original articles (Beck, Uncle Bob)         | [Further reading](tcrdd/further-reading.md)           |
| Benchmark results                                                  | [Benchmarks](tcrdd/benchmarks.md)                     |

## Upstream

| Before starting TCRDD                        | Skill  | Why                                                                |
| -------------------------------------------- | ------ | ------------------------------------------------------------------ |
| Unsure whether the feature is worth building | `kano` | Classify the feature before investing in red/green/refactor cycles |
