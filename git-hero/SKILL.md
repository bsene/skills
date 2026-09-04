---
name: git-hero
description: >
  Git best practices — commit discipline, branching/history hygiene, safety, and CI/CD pipelines.
  Routes to `git-guru` (expert Q&A), `gitmoji`, and `gitlab-dag` sub-skills.

  TRIGGER when: commits (Conventional Commits, atomic commits, commit message format, commit hygiene,
  commit types, scope selection, breaking change),
  history (branch naming, rebase vs merge, clean git history, interactive rebase, history management),
  safety (force push safety, recover lost commits, reflog, reset),
  CI/CD (GitLab CI, pipeline optimization, DAG, .gitlab-ci.yml),
  emoji (gitmoji, commit emoji, "quel emoji pour ce commit"),
  setup (git configuration, "bonnes pratiques git", "comment faire un rebase", "configure git properly").
  DO NOT USE when: user needs a single one-shot git command answer — let Claude answer directly.
metadata:
  user-invocable: "false"
---

# Git Hero

Comprehensive Git mastery — best practices, expert Q&A, gitmoji, and CI/CD pipelines.

## Route to Sub-skills

Route immediately on keyword match. Answer inline only for quick factual git questions not covered by a sub-skill.

-> **Git Q&A** — route when: user asks about concepts, commands, workflows, internals, troubleshooting, conflicts, stash, rebase, reflog, or anything "how do I do X in git?" → `git-guru/` sub-skill
-> **Gitmoji** — route when: user asks about commit emoji, gitmoji prefix, "which emoji for this commit?", or emoji commit conventions → `gitmoji/` sub-skill
-> **GitLab CI/CD** — route when: user mentions GitLab pipelines, DAG, `needs:`, parallel matrix, `.gitlab-ci.yml`, or pipeline optimization → `gitlab-dag/` sub-skill

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

---

## Benchmark

Scenario: `.benchmarks/scenarios/git-hero-001-atomic-commits.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/git-hero-001-atomic-commits.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 100% | +0%   |
| claude-sonnet-4-6 | 100%    | 100% | +0%   |
| claude-haiku-4-5  | 100%    | 100% | +0%   |

> **NEUTRAL (run 2026-08-31)**. All models 100% with and without — atomic-commit guidance is at ceiling on this scenario; the router's value is triage, not code change. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
