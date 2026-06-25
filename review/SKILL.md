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

## Guardrails

- Never skip diff step — reconstructed diffs miss context and whitespace changes
- Grill-me questions cover design intent only, not style
- Commit only after approval + green tests + clean lint
