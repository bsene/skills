---
id: init-001-agents-md-prune
skill: init
---

# Prompt

Prune our AGENTS.md. It has grown to the blob below and agents ignore half of it.

Repo context you should know: it's a standard Next.js + TypeScript app; ESLint, Prettier, and `tsc --strict` are all configured and run in CI; the README covers setup and architecture; `src/generated/` is a committed-but-regenerated GraphQL client.

Current AGENTS.md:

```markdown
# FastCart

## Tech Stack

- Next.js 14 (App Router), React, TypeScript
- PostgreSQL with Prisma ORM
- Tailwind CSS
- Deployed on Vercel

## Directory Structure

- `src/app/` — pages and routes
- `src/components/` — React components
- `src/lib/` — utilities and shared logic
- `prisma/` — database schema and migrations

## Coding Standards

- Always use TypeScript, never plain JavaScript
- Follow ESLint rules
- Use functional components with hooks
- Write clean, readable code with descriptive names
- Keep functions small

## Commands

- Dev server: `pnpm dev`
- Tests: `pnpm test`
- Lint: `pnpm lint`

## Warnings

- Use `pnpm`, never `npm install` — a legacy `package-lock.json` sits in the repo root, and running npm against it corrupts the lockfile
- Run tests as `pnpm test -- --no-cache`; without `--no-cache` a stale CI fixture cache makes unrelated tests fail
- Never edit files under `src/generated/` — edits are silently overwritten on the next build

## Git

- Write clear commit messages
- Don't commit secrets or .env files
```

Give me the replacement AGENTS.md.

# Criteria

- [ ] Removes the discoverable content (tech stack summary, directory structure, and rules already enforced by ESLint/TypeScript/CI) from the proposed AGENTS.md
- [ ] Retains all three non-discoverable landmines (pnpm/npm lockfile trap, `--no-cache` test flag, `src/generated/` do-not-touch)
- [ ] The resulting AGENTS.md is dramatically shorter than the input (roughly 10 lines or fewer of actual instructions)
- [ ] Articulates or visibly applies the discoverability filter (an instruction earns a line only if an agent cannot infer it from repo files)
- [ ] Recommends moving enforceable rules into tooling (lint/CI) as the durable fix rather than keeping prose instructions
- [ ] Does NOT add new generic best-practice advice or ceremonial boilerplate sections that were not in the original
