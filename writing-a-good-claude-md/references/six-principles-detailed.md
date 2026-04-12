# The Six Principles (Detailed)

## 1. Less is More

LLMs can reliably follow ~150–200 instructions total. Claude Code's own system prompt already consumes ~50. That means you have a budget of roughly 100–150 instructions before quality degrades uniformly across _all_ instructions — not just the new ones.

**Rules:**

- Include only instructions that are **universally applicable** to every task in your codebase
- Omit anything task- or domain-specific (e.g. "how to add a new DB schema" shouldn't be in the root file)
- Target < 300 lines; aim for < 60–100 lines if possible
- When in doubt, cut it

---

## 2. Universally Applicable Content Only

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

---

## 3. Progressive Disclosure

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

---

## 4. Don't Use Claude as a Linter

Code style and formatting are for deterministic tools (Biome, ESLint, Prettier, Ruff, etc.), not LLMs. Putting style guidelines in `CLAUDE.md`:

- Wastes instruction budget
- Clutters the context window with irrelevant snippets
- Produces inconsistent results

**Better alternatives:**

- Set up a Claude Code `Stop` hook to run your formatter/linter after each turn
- Use a slash command that focuses Claude on `git diff` / changed files for a post-implementation formatting pass
- Use auto-fixable linter rules for maximum safe coverage

LLMs are in-context learners — if the codebase follows consistent patterns, Claude will tend to follow them naturally after a few file reads.

---

## 5. Craft It Manually — Don't Auto-Generate

`CLAUDE.md` is the **highest-leverage point** in your agentic workflow. A bad instruction here affects every session, every plan, every artifact Claude produces.

`/init` and auto-generated `CLAUDE.md` files tend to be bloated and generic. Spend time thinking carefully about every line. Ask yourself: "Is this universally applicable? Would Claude behave differently without this line?"

---

## 6. Understand Why Claude Ignores Instructions

Claude Code wraps `CLAUDE.md` in a system reminder that says:

> _"This context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task."_

This is by design. Claude will skip instructions it judges as irrelevant. The remedy is not to add more instructions — it's to ensure every instruction is _genuinely universally relevant_.
