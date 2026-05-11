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

For step-by-step guides to common operations (undoing commits, changing messages, moving commits, resolving conflicts, stash) → `references/scenarios.md`

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

## Read On Demand

- For full glossary and concept definitions → `references/concepts.md`
- For command flags and usage patterns → `references/commands.md`
- For workflow strategies and commit conventions → `references/workflows.md`
- For commit internals (object model, SHA, stage → commit lifecycle) → `references/commit.md`
- For common scenario step-by-step guides (undo, amend, cherry-pick, conflict, stash) → `references/scenarios.md`
- Source: https://comprendre-git.com/fr/glossaire/
