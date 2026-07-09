# Workflow Decisions

Decision matrices for choosing workflows, branching strategies, and merge vs rebase.

## Merge vs Rebase Decision Matrix

| Scenario | Use | Why |
| -------- | --- | --- |
| Syncing your branch with upstream | `git pull --rebase` | Keeps your commits on top, avoids noise merge commits |
| Landing feature into main | `git merge --no-ff` | Preserves feature boundary as a merge commit |
| Shared branch (others have pulled it) | `git merge` | Never rewrite shared history |
| Cleaning up local commits before PR | `git rebase -i` | Squash fixups, reword messages, reorder |
| Undoing a merged feature | `git revert -m 1 <merge-sha>` | Safe undo without rewriting history |
| Updating a long-lived branch (develop) | `git merge` | Rebase would rewrite too many shared commits |

### The Golden Rule

> **Never rebase commits that exist outside your local repository.**

If you've pushed and someone else may have pulled, treat that history as immutable. Use merge or revert.

## Workflow Comparison

### Trunk-Based Development

```
main ─────●────●────●────●────●────
           \  /      \  /
            ●         ●
         (short-lived branches, < 1 day)
```

**Best for:** Small teams (1-3), continuous deployment, high trust.

**Rules:**
- Branch from main, merge back within hours (1 day max)
- Feature flags for incomplete work
- No long-lived branches
- CI/CD on every push to main

**Pros:** Minimal merge conflicts, fast feedback, simple mental model.
**Cons:** Requires solid CI/CD, feature flags add complexity, risky without good test coverage.

### GitHub Flow

```
main ────●────●─────────●────●────
          \              /
           ●────●────●──
            (feature branch + PR)
```

**Best for:** Teams of 3-10, frequent releases, code review culture.

**Rules:**
- Main is always deployable
- Branch for every change (feature, fix, chore)
- Open PR for review before merging
- Deploy from main after merge

**Pros:** Simple, enforces review, works well with CI/CD.
**Cons:** No release staging, main can break if CI is weak.

### GitFlow

```
main    ────●──────────────────●────
             \                /
develop ──●───●───●───●───●──●──────
           \     / \     /
            ●──●    ●──●
          (feature) (feature)
              \
               ● (release branch)
```

**Best for:** Large teams (10+), scheduled releases, multiple versions in production.

**Rules:**
- `main` — production-ready only, tagged releases
- `develop` — integration branch for next release
- `feature/*` — branch from develop, merge back to develop
- `release/*` — branch from develop for release prep, merge to both main and develop
- `hotfix/*` — branch from main for urgent fixes, merge to both main and develop

**Pros:** Clear release process, parallel development, hotfix isolation.
**Cons:** Complex, many long-lived branches, merge overhead.

## Branch Naming Conventions

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

## Branch Lifecycle Checklist

1. **Create** — branch from the right base (`main` or `develop`)
2. **Name** — use `<type>/<slug>` convention (`feature/oauth-login`)
3. **Work** — atomic commits, rebase to sync with upstream
4. **Review** — open PR, get approval
5. **Merge** — `--no-ff` to preserve branch history
6. **Delete** — immediately after merge (both local and remote)

```bash
# After merge, clean up
git branch -d feature/oauth-login            # delete local
git push origin --delete feature/oauth-login  # delete remote
```

## When to Squash

| Situation | Strategy |
| --------- | -------- |
| Feature branch with clean atomic commits | Merge as-is (`--no-ff`) |
| Feature branch with messy WIP commits | Squash into 1-3 logical commits before merging |
| Single-commit fix | Fast-forward or `--no-ff` (team preference) |
| Large refactor with meaningful stages | Keep individual commits, rebase to clean up fixups |

**Squash workflow:**

```bash
git rebase -i main        # mark commits as 'squash' or 'fixup'
# Edit the combined message
git push --force-with-lease --force-if-includes origin <branch>
```
