---
name: git-hero
description: "Comprehensive Git mastery — opinionated best practices, expert Q&A, gitmoji commit prefixes, and GitLab CI/CD pipelines. Use when the user asks about git best practices, commit hygiene, branching strategy, history management, force push safety, git workflow setup, clean git history, atomic commits, branch naming, rebase vs merge strategy, git configuration, gitmoji, commit emoji, GitLab CI, pipeline optimization, or says things like 'review my git workflow', 'how should I set up git', 'what are good git practices', 'configure git properly', 'mes bonnes pratiques git', 'comment faire un rebase', 'quel emoji pour ce commit'."
---

# Git Hero

Comprehensive Git mastery — best practices, expert Q&A, gitmoji, and CI/CD pipelines.

## Route to Sub-skills

-> **Git Q&A** (concepts, commands, workflows, internals, troubleshooting, conflicts, stash, rebase, reflog...) -> `git-guru/` sub-skill
-> **Gitmoji** (commit emoji, gitmoji prefix, which emoji for..., emoji commit convention...) -> `gitmoji/` sub-skill
-> **GitLab CI/CD** (GitLab pipelines, DAG, `needs:`, parallel matrix, `.gitlab-ci.yml`...) -> `gitlab-dag/` sub-skill

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

## History Strategy

### The Three Rules

| Rule | When | Command |
| ---- | ---- | ------- |
| **Rebase to sync** | Updating your branch with upstream changes | `git pull --rebase` (or `pull.rebase=true`) |
| **Merge --no-ff to integrate** | Landing a feature branch into main | `git merge --no-ff feature-branch` |
| **Never rebase shared branches** | Branch has been pushed and others work on it | Use `merge` or `revert` instead |

### Why Linear History Matters

- `git bisect` works reliably
- `git log --oneline` tells a coherent story
- Reverts are clean single-commit operations
- Code review diffs stay minimal

## Branch Conventions

### Naming

```
<type>/<ticket-or-slug>
```

| Prefix | Purpose | Example |
| ------ | ------- | ------- |
| `feature/` | New functionality | `feature/oauth-login` |
| `fix/` | Bug fix | `fix/cart-double-submit` |
| `hotfix/` | Urgent production fix | `hotfix/payment-timeout` |
| `release/` | Release preparation | `release/2.1.0` |
| `chore/` | Maintenance, tooling | `chore/upgrade-eslint` |

### Lifecycle

1. Branch from `main` (or `develop` in GitFlow)
2. Keep branches short-lived -- merge within days, not weeks
3. Delete after merge -- branches are pointers, not archives

## Safety Nets

### Force Push

Never use `--force`. Always use the safe alternative:

```bash
git push --force-with-lease --force-if-includes origin <branch>
```

- `--force-with-lease` -- refuses if remote has commits you haven't fetched
- `--force-if-includes` -- refuses if your local ref doesn't include remote tip

### Rerere (Reuse Recorded Resolution)

Enable once, benefit forever:

```bash
git config --global rerere.enabled true
```

Git remembers how you resolved conflicts and auto-applies the same resolution next time.

### Reflog as Safety Net

Every HEAD movement is logged for 90 days. If you lose commits:

```bash
git reflog                    # find the SHA before the mistake
git reset --hard <sha>        # restore to that point
```

## Essential Config

These settings enforce the practices above:

```bash
git config --global pull.rebase true
git config --global rerere.enabled true
git config --global init.defaultBranch main
git config --global core.autocrlf input
```

### GPG Signing (SSH)

```bash
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
```

### Recommended Aliases

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.fap 'fetch --all --prune'
git config --global alias.lola 'log --graph --decorate --pretty=oneline --abbrev-commit --all'
```

## Modern Syntax

Prefer the modern commands over legacy `checkout`:

| Legacy | Modern | Purpose |
| ------ | ------ | ------- |
| `git checkout <branch>` | `git switch <branch>` | Switch branches |
| `git checkout -b <branch>` | `git switch -c <branch>` | Create and switch |
| `git checkout -- <file>` | `git restore <file>` | Discard changes |
| `git checkout --patch` | `git restore --patch` | Selective discard |
| `git reset HEAD <file>` | `git restore --staged <file>` | Unstage |

## Workflow Selection

| Team Size | Release Cadence | Recommended Workflow |
| --------- | --------------- | -------------------- |
| 1-3 devs | Continuous | Trunk-Based Development |
| 3-10 devs | Weekly/biweekly | GitHub Flow |
| 10+ devs | Scheduled releases | GitFlow |

For detailed workflow comparison and merge vs rebase decision matrix, see [references/workflow-decisions.md](references/workflow-decisions.md).

## References

- Full config recipes with explanations -> [references/config-recipes.md](references/config-recipes.md)
- Workflow comparison and decision matrices -> [references/workflow-decisions.md](references/workflow-decisions.md)
