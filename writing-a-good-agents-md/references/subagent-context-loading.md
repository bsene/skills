# Sub-Agent Context Loading: Who Reads This File

The context file is not read by every agent. Claude Code splits its agents into those
that **produce or judge** code and those that **explore** it — and only the first group
loads `AGENTS.md` / `CLAUDE.md`.

## Who loads it, who doesn't

| Agent                       | Loads the file    | Role                         |
| --------------------------- | ----------------- | ---------------------------- |
| Implementer (main loop)     | Yes               | writes and edits code        |
| General-purpose sub-agent   | Yes               | multi-step tasks             |
| Custom agents and reviewers | Yes               | produce and apply judgment   |
| **Explore** sub-agent       | **No, by design** | codebase search, orientation |
| **Plan** sub-agent          | **No, by design** | plan-mode context gathering  |

No setting changes this. The two agents that fire most often — every delegated codebase
lookup, every plan-mode exploration — never see a line of the file.

## The audience rule

Write the file as a **contract for producers and judges**, not a guided tour:

- **Stays in the file** — judgment content the implementer cannot rebuild by reading code:
  - Definition of done ("done" means tests green, types clean, verified in the running app)
  - What a good test looks like here (behavioral vs snapshot, what must be covered)
  - Patterns refused in review (the reviewer agent loads this file)
  - Invariants that must never move (landmines, never-touch areas)
  - Non-discoverable build/test commands — kept not for the explorer but because the
    _judge_ needs the path to green
- **Lives elsewhere** — orientation content an explorer would consume:
  - Directory layouts, module maps, "where things live"
  - The implementer rebuilds that map in seconds of grep anyway
  - Put it in the `README` or an ADR — plain files the Explore agent **does** read

The same rule applies to nested `CLAUDE.md` files: local rules, not a local map.

## Reaching the explorers

Exactly one channel reaches an Explore or Plan sub-agent: the prompt given at delegation.
If a rule must steer a search, put it in the delegation prompt — not in the context file.

## The `/init` direction

Raw `/init` output was always a first draft (see [Craft It Manually](six-principles-detailed.md)).
The newer interactive init flow (`CLAUDE_CODE_NEW_INIT=1`) and its `/init-verifiers`
companion skills push further the same way: generate what producers and judges need,
leave orientation to files explorers can find themselves.
