# Building the Mikado Graph

## Starting a new graph

When the user presents a refactoring goal, help them:

1. **Name the goal precisely** — vague goals produce vague maps. Bad: "clean up the DB
   layer". Good: "Replace `FileDatabase` with a `DatabaseInterface`".
2. **Draw the root node** — on paper, whiteboard, or a tool like Mermaid or Excalidraw.
3. **Attempt the change naively** in a throwaway branch or with `git stash` ready.
4. **List every error/breakage** — each one becomes a child bubble.
5. **Revert immediately** — `git checkout .` or `git stash drop`.

---

## Populating prerequisites

For each prerequisite node, apply the same loop recursively. A prerequisite may itself
have prerequisites. The graph grows depth-first until you reach nodes that:
- Can be implemented without touching anything else (leaves), OR
- Map to a single atomic refactoring from Fowler's catalog.

---

## What makes a good leaf?

A leaf node is ready to implement when:
- It compiles/passes tests after the change with NO other modifications needed.
- It can be expressed as **one atomic commit** (a single refactoring gesture: rename,
  extract method, move class, add parameter, etc.).
- It does **not change observable behavior** (internal structure only).
