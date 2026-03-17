---
name: writing-a-good-claude-md
description: >
  Write, review, audit, or improve CLAUDE.md (or AGENTS.md) files for Claude Code and other AI coding agent harnesses (OpenCode, Zed, Cursor, Codex). Use this skill whenever the user wants to create a new CLAUDE.md from scratch, audit an existing one for bloat or anti-patterns, improve instruction quality, apply progressive disclosure, split monolithic context into referenced sub-documents, or understand CLAUDE.md best practices. Trigger even for casual mentions like "help me write my CLAUDE.md", "is my CLAUDE.md good?", "what should go in CLAUDE.md?", or "my agent keeps ignoring my instructions". Also applies to AGENTS.md files — treat them identically.
---

# writing-a-good-claude-md Skill

> This skill is based on **"Writing a good CLAUDE.md"** by [Kyle](https://twitter.com/0xblacklight) (November 25, 2025), published on the [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md). All core principles and recommendations are derived from that article.

Help users write, audit, and improve `CLAUDE.md` (or `AGENTS.md`) files for AI coding agent harnesses.

---

## Core Mental Model

`CLAUDE.md` is an **onboarding document**, not a configuration dump. It answers three questions about your codebase:

- **WHY** — What is the purpose of this project and its components?
- **WHAT** — What is the tech stack, project structure, and map of the codebase?
- **HOW** — How does Claude actually work on this project? (build commands, test commands, verification steps)

Everything else should live elsewhere.

---

## The Six Principles

### 1. Less is More

LLMs can reliably follow ~150–200 instructions total. Claude Code's own system prompt already consumes ~50. That means you have a budget of roughly 100–150 instructions before quality degrades uniformly across _all_ instructions — not just the new ones.

**Rules:**

- Include only instructions that are **universally applicable** to every task in your codebase
- Omit anything task- or domain-specific (e.g. "how to add a new DB schema" shouldn't be in the root file)
- Target < 300 lines; aim for < 60–100 lines if possible
- When in doubt, cut it

### 2. Universally Applicable Content Only

`CLAUDE.md` appears in _every single session_. Irrelevant content dilutes Claude's attention and wastes instruction budget.

**Good candidates:**

- Project overview (1–3 sentences)
- How to build the project
- How to run tests / typechecks
- Key monorepo structure (app names, shared packages)
- How Claude should verify its own changes

**Bad candidates:**

- Code style guidelines → use a linter
- Domain-specific how-tos → move to referenced sub-docs
- Seldom-needed commands → move to referenced sub-docs
- Hotfixes for one-off behavior → remove or move to slash commands

### 3. Progressive Disclosure

Don't tell Claude everything upfront. Instead, give Claude a **map to find information** when it needs it.

**Pattern:**

```
agent_docs/
  |- building_the_project.md
  |- running_tests.md
  |- code_conventions.md
  |- service_architecture.md
  |- database_schema.md
```

In `CLAUDE.md`, include a short table of these files with descriptions. Tell Claude to read only the ones relevant to its current task.

**Prefer pointers over copies.** Reference `file:line` locations instead of pasting code snippets — snippets go stale.

### 4. Don't Use Claude as a Linter

Code style and formatting are for deterministic tools (Biome, ESLint, Prettier, Ruff, etc.), not LLMs. Putting style guidelines in `CLAUDE.md`:

- Wastes instruction budget
- Clutters the context window with irrelevant snippets
- Produces inconsistent results

**Better alternatives:**

- Set up a Claude Code `Stop` hook to run your formatter/linter after each turn
- Use a slash command that focuses Claude on `git diff` / changed files for a post-implementation formatting pass
- Use auto-fixable linter rules for maximum safe coverage

LLMs are in-context learners — if the codebase follows consistent patterns, Claude will tend to follow them naturally after a few file reads.

### 5. Craft It Manually — Don't Auto-Generate

`CLAUDE.md` is the **highest-leverage point** in your agentic workflow. A bad instruction here affects every session, every plan, every artifact Claude produces.

`/init` and auto-generated `CLAUDE.md` files tend to be bloated and generic. Spend time thinking carefully about every line. Ask yourself: "Is this universally applicable? Would Claude behave differently without this line?"

### 6. Understand Why Claude Ignores Instructions

Claude Code wraps `CLAUDE.md` in a system reminder that says:

> _"This context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task."_

This is by design. Claude will skip instructions it judges as irrelevant. The remedy is not to add more instructions — it's to ensure every instruction is _genuinely universally relevant_.

---

## Workflow: Writing a New CLAUDE.md

1. **Gather answers to WHY/WHAT/HOW** — ask the user if needed
2. **Draft a minimal root file** (target 40–80 lines)
   - 1–3 sentence project overview
   - Stack and structure summary
   - Build / test / verify commands
   - Pointer table to `agent_docs/` sub-documents (if applicable)
3. **Identify content that should move to sub-docs**
   - Domain-specific how-tos → `agent_docs/`
   - Code style → linter config
   - Rarely needed commands → slash commands or sub-docs
4. **Draft sub-documents** for each major topic (if needed)
5. **Review** using the audit checklist below

---

## Workflow: Auditing an Existing CLAUDE.md

Ask the user to share their current `CLAUDE.md`. Then evaluate it against:

### Audit Checklist

| Check                      | Question                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **Universality**           | Is every instruction applicable to _every_ task the agent might do?                     |
| **Length**                 | Is it under 300 lines? Could it be under 100?                                           |
| **Linter work**            | Does it include code style rules that a formatter could enforce?                        |
| **Stale snippets**         | Does it paste code that could go stale? Use `file:line` refs instead                    |
| **Instruction count**      | Count bullets/rules. Is it approaching 50+?                                             |
| **Auto-generated**         | Does it look like it was generated by `/init`? If so, it needs a rewrite                |
| **Progressive disclosure** | Are domain-specific docs referenced rather than inlined?                                |
| **Hotfix accumulation**    | Are there specific one-off instructions that suggest workarounds rather than structure? |

For each failure, suggest a concrete fix: move to sub-doc, delete, replace with linter rule, etc.

---

## Template: Minimal CLAUDE.md

```markdown
# Project Name

Brief description of what this project does and why it exists (2-3 sentences).

## Stack & Structure

- **Frontend**: [framework, location]
- **Backend**: [framework, location]
- **Shared packages**: [names and purpose]
- **Key config**: [important files/locations]

## Working on This Project

Build: `<command>`
Test: `<command>`
Typecheck: `<command>`
Lint: `<command>`

Always verify your changes compile and tests pass before considering a task done.

## Reference Docs

Read these files when relevant to your current task — don't read all of them upfront:

| File                         | When to read                |
| ---------------------------- | --------------------------- |
| `agent_docs/architecture.md` | Understanding system design |
| `agent_docs/database.md`     | Working with data models    |
| `agent_docs/testing.md`      | Writing or running tests    |
| `agent_docs/deployment.md`   | Deploying or CI/CD work     |
```

---

## Common Anti-Patterns and Fixes

| Anti-Pattern                                 | Fix                                                    |
| -------------------------------------------- | ------------------------------------------------------ |
| "Always use tabs not spaces"                 | Configure in `.editorconfig` or linter                 |
| "When adding a new API endpoint, do X, Y, Z" | Move to `agent_docs/adding_endpoints.md`               |
| 200-line CLAUDE.md                           | Ruthlessly prune; move specifics to sub-docs           |
| Pasted code examples                         | Replace with `file:line` references                    |
| Auto-generated by `/init`                    | Rewrite from scratch using WHY/WHAT/HOW                |
| Instructions about one specific module       | Move to that module's directory as a local `CLAUDE.md` |

---

## Notes on Local CLAUDE.md Files

Claude Code supports `CLAUDE.md` files in subdirectories. These are loaded only when Claude is working in that directory. Use them for:

- Package-specific build instructions in a monorepo
- Module-specific conventions
- Sub-team context

This is another form of progressive disclosure — keep root CLAUDE.md minimal and push specifics down.
