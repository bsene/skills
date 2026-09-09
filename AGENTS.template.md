# Repository Guidelines

> Extracted from 40+ prototype `AGENTS.md`/`CLAUDE.md` files. The section
> headings below are the ones that recur across the corpus; fill in the
> `[...]` placeholders and delete what doesn't apply. Keep every line to
> something an agent can't infer from the code itself.

## Project Structure & Module Organization

- `[lib/]` — [core domain logic; keep it framework-free]
- `[bin/]` — [thin executable entry point: parse input, call lib, print output]
- `[test/]` — [test suite; mirror files as `test/test_<module>.<ext>`]
- `[src/]` — [application code; one folder per route/feature]
- `[docs/]` — [postmortems, checklists, architecture diagrams]
- `[config file]` — [project config; source of truth]
- Keep core logic in `[lib/]`; `[bin/]` stays a thin wrapper.
- Add new files beside existing ones and follow the same naming convention.

## Build, Test, and Development Commands

```bash
[build]      # compile / bundle / start dev server
[test]       # run the test suite
[verify]     # the sign-off gate — run before considering a task done
[lint]       # style / static analysis
[fmt]        # auto-format
```

- Run the focused check for the file you touched, not the full suite, for fast feedback.
- `[verify]` is the gate: lint + tests + [mutation] + [type check]. All must pass.

## Coding Style & Naming Conventions

- [Naming conventions for the language: e.g. `snake_case` values, `CamelCase` types].
- Indentation: [2 spaces]; format with the project formatter before committing.
- Prefer total functions: use `option`/`result` instead of partial functions; avoid mutable state.
- Keep functions small and composable; favor simple implementations over fancy ones.
- Do not add new dependencies without discussion; the dependency surface is intentionally tiny.

## Testing Guidelines

- Framework: [test framework].
- Write tests in [BDD] style: name by observable behavior, not implementation detail.
- Add or update a test for every behavior change and every bug fix.
- [TDD / TCRDD] workflow: red → green → commit (or revert) → refactor.
- [Property-based testing] and [mutation testing] where configured.
- Coverage target: [nearly 100% of production code; write tests that specify behavior, don't chase coverage].

## Commit & Pull Request Guidelines

- Conventional Commits, one line: `type: summary` (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`).
- Keep commits atomic: one logical change per commit; explain the *why* in the body when not obvious.
- PRs: describe what changed and why, link the related issue, list verification run, note behavior changes.
- Keep refactorings behavior-preserving; verify with existing tests before committing.

## Security & Configuration Tips

- Do not commit secrets, `.env`, or local credentials.
- [Base URLs default to HTTPS; insecure transport is local-dev only].
- [Log security-relevant events via the structured logger; never print secrets to stdout].
- [Guard prototype-pollution reads (`__proto__`, `constructor`, `prototype`) in merge/object code].
- [Every HTTP server needs timeouts, max header size, and panic-recovery middleware].

## Verification

> Run after **each** edit, not just at the end.

1. [lint]
2. [build / type check]
3. [all tests]
4. [mutation tests on significant logic changes]
5. [smoke tests]

## Workflow

- [TDD / TCRDD / Mikado method / REPL-driven development].
- Grill the user and get plan approval before starting implementation.
- Verify assumptions before going further; favor the simplest implementation.
- When you finish implementing, run parallel reviewers: one for correctness, one for tests, one for unnecessary complexity.

## Debugging

When investigating a bug:

1. Find the root cause (e.g. 5 Whys / Dantotsu).
2. Challenge the root cause with the user before concluding.
3. Fix it, then file a [Dantotsu report] under `docs/dantotsu/` / `docs/postmortem/`.
4. Verify the issue no longer appears; review the code; run verification.

## Agent-Specific Instructions

- [CLAUDE.md includes this file via `@AGENTS.md` — keep them in sync].
- [Agent skills live in `.agents/skills/`; update `skills-lock.json` when adding skills].
- [When context reaches ~30%, stop and ask for a handoff to a fresh session].
