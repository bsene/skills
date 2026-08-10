# Run History

All optimizer runs for the TypeScript skill are recorded here.

| Timestamp | Model | Activation % | Token Delta | Notes |
|-----------|-------|--------------|-------------|-------|
| 2026-04-05 10:00 | claude-opus-4-6 | 88 % | +5 % | Initial run – below target.
| 2026-04-05 12:30 | claude-opus-4-6 | 92 % | -3 % | After adding triggers and examples.

| 2026-04-06 14:00 | claude-haiku-4-5 | — | — | Trigger extraction + front-load sub-skill routing across all 4 SKILL.md files. Explicit YAML `triggers:` keys added to 3 sub-skills; root skill routing moved to top.
| 2026-04-06 15:15 | claude-haiku-4-5 | — | — | Context-budget compression pass: converted prose explanations to concise checklists/single-line summaries while preserving code examples, tables, and behavior-critical references.

| 2026-08-10 | manual (agentskills.io audit) | — | — | Spec-compliance + de-bloat pass. Fixed `name`/directory mismatch on `type-system/` and `zod/` (were `typescript-type-system` / `typescript-zod`, confirmed reference-only — not independently discovered, so trimmed their frontmatter to a single description line instead of the full duplicate `TRIGGER when:` list). Fixed `type-system/SKILL.md` description exceeding the 1024-char spec cap. Removed duplicated `as const` code block from `type-system/SKILL.md` (now points to `rules/favor-existing-types-over-as-const.md` instead of repeating it). Stripped skill-style `name`/`description` frontmatter from all 5 `rules/*.md` files — they're plain reference docs reached only via the router table, so that frontmatter was dead weight loaded on every read; replaced with a lightweight HTML-comment tag line. Added a "why" note to the Interface vs Type Alias section (interface caching vs intersection recomputation, TS7 Go-port context).

---

*Use this file to track progress and identify regressions.*
