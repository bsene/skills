# Git Common Scenarios

## Undoing things

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

## Changing a commit message

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

## Moving commits to another branch

```bash
git checkout correct-branch
git cherry-pick <sha>
git checkout wrong-branch
git reset --hard HEAD~1  # remove from wrong branch
```

## Resolving a conflict

```bash
# After merge/rebase/cherry-pick encounters a conflict:
# 1. Edit conflicting files (look for <<<<<<<, =======, >>>>>>>)
# 2. Stage resolved files
git add <resolved-file>
# 3. Continue the operation
git merge --continue   # or rebase --continue / cherry-pick --continue
```

## Stash workflow

```bash
git stash          # save current work in progress
git stash pop      # restore and remove from stash
git stash list     # see all stashed entries
git stash apply stash@{2}  # restore a specific entry without removing it
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
