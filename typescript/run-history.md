# Run History

All optimizer runs for the TypeScript skill are recorded here.

| Timestamp | Model | Activation % | Token Delta | Notes |
|-----------|-------|--------------|-------------|-------|
| 2026-04-05 10:00 | claude-opus-4-6 | 88 % | +5 % | Initial run – below target.
| 2026-04-05 12:30 | claude-opus-4-6 | 92 % | -3 % | After adding triggers and examples.

| 2026-04-06 14:00 | claude-haiku-4-5 | — | — | Trigger extraction + front-load sub-skill routing across all 4 SKILL.md files. Explicit YAML `triggers:` keys added to 3 sub-skills; root skill routing moved to top.
| 2026-04-06 15:15 | claude-haiku-4-5 | — | — | Context-budget compression pass: converted prose explanations to concise checklists/single-line summaries while preserving code examples, tables, and behavior-critical references.

---

*Use this file to track progress and identify regressions.*