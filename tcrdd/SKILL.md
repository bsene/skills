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
  command available; trivial code (getters/setters, one-line/obvious functions, bare member
  variables — covered indirectly by other tests); GUI/layout code that has to be fiddled into
  place by trial and error; a genuine one-shot throwaway script; thin wrapping of a trusted
  third-party framework/DB/HTTP client you aren't testing the internals of. See Pragmatics
  below.

  Prefer this over `testing` when cadence and commit discipline matter, not just test
  authoring.
---

# TCRDD

Red/green/refactor driven by `git-gamble`: each phase runs the tests and auto-commits on the expected result or auto-reverts otherwise.

## Mode

- **Interactive** (a human is in the loop): use the approval gates below — plan approval, then diff approval before each `git-gamble`.
- **Autonomous** (no human available to approve, e.g. running unattended): **just run the loop.** Approval gates are optional — skip them and proceed. Still commit per phase and still take one baby step at a time. Do **not** freeze waiting for an approval that will never come.

## Agentic Execution — running unattended as an autonomous coding agent

Autonomous mode (see **Mode** above) says "just run the loop." These are the guardrails that
make that safe to actually leave unattended, rather than just permission to skip approvals.

- **Verify, never self-report.** A phase is only GREEN/RED-as-expected if it's backed by an
  actual test-runner tool call whose output you inspected — exit code, pass/fail counts, the
  works. Never advance the loop, commit, or tell the orchestrator/user "tests pass" on the
  basis of your own prediction of what the code should do. If the tool call didn't happen,
  the phase didn't happen.
- **Stuck-loop limit.** If `git-gamble` reverts the *same* candidate step more than twice in a
  row, stop retrying at that size — split it smaller (per the transformation ladder) before
  trying again. If a second round of splitting also stalls, **halt and report a blocker**
  instead of continuing to loop or reaching for a higher-numbered transformation just to
  escape. Forcing a bigger move to get unstuck is exactly the failure TCRDD exists to prevent.
- **Budget the run.** Before starting, note a rough ceiling (iteration count, wall-clock, or
  token budget) for the feature. Hitting it is a stop condition, not a reason to rush the
  remaining steps by batching them — see "one baby step at a time" above.
- **Tag commits by phase.** Prefix each phase's commit message with `[RED]`, `[GREEN]`, or
  `[REFACTOR]` (and squash to a clean final message per **REPEAT**). This is what makes an
  unattended run auditable after the fact, when no one watched the diffs live.
- **Handoff contract.** When TCRDD is invoked as a subagent/tool call by an orchestrator (or
  you're reporting back after an unattended run), end with a structured status rather than
  just stopping:
  - `done` — feature complete, commits squashed, tests green.
  - `blocked-stuck` — stuck-loop limit hit; include the last failing test and what was tried.
  - `blocked-budget` — budget exceeded mid-feature; include current state and next planned step.
  - `blocked-ambiguous` — the smallest-next-behaviour choice needs a human call the agent
    isn't positioned to make (see RED: "ask the user... in autonomous mode, pick it yourself" —
    this is the escape hatch for when even that isn't safe to guess).
- **Isolate concurrent runs.** If more than one agent instance might touch the same repo at
  once (a swarm, or parallel features), give each its own git worktree. `git-gamble`'s
  commit/revert cycle assumes exclusive control of the working tree — two agents sharing one
  will revert each other's in-flight work.

## Pragmatics — when to skip or downgrade the loop

TDD is a discipline, not dogma. Per Uncle Bob's own pragmatics, skip TCRDD (or downgrade to a
lighter cadence) in these cases — everything else still gets the full loop:

- **Trivial code** — getters/setters, bare member variables, one-line or obviously trivial
  functions. These get exercised indirectly by the tests of whatever calls them; writing a
  RED/GREEN cycle for each one is ceremony without signal.
