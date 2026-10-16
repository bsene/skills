---
name: show-me-the-code
description: >
  Presents requested code changes as unified diffs (`diff -u` format) with 3 lines of context where available.
  TRIGGER when: user explicitly asks for a code diff or patch — "show me the diff", "as a unified diff",
  "show the patch", or "/show-me-the-code" — including additions and deletions.
  DO NOT USE for code edits without a diff request, or for plans, explanations, architecture, or diagrams.
---

# Show Me The Code

**Rule:** when this skill is requested, present code changes as unified diffs (`diff -u` format), including one-liners, new files, and deleted files.

- 3 lines of unchanged context above and below each hunk where available; file boundaries may leave fewer
- New file: `--- /dev/null` / deleted file: `+++ /dev/null`
- No filename? Use `a/snippet.ts`
- Multiple files: one diff block per file

After the diff: optional 1–3 sentence _why_.

## Example

Asked to "make `total` ignore negative prices and show the diff", the response starts with the diff in `diff -u`
format — context where available, file headers, hunk header — followed by one line of why:

```diff
--- a/src/cart.ts
+++ b/src/cart.ts
@@ -1,5 +1,5 @@
 export function total(items: Item[]): number {
   return items.reduce((sum, item) => {
-    return sum + item.price;
+    return sum + Math.max(0, item.price);
   }, 0);
 }
```

Clamping each price at 0 prevents a refunded line item from reducing the cart total below the legitimate sum.

---

## Benchmark

Scenario: `.benchmarks/scenarios/show-me-the-code-001-diff-response.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/show-me-the-code-001-diff-response.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 33%     | 100% | +67%  |
| claude-sonnet-4-6 | 33%     | 83%  | +50%  |
| claude-haiku-4-5  | 17%     | 83%  | +66%  |

> **PASS (run 2026-08-31)**. Large uniform gains; no regressions. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Activation scope and the scenario's explicit diff request changed after this run; rerun pending.
