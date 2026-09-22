---
name: review
description: >
  Reviews current branch and uncommitted changes: reads the actual diff, checks changed tests
  and CI first, reports risk and evidence with structured feedback (Blockers / Concerns / Nits),
  then applies approved fixes and asks before committing.

  TRIGGER when: user says "/review", "review this PR", "review my changes", "code review",
  "review the diff", "PR review", "review branch", "what do you think of my code",
  "look at my changes", "give me feedback on this".

  DO NOT USE when: user wants to understand what changed without requesting feedback;
  user asks for explanation only; there is no supplied or local diff to review.
---

# /review

## Workflow

1. Get the actual scope, never reconstruct it: review a supplied diff; otherwise inspect
   `git diff main...HEAD`, `git diff --cached`, `git diff`, and `git status --short`. This includes
   tracked uncommitted work by default. If untracked files exist, ask the user whether to include
   them; state which parts were available.
2. Read changed tests and CI/config before implementation. A behavior-changing test rewrite
   without a sound reason, or an unjustified weaker gate, is a Blocker.
3. Produce structured review with risk, blast radius, and available test/validation evidence.
   When changed code has obvious callers, dependents, or public surface, recommend checking them
   and their relevant tests; do not turn every review into call-graph archaeology.
4. Ask ≤5 grill-me questions — one per key design decision; design intent only, not style.
5. On approval of specific fixes: apply them → run relevant tests and lint → stop and grill the
   user about remaining design or validation questions → ask explicit approval before committing.

## Scope Discipline

Review **only what changed** — never report pre-existing, unmodified code as a finding. The diff
is the contract, but it is not the only context: read a changed file or an obvious caller,
dependent, or relevant test when needed to establish the changed code's impact. Real repos make
this a hard rule:

> Focus findings exclusively on changed code. Use surrounding code only to understand impact;
> do not turn a review into a backlog of pre-existing issues.

## Security-Before-Push

For anything about to be pushed, run a **security-focused review of the branch's own changes**
before shipping (optional `trivy fs` on vulnerable deps). Watch specifically for: logged
secrets/tokens/PINs/PII, and `__proto__`/prototype-walking reads on untrusted config.

## Agent-Authored Diffs

Run the test-tampering and CI-weakening checks in every review. If the branch was authored
largely by an agent — or you suspect it was — also layer
[agentic-code-review](references/agentic-code-review.md). For every new or changed AI/LLM
feature, inspect untrusted prompt input: it is a Blocker when it can influence privileged data
or actions, otherwise a Concern. Tier review depth by blast radius, not by author; the human
who clicks merge owns the change.

## Severity Tiers

| Tier        | Criterion                                       | Required Action      |
| ----------- | ----------------------------------------------- | -------------------- |
| **Blocker** | Incorrect behavior, security hole, data loss, broken invariant, or unjustified weakened gate | Fix before merge |
| **Concern** | Design flaw, missing evidence/test, or perf issue without demonstrated user harm              | Discuss + likely fix |
| **Nit**     | Style, naming, minor duplication                | Optional             |

If a performance finding may affect availability but its impact is unclear, ask the user whether
to treat it as a Blocker before assigning a tier.

## Output Format

```
## Review Context
- **Scope:** branch diff + staged + unstaged changes
- **Risk:** Medium
- **Blast radius:** `createInvoice()` feeds the payment record
- **Validation evidence:** no test output supplied

## Blockers
- `src/auth.ts:42` — expiry check uses `<` not `<=`; off-by-one passes expired tokens

## Concerns
- No test for error path in `processPayment()`

## Nits
- `userData` → `user` (same meaning, shorter)

## Questions
1. Why is `retryCount` hardcoded to 3 — should this be config?
```

## Deep-Rigor Mode

When the user asks for a strict / thorough review (e.g. "/review --strict", "deep review",
"rigorous review", "code quality audit"), layer the
[code-review-and-quality](references/code-review-and-quality.md) rubric on top of the
workflow above: walk the five axes (correctness, readability, architecture, security,
performance), promote its presumptive blockers into `Blockers`, and hold commits to its
higher approval bar. For agent-authored branches, also layer
[agentic-code-review](references/agentic-code-review.md).

## Related

- [mattpocock/code-review](https://skills.sh/mattpocock/skills/code-review) — two-axis review
  (Standards + Spec vs the originating issue) run as parallel sub-agents. Source:
  <https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review>
- [code-review-and-quality](https://github.com/addyosmani/agent-skills/tree/main/skills/code-review-and-quality) —
  upstream of the vendored deep-rigor rubric used in Deep-Rigor Mode above; see also
  [agentic code review](https://addyosmani.com/blog/agentic-code-review/) for the agent-diff
  failure modes.

## Benchmark

Scenario: `.benchmarks/scenarios/review-001-severity-tiers.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/review-001-severity-tiers.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 67%     | 83%  | +16%  |
| claude-sonnet-4-6 | 83%     | 67%  | −16%  |
| claude-haiku-4-5  | 83%     | 83%  | +0%   |

> **NEG (run 2026-08-31)**. Sonnet −16 on the severity-tier boundary; opus +16. Classification ambiguous between criteria and tier table — diagnostic c5-only re-run queued before any edit (cap reached). Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
