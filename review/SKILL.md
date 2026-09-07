---
name: review
description: >
  Reviews current branch changes: reads the actual diff, produces structured feedback
  (Blockers / Concerns / Nits), asks targeted questions, then applies fixes on approval.

  TRIGGER when: user says "/review", "review this PR", "review my changes", "code review",
  "review the diff", "PR review", "review branch", "what do you think of my code",
  "look at my changes", "give me feedback on this".

  DO NOT USE when: user wants to understand what changed without requesting feedback;
  user asks for explanation only; no commits exist on current branch beyond main.
---

# /review

## Workflow

1. Run `git diff main...HEAD` — get ACTUAL diff, never reconstruct
2. Produce structured review (severity tiers below)
3. Ask ≤5 grill-me questions — one per key design decision; design intent only, not style
4. On approval: apply Blocker fixes → run tests → run lint → commit (conventional message)

## Severity Tiers

| Tier        | Criterion                                       | Required Action      |
| ----------- | ----------------------------------------------- | -------------------- |
| **Blocker** | Bug, security hole, data loss, broken invariant | Fix before merge     |
| **Concern** | Design flaw, missing test, perf issue           | Discuss + likely fix |
| **Nit**     | Style, naming, minor duplication                | Optional             |

## Output Format

```
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

When the user asks for a strict / thorough / "thermo-nuclear" review (e.g. "/review --strict",
"deep review", "rigorous review", "code quality audit"), layer the
[thermo-nuclear-code-quality-review](references/thermo-nuclear-code-quality-review.md) rubric
on top of the workflow above: promote its structural findings into the `Blockers`/`Concerns`
tiers before approval, and hold commits to that rubric's higher approval bar.

## Related

- [mattpocock/code-review](https://skills.sh/mattpocock/skills/code-review) — two-axis review
  (Standards + Spec vs the originating issue) run as parallel sub-agents. Source:
  <https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review>
- [thermo-nuclear-code-quality-review](https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/thermo-nuclear-code-quality-review/SKILL.md) —
  upstream of the vendored deep-rigor rubric used in Deep-Rigor Mode above.

## Benchmark

Scenario: `.benchmarks/scenarios/review-001-severity-tiers.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/review-001-severity-tiers.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 67%     | 83%  | +16%  |
| claude-sonnet-4-6 | 83%     | 67%  | −16%  |
| claude-haiku-4-5  | 83%     | 83%  | +0%   |

> **NEG (run 2026-08-31)**. Sonnet −16 on the severity-tier boundary; opus +16. Classification ambiguous between criteria and tier table — diagnostic c5-only re-run queued before any edit (cap reached). Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
