# Git Commit

Source: https://comprendre-git.com/fr/commandes/git-commit-detail/

---

## What a commit stores

A commit is an atomic unit of work — a coherent, self-contained logical change. Technically, Git does **not** store diffs; it stores **complete snapshots** of the project at a given instant.

Each commit records:

| Field              | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| **tree**           | Reference to the root tree object (full project snapshot)      |
| **parent(s)**      | SHA(s) of parent commit(s) — absent only on the initial commit |
| **author**         | Name + email of the person who wrote the change                |
| **author date**    | When the author created it                                     |
| **committer**      | Name + email of the person who created the commit object       |
| **committer date** | When the commit was recorded (may differ after amend/rebase)   |
| **message**        | Description written by the author                              |
| **GPG signature**  | Optional — for signed commits                                  |

> **Author ≠ Committer** — they diverge on cherry-pick, amend, rebase, or pair-programming. The author is who did the work; the committer is who recorded it.

---

## Inspecting a commit with plumbing commands

```bash
# Human-readable output (porcelain)
git show <sha>

# Raw commit object content (plumbing)
git cat-file -p <sha>
```

Example raw output:

```
tree 6df8433ebd2517c43aff68ff14e726cd788ad84d
parent b4cf8aec80f87ac6a1e21e47ffc42dd4ec53ef2a
author Alice <alice@example.com> 1642688897 +0100
committer Alice <alice@example.com> 1642688897 +0100

Add user authentication
```

---

## The Git object model

Everything in Git is a content-addressed object stored in `.git/objects/`. Four types exist:

| Type       | Represents       | Content                                     |
| ---------- | ---------------- | ------------------------------------------- |
| **blob**   | A file           | Raw file content (no name, no path)         |
| **tree**   | A directory      | List of (mode, type, sha, name) entries     |
| **commit** | A snapshot       | tree ref + parent refs + metadata + message |
| **tag**    | An annotated tag | Points to any object, adds metadata         |

```bash
git cat-file -t <sha>   # type of an object
git cat-file -p <sha>   # print object content
```

### Object graph for a commit

```
commit d9ed106
  └── tree f45c454        ← root directory
        ├── blob 1cb865f  ← .gitignore
        ├── blob e3ab945  ← README.md
        ├── tree 29a422c  ← log/
        │     └── blob e69de29  ← log/.keep
        └── tree 4c2f911  ← src/
              ├── blob e69de29  ← src/.keep
              └── blob 1873719  ← src/index.js
```

A commit object is a complete, self-sufficient snapshot — reading it is enough to reconstruct the entire project state at that moment.

---

## How SHAs are generated

Each object's identifier is a **SHA-1 hash** (transitioning to SHA-256 since Git 2.29) computed from the object's **binary content**. This means:

- Identical content always produces the same SHA → Git never stores duplicates.
- Two files with identical content share one blob (e.g., two empty `.keep` files → one blob).
- Any modification to a file produces a new blob with a new SHA.
- Changing a file cascades upward: new blob → new parent tree → new root tree → new commit.
- Reverting to an old content reuses the existing blob's SHA automatically.

```bash
# The 2-char prefix splits objects into subdirectories
# (workaround for filesystem limits like FAT32's 65 534 entries/dir)
.git/objects/
├── 1c/  b865f27fa00fa0cd3d5ef0a3df729ea636413a   ← blob .gitignore
├── 29/  a422c19251aeaeb907175e9b3219a9bed6c616   ← tree log/ and src/
├── b4/  cf8aec80f87ac6a1e21e47ffc42dd4ec53ef2a   ← initial commit
└── e6/  9de29bb2d1d6434b8b29ae775ad8c2e48c5391   ← blob empty .keep files
```

---

## What happens step by step when you commit

### Step 1 — `git add` (staging)

- Git reads the file content and computes its SHA.
- Creates a **blob** object in `.git/objects/` (only if it doesn't already exist).
- Updates `.git/index` (the stage) with the blob reference.
- At this point: no tree, no commit yet — only blobs and the index.

```bash
git ls-files --stage   # inspect the current index
```

### Step 2 — `git commit` (recording)

1. Reads all entries from `.git/index`.
2. Creates **tree objects** for every directory containing changes (recursively up to root).
3. Unchanged trees and blobs are referenced as-is (not duplicated).
4. Creates the **commit object** with:
   - Reference to the root tree
   - Reference(s) to parent commit(s)
   - Author/committer metadata
   - The message
5. Moves the current branch pointer forward to the new commit SHA.

---

## The commit chain

Commits are linked in a **directed acyclic graph (DAG)**. Each commit holds a reference to its parent(s) — not the other way around. Arrows in diagrams point backward in time (child → parent):

```
A ← B ← C ← D    (HEAD → main)
         ↑
         └── E ← F   (feature)
```

- A **merge commit** has two parents.
- The **initial commit** has no parent.
- The entire history is expressed through these chained references.
- A **branch** is just a file containing one SHA (the tip commit).
- **HEAD** points to the current branch (or directly to a commit in detached HEAD state).

---

## Key takeaways

- Git stores **snapshots**, not diffs.
- Every object is **immutable** and identified by its content hash.
- A commit is a **complete project state** — no need to replay history to reconstruct it.
- `git add` creates blobs; `git commit` creates trees + a commit object.
- Author and committer can differ — this matters for cherry-pick, rebase, and amend.
- The `.git/objects/` directory is the single source of truth for all history.
