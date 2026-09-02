# Writing Workflow, Anti-Patterns & Directory-Scoped Files

## Workflow: Writing a New AGENTS.md

1. Gather WHY/WHAT/HOW answers — ask the user if needed
2. Draft minimal root file (target 40–80 lines): overview, stack/structure, build/test/verify commands, hard boundaries, pointer table to sub-docs
3. Move out of root: domain how-tos → `agent_docs/`, code style → linter config, rare commands → sub-docs or custom commands
4. Draft sub-documents per major topic (if needed)
5. Multi-tool setup: default to `AGENTS.md` alone; add a harness adapter only if the user's tools need one, kept to an import plus tool-specific bits
6. Review against the audit checklist in the main skill

## Anti-Patterns and Fixes

| Anti-Pattern | Fix |
|---|---|
| "Always use tabs not spaces" | `.editorconfig` or linter |
| "When adding a new API endpoint, do X, Y, Z" | `agent_docs/adding_endpoints.md` |
| 200+ line AGENTS.md | Prune; specifics to sub-docs |
| Pasted code examples | `file:line` references |
| Raw `/init` output shipped as-is | Rewrite from scratch using WHY/WHAT/HOW |
| Instructions about one module | Directory-scoped file in that module |
| Same content in AGENTS.md + CLAUDE.md + .cursorrules | One source of truth; others are thin adapters |
| Full repo directory tree for orientation | Shallow map at most; agents navigate structured repos fine |
| Secrets/internal vulnerability details checked in | Never — context files are shareable documentation |

## Directory-Scoped Files

Several harnesses (Claude Code nested `CLAUDE.md`, Cursor glob-scoped `.mdc`) load instruction files only when working in that subdirectory — progressive disclosure at the filesystem level. Use for package-specific builds, module conventions, sub-team context.

## Multi-Tool Teams: Avoiding Drift

- Shared tool-agnostic instructions in root `AGENTS.md`
- Smallest possible adapter per non-native harness (`@AGENTS.md` first line for Claude Code; short `.mdc` for Cursor)
- Periodically re-review for content that has since migrated into toolchain (linter rule, CI check) and delete it
- Multiple hand-maintained copies today → one-time consolidation into `AGENTS.md` plus adapters