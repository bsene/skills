# Git Commands Cheatsheet

Source: https://comprendre-git.com/fr/glossaire/

---

## Table of Contents

1. [Setup & config](#setup--config)
2. [Creating & cloning](#creating--cloning)
3. [Staging & committing](#staging--committing)
4. [Branching](#branching)
5. [Merging & rebasing](#merging--rebasing)
6. [Remote operations](#remote-operations)
7. [Undoing things](#undoing-things)
8. [Inspection & history](#inspection--history)
9. [Advanced commands](#advanced-commands)

---

## Setup & config

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.editor "code --wait"
git config --global pull.rebase true         # pull = fetch + rebase
git config --global push.default current    # push current branch
git config --global init.defaultBranch main
git config --global alias.lg "log --oneline --graph --all"
git config --list --show-origin              # see all config
```

---

## Creating & cloning

```bash
git init                          # init new repo
git init --bare                   # bare repo (server-side)
git clone <url>                   # clone remote
git clone --depth=1 <url>         # shallow clone (last commit only)
git clone --branch <tag> <url>    # clone specific branch/tag
```

---

## Staging & committing

```bash
git status                        # current state of working dir + stage
git add <file>                    # stage a file
git add .                         # stage all changes
git add -p                        # interactive staging by hunk
git diff                          # unstaged changes
git diff --staged                 # staged changes (vs last commit)
git commit -m "message"           # commit staged changes
git commit -am "message"          # stage tracked files + commit
git commit --amend                # amend last commit (message or content)
git commit --amend --no-edit      # amend without changing message
```

---

## Branching

```bash
git branch                        # list local branches
git branch -a                     # list all branches (incl. remote)
git branch <name>                 # create branch
git branch -d <name>              # delete merged branch
git branch -D <name>              # force delete branch
git branch -m old new             # rename branch
git switch <name>                 # switch to branch
git switch -c <name>              # create + switch
git checkout <name>               # switch (older syntax)
git checkout -b <name>            # create + switch (older syntax)
git checkout <sha>                # detach HEAD at a specific commit
```

---

## Merging & rebasing

```bash
git merge <branch>                # merge branch into current
git merge --no-ff <branch>        # always create merge commit
git merge --ff-only <branch>      # fast-forward only (fail if not possible)
git merge --abort                 # abort in-progress merge
git merge --continue              # continue after conflict resolution

git rebase <branch>               # rebase current branch onto <branch>
git rebase -i HEAD~3              # interactive rebase (last 3 commits)
git rebase --onto main feature bugfix  # advanced: graft subtree
git rebase --abort                # abort in-progress rebase
git rebase --continue             # continue after resolving conflict

git cherry-pick <sha>             # apply a single commit
git cherry-pick <sha1>..<sha2>    # apply a range (exclusive sha1)
git cherry-pick --abort
git cherry-pick --continue
```

---

## Remote operations

```bash
git remote -v                     # list remotes
git remote add <name> <url>       # add remote
git remote remove <name>          # remove remote
git remote rename <old> <new>     # rename remote
git remote set-url origin <url>   # update remote URL

git fetch                         # fetch all remotes
git fetch origin                  # fetch specific remote
git fetch --prune                 # fetch + remove stale tracking branches

git pull                          # fetch + merge
git pull --rebase                 # fetch + rebase (cleaner history)

git push origin <branch>          # push branch
git push -u origin <branch>       # push + set upstream tracking
git push --force-with-lease       # safer force push
git push origin --delete <branch> # delete remote branch
git push origin <tag>             # push a tag
git push origin --tags            # push all tags
```

---

## Undoing things

```bash
# ── Unstaged changes ──────────────────────────────────────────
git restore <file>                # discard changes in working dir
git restore .                     # discard ALL unstaged changes ⚠️
git clean -fd                     # remove untracked files/dirs ⚠️

# ── Staged changes ────────────────────────────────────────────
git restore --staged <file>       # unstage (keep in working dir)

# ── Commits (local, not pushed) ───────────────────────────────
git commit --amend                # edit last commit
git reset --soft HEAD~1           # undo last commit, keep staged
git reset --mixed HEAD~1          # undo last commit, keep in WD (default)
git reset --hard HEAD~1           # undo last commit, discard changes ⚠️

# ── Commits (already pushed) ──────────────────────────────────
git revert <sha>                  # create an inverse commit (safe)
git revert HEAD                   # revert last commit

# ── Undo a pull ───────────────────────────────────────────────
git reset --hard ORIG_HEAD        # go back to before the pull ⚠️

# ── Undo a merge ──────────────────────────────────────────────
git reset --hard ORIG_HEAD        # if merge just happened ⚠️
git revert -m 1 <merge-sha>       # revert a specific merge commit

# ── Undo a rebase ─────────────────────────────────────────────
git reset --hard ORIG_HEAD        # if rebase just finished ⚠️
git reflog                        # find the pre-rebase commit
git reset --hard HEAD@{5}         # go back to it ⚠️

# ── Recover "lost" commits ────────────────────────────────────
git reflog
git checkout <sha>                # inspect orphan commit
git branch rescue <sha>           # rescue into a branch
```

> ⚠️ Commands marked with ⚠️ are destructive and cannot be undone easily.

---

## Inspection & history

```bash
git log                           # full log
git log --oneline --graph --all   # visual branch graph
git log --author="Name"           # filter by author
git log --since="2 weeks ago"     # filter by date
git log -S "searchterm"           # find commits that add/remove string
git log --follow <file>           # file history including renames
git log main..feature             # commits in feature not in main

git show <sha>                    # show a commit + its diff
git diff <sha1>..<sha2>           # diff between two commits
git diff main..feature            # diff between branches
git blame <file>                  # show who wrote each line
git bisect start/good/bad/reset   # binary search for bug

git reflog                        # history of HEAD positions

git status                        # working dir + stage state
git status --short                # compact status

git stash list                    # list stash entries
git stash show stash@{0}          # show stash content
```

---

## Advanced commands

```bash
# ── Stash ─────────────────────────────────────────────────────
git stash
git stash push -m "wip: feature X"
git stash pop                     # restore top, remove from stash
git stash apply stash@{2}         # restore without removing
git stash drop stash@{0}
git stash branch <new-branch>     # restore stash into new branch
git stash clear                   # delete all stashes ⚠️

# ── Tags ──────────────────────────────────────────────────────
git tag                           # list tags
git tag v1.0.0                    # lightweight tag
git tag -a v1.0.0 -m "message"    # annotated tag
git tag -d v1.0.0                 # delete local tag
git push origin --delete v1.0.0   # delete remote tag

# ── Worktree ──────────────────────────────────────────────────
git worktree add ../hotfix hotfix-branch
git worktree list
git worktree remove ../hotfix

# ── Sparse checkout ───────────────────────────────────────────
git sparse-checkout init --cone
git sparse-checkout set apps/api

# ── Submodules ────────────────────────────────────────────────
git submodule add <url> path/
git submodule update --init --recursive
git submodule foreach git pull

# ── Filter / rewrite history ──────────────────────────────────
git filter-repo --path sensitive-file --invert-paths  # remove a file from all history

# ── Config aliases (examples) ─────────────────────────────────
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.undo "reset --soft HEAD~1"

# ── Bisect ────────────────────────────────────────────────────
git bisect start
git bisect bad
git bisect good v1.0.0
# test → git bisect good / git bisect bad
git bisect reset

# ── Archive ───────────────────────────────────────────────────
git archive --format=zip HEAD > project.zip

# ── Rerere (reuse recorded resolution) ───────────────────────
git config rerere.enabled true   # auto-record conflict resolutions
```
