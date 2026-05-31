---
id: tcrdd-001-red-green
skill: tcrdd
models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5-20251001]
---

# Prompt

Implement a `Roman.toArabic(s: string): number` converter using TCRDD. Start now.

# Criteria

- [ ] Response starts with RED — writes failing test FIRST, runs it, confirms it fails for the right reason
- [ ] Response then GREEN — minimal implementation, no premature generalization
- [ ] Response does NOT inject loggers, DI decorators (`@Injectable`), or Zod schemas in GREEN
- [ ] Response respects the Commit-or-Revert step (or names it explicitly)
- [ ] Response refactors only after GREEN, only with test coverage
- [ ] Response steps in small increments (single test → green → next test), not jumping to full implementation
