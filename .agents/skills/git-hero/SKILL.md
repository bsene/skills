---
name: git-hero
description: >
  Answer Git questions and guide commits, branching, merge/rebase, conflict resolution,
  recovery, configuration, and internals in French or English. Use for Git commands,
  workflows, history rewriting, reflog/stash, Conventional Commits, Gitmoji, and GitLab
  CI pipeline design. Routes emoji selection to gitmoji and GitLab CI to gitlab-dag;
  not for non-Git version control or other CI systems.
metadata:
  user-invocable: "false"
---

# Git Hero

Comprehensive Git mastery — best practices, expert Q&A, gitmoji, and CI/CD pipelines.

## Answer Git questions

Match the user's language and experience. For conceptual questions, explain what and
why before showing a concrete command; use a commit graph when it clarifies history.
For workflow questions, state the recommendation, its trade-offs, and the command sequence.
Keep simple command answers short; read references only when the question needs them.

For recovery, diagnose with `git status` and, when needed, `git reflog` before suggesting
a corrective command. Prefer the safest fix and explain data loss or history rewriting
before recommending destructive commands. Do not rewrite shared history as a default fix.

## Route to specialized skills

- **Commit emoji / Gitmoji** → [gitmoji](gitmoji/SKILL.md). Plain Conventional Commits need no emoji.
- **GitLab pipelines, DAG, `needs:`, parallel matrix** → [gitlab-dag](gitlab-dag/SKILL.md).

---

## Commit Discipline

### Format

Every commit message follows Conventional Commits, optionally prefixed with gitmoji:

```
<emoji> <type>(<scope>): <imperative description>
```

**Rules:**

- **One-liner only** -- no body, no footer, no blank lines
- **Imperative mood** -- "add feature" not "added feature" or "adds feature"
- **Lowercase description** -- no capital after the colon
- **No trailing period**
- **Scope is optional** but recommended for multi-module repos
- **No `Co-Authored-By: Claude` trailer** — never append it, regardless of tool defaults

**Example:** `feat(auth): add OAuth2 login with Google`

### Atomic Commits

One logical change per commit. Each commit should:

- Compile and pass tests on its own
- Be revertable without side effects
- Have a message that fully describes the change

**Smell test:** if the message needs "and", split the commit.

## Read On Demand

| Read When                                                                                                                    | File                                                       |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Choosing a commit type by release impact, breaking changes (`!` / `BREAKING CHANGE`), scope selection, commitlint validation | [Conventional Commits](references/conventional-commits.md) |
| Configuring git (aliases, GPG signing, push safety, force push, reflog, modern syntax, rerere)                               | [Config Recipes](references/config-recipes.md)             |
| Choosing a workflow, merge vs rebase, branch naming conventions, branch lifecycle                                            | [Workflow Decisions](references/workflow-decisions.md)     |
| Environment/release branches, GitLab Flow, feature switches, cherry-pick backports, or CI pipeline quick wins                | [GitLab Flow and Pipelines](references/gitlab-flow.md)     |
| Understanding HEAD, branches, zones, remotes, objects, or merge vs rebase                                                    | [Git Concepts](references/concepts.md)                     |
| Looking up command flags, inspection, worktrees, submodules, or history rewriting                                            | [Command Cheatsheet](references/commands.md)               |
| Understanding snapshots, commit objects, hashes, or the add/commit lifecycle                                                 | [Commit Internals](references/commit.md)                   |
| Undoing, amending, moving commits, resolving conflicts, or using stash                                                       | [Common Scenarios](references/scenarios.md)                |

---

## Benchmark

These historical results predate the Git Guru consolidation; the merged skill has
not been rerun. Scenario IDs remain unchanged to preserve run provenance.

Scenario: `.benchmarks/scenarios/git-hero-001-atomic-commits.md` · Run: 2026-09-04 · Log: `.benchmarks/runs/2026-09-04/git-hero-001-atomic-commits.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 100% | +0%   |
| claude-sonnet-4-6 | 100%    | 100% | +0%   |
| claude-haiku-4-5  | 100%    | 100% | +0%   |

> **NEUTRAL (run 2026-09-04)**. All models 100% with and without — atomic-commit guidance is at ceiling on this scenario; the router's value is triage, not code change. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

### Git questions (formerly Git Guru)

Scenario: `.benchmarks/scenarios/git-guru-001-merge-vs-rebase.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/git-guru-001-merge-vs-rebase.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 83%  | +0%   |
| claude-sonnet-4-6 | 83%     | 100% | +17%  |
| claude-haiku-4-5  | 83%     | 83%  | +0%   |

> **SOFT PASS (run 2026-08-31)**. Sonnet +17; opus/haiku unchanged. Merge-vs-rebase criteria are mostly default behavior. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
