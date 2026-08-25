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
3. Ask ≤5 grill-me questions (one per key design decision)
4. On approval: apply Blocker fixes → run tests → run lint → commit (conventional message)

## Severity Tiers

| Tier | Criterion | Required Action |
|------|-----------|-----------------|
| **Blocker** | Bug, security hole, data loss, broken invariant | Fix before merge |
| **Concern** | Design flaw, missing test, perf issue | Discuss + likely fix |
| **Nit** | Style, naming, minor duplication | Optional |

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

## Integrated Example

**Input:** user says "/review my changes".

**Step 1 — get the ACTUAL diff** (never reconstruct from memory or from the chat history):

```
$ git diff main...HEAD
--- a/src/cart.ts
+++ b/src/cart.ts
@@ -8,7 +8,7 @@ export function total(items: Item[], coupon?: Coupon) {
-  const sum = items.reduce((a, i) => a + i.price, 0);
+  const sum = items.reduce((a, i) => a + i.price * i.qty, 0);
   if (coupon) return sum - coupon.amount;
   return sum;
 }
```

**Step 2 — structured review** against the real lines (note the `coupon.amount` guard the diff
revealed — reconstructing would have missed it):

```
## Blockers
- `src/cart.ts:11` — coupon can drive total negative; clamp with `Math.max(0, sum - coupon.amount)`

## Concerns
- No test covers the new `qty` multiplication path

## Questions
1. Should a coupon larger than the cart be an error, or just clamp to 0?
```

**Step 3 — on approval:** apply the Blocker fix, run tests, run lint, then commit with a
conventional message (`fix(cart): clamp coupon discount at zero`).

---

## Deep-Rigor Mode

When the user asks for a strict / thorough / "thermo-nuclear" review (e.g. "/review --strict",
"deep review", "rigorous review", "code quality audit"), layer the
[thermo-nuclear-code-quality-review](references/thermo-nuclear-code-quality-review.md) rubric
on top of the workflow above:

- Run the standard workflow (diff → severity tiers → questions → fixes).
- Then re-run the diff against the thermo-nuclear rubric: hunt for "code judo" moves that
  delete whole categories of complexity, flag files crossing 1000 lines, spaghetti growth,
  boundary leaks, unnecessary wrappers/casts, and missed decompositions.
- Promote those structural findings into the `Blockers`/`Concerns` tiers before approval.
- Approval bar rises: correct behavior is not enough — no clear structural regression and
  no obvious missed simplification.

## References

- [thermo-nuclear-code-quality-review](references/thermo-nuclear-code-quality-review.md) —
  deep-rigor rubric for ambitious structural simplification. Source:
  <https://github.com/cursor/plugins/tree/3347cbab5b54136f6fba0994c3a01a56f7fb7fca/cursor-team-kit/skills/thermo-nuclear-code-quality-review>

---

## Guardrails

- Never skip diff step — reconstructed diffs miss context and whitespace changes
- Grill-me questions cover design intent only, not style
- Commit only after approval + green tests + clean lint
