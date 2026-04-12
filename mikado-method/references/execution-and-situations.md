# Execution Strategy & Practical Situations

## Order of work

Always implement **leaves first**, work upward toward the goal. Never attempt a parent
node until all its children are committed and pruned from the graph.

```
Example graph execution order:

Goal: Replace FileDatabase with DatabaseInterface
  ├── Extract DatabaseInterface              ← implement 3rd
  │   ├── Move FileDatabase to impl/         ← implement 1st ✓
  │   └── Update all import paths            ← implement 2nd ✓
  └── Add constructor injection              ← implement 4th
      └── Rename constructor param           ← implement 1st ✓
```

## Committing

- One commit per leaf node.
- Commit message should name the atomic refactoring: `"Extract: DatabaseInterface from FileDatabase"`.
- Commits go directly to **main/trunk** — no refactoring branches needed.
- Never commit a node that leaves the build broken or tests failing.

---

## Legacy code with no tests

Use the **Mikado + Test Data Builder** combination:
1. Make "add a test around this bug/feature" a node in the graph.
2. Each prerequisite for that test (instantiating a tangled class) becomes a
   **Test Data Builder** node — a reusable builder other developers can leverage.
3. Each completed builder increases system-wide testability virally.
4. Avoid mocks for data setup — they duplicate real behavior and create rigidity.

---

## Circular dependencies

A classic Mikado target. Typical leaf sequence:
1. Identify the cycle (compiler/linter output).
2. Leaves: move classes, add interfaces, update imports.
3. Work inward until the cycle is broken.

---

## Very large / multi-week refactorings

- Keep the graph on a **physical whiteboard** visible to the whole team.
- Long-running graphs (weeks or months) are normal — the map tracks progress.
- Team members can pick up any current leaf node independently.
- The graph is also a **negotiation tool**: show stakeholders the dependency tree to
  make scope/cost trade-offs visible (e.g., "removing this node saves 3 months").

---

## Solo / informal use

For small tasks, the method can be done mentally. For anything touching more than
~3 files or taking more than a day, always externalize the map (paper is fine).

---

## Enforcing Good Refactoring Hygiene

When reviewing or generating refactoring code, enforce these rules:

1. **No behavior changes in a refactoring commit.** Renaming a variable ✓. Renaming
   a public API endpoint ✗ (that is a breaking change).
2. **One type of change per commit.** Mixed commits (rename + extract + move) make
   the graph untrustworthy and rollback dangerous.
3. **Always return to green before picking the next leaf.** If the build is red,
   revert — do not patch forward.
4. **No "just one more thing" creep.** If a new prerequisite is discovered mid-leaf
   implementation, stop, add it to the map, and revert. Do not chain fixes.
5. **Prefer TDD.** Fast test feedback makes error discovery immediate, shrinking
   the identify-prerequisites step dramatically.
