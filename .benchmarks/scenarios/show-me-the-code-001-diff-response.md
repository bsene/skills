---
id: show-me-the-code-001-diff-response
skill: show-me-the-code
---

# Prompt

Make this change: skip items whose `qty` is zero or negative instead of adding them to the subtotal.

File `src/pricing.ts`:

```ts
export function priceQuote(items: Item[]): number {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.qty * item.price;
  }
  if (subtotal > 500) {
    subtotal *= 0.95;
  }
  return roundToCents(subtotal);
}
```

# Criteria

- [ ] The code change is presented entirely as a unified diff with `---` and `+++` file header lines (`a/src/pricing.ts` / `b/src/pricing.ts`)
- [ ] The diff includes a valid `@@` hunk header line
- [ ] The diff shows at least 3 lines of unchanged context above and 3 lines of unchanged context below the changed line(s)
- [ ] Does NOT also restate the complete modified function as a plain (non-diff) code block
- [ ] Does NOT open with prose before the diff (any explanation comes after it)
- [ ] Total non-diff prose is limited to at most 3 sentences
