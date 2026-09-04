# The Six Principles (Detailed)

## 1. Less is More

Every instruction competes for a limited attention budget on top of tool definitions, history, and file contents already in context. A 2026 study of LLM-generated context files across 138 real-world repositories found such files consistently _reduced_ task success and _increased_ inference cost; hand-written files helped only when minimal and precise. The mechanism: agents follow bloated instructions faithfully, which broadens exploration and inflates reasoning cost without improving outcomes.

**Rules:**

- Only instructions **universally applicable** to every task in the codebase
- Target well under 150 lines; aim for 50–100
- If a constraint can live in a linter, CI, or the code itself, it does not live here
- When in doubt, cut it

## 2. Universally Applicable Content Only

`AGENTS.md` loads in every session regardless of task. Irrelevant content dilutes attention on every run.

**Good candidates:** project overview (1–3 sentences), build commands, test/typecheck commands, monorepo structure, hard boundaries (never-touch files, never-commit secrets), self-verification steps.

**Bad candidates:**

- Code style → linter/formatter
- Domain-specific how-tos, seldom-needed commands → sub-docs
- Hotfixes for one-off behavior → directory-scoped file or delete
- Directory tree "just in case" — research shows it doesn't speed up file discovery; a map earns its place for architectural orientation only

## 3. Progressive Disclosure

Give the agent a **map to find information**, not all information upfront. Keep domain docs in `agent_docs/` with a short pointer table in `AGENTS.md`; the agent reads only what the task needs.

**Prefer pointers over copies:** reference `file:line` locations instead of pasting code snippets — snippets go stale. Same for multi-tool setups: `AGENTS.md` is the source of truth; harness files import it.

## 4. Don't Use the Agent as a Linter

Style rules enforced by an LLM are inconsistent; enforced by a linter they're free. Set up a post-turn hook (e.g. Claude Code's `Stop` hook) or a custom command for a post-implementation formatting pass over changed files.

Agents are in-context learners: consistent codebase patterns get followed naturally after a few file reads, no conventions spelled out.

## 5. Craft It Manually

`AGENTS.md` is the highest-leverage point in an agentic workflow — read in every session, every tool. Auto-generated `/init` output is a first draft, not a product; the same research above found LLM-generated files actively hurt more often than help. Test every line: "Would the agent behave differently without this?"

If a repo has an auto-generated file, rewrite from scratch using WHY/WHAT/HOW — don't prune in place.

## 6. Why Agents Ignore Instructions

Harnesses treat context files as supplementary — Claude Code explicitly wraps it in a "may or may not be relevant" reminder. Instructions judged irrelevant get skipped.

The subtler risk: agents follow what they _do_ deem relevant faithfully, broadening exploration and raising cost even when strict following wasn't needed. Either way the remedy is the same — fewer, universally relevant instructions, not more hoping some stick.
