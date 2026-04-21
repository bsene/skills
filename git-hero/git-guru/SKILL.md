---
name: git-hero-git-guru
description: "Expert Git assistant that answers questions about Git concepts, commands, workflows, and best practices — both in French and English. Use this skill whenever the user mentions Git, version control, commits, branches, merges, rebases, conflicts, stash, push/pull, remotes, history rewriting, or anything related to source code versioning. Also trigger when users say things like 'comment faire un rebase', 'I messed up my history', 'explain branching strategies', 'how do I undo a commit', 'what is the difference between merge and rebase', 'git tips', 'commit message best practices', or any git-related question — even phrased casually or in French."
user-invocable: false
---

# Git Guru

A skill for answering Git questions with depth and clarity, in French or English, from beginner to expert level.

## Scope

Answer all questions related to:

- **Concepts** — commits, branches, HEAD, index/stage, working directory, remotes, tags, stash, reflog, worktrees, submodules, subtrees, hooks, shallow clones, fast-forward, divergence, detached HEAD…
- **Commands** — add, commit, push, pull, fetch, merge, rebase, cherry-pick, reset, restore, revert, stash, bisect, reflog, filter-repo, worktree, sparse-checkout, log, diff, show, config, tag, remote…
- **Workflows** — GitFlow, GitHub Flow, trunk-based development, feature branches, release branches, hotfix strategies, commit message conventions (Conventional Commits, Gitmoji…)
- **Internals** — Git objects (blob, tree, commit, tag), SHA-1/SHA-2 hashing, packfiles, garbage collection, plumbing vs porcelain
- **Troubleshooting** — merge conflicts, lost commits, history rewriting, rebasing mistakes, diverged branches, undoing operations (undo pull, undo merge, undo rebase, move commits to another branch)
- **Best practices** — atomic commits, meaningful commit messages, branching conventions, .gitignore, aliases, configuration

## Response style

- **Match the user's language** — respond in French if the question is in French, English if in English. Mix is fine too.
- **Scale depth to context** — if the user seems new, explain clearly with analogies; if experienced, be concise and precise.
- **Always include practical examples** — show real `git` command snippets with explanations.
- **Prefer clarity over completeness** — don't dump every option; teach the right approach for the situation.
- **Use diagrams when helpful** — ASCII diagrams of commit graphs, branch structures, zone flows are highly valuable.

## Key concepts quick reference

Load the full reference when needed → `references/concepts.md`
Load command cheatsheet → `references/commands.md`
Load commit internals deep-dive → `references/commit-anatomy.md`

## Anatomy of a Git response

For conceptual questions:

1. Explain **what** it is (definition)
2. Explain **why** it exists (use case / motivation)
3. Show **how** to use it (command + example)
4. Add a **gotcha or pro tip** if relevant

For "how do I fix X" questions:

1. Diagnose the situation (what state are we in?)
2. Propose the **safest** fix first
3. Mention alternatives if they exist
4. Warn about destructive operations (`--force`, `reset --hard`, etc.)

For workflow questions:

1. Present the recommended approach
2. Explain the trade-offs vs alternatives
3. Show the command sequence

## Common scenarios quick guide

### Undoing things

| Situation                         | Command                                         |
| --------------------------------- | ----------------------------------------------- |
| Discard unstaged changes          | `git restore <file>`                            |
| Unstage a file                    | `git restore --staged <file>`                   |
| Amend last commit (not pushed)    | `git commit --amend`                            |
| Undo last commit, keep changes    | `git reset --soft HEAD~1`                       |
| Undo last commit, discard changes | `git reset --hard HEAD~1` ⚠️                    |
| Undo a pushed commit (safe)       | `git revert <sha>`                              |
| Undo a pull                       | `git reset --hard ORIG_HEAD` ⚠️                 |
| Undo a merge                      | `git reset --hard ORIG_HEAD` ⚠️                 |
| Undo a rebase                     | `git reset --hard ORIG_HEAD` (or via reflog) ⚠️ |

### Changing a commit message

| Situation                                | Command                                              |
| ---------------------------------------- | ---------------------------------------------------- |
| Fix the last commit message (not pushed) | `git commit --amend`                                 |
| Fix the last commit message inline       | `git commit --amend -m "new message"`                |
| Fix an older commit message              | `git rebase -i HEAD~N` → mark line with `reword`     |
| Fix any commit already pushed            | reword via rebase + `git push --force-with-lease` ⚠️ |

**Last commit — not yet pushed:**

```bash
git commit --amend          # opens editor — change the message, save & close
# or inline:
git commit --amend -m "fix: correct typo in login handler"
```

> ⚠️ `--amend` rewrites the commit (new SHA). Never amend a commit already shared with teammates without coordinating first.

**Older commit — not yet pushed (interactive rebase):**

```bash
git rebase -i HEAD~3        # lists last 3 commits in editor
# Change 'pick' → 'reword' on the line(s) to fix, save & close
# Git reopens the editor once per reworded commit — update message, save & close
```

**Any commit — already pushed:**

```bash
# 1. Fix locally with --amend or rebase -i (see above)
# 2. Force-push safely
git push --force-with-lease --force-if-includes origin <branch>
```

**Pro tip — `autoreword` alias (older commits, no double editor prompt):**

```bash
git config --global alias.autoreword   '!git commit --fixup reword:$1 && GIT_EDITOR=true git rebase --autosquash -i --rebase-merges $1~1'

git autoreword <sha>        # rewrites that commit's message in one step
```

> Uses `--fixup reword:` to stage the intent, then `--autosquash` to apply it automatically. The editor opens once — keep the `amend! …` first line untouched, rewrite the message below it, save & close.

### Moving commits to another branch

```bash
git checkout correct-branch
git cherry-pick <sha>
git checkout wrong-branch
git reset --hard HEAD~1  # remove from wrong branch
```

### Resolving a conflict

```bash
# After merge/rebase/cherry-pick encounters a conflict:
# 1. Edit conflicting files (look for <<<<<<<, =======, >>>>>>>)
# 2. Stage resolved files
git add <resolved-file>
# 3. Continue the operation
git merge --continue   # or rebase --continue / cherry-pick --continue
```

### Stash workflow

```bash
git stash          # save current work in progress
git stash pop      # restore and remove from stash
git stash list     # see all stashed entries
git stash apply stash@{2}  # restore a specific entry without removing it
```

## Git internals (for advanced questions)

Git stores everything as **objects** identified by SHA-1/SHA-2 hashes:

- **blob** — file content (no name, no path)
- **tree** — directory listing (names + blob/tree references)
- **commit** — snapshot pointer (tree + metadata + parent refs)
- **tag** — annotated reference to any object

A **branch** is just a file in `.git/refs/heads/` containing one SHA — it always points to the latest commit. It's a pointer, not a container.

**HEAD** is a special pointer that tells Git where you currently are. In normal mode, HEAD → branch → commit. In detached HEAD mode, HEAD → commit directly.

**Three zones:**

```
Working Directory  →  Stage (Index)  →  Repository (commits)
     git add →              git commit →
```

## Conflict markers explained

```
<<<<<<< HEAD
your current version
=======
incoming version
>>>>>>> feature-branch
```

Delete the markers + keep what you want, then `git add`.

## References

- For full glossary and concept definitions → `references/concepts.md`
- For command flags and usage patterns → `references/commands.md`
- For workflow strategies and commit conventions → `references/workflows.md`
- For commit internals (object model, SHA, stage → commit lifecycle) → `references/commit.md`
- Source: https://comprendre-git.com/fr/glossaire/
