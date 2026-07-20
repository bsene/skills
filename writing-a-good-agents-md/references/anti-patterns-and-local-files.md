# Anti-Patterns, Local/Directory-Scoped Files & Writing Workflow

## Workflow: Writing a New AGENTS.md

1. **Gather answers to WHY/WHAT/HOW** — ask the user if needed
2. **Draft a minimal root file** (target 40–80 lines)
   - 1–3 sentence project overview
   - Stack and structure summary
   - Build / test / verify commands
   - Any hard boundaries (files never to touch, secrets never to commit)
   - Pointer table to `agent_docs/` sub-documents (if applicable)
3. **Identify content that should move to sub-docs**
   - Domain-specific how-tos → `agent_docs/`
   - Code style → linter config
   - Rarely needed commands → custom/slash commands or sub-docs
4. **Draft sub-documents** for each major topic (if needed)
5. **Decide on multi-tool setup, if relevant** — does the user need `AGENTS.md` alone, or also a harness-specific adapter (`CLAUDE.md`, `.cursor/rules/*.mdc`, `GEMINI.md`, Copilot instructions)? Default to `AGENTS.md` as the single source of truth; add an adapter only if the user's actual tool needs one, and keep the adapter to an import plus any genuinely tool-specific bits.
6. **Review** using the audit checklist in the main skill file

---

## Common Anti-Patterns and Fixes

| Anti-Pattern                                 | Fix                                                    |
| --------------------------------------------- | -------------------------------------------------------- |
| "Always use tabs not spaces"                 | Configure in `.editorconfig` or linter                 |
| "When adding a new API endpoint, do X, Y, Z" | Move to `agent_docs/adding_endpoints.md`               |
| 200+ line AGENTS.md                          | Ruthlessly prune; move specifics to sub-docs             |
| Pasted code examples                         | Replace with `file:line` references                    |
| Raw `/init` output shipped as-is             | Rewrite from scratch using WHY/WHAT/HOW                 |
| Instructions about one specific module       | Move to that module's directory as a local, directory-scoped file |
| Same content pasted into `AGENTS.md`, `CLAUDE.md`, and `.cursorrules` | Keep one source of truth in `AGENTS.md`; make the others thin imports/adapters |
| A full repo directory tree included "for orientation" | Keep at most a shallow, high-level map if it aids architectural understanding — don't rely on it as a substitute for a well-structured repo; most agents navigate fine without it during actual implementation work |
| Detailed security-sensitive info (keys, internal vulnerability details) checked in | Never include in a version-controlled context file — treat it as shareable documentation |

---

## Notes on Local / Directory-Scoped Files

Several harnesses support instruction files scoped to a subdirectory, loaded only when the agent is actually working in that directory — Claude Code's nested `CLAUDE.md` files and Cursor's glob-scoped `.mdc` rules are two common examples; check the specific harness's current docs for exact mechanics. Use them for:

- Package-specific build instructions in a monorepo
- Module-specific conventions
- Sub-team context

This is another form of progressive disclosure — keep the root file minimal and push specifics down into the directory (or module) where they actually apply.

---

## Multi-Tool Teams: Avoiding Drift

When a team uses more than one agent harness (e.g. some engineers on Claude Code, others on Cursor or Codex), the biggest practical risk isn't picking the "wrong" file — it's **drift** between multiple copies of essentially the same content.

- Put the shared, tool-agnostic instructions in `AGENTS.md` at the repo root.
- For harnesses that don't read it natively, add the smallest possible adapter:
  - Claude Code: a `CLAUDE.md` whose first line imports it (`@AGENTS.md`)
  - Cursor: a short `.mdc` rule that references it, reserving Cursor's glob-scoped frontmatter for genuinely Cursor-specific scoping
  - Others: whatever the harness's minimal native format supports
- Periodically re-review `AGENTS.md` for content that has since migrated into the toolchain (a linter rule, a CI check) and can be deleted rather than maintained forever.
- If the user is juggling several hand-maintained copies today, the fix is a one-time consolidation into `AGENTS.md` plus adapters — not a new set of authoring rules per file.
