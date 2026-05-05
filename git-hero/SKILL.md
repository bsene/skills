---
name: git-hero
description: >
  Comprehensive Git mastery: commit discipline (Conventional Commits, atomic commits) inline, plus routing to
  expert Q&A (`git-guru`), gitmoji (`gitmoji`), and GitLab CI/CD pipelines (`gitlab-dag`) sub-skills.

  TRIGGER when: user asks about git best practices, commit hygiene, atomic commits, branching strategy,
  history management, force push safety, git workflow setup, clean git history, branch naming,
  rebase vs merge strategy, git configuration, gitmoji, commit emoji, GitLab CI, pipeline optimization,
  Conventional Commits, "review my git workflow", "how should I set up git", "what are good git practices",
  "configure git properly", "mes bonnes pratiques git", "comment faire un rebase", "quel emoji pour ce commit".
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

**Examples:**

```
feat(auth): add OAuth2 login with Google
fix(cart): prevent double-submission on slow networks
refactor: extract validation into shared module
```

### Atomic Commits

One logical change per commit. Each commit should:

- Compile and pass tests on its own
- Be revertable without side effects
- Have a message that fully describes the change

**Smell test:** if the message needs "and", split the commit.

## Read On Demand

| Read When | File |
| --- | --- |
| Configuring git (aliases, GPG signing, push safety, force push, reflog, modern syntax, rerere) | [Config Recipes](references/config-recipes.md) |
| Choosing a workflow, merge vs rebase, branch naming conventions, branch lifecycle | [Workflow Decisions](references/workflow-decisions.md) |
