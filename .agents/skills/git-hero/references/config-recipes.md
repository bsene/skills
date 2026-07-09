# Git Config Recipes

Recommended `.gitconfig` settings grouped by purpose, with explanations.

## Identity & Signing

```ini
[user]
    name = Your Name
    email = your@email.com
    signingkey = ~/.ssh/id_ed25519.pub

[commit]
    gpgsign = true

[gpg]
    format = ssh
```

**Why sign commits?** Proves authorship. GitHub shows a "Verified" badge. SSH keys are simpler than GPG — no keyring management, no expiration headaches.

## Pull & Merge Behavior

```ini
[pull]
    rebase = true

[merge]
    tool = vimdiff
    conflictstyle = diff3

[rerere]
    enabled = true
```

| Setting | Effect |
| ------- | ------ |
| `pull.rebase = true` | `git pull` rebases instead of creating merge commits — keeps history linear |
| `conflictstyle = diff3` | Shows base version in conflict markers (3-way), making resolution easier |
| `rerere.enabled = true` | Records conflict resolutions and auto-applies them on repeat encounters |

## Branch & Init

```ini
[init]
    defaultBranch = main

[branch]
    sort = -committerdate
```

`branch.sort = -committerdate` lists most recently active branches first — useful when you have many branches.

## Line Endings

```ini
[core]
    autocrlf = input
```

Converts CRLF to LF on commit, leaves LF untouched on checkout. Prevents Windows line endings from entering the repository.

## Aliases

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    fap = fetch --all --prune
    lola = log --graph --decorate --pretty=oneline --abbrev-commit --all
    unstage = restore --staged
    last = log -1 HEAD
    amend = commit --amend --no-edit
    wip = !git add -A && git commit -m 'chore: wip [skip ci]'
    undo = reset --soft HEAD~1
```

| Alias | Purpose |
| ----- | ------- |
| `fap` | Fetch all remotes and prune deleted remote branches |
| `lola` | Compact graph view of all branches |
| `unstage` | Unstage files using modern `restore` syntax |
| `last` | Show the last commit |
| `amend` | Amend last commit keeping the same message |
| `wip` | Quick save-all as work-in-progress commit |
| `undo` | Soft-undo last commit (keeps changes staged) |

## Diff & Log

```ini
[diff]
    algorithm = histogram
    colorMoved = default

[log]
    abbrevCommit = true
```

| Setting | Effect |
| ------- | ------ |
| `algorithm = histogram` | Better diff output for moved code blocks |
| `colorMoved = default` | Highlights moved lines in a different color — distinguishes moves from additions |
| `abbrevCommit = true` | Shows short SHAs by default in `git log` |

## Push Safety

```ini
[push]
    default = current
    autoSetupRemote = true
```

| Setting | Effect |
| ------- | ------ |
| `default = current` | `git push` pushes current branch to same-named remote branch |
| `autoSetupRemote = true` | First push auto-creates the upstream tracking — no more `-u` flag |

### Force Push

Never use `--force`. Always use the safe alternative:

```bash
git push --force-with-lease --force-if-includes origin <branch>
```

- `--force-with-lease` — refuses if remote has commits you haven't fetched
- `--force-if-includes` — refuses if your local ref doesn't include remote tip

## Reflog as Safety Net

Every HEAD movement is logged for 90 days. If you lose commits:

```bash
git reflog                    # find the SHA before the mistake
git reset --hard <sha>        # restore to that point
```

## Modern Command Syntax

Prefer the modern commands over legacy `checkout`:

| Legacy | Modern | Purpose |
| ------ | ------ | ------- |
| `git checkout <branch>` | `git switch <branch>` | Switch branches |
| `git checkout -b <branch>` | `git switch -c <branch>` | Create and switch |
| `git checkout -- <file>` | `git restore <file>` | Discard changes |
| `git checkout --patch` | `git restore --patch` | Selective discard |
| `git reset HEAD <file>` | `git restore --staged <file>` | Unstage |

## Fetch & Prune

```ini
[fetch]
    prune = true
    prunetags = true
```

Automatically removes local references to deleted remote branches and tags on every fetch.

## Complete Starter Config

Copy this as a starting point and customize:

```ini
[user]
    name = Your Name
    email = your@email.com
    signingkey = ~/.ssh/id_ed25519.pub

[commit]
    gpgsign = true

[gpg]
    format = ssh

[init]
    defaultBranch = main

[core]
    autocrlf = input

[pull]
    rebase = true

[merge]
    conflictstyle = diff3

[rerere]
    enabled = true

[push]
    default = current
    autoSetupRemote = true

[fetch]
    prune = true
    prunetags = true

[diff]
    algorithm = histogram
    colorMoved = default

[branch]
    sort = -committerdate

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    fap = fetch --all --prune
    lola = log --graph --decorate --pretty=oneline --abbrev-commit --all
    unstage = restore --staged
    last = log -1 HEAD
    undo = reset --soft HEAD~1
```
