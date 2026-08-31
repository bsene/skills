---
id: writing-a-good-agents-md-001-consolidate
skill: writing-a-good-agents-md
---

# Prompt

I have a CLAUDE.md and a .cursorrules that duplicates about half of it. My agents keep ignoring half the instructions, and the file keeps growing every time someone pastes something in. Audit the setup and tell me how to fix it.

CLAUDE.md (current):

```markdown
# FastCart

FastCart is a Next.js e-commerce platform for grocery chains. It uses
TypeScript, Prisma, PostgreSQL, and deploys on Vercel.

## Stack
- Next.js 14 App Router
- PostgreSQL + Prisma
- Tailwind
- Vercel

## Style rules
- Always use async/await, never .then()
- Use descriptive variable names
- Prefer named exports
- Keep components under 200 lines

## Request validation middleware
Here is our middleware so you know how it works:

(paste of 25 lines of `src/middleware/validate.ts` — this copy has
already drifted from the real file after last month's refactor)

## Things to remember
- IMPORTANT: when you edit the checkout total calculation, you MUST also
  update src/legacy/totals.py — the legacy dashboard still reads from it.
  Temporary workaround, added in March.
- Never commit .env or any file containing secrets.
- Tests: `npm test`
- Always write tests for new features.
- Be helpful and concise.

## Git
- Use conventional commits.
- Don't force-push to main.
```

.cursorrules duplicates the Stack section and the Style rules verbatim.

# Criteria

- [ ] Recommends consolidating into one source of truth (AGENTS.md) with CLAUDE.md and .cursorrules kept as thin adapters (e.g. a `@AGENTS.md` import as the first line) instead of copy-pasted duplicates
- [ ] Flags the pasted middleware snippet as stale-prone and replaces it with a file/line reference (e.g. `src/middleware/validate.ts`)
- [ ] Moves the style rules (async/await, naming, export style) out of the instruction file and into a linter/formatter
- [ ] Applies an explicit length/instruction-count budget — targets under ~150 lines (ideally 50–100) or counts the discrete rules
- [ ] Retains the hard constraints that survive the pruning: the .env/secrets boundary, the checkout/legacy-totals coupling, and the test command
- [ ] Does NOT resolve the duplication by concatenating both files into one bigger document — the final guidance is shorter than the combined current inputs