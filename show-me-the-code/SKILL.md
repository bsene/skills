---
name: show-me-the-code
description: >
  Enforces one rule: any code change must be shown as a unified diff. Trigger
  for any request that modifies existing code — fix, refactor, update, replace,
  apply changes — even one-liners. Never skip this skill when code is being changed.
  DO NOT USE when: producing a new file from scratch (no context lines to diff against)
  or for non-code responses such as plans, explanations, or architecture diagrams.
---

# Show Me The Code

**Rule:** every code change → unified diff (`diff -u` format). No exceptions.

- 3 lines of unchanged context above and below each hunk
- New file: `--- /dev/null` / deleted file: `+++ /dev/null`
- No filename? Use `a/snippet.ts`
- Multiple files: one diff block per file

After the diff: optional 1–3 sentence _why_.
