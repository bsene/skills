---
name: writing-a-good-agents-md
description: >
  Write, audit, or improve AGENTS.md — the tool-agnostic context file for
  coding agents — plus harness adapters (CLAUDE.md, .cursorrules, GEMINI.md,
  Copilot instructions). Use when creating one from scratch, auditing for
  bloat or anti-patterns, consolidating multiple tool files into one source
  of truth, or applying progressive disclosure.
metadata:
  source: https://www.humanlayer.dev/blog/writing-a-good-claude-md
  author: Kyle (HumanLayer), generalized for AGENTS.md
  standard: https://agents.md/
  version: "2.0"
---

# Writing a Good AGENTS.md

Help users write, audit, and improve `AGENTS.md` — and the harness-specific files that sit alongside or import it.

## Core Model

`AGENTS.md` is an **onboarding document**, not a configuration dump. It answers three questions:

- **WHY** — purpose of the project and its components
- **WHAT** — stack, structure, map of the codebase
- **HOW** — build, test, verify commands the agent runs

Everything else lives elsewhere: linter config, sub-documents, one-off instructions.

## Audit Checklist

| Check | Question |
|---|---|
| **Universality** | Does every instruction apply to every task? |
| **Length** | Under ~150 lines? Ideally 50–100? |
| **Linter work** | Code style rules a formatter could enforce instead? |
| **Stale snippets** | Pasted code that could go stale? Use `file:line` refs |
| **Instruction count** | Approaching 20–30+ discrete rules? |
| **Auto-generated** | Raw `/init` output? Rewrite from scratch, don't prune |
| **Progressive disclosure** | Domain docs referenced, not inlined? |
| **Hotfix accumulation** | One-off workarounds instead of structure? |
| **Duplication across tools** | Same content pasted into CLAUDE.md/.cursorrules instead of imported? |

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

## Git

- [Merge strategy, commit message format, branch naming]

## Reference Docs

Read these files when relevant to your current task — don't read all of them upfront:

| File                         | When to read                |
| ---------------------------- | --------------------------- |
| `agent_docs/architecture.md` | Understanding system design |
| `agent_docs/database.md`     | Working with data models    |
| `agent_docs/testing.md`      | Writing or running tests    |
| `agent_docs/deployment.md`   | Deploying or CI/CD work     |
```

No frontmatter, no required fields — plain Markdown by design, which is what makes it portable across harnesses.

## Harness Adapters

`AGENTS.md` is the shared source of truth; harness files are thin adapters, never copies:

| Harness | Adapter |
|---|---|
| Claude Code | `CLAUDE.md` whose first line imports it: `@AGENTS.md` |
| Cursor | Short `.mdc` rule referencing it; glob scoping only for Cursor-specific rules |
| Gemini CLI | `GEMINI.md` — same relationship as CLAUDE.md |
| Codex, Windsurf, Zed, OpenCode | Read `AGENTS.md` natively; no adapter |

Single tool → just write `AGENTS.md`. Multiple tools → adapters, never copy-paste: three copies guarantee drift.

## Read On Demand

| Read When | File |
|---|---|
| Principle details, research evidence, reasoning | [Six Principles Detailed](references/six-principles-detailed.md) |
| Writing workflow, anti-pattern fixes, directory-scoped files, drift | [Anti-Patterns & Local Files](references/anti-patterns-and-local-files.md) |

## Benchmark

Scenario: `.benchmarks/scenarios/writing-a-good-agents-md-001-consolidate.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/writing-a-good-agents-md-001-consolidate.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 50%     | 100% | +50%  |
| claude-sonnet-4-6 | 67%     | 100% | +33%  |
| claude-haiku-4-5  | 83%     | 100% | +17%  |

> **PASS (run 2026-08-31)**. Gains on all models; consolidation criteria land. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.