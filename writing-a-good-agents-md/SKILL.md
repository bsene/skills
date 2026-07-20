---
name: writing-a-good-agents-md
description: >
  Write, review, audit, or improve AGENTS.md files — the open, tool-agnostic
  standard for giving AI coding agents persistent project context — as well as
  the harness-specific files that wrap or import it (CLAUDE.md for Claude Code,
  .cursorrules/.cursor/rules for Cursor, GEMINI.md for Gemini CLI, Copilot
  instructions, .windsurfrules, OpenCode/Zed config, etc). Use this skill
  whenever the user wants to create a new AGENTS.md from scratch, audit an
  existing context file for bloat or anti-patterns, improve instruction
  quality, apply progressive disclosure, split monolithic context into
  referenced sub-documents, reconcile multiple tool-specific files into one
  shared source of truth, or understand AGENTS.md best practices. Trigger even
  for casual mentions like "help me write my AGENTS.md", "is my CLAUDE.md
  good?", "what should go in agents.md?", "my agent keeps ignoring my
  instructions", or "I have a .cursorrules and a CLAUDE.md, how do I unify
  them?". Treat AGENTS.md, CLAUDE.md, and other harness-specific instruction
  files as the same underlying problem — the specific filename almost never
  changes the guidance.
---

# Writing a Good AGENTS.md

> Adapted from **"Writing a good CLAUDE.md"** by [Kyle](https://twitter.com/0xblacklight) (November 25, 2025), published on the [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md), and generalized to [agents.md](https://agents.md/), the open convention now read natively by 30+ coding agents (Codex, Cursor, Gemini CLI, GitHub Copilot, Windsurf, Zed, OpenCode, and others).

Help users write, audit, and improve `AGENTS.md` — and, where relevant, the harness-specific file that sits alongside or imports it.

---

## Core Mental Model

`AGENTS.md` is an **onboarding document**, not a configuration dump. It answers three questions:

- **WHY** — What is the purpose of this project and its components?
- **WHAT** — What is the tech stack, project structure, and map of the codebase?
- **HOW** — How does the agent actually work on this project? (build, test, verify commands)

Everything else should live elsewhere: linter config, one-off instructions, or a referenced sub-document.

This file is read by many different agents, each with its own harness-specific quirks (see [Harness Compatibility](#harness-compatibility-agentsmd-vs-claudemd-vs-others) below), but the underlying authoring discipline is identical across all of them.

---

## The Six Principles (Summary)

| # | Principle | Key Rule |
|---|---|---|
| 1 | Less is More | Budget a limited instruction count; target < 150 lines, ideally under ~50–100 |
| 2 | Universally Applicable Only | Every instruction must apply to every task in the codebase |
| 3 | Progressive Disclosure | Give the agent a map to find info, not all info upfront |
| 4 | Don't Use the Agent as a Linter | Code style belongs in deterministic tools, not AGENTS.md |
| 5 | Craft Manually | Never trust an auto-generated AGENTS.md as a finished product; write every line intentionally |
| 6 | Understand Why Agents Skip Instructions | Content judged irrelevant or unnecessary gets skipped, ignored, or actively hurts task success — make every line count |

---

## Audit Checklist

| Check                      | Question                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| **Universality**           | Is every instruction applicable to _every_ task the agent might do?                     |
| **Length**                 | Is it under ~150 lines? Could it be under 50–100?                                       |
| **Linter work**            | Does it include code style rules that a formatter/linter could enforce instead?         |
| **Stale snippets**         | Does it paste code that could go stale? Use `file:line` refs instead                    |
| **Instruction count**      | Count discrete rules. Is it approaching 20–30+?                                         |
| **Auto-generated**         | Does it look like raw `/init` or similar auto-generated output? If so, it needs a rewrite |
| **Progressive disclosure** | Are domain-specific docs referenced rather than inlined?                                |
| **Hotfix accumulation**    | Are there specific one-off instructions that suggest workarounds rather than structure? |
| **Duplication across tools** | Is the same content copy-pasted into CLAUDE.md, .cursorrules, GEMINI.md, etc. instead of imported from one source? |

---

## Template: Minimal AGENTS.md

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

## Boundaries

- Never modify files in `<generated-dir>/`.
- Never commit `.env` or any file containing secrets.
- [Any other hard constraint the agent must never violate]

## Git

- [Merge strategy, commit message format, branch naming]

## Reference Docs

Read these files when relevant to your current task — don't read all of them upfront:

| File                          | When to read                |
| ------------------------------ | ---------------------------- |
| `agent_docs/architecture.md`  | Understanding system design |
| `agent_docs/database.md`      | Working with data models    |
| `agent_docs/testing.md`       | Writing or running tests    |
| `agent_docs/deployment.md`    | Deploying or CI/CD work     |
```

No frontmatter, no required fields — `AGENTS.md` is plain Markdown by design, which is exactly what makes it portable across harnesses.

---

## Harness Compatibility: AGENTS.md vs CLAUDE.md vs Others

`AGENTS.md` is the shared, tool-agnostic file. Most harness-specific files are best treated as **thin adapters** on top of it rather than independent documents:

| Harness | Native file | How it relates to AGENTS.md |
|---|---|---|
| Claude Code | `CLAUDE.md` | Does **not** read `AGENTS.md` automatically. Point it there with a one-line import (`@AGENTS.md` as the first line of `CLAUDE.md`), or run `/init` in a repo that already has an `AGENTS.md` — Claude Code will read and incorporate it. |
| OpenAI Codex, many others | `AGENTS.md` | Native, no adapter needed. |
| Cursor | `.cursor/rules/*.mdc` (or legacy `.cursorrules`) | Supports glob-scoped frontmatter `AGENTS.md` doesn't have; keep shared content in `AGENTS.md` and use the MDC file only for Cursor-specific scoping. |
| Gemini CLI | `GEMINI.md` | Same relationship as CLAUDE.md — treat as an adapter, not a duplicate. |
| GitHub Copilot | Copilot instructions file | Reference or align with the root `AGENTS.md` rather than re-authoring. |
| Windsurf, Zed, OpenCode, others | Varies | Check current docs; the trend across the ecosystem is to read `AGENTS.md` natively or via a short import. |

**Practical guidance:**
- If the user works with a single tool, just write `AGENTS.md` (or that tool's native filename directly) — don't over-engineer a multi-file setup they don't need.
- If the user works across multiple tools/teammates, put shared instructions in `AGENTS.md` and keep tool-specific files as short adapters (imports, or a couple of lines for tool-only features like Cursor's glob-scoped rules).
- Never copy-paste the same content into three files. That triples the maintenance burden and guarantees drift.
- Nested/directory-local files: several harnesses (Claude Code, Cursor, others) support subdirectory-scoped instruction files, loaded only when the agent is working in that directory. This is progressive disclosure at the filesystem level — see [Anti-Patterns & Local Files](references/anti-patterns-and-local-files.md).

---

## Read On Demand

| Read When | File |
|---|---|
| Full detail on all 6 principles with examples and reasoning | [Six Principles Detailed](references/six-principles-detailed.md) |
| Anti-patterns table, local/directory-scoped files, writing workflow | [Anti-Patterns & Local Files](references/anti-patterns-and-local-files.md) |
