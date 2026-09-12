---
name: vendor-reference
description: >
  Vendor a library's real source code as read-only analysis material and ground
  every usage decision in that code instead of docs, web search, or generated
  guesses.

  TRIGGER when: the user wants to use a library idiomatically, asks "which API /
  pattern should I use for <library>", asks how a library handles errors,
  composition, or resource management, wants Effect-style vendored-source
  grounding, or says "vendor", "vendored", "read the library source".

  DO NOT USE when: the task needs no third-party library source (plain language
  features, infra, tooling), or the library is already covered by a dedicated
  skill (e.g. zod).
metadata:
  user-invocable: "true"
---

# Vendor a library as read-only reference

Real source beats docs: agents that read the library's actual code produce
idiomatic usage instead of hallucinated APIs. This skill vendors the library
into a **gitignored** directory — analysis material only, never in git history.

## Workflow

### 1. Ask first — before anything else

Ask the user which library to ground on. Get:

- **Name** (e.g. `effect`)
- **Source**: repo URL or package name (resolve via the ecosystem registry)
- **Version** (optional; defaults to latest default branch)

Do not proceed without an answer. Do not guess the library from context.

### 2. Gitignore BEFORE fetching — ordering is the safety property

In the **target project** (not this skill repo):

```bash
grep -qx '.vendor/' .gitignore 2>/dev/null || printf '.vendor/\n' >> .gitignore
```

Only then clone. Shallow and blob-limited keeps it small:

```bash
git clone --depth 1 --filter=blob:limit=1m <repo-url> .vendor/<name>
# older git without --filter: plain --depth 1
```

**Never** `git subtree` or `git submodule` — both commit the source into
history. The rule: if `git log --all -- .vendor/` shows any commit, the
constraint is broken. Verify after cloning:

```bash
git status --porcelain   # must list nothing new
```

If `.vendor/<name>` already exists, reuse it; `git -C .vendor/<name> pull --depth 1` to refresh.

### 3. Read-only reference rules

- Treat `.vendor/<name>/` as **read-only analysis material** — never edit, format, or generate files under it.
- **Prefer** examples, types, and patterns from the vendored source over docs summaries, web search results, or generated guesses.
- **Never import from `.vendor/`** — application code imports the real package dependency. The vendored copy is for reading, not linking.
- Never commit, stage, or `git add` anything under `.vendor/`.

### 4. Analysis pass

When answering questions about the library, ground each claim in the source:

| Look at | Why |
| --- | --- |
| Module/entry structure | What is public, what is internal |
| `examples/`, `README`, doc comments | Intended usage patterns |
| Tests | Executable usage documentation — often the most honest examples |
| Error/exit types | How failures are modeled and composed |
| Generics/abstractions | Which patterns the API is designed around |

Cite vendored paths in answers: `.vendor/effect/packages/schema/src/Schema.ts`.

### 5. Distill once — if the library recurs

After the second deep dive on the same library, write a distilled pattern note
to `agent-patterns/<name>.md` in the target project: constructors,
combinators, error handling, resource lifecycle, anti-patterns found in the
source. This note **may** be committed — only the library source itself is
banned from git. Future sessions read the note instead of re-mining the source.

### 6. Report

End with: what was vendored (name, commit SHA, version), key findings with
`file:line` references, and any caveats (version drift vs. the installed
package, monorepo layout, license).

## Compatibility

The same file works across tools:

| Tool | How to use |
| --- | --- |
| Claude Code | Symlink/copy to `.claude/agents/vendor-reference.md` (subagent) or `.claude/skills/` |
| pi | Symlink to `.pi/agents/vendor-reference.md` |
| OpenCode | Copy to the opencode agent directory |
| Codex | No agent format — paste the workflow into `AGENTS.md` instructions |