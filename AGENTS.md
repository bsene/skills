# Repository Guidelines

Coding-agent skill library: each top-level directory is one skill (`SKILL.md` + optional `references/`).

## Landmines

- **Two skill locations.** Top-level dirs are skills authored here. `.agents/skills/` holds externally installed skills (tracked in `skills-lock.json`); `.pi/skills/` and `.claude/skills/` are symlinks into it. Edit the real dir under `.agents/skills/`, never through a symlink target elsewhere, and keep `skills-lock.json` hashes intact when syncing.
- `typescript` exists in both places; check which copy you are editing and keep them in sync.
- Commit hooks live in `.githooks/` but are not active until `git config core.hooksPath .githooks`. Enforce one-line Conventional Commits and no `Co-authored-by` even if the hook is off.
- Update `README.md` whenever a skill is added, removed, or materially changed.

## Commands

- `git diff --check` — whitespace errors before committing.
- `npx prettier --check "**/*.md"` — Markdown formatting.
- `node --test .benchmarks/benchmark-validity.test.js` — offline benchmark validity; live recipes need Pi (see `.benchmarks/README.md`). Include benchmark results in PRs.
- No unit-test suite: validate by checking links, frontmatter, and that every command/example in a skill actually works.

## Conventions

- Keep `SKILL.md` focused; push detail to `references/<descriptive-name>.md` and link it.
- Skill dir and frontmatter `name`: short, lowercase, hyphenated.
- Tooling and helper executables are **OCaml** (dune project under `.pi/`, e.g. `.pi/c2fetch`), never Python. Fetch/scrape tasks included.
- Commits: one focused skill/concern each, e.g. `feat(skills): add rescript skill`.
- No secrets, editor config, or generated caches (`_build/`, `.DS_Store`).
