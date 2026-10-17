# Phase Guide

Detail for [TCRDD](../tcrdd.md): how to write each phase and the transformation ladder.

Before each phase (**interactive mode only** — skip in autonomous mode, see Mode):

- [ ] Plan approved by user
- [ ] Diff approved by user before staging and running the tests

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
- No extra dependencies, loggers, or validators — unless the failing test explicitly requires it.

**Transformation priority** — use the lowest-numbered move on this ladder that makes the test pass. Reaching for a higher number is a signal the test was too big (go back and split it):

1. No code → a stub return
2. Stub → a literal constant
3. Constant → a richer constant
4. Constant → a variable/argument
5. One statement → more statements
6. Straight line → a branch
7. Scalar → an array/collection
8. Branch → a loop
9. Reassigning an existing variable
10. Loop → recursion (bounded/shallow depth only)
11. Inline expression → an extracted function
12. Adding a case to an existing multi-branch conditional

Step 12 is always the last resort, never the first move. If every way to pass a
candidate test needs a multi-branch conditional, the test was too big — go back
and find a smaller intervening test instead of reaching for step 12.

### REFACTOR

- With all tests green, clean up both production and test code freely.

### REPEAT

- Ask the user whether the overall feature or fix is done.
  - **Not done** → back to RED
  - **Done** → squash the intermediate commits into one clean commit
