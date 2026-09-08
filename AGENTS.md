# Repository Guidelines

This repository is a coding-agent skill library. Each skill is a focused Markdown knowledge pack that agents can load on demand.

## Project Structure & Module Organization

- Each top-level directory is one skill, e.g. `review/`, `golang/`, or `typescript/`.
- Every skill must contain `SKILL.md` with YAML frontmatter (`name`, `description`) followed by its core workflow.
- Place supporting material in `references/`; nest related skills as subdirectories when useful.
- `.benchmarks/` contains benchmark scenarios and scripts; do not treat it as an installable package.
- `skills-lock.json` tracks externally sourced skills and their hashes.
- Update `README.md` whenever adding, removing, or materially changing a skill.

## Build, Test, and Development Commands

There is no application build step. Useful checks include:

- `git diff --check` — detect whitespace errors before committing.
- `npx prettier --check "**/*.md"` — verify Markdown formatting if Prettier is available.
- `node .benchmarks/skill-benchmark-trio.js` — run the available local benchmark harness when benchmark behavior changes.
- `git status --short` — review intended changes before opening a PR.

## Coding Style & Naming Conventions

- Write concise, instructional Markdown with descriptive headings, tables, and short code examples.
- Use two-space indentation for YAML frontmatter and fenced code blocks.
- Keep skill directory and frontmatter names short, lowercase, and hyphenated, e.g. `ports-adapters-architecture`.
- Name reference files descriptively, e.g. `references/testing-and-quality.md`.
- Keep `SKILL.md` focused; move detailed material to references and link it on demand.

## OCaml Tooling

- Implement OCaml tooling and helper executables in **OCaml**, not Python or another language. Use a dune project and keep it under `.pi/`.

## Testing Guidelines

There is no conventional unit-test suite. Validate changes by checking Markdown rendering, links, frontmatter syntax, and the accuracy of every command or example. For benchmark changes, run the benchmark scripts directly and include the results in the PR.

## Commit & Pull Request Guidelines

Follow the existing one-line Conventional Commit style:

- `feat(skills): add rescript skill`
- `docs(ocaml): add testing reference`
- `chore(skills): update skills-lock.json`

Keep each commit focused on one skill or concern. Pull requests should include a short purpose statement, list of changed skills, validation performed, and linked issues where applicable. Add screenshots only when Markdown rendering itself changes.

## Security & Configuration Tips

Do not commit secrets, local editor configuration, or generated caches. Preserve `skills-lock.json` hashes when syncing external skills.
