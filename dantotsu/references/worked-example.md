# Worked Example — Fictional, Illustrative

A filled-in analysis using [`_template.md`](../_template.md). The defect, IDs, and people are invented; the point is the shape: stage first, separate occurrence and outflow chains, evidence on every link, countermeasure kept apart from eradication.

## Problem Statement

Expected: an order total of 100.00 EUR with a 10% coupon charges 90.00 EUR. Actual: the customer was charged 100.00 EUR and the coupon line showed `-0.00`.

## Metadata

| Field                 | Value                                        |
| --------------------- | -------------------------------------------- |
| **ID**                | `SHOP-482`                                   |
| **Analysis Date**     | `2026/11/06`                                 |
| **Detection Stage**   | `F - Client` (support ticket)                |
| **Earliest feasible** | `B - CI` (unit test on rounding)             |
| **Status**            | Countermeasure shipped, eradication proposed |

## Causal Chain

1. Customer applies coupon `SAVE10` (`percent: 10`) at checkout.
2. `applyCoupon` reads `coupon.percent` as a string from the JSON config.
3. `total * (coupon.percent / 100)` runs on `"10"`, giving `10 / 100 = 0.1`, then `Math.floor(0.1)` → `0`.
4. Discount is `0`; the full price is charged.

**Recurrence check:** `SHOP-311` (flat-amount coupon ignored) had the same pattern — config value used without type validation. Recurring → eradication takes priority over a one-off fix.

## Root Cause of Occurrence

### Evidence and Occurrence Whys

1. Why was the discount 0? `Math.floor` was applied to a fraction (`git blame` + diff of `pricing.ts`, commit `a1b2c3d`).
2. Why was `floor` applied to a fraction? Rounding was added to the cents amount but placed before the multiplication (same diff).
3. Why did rounding move? A refactor extracted `computeDiscount` and kept the call order from an older flat-amount path (PR description says "no behavior change").
4. Why was "no behavior change" accepted? No test covered percent coupons; the only coupon test used a flat amount (test file at that commit).
5. Why was there no percent test? Coupon types were added across two sprints and the acceptance criteria of the percent story did not list rounding (story text in the tracker).

### Hypotheses

- The author may have assumed percent coupons were covered by the flat-amount test. **Unconfirmed**: author on leave, no decision log. Confirm with the author before finalizing.

## Detection Failure Causes

Actual: F. Earliest feasible: B.

1. Why did CI pass? No test exercised percent coupons (coverage report: `pricing.ts` branch for `kind === "percent"` uncovered).
2. Why was the branch uncovered without notice? Coverage is reported but not gated on changed lines (CI config).
3. Why not caught in review? Diff showed a pure move; reviewer checklist has no "behavior-bearing branch has a test" item (checklist file). Reviewer reasoning: **unknown**.

## Countermeasure

- Done (containment): hotfix `b4c5d6e` applies rounding after multiplication; 14 affected orders refunded by support.
- Result: reproducer from the ticket now charges 90.00 EUR (verified locally and in staging). Production behavior after deploy: **unverified** until next coupon order.

## Eradication

### Similar Instances

`grep -rn "coupon\." src/` shows two other unvalidated reads (`maxUses`, `expiresAt`).

### Prevention Strategy (micro-guardrails)

1. Parse coupon config with a schema at load time, so `percent` is a number or startup fails.
2. Add a CI rule: changed lines in `pricing/` must be covered (diff-coverage gate).

### Verification and Monitoring

- Regression test `percent coupon 10% on 100.00 → 90.00` fails on `a1b2c3d`, passes on the fix. Covered: percent and flat; not covered: stacked coupons.
- Monitor: 60 days, all coupon orders, owner tech lead, review at next sprint demo. A quiet period is an observation, not proof of eradication.

## Learning to share

"Moving code in a refactor can change evaluation order. 'No behavior change' needs a test that pins the behavior, not a reviewer's eye."

## Why this example is shaped this way

- Stage was given (F), then compared with the earliest feasible (B): the gap is the process finding.
- The occurrence and detection chains are separate; neither is padded to five steps.
- The author's reasoning is a labeled hypothesis, not a link in the chain.
- Countermeasure (hotfix) and eradication (schema + diff-coverage gate) are different sections with different scopes.
