# Git Concepts Reference

Source: https://comprendre-git.com/fr/glossaire/

---

## Table of Contents

1. [Core concepts](#core-concepts)
2. [Zones](#zones)
3. [History and references](#history-and-references)
4. [Remote collaboration](#remote-collaboration)
5. [Advanced concepts](#advanced-concepts)
6. [Merge vs Rebase](#merge-vs-rebase)

---

## Core concepts

### Commit

A commit represents the state of the project captured at a given instant. It is a Git object containing metadata (message, author, date), a reference to the tree object representing the project root at that instant, and optionally one or more references to parent commits.

A good commit message:

- Uses imperative mood: "Add feature" not "Added feature"
- Is concise on the first line (<72 chars)
- Explains _why_, not just _what_

**Conventional Commits format:**

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Atomic commit (commit atomique)

A commit that encapsulates a single, coherent, logical change. It should be self-contained — the project should compile and work after applying it. Atomic commits make history readable, bisecting easy, and cherry-picking safe.

### Branch (branche)

A branch is a named reference that points to the last commit of a chain. A branch does **not** "contain" commits — it is merely a **pointer** (a movable label) on a commit. This pointer advances each time a new commit is created on that branch.

Internally: a branch is just a file in `.git/refs/heads/<name>` containing a SHA.

### HEAD

HEAD is a special pointer that indicates where you currently are in the repository. In normal mode, HEAD points to a branch (which in turn points to a commit). When HEAD points directly to a commit (not a branch), you are in **detached HEAD** state — commits made in this state will be orphaned unless you create a branch.

```bash
cat .git/HEAD       # shows: ref: refs/heads/main
git checkout <sha>  # detaches HEAD
```

### Tag

A tag is a named reference pointing to a specific commit, used to mark important points in history (releases). Unlike branches, tags don't move.

- **Lightweight tag**: just a pointer, like a branch
- **Annotated tag**: a full object with metadata (message, author, date) — preferred for releases

```bash
git tag v1.0.0                          # lightweight
git tag -a v1.0.0 -m "Release 1.0.0"   # annotated
```

---

## Zones

### The three zones

```
┌─────────────────────┬─────────────────┬──────────────────────┐
│  Working Directory  │  Stage / Index  │     Repository       │
│  (copie de travail) │  (staging area) │   (commits/history)  │
│                     │                 │                      │
│  Modified files,    │ Prepared snapshot│  Permanent history  │
│  untracked files    │ for next commit  │  (immutable commits) │
└─────────────────────┴─────────────────┴──────────────────────┘
         git add →             git commit →
                  ←── git restore --staged       ←── git reset
         ←── git restore                         ←── git revert
```

### Stage / Index (staging area)

The stage is a zone used to prepare the next commit. It lets you precisely control which changes go into a commit. Also called index, staging area, or cache.

```bash
git add file.txt          # stage a specific file
git add -p                # interactively stage hunks
git diff --staged         # see what's staged
git restore --staged file # unstage
```

### Working Directory (copie de travail)

The working directory is where your files live on disk. It reflects the state of a particular commit plus any uncommitted modifications.

### Stash (remise)

The stash is a zone that temporarily shelves work in progress so you can switch context. It saves uncommitted changes (both working directory and stage) and restores them later.

```bash
git stash                  # save WIP
git stash push -m "wip: feature X"  # with a message
git stash list             # view stash stack
git stash pop              # restore top and remove
git stash apply stash@{2}  # restore specific entry
git stash drop stash@{0}   # discard entry
git stash branch new-branch # restore into new branch
```

---

## History and references

### Commit chain (chaîne de commits)

Commits are linked in a directed acyclic graph (DAG). Each commit contains a reference to its parent(s). A merge commit has two parents. The chain goes from newest to oldest.

```
A ← B ← C ← D (HEAD → main)
             ↑
         feature ← E ← F
```

### Divergence

Two branches are divergent when each has commits the other doesn't have. This happens when two people work independently from the same base.

```
      A ← B ← C (origin/main)
           ↑
           └── D ← E (local main)
```

### Fast-forward

A fast-forward merge occurs when the target branch has no commits that diverge from the source. Git simply moves the branch pointer forward — no merge commit is created.

```bash
git merge --ff-only feature  # force ff or fail
git merge --no-ff feature    # always create a merge commit
```

### Detached HEAD (tête détachée)

State where HEAD points directly to a commit instead of a branch. Useful for inspecting history. Commits made here are not reachable from any branch and may be garbage collected.

```bash
git checkout <sha>    # detach
git checkout -b new-branch  # rescue by creating a branch
```

### Reflog

The reflog is a local log of all positions HEAD has visited. It's your safety net — you can recover "lost" commits even after resets and rebases.

```bash
git reflog          # see history of HEAD positions
git reset --hard HEAD@{3}  # go back to a previous position
```

### Revision syntaxes

Special syntax to reference commits:

- `HEAD~1` — parent of HEAD
- `HEAD~3` — 3 ancestors back
- `HEAD^2` — second parent of a merge commit
- `main@{3 days ago}` — where main was 3 days ago
- `v1.0^{}` — dereference a tag to its commit
- `A..B` — commits reachable from B but not A (log range)
- `A...B` — symmetric difference (commits in either but not both)

### Commit-ish

Any expression that resolves to a commit: a SHA, a branch name, a tag, HEAD, HEAD~1, etc.

---

## Remote collaboration

### Remote (dépôt distant)

A remote is a reference to a copy of the repository hosted elsewhere. By convention the main remote is called `origin`.

```bash
git remote -v                   # list remotes
git remote add upstream <url>   # add a second remote
git remote set-url origin <url> # change remote URL
```

### Remote tracking branches (branches distantes)

Local read-only copies of what a remote branch looked like at last fetch. Named `origin/main`, `origin/feature`, etc.

```bash
git fetch origin         # update all remote tracking branches
git branch -r            # list remote tracking branches
```

### Fetch vs Pull

- `git fetch` — downloads changes from remote, updates remote tracking branches, does NOT touch local branches
- `git pull` — fetch + merge (or fetch + rebase if configured)

```bash
git pull --rebase        # recommended to keep history clean
```

### Push

```bash
git push origin main
git push --force-with-lease  # safer than --force: fails if remote changed
git push -u origin feature   # set upstream tracking
```

### Refspec

A refspec maps remote refs to local refs: `+refs/heads/*:refs/remotes/origin/*`

---

## Advanced concepts

### Git objects (objets Git)

Everything in Git is an object stored by content hash:

- **blob**: raw file content (no filename)
- **tree**: directory (maps names to blobs and subtrees)
- **commit**: snapshot (tree + metadata + parent refs)
- **tag**: annotated tag object

```bash
git cat-file -t <sha>   # type of object
git cat-file -p <sha>   # print object content
```

### SHA-1 / SHA-2

Git uses SHA-1 (transitioning to SHA-256) to identify objects. The hash is computed from the object's content. Identical content always produces the same hash — Git never stores duplicates.

### Hook

Scripts executed automatically by Git at specific events: `pre-commit`, `commit-msg`, `post-merge`, `pre-push`, `post-checkout`, etc. Located in `.git/hooks/`.

```bash
# Example: pre-commit hook to run tests
#!/bin/sh
npm test || exit 1
```

### Submodules

A way to embed one Git repository inside another. The parent tracks a specific commit of the submodule.

```bash
git submodule add <url> path/to/module
git submodule update --init --recursive
```

### Subtrees

An alternative to submodules that merges another repo's history into a subdirectory. Simpler for contributors (no extra commands needed).

### Worktree

Allows checking out multiple branches simultaneously into separate directories from the same repository.

```bash
git worktree add ../hotfix hotfix-branch
git worktree list
git worktree remove ../hotfix
```

### Shallow clone

A clone with a truncated history — only the last N commits are downloaded. Faster for CI/CD.

```bash
git clone --depth=1 <url>
git fetch --unshallow  # restore full history
```

### Sparse checkout

Check out only a subset of files/directories from a repository. Useful for monorepos.

```bash
git sparse-checkout init
git sparse-checkout set apps/my-service
```

### Plumbing vs Porcelain

- **Porcelain**: high-level, user-friendly commands (`git commit`, `git merge`, `git status`)
- **Plumbing**: low-level building blocks (`git hash-object`, `git cat-file`, `git update-ref`)

### Packing / Garbage collector

Git periodically packs loose objects into packfiles for efficiency. The garbage collector (`git gc`) removes unreachable objects and loose files.

```bash
git gc --prune=now   # immediate garbage collection
```

---

## Merge vs Rebase

### Merge (fusion)

Integrates changes from one branch into another by creating a **merge commit** with two parents. Preserves full history exactly as it happened.

```
Before:  A ← B ← C (main)
                   ↑
              D ← E (feature)

After merge:  A ← B ← C ← M (main, merge commit)
                        ↑   ↑
                   D ← E ──┘
```

### Rebase

Replays commits from one branch on top of another, rewriting history. Results in a linear history. The original commits get new SHAs.

```
Before:  A ← B ← C (main)
              ↑
         D ← E (feature)

After rebase of feature onto main:
         A ← B ← C (main)
                  ↑
             D'← E' (feature — new commits)
```

### When to use which?

| Situation                             | Recommendation                              |
| ------------------------------------- | ------------------------------------------- |
| Integrating a completed feature       | `merge --no-ff` to preserve feature context |
| Syncing with main before PR           | `rebase` for clean linear history           |
| Shared/public branch                  | `merge` — never rebase shared history       |
| Fixing merge conflicts on a PR        | `git pull --rebase`                         |
| Cleaning up local commits before push | `git rebase -i` (interactive)               |

### Interactive rebase

```bash
git rebase -i HEAD~3   # edit last 3 commits
# Commands: pick, reword, edit, squash, fixup, drop
```

### Cherry-pick

Apply a specific commit from anywhere onto current branch.

```bash
git cherry-pick <sha>
git cherry-pick A..B   # range (exclusive A)
git cherry-pick A^..B  # range (inclusive A)
```

---

## Bisect

Binary search through history to find the commit that introduced a bug.

```bash
git bisect start
git bisect bad           # current commit is bad
git bisect good v1.0.0  # this tag was good
# Git checks out middle commit → test it → mark good or bad
git bisect good
git bisect bad
# ... repeat until Git finds the culprit
git bisect reset         # go back to HEAD
```
