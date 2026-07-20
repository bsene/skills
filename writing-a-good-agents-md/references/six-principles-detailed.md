# The Six Principles (Detailed)

## 1. Less is More

Every agent harness ships its own system prompt/scaffolding before your file is even loaded, and every additional instruction competes for a limited attention budget. `AGENTS.md` content adds to that load on top of tool definitions, conversation history, and file contents already in context. That means you have a limited budget of instructions before quality degrades — not just for the new lines you add, but for everything already there.

Recent field research backs this up directly: a 2026 study of LLM-generated context files across 138 real-world repositories found that such files consistently *reduced* agent task success rates and *increased* inference cost, while carefully hand-written, minimal files produced only a small improvement — and only when kept minimal and precise. The mechanism isn't that agents ignore bloated instructions; it's that they follow them faithfully, which broadens exploration and inflates reasoning cost without improving outcomes.

**Rules:**

- Include only instructions that are **universally applicable** to every task in your codebase
- Omit anything task- or domain-specific (e.g. "how to add a new DB schema" shouldn't be in the root file)
- Target well under 150 lines; aim for 50–100 if possible
- If a constraint can be expressed elsewhere (linter, CI, code itself), it should not live in `AGENTS.md`
- When in doubt, cut it

---

## 2. Universally Applicable Content Only

`AGENTS.md` (and whatever harness-specific file imports it) appears in _every single session_, regardless of which agent or which task. Irrelevant content dilutes the agent's attention and wastes instruction budget on every run, not just the ones where it happens to matter.

**Good candidates:**

- Project overview (1–3 sentences)
- How to build the project
- How to run tests / typechecks
- Key monorepo structure (app names, shared packages)
- Hard boundaries (files/directories never to touch, secrets never to commit)
- How the agent should verify its own changes

**Bad candidates:**

- Code style guidelines → use a linter/formatter
- Domain-specific how-tos → move to referenced sub-docs
- Seldom-needed commands → move to referenced sub-docs or slash/custom commands
- Hotfixes for one-off behavior → remove, or move to a directory-scoped file
- A directory tree/map "just in case" — research suggests directory maps in context files don't meaningfully speed up file discovery during implementation tasks; most modern agents navigate a reasonably-structured repo fine without one. A map earns its place for architectural orientation, not as a substitute for reading the repo.

---

## 3. Progressive Disclosure

Don't tell the agent everything upfront. Instead, give it a **map to find information** when it needs it.

**Pattern:**

```
agent_docs/
  |- building_the_project.md
  |- running_tests.md
  |- code_conventions.md
  |- service_architecture.md
  |- database_schema.md
```

In `AGENTS.md`, include a short table of these files with descriptions. Tell the agent to read only the ones relevant to its current task.

**Prefer pointers over copies.** Reference `file:line` locations instead of pasting code snippets — snippets go stale.

This same idea extends to multi-tool setups: keep the shared source of truth in `AGENTS.md`, and let harness-specific files (`CLAUDE.md`, `.cursor/rules/*.mdc`, `GEMINI.md`) import it rather than duplicating it.

---

## 4. Don't Use the Agent as a Linter

Code style and formatting are for deterministic tools (Biome, ESLint, Prettier, Ruff, etc.), not for instructions in `AGENTS.md`. Putting style guidelines there:

- Wastes instruction budget
- Clutters the context window with content that's better enforced mechanically
- Produces inconsistent results, since an LLM won't apply a formatting rule with 100% consistency the way a linter will

**Better alternatives:**

- Set up a post-turn hook (where the harness supports one, e.g. Claude Code's `Stop` hook) to run your formatter/linter automatically
- Use a custom/slash command that focuses the agent on `git diff` / changed files for a post-implementation formatting pass
- Use auto-fixable linter rules for maximum safe coverage

Agents are in-context learners — if the codebase follows consistent patterns, the agent will tend to follow them naturally after a few file reads, without needing every convention spelled out.

---

## 5. Craft It Manually — Don't Auto-Generate and Ship As-Is

`AGENTS.md` is the **highest-leverage point** in your agentic workflow. A bad instruction here affects every session, every plan, every artifact the agent produces, and it's read regardless of which specific tool the person on your team happens to be using.

Most harnesses offer some form of `/init` or auto-generation command that scans the repo and drafts a starter file. Treat this as a first draft, not a finished product — auto-generated files tend to be bloated and generic, and the same research cited above found LLM-generated context files actively hurt task success rates more often than they help. Spend time thinking carefully about every line. Ask yourself: "Is this universally applicable? Would the agent behave differently without this line?"

If a repo already has one tool's auto-generated file (e.g. a Codex-`/init`-style `AGENTS.md`, or a Claude-Code-`/init`-style `CLAUDE.md`), the fix is the same either way: rewrite from scratch using WHY/WHAT/HOW, don't just prune the generated version in place.

---

## 6. Understand Why Agents Ignore or Are Hurt By Instructions

Some harnesses (Claude Code among them) explicitly wrap the loaded context file in a system reminder along the lines of:

> _"This context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task."_

This is by design across the ecosystem, even where it isn't stated so explicitly: agent context files are treated as supplementary, not as hard rules the agent must obey regardless of relevance. An instruction the agent judges irrelevant to the current task will often get skipped.

But the risk isn't only "ignored and harmless." As principle 1 covers, unnecessary content in `AGENTS.md` doesn't just sit there neutrally — agents tend to follow what's there fairly faithfully once they decide it's relevant, which can broaden exploration and increase cost even for guidance that didn't need to be followed strictly. The remedy either way is the same: don't add more instructions hoping some will stick — make every one you keep genuinely universally relevant.
