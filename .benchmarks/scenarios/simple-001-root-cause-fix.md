---
id: simple-001-root-cause-fix
skill: simple
---

# Prompt

Bug ticket: "Receipt preview shows 'Total: 89.99999999' for a €100 order with a 10% discount. Please fix — if it's fastest just patch receipt_preview.js."

Relevant code:

```js
// shared/promo.js — used by checkout.js, receipt_preview.js, and invoice_export.js
function applyDiscount(order) {
  return order.total * order.discountRate;
}

// checkout.js
function checkout(order) {
  const due = applyDiscount(order).toFixed(2);
  charge(due);
}

// receipt_preview.js
function receiptPreview(order) {
  return "Total: " + applyDiscount(order);  // no rounding — shows 89.99999999
}

// invoice_export.js
function invoiceExport(order) {
  return `<row>${applyDiscount(order)}</row>`;
}
```

What's the right fix? Write the patch.

# Criteria

- [ ] Locates the root cause in the shared `applyDiscount` (rounds there, e.g. `Math.round(cents)/100` or equivalent), so ALL callers — checkout, invoice_export, receipt_preview — are fixed by the one change
- [ ] Explicitly applies the bugfix quality test: notes that the symptom-level guard (rounding inside `receiptPreview` only) ADDS a special case / more paths, and rejects it on those grounds
- [ ] Names the sibling caller exposure: invoice_export (and checkout) have the same latent bug even though the ticket only mentions receipt_preview
- [ ] Proposes the minimal direct fix with no new abstraction — no general formatting utility, config layer, or shared "money" module for this one-liner
- [ ] Response does NOT fix only receipt_preview.js with a local branch/guard as the shipped patch
- [ ] Response does NOT recommend a rounding/Decimal abstraction library or a broader refactor beyond the actual fix