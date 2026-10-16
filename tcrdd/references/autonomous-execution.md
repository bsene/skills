## Agentic Execution — running unattended as an autonomous coding agent

Autonomous mode (see [Mode](../SKILL.md#mode)) says "just run the loop." These are the guardrails that
make that safe to actually leave unattended, rather than just permission to skip approvals.

- **Verify, never self-report.** A phase is only GREEN/RED-as-expected if it's backed by an
  actual test-runner tool call whose output you inspected — exit code, pass/fail counts, the
  works. Never advance the loop, commit, or tell the orchestrator/user "tests pass" on the
  basis of your own prediction of what the code should do. If the tool call didn't happen,
  the phase didn't happen.
- **Stuck-loop limit.** If `git reset --hard` fires on the _same_ candidate step more than twice in a
  row, stop retrying at that size — split it smaller (per the [transformation ladder](../SKILL.md#green--write-the-minimum-production-code)) before
  trying again. If a second round of splitting also stalls, **halt and report a blocker**
  instead of continuing to loop or reaching for a higher-numbered transformation just to
  escape. Forcing a bigger move to get unstuck is exactly the failure TCRDD exists to prevent.
- **Budget the run.** Before starting, note a rough ceiling (iteration count, wall-clock, or
  token budget) for the feature. Hitting it is a stop condition, not a reason to rush the
  remaining steps by batching them — see [How to write code](../SKILL.md#how-to-write-code).
- **Tag commits by phase.** Prefix each phase's commit message with `[RED]`, `[GREEN]`, or
  `[REFACTOR]` (and squash to a clean final message per [REPEAT](../SKILL.md#repeat)). This is what makes an
  unattended run auditable after the fact, when no one watched the diffs live.
- **Handoff contract.** When TCRDD is invoked as a subagent/tool call by an orchestrator (or
  you're reporting back after an unattended run), end with a structured status rather than
  just stopping:
  - `done` — feature complete, commits squashed, tests green.
  - `blocked-stuck` — stuck-loop limit hit; pull the last failing test and what was tried
    from `tcr-failure-log.md` rather than reconstructing it from memory.
  - `blocked-budget` — budget exceeded mid-feature; include current state and next planned step.
  - `blocked-ambiguous` — the smallest-next-behaviour choice needs a human call the agent
    isn't positioned to make (see [RED](../SKILL.md#red--write-a-failing-test): "ask the user... in autonomous mode, pick it yourself" —
    this is the escape hatch for when even that isn't safe to guess).
- **Isolate concurrent runs.** If more than one agent instance might touch the same repo at
  once (a swarm, or parallel features), give each its own git worktree. The commit/revert
  [git cycle](git-cycle.md) assumes exclusive control of the working tree — `git reset --hard` from one
  agent will discard another agent's uncommitted in-flight work on a shared tree.
