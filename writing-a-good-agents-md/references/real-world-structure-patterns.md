# Real-World AGENTS Files: Structure Patterns

Patterns observed across a corpus of ~30 production AGENTS.md / CLAUDE.md files from real
projects (Go katas, NestJS monorepos, Rails, Next.js apps). Use these as a "what good looks
like" checklist when authoring or auditing a context file. They complement the minimal
template in the skill by showing the sections real teams actually add once a project is
non-trivial.

## 1. Non-Discoverable Commands (why, not just the command)

List commands whose existence or behavior is NOT inferable from reading the repo. For each,
state **why it matters**, not just the command. Real examples:

- "`pnpm dev` expects a `server.ts` in the root. This file is **generated during build** and
  may not exist in a fresh clone. Run `pnpm run build` first."
- "`test:integration` must be run with the correct `SONOS_SMAPI_SERVICE_HOST`; a wrong host
  causes **flaky/failing tests**."
- "The `clean` script deletes `dist/` and `sonos.zip`. Running it affects subsequent builds."
- "Project uses `pnpm`. Avoid `npm`/`yarn` — they resolve dependencies differently and cause
  version mismatches."

Rule: if the failure is silent or non-obvious, it belongs here; if it's discoverable from the
README or package.json, leave it out.

## 2. Landmine List

A separate section (often literally titled `## Landmines`) for traps that cause silent or
breaking failures:

- Hardcoded host/environment URL (dev `http://localhost:8000` vs prod `https://...` — wrong
  one fails at connection time).
- Version-sensitive dependency behavior (e.g. Zod `^3.23.8` breaking schema changes).
- Stale lock files, running mock servers, `.git/index.lock` races.

Each entry = what breaks + why.

## 3. WHY / WHAT / HOW

Lead with **WHY** (the project's purpose, including non-obvious constraints like a legal CLA
boundary), then **WHAT** (repo shape — which top-level dir is what), then **HOW** (how work
actually flows — every change routes through some entry point). Many real files use exactly
these three words as headings; they map one-to-one to the skill's onboarding model.

## 4. "Pointers" Table (progressive disclosure by task)

A table of `branch | task → doc to read when that task fires`. Lazily loads docs, never reads
them up front. Example shape:

| When you are asked to | Read                   |
| --------------------- | ---------------------- |
| Change business rules | `docs/domain.md`       |
| Add an API endpoint   | `docs/api-contract.md` |

## 5. Explicit "Don't Touch" Boundaries

State invariants plainly rather than implying them:

- "Never modify `X` unless ..."
- "Do not commit `Y` if it contains PII / secrets / tokens."
- "Do not modify config files (vitest.config, eslint.config, CI) unless explicitly asked."

## 6. Plain Tool-Choice Rules

State package-manager / tooling choices directly instead of expecting inference:

- "Always use `pnpm`, never `npm`."
- "No eslint/typecheck without an explicit ask (slow, low signal)."

## 7. Small, Scoped Files Over One Big File

For large codebases: a small per-package `CLAUDE.md` with `globs` + frontmatter for scoped
rules, plus a repo-wide `AGENTS.md`. Progressive disclosure applies to files too.

## 8. Portability

Replace hardcoded paths with `path/to/` placeholders when the file is meant to be copied as a
template.