- **GUI / layout code** — anything that has to be *fiddled* into place by trial and error
  (font sizes, RGB values, XY positions, spacing). Don't force a failing test first here.
  Instead:
  - Extract any real logic out of the GUI layer into a plain module and TCRDD *that* module.
    The GUI itself should be thin glue — wiring, not behavior.
  - For the fiddly glue itself, either fiddle first and write tests after the fact, or fiddle,
    then delete and re-write test-first once you know the shape. Both are legitimate; pick
    per judgement call, not per rule.
- **Trusted third-party code** — frameworks, databases, web servers, SDKs you have no reason
  to distrust. Mock the boundary and TCRDD *your* code against the mock; don't write tests
  that re-verify the third party's behavior. Exception: if you suspect it's actually broken,
  or a real call is cheap/fast/predictable enough that mocking is overkill — then it's fine
  to test through it.
- **Genuine one-shot throwaway work** — a script or program that will be run once and
  discarded (e.g. generating a one-off asset), especially in a REPL-driven / exploratory
  context. Skip the loop entirely.

None of this licenses skipping TCRDD because a task merely *feels* inconvenient or slow. The
default is still: make every effort to TDD any code with lasting production value. These are
narrow, recognizable exceptions — not a general escape hatch.

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
- If every way to pass the candidate test needs a low-priority transformation (see table below), that test is too big — look for a smaller intervening test first.

### GREEN — Write the minimum production code

- Write _only_ the code that makes the currently failing test pass. Nothing more.
- Resist the urge to generalise, add helpers, or handle future cases — those are for later tests.
- No `@Injectable`, no logger, no Zod — unless the failing test explicitly requires it.

**Transformation priority** — use the lowest-numbered move on this ladder that makes the test pass. Reaching for a higher number is a signal the test was too big (go back and split it):

1. No code → a stub return
2. Stub → a literal constant
3. Constant → a richer constant
4. Constant → a variable/argument
5. One statement → more statements
6. Straight line → a branch (`if`)
7. Scalar → an array/collection
8. `if` → a loop (`while`)
9. Reassigning an existing variable
10. Loop → recursion (bounded/shallow depth only — see TCO note below)
11. Inline expression → an extracted function
12. `(case)` — adding a case/else-if to an existing `switch`/`if`

`(case)` is always the last resort, never the first move. If every way to pass a
candidate test needs a `switch`/`else-if` branch, the test was too big — go back
and find a smaller intervening test instead of reaching for step 12.

> **TCO note (JS/TS/Node):** V8 does not implement proper tail-call optimization
> (it shipped in the ES6 spec but no major engine adopted PTC, and it was later
> dropped from serious consideration). That's why `while`-loop + reassignment
> (steps 8–9) rank *above* recursion (step 10) here — the reverse of the ordering
> you'd use in a language with guaranteed TCO (Clojure's `recur`, Scheme, etc.).
> Reach for recursion only when `n`/depth is small and bounded; for anything
> that could grow large, unwind to a loop before it becomes a stack-overflow risk
> in production.

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
| Same-size step reverts >2x in a row (autonomous) | Stop retrying at that size. Split smaller once; if that also stalls, halt and report a `blocked-stuck` status instead of looping or forcing a bigger transformation |
| Tests are flaky (pass/fail randomly) | Fix or isolate the flaky test before continuing the cycle                             |
| `git-gamble` is not installed        | Run tests manually; `git commit` on expected result, `git reset --hard` on unexpected |

---

## Read On Demand

| Read when                             | Link                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Need visual flowcharts for each phase | [git-gamble theory page](https://git-gamble.is-cool.dev/theory.html)                                  |
| Want the original TCR rationale       | [TCR — Kent Beck](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864)                  |
| Want deeper TDD cycle theory          | [The Cycles of TDD — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) |
| Want the full derivation of the transformation ladder above | [The Transformation Priority Premise — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2013/05/27/TheTransformationPriorityPremise.html) |
| Want to see why `(case)` is last and why tail-recursion/language runtime changes the ladder's order | [Fib. The T-P Premise — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2013/05/27/FibTPP.html) |
| Unsure whether a specific piece of code is a legitimate TCRDD exception | [The Pragmatics of TDD — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2013/03/06/ThePragmaticsOfTDD.html) |

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
