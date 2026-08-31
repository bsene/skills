---
id: review-001-severity-tiers
skill: review
---

# Prompt

Please review this PR before I merge it. I can't share repo access, so here is the complete `git diff main...HEAD` output:

```diff
--- a/src/invoice.ts
+++ b/src/invoice.ts
@@ -12,9 +12,14 @@ export function createInvoice(order: Order): Invoice {
-  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
-  const tax = subtotal * 0.08;
-  return { subtotal, tax, total: subtotal + tax };
+  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
+  const discount = order.coupon ? subtotal * 0.1 : 0;
+  const tax = subtotal * 0.08;
+  const totalToCharge = subtotal - discount + tax;
+  applyDiscountAudit(order.id, discount);
+  return { subtotal, discount, tax, totalToCharge };
}
```

Context: `applyDiscountAudit` writes to an analytics table. The invoice record returned here is what the payment service charges against; discounts are not persisted anywhere except the analytics table.

# Criteria

- [ ] Findings are organized into explicit severity tiers (e.g. headings or labeled sections for Blockers / Concerns / Nits or equivalent levels)
- [ ] Identifies tax being computed on the pre-discount subtotal as a top-severity bug
- [ ] Raises the discount-not-persisted / payment-record mismatch (or the side-effecting audit call inside a pure calculation) as a design-level concern, distinct from the tax bug
- [ ] Ends with a small set (5 or fewer) of targeted questions about the design decisions in the diff
- [ ] Does NOT classify the `totalToCharge` naming choice as a blocker (style/naming items are placed in a lower tier)
- [ ] Every finding cites a specific symbol, line, or behavior from the provided diff (no generic checklist sections padded with zero findings)