# Context-budget requirements

## Goal

Make every always-loaded instruction earn its context cost. Keep one authoritative, compact entrypoint per concern; put conditional detail behind an on-demand reference.

## Skill requirements

- Preserve triggers, decision rules, and one unique benchmark/example when they change behavior. Remove repeated explanation, duplicate examples, and generic background first.
- Merge overlapping skills into the closest existing owner. Remove the superseded skill, its catalog and lock entries, and stale audit references.
- Measure a material context reduction by lines or tokens before claiming it. Do not grow an entrypoint without measured value from a benchmark or real failure.
- Keep `SKILL.md` to activation cues, high-signal rules, and links. Put deep workflows and low-frequency examples in `references/`.

## Agent-instruction requirements

- Keep root `AGENTS.md` broadly applicable: project map, non-discoverable commands, hard boundaries, and verification.
- Target 50–100 lines and well under 150. Move task-, domain-, or directory-specific instructions into referenced or directory-scoped documents.
- Keep shared instructions in `AGENTS.md`; use harness-specific files as thin adapters. Never maintain copied rules in Codex, Claude, Pi, or OpenCode files.
- Let linters, formatters, CI, and code enforce deterministic rules instead of spending context on them.

## Session requirements

- Before a session reaches 100,000 used tokens, compact or hand off with the goal, decisions, touched files, validation, and remaining work.
- A handoff must link to files and commands instead of pasting large artifacts or transcripts.

## Context-engineering report capability

For a long-running agent, skill, or context-file change, produce a context-engineering report before proposing a larger context window or adding more always-loaded instructions. This report applies the [Anthropic context-engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents): favor the smallest high-signal context that can achieve the outcome.

### Required report contents

| Area | Report |
| --- | --- |
| Objective | The user outcome, the agent decision it supports, and the failure mode being addressed. |
| Context inventory | System instructions, tools, examples, retrieved documents, history, and persistent notes. Mark each as always loaded, just-in-time, or retained only outside the window. |
| Budget and signal | Token count where available; otherwise lines, bytes, or item count. Identify duplicated, stale, low-signal, or ambiguous material and state what can be removed. |
| Retrieval | Which stable identifiers (paths, URLs, queries, IDs) are kept up front; how the agent retrieves the underlying material only when needed; and the task-specific preloaded context that justifies an exception. |
| Tool surface | Tool purpose, disambiguating trigger, expected output shape, output-size limit, and overlap with other tools. Recommend removal or consolidation where a human cannot choose the correct tool decisively. |
| Prompt and examples | The minimal direct instructions needed; distinct canonical examples only; and the observed failure that justifies every added rule or example. |
| Long-horizon strategy | Choose compaction for conversational continuity, persistent notes for milestone-based work, or focused subagents for independent deep exploration. Explain why the selected strategy fits. |
| Validation | A representative trace or benchmark; before/after context cost; task-success evidence; and regressions or information losses found. |

### Compaction and memory requirements

- Compaction must retain the objective, architectural decisions, active constraints, unresolved defects, touched files, verification status, and next actions.
- Clear or summarize obsolete tool outputs before removing decisions or unresolved evidence. Tune summaries for recall first, then remove material that does not change the next decision.
- Persistent notes must be structured, small, and updateable. They are an index to durable files and results, not a transcript copy.
- A subagent may explore a large context, but returns only a concise finding summary with evidence pointers, open questions, and a recommendation.

### Report output template

```markdown
## Context-engineering report

### Objective and failure mode
...

### Context inventory and budget
| Source | Load mode | Cost | Keep / change | Reason |
| --- | --- | ---: | --- | --- |

### Retrieval and tool plan
...

### Long-horizon plan
...

### Validation
...
```

## Current consolidation: `simple` into `clean-code`

- `clean-code/SKILL.md` owns readability, complexity, and abstraction decisions.
- It retains: rule of three, root-cause fixes, chunking versus slicing, and explicit domain complexity.
- `simple/SKILL.md` does not exist; `README.md` and `skills-lock.json` have no `simple` entry.
- The `simple-001-root-cause-fix` benchmark remains discoverable from `clean-code/SKILL.md`.

## Validation

```sh
test ! -e simple/SKILL.md
! rg -n 'simple/SKILL.md|\[simple\]' README.md skills-lock.json
git diff --check
```
