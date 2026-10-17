---
name: repo-docs
description: >
  Write, audit, or improve a repository's front-door docs: README.md and
  AGENTS.md (plus harness adapters CLAUDE.md, .cursorrules, GEMINI.md, Copilot
  instructions). Use for "writing a readme" / "writing a good agents md": create,
  improve, restructure, or make a README look more professional (library, CLI,
  app, monorepo, GitHub profile README), badges/shields, table of contents,
  getting started, installation, Support or Project Status sections; or write,
  audit, trim, or consolidate AGENTS.md / CLAUDE.md for coding agents,
  progressive disclosure, bloat and anti-patterns. Templates drawn from
  Best-README-Template, standard-readme, makeareadme.com, awesome-readme, and
  the agents.md standard.
---

# Repo Docs

Two files, two audiences. Route first, then read only the matching reference.

| File        | Reader                          | Answers                           | Read                                                |
| ----------- | ------------------------------- | --------------------------------- | --------------------------------------------------- |
| `README.md` | Humans deciding to use the repo | What is it, how do I install/use  | [references/readme.md](references/readme.md)        |
| `AGENTS.md` | Coding agents working in repo   | Non-discoverable rules, commands  | [references/agents-md.md](references/agents-md.md)  |

## Workflow

1. Identify the target: README, AGENTS.md, or both. `CLAUDE.md`, `GEMINI.md`, `.cursorrules` are adapters of AGENTS.md, so route them to the AGENTS.md reference.
2. Read the matching reference and follow its workflow.
3. Keep them separate: orientation, install, and usage belong in the README; agent-only build, test, and boundary rules belong in AGENTS.md. Link, do not duplicate.

## Read On Demand

| Read When                                      | File                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| README templates (library, CLI, profile)       | [readme-templates.md](references/readme-templates.md)                         |
| AGENTS.md principles, evidence                 | [six-principles-detailed.md](references/six-principles-detailed.md)           |
| Which sub-agents load the file                 | [subagent-context-loading.md](references/subagent-context-loading.md)         |
| Anti-pattern fixes, directory-scoped files     | [anti-patterns-and-local-files.md](references/anti-patterns-and-local-files.md) |
| Real production AGENTS.md structures           | [real-world-structure-patterns.md](references/real-world-structure-patterns.md) |
