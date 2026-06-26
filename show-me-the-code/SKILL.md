---
name: show-me-the-code
description: >
  Enforces one rule: every code change must be presented as a unified diff (`diff -u` format) with 3 lines of context. No exceptions, even one-liners.

  TRIGGER when: user requests a code modification — fix, refactor, update, replace, edit, patch, change, tweak, rename, rewrite,
  apply changes, modify this, edit the file, change this code,
  or explicitly asks for a diff — "show me the diff", "as a unified diff", "what changed", "show the patch", "/show-me-the-code".
  DO NOT USE when: producing a brand-new file from scratch (no context lines to diff against),
  or for non-code responses such as plans, explanations, architecture, or diagrams.
---

# Show Me The Code

**Rule:** every code change → unified diff (`diff -u` format). No exceptions.

- 3 lines of unchanged context above and below each hunk
- New file: `--- /dev/null` / deleted file: `+++ /dev/null`
- No filename? Use `a/snippet.ts`
- Multiple files: one diff block per file

After the diff: optional 1–3 sentence _why_.

## Example

Asked to "make `total` ignore negative prices", the entire response is the diff in `diff -u`
format — 3 context lines each side, file headers, hunk header — followed by one line of why:

```diff
--- a/src/cart.ts
+++ b/src/cart.ts
@@ -5,7 +5,7 @@ export function total(items: Item[]): number {
   return items.reduce((sum, item) => {
-    return sum + item.price;
+    return sum + Math.max(0, item.price);
   }, 0);
 }
```

Clamping each price at 0 prevents a refunded line item from reducing the cart total below the legitimate sum.
