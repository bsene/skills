# Uncle Bob Design Principles

Condensed from Robert C. Martin's [Clean Coder Blog](https://blog.cleancoder.com/). Use when a review
touches SOLID, repeated `if/else/switch`, objects vs data structures, or "how clean is clean enough".

## SOLID is still the working definition of simple

Source: [SOLID Relevance](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)

"Just write simple code" is not guidance; the principles define what simple means. Software is still
sequence, selection, and iteration, so the principles still apply. Microservices do not remove them:
a tangled service is still tangled.

| Principle | Working rule                                                                                    | Review question                                               |
| --------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| SRP       | Gather what changes for the same reason; separate what changes for different reasons.           | Does a business-rule change force an edit next to SQL or GUI? |
| OCP       | Extend without modifying; keep right code untouched when wrong code changes.                    | Does a new variant add a branch in old code?                  |
| LSP       | A user of an interface must not be confused by any implementation (subtyping, not inheritance). | Do callers branch on which implementation they got?           |
| ISP       | Callers must not depend on methods they do not call (recompile/redeploy cost).                  | Does a change to an unused method force a redeploy?           |
| DIP       | Source dependencies, especially across boundaries, point toward abstractions.                   | Does business logic import a database or protocol detail?     |

## Repeated if/else/switch: one decision, made once

Source: [if-else-switch](https://blog.cleancoder.com/uncle-bob/2021/03/06/ifElseSwitch.html)

- A lone translation (`0 → "male"`, `1 → "female"`, else `"unknown"`) stays a plain lookup. Do not add polymorphism for it.
- The smell is the same chain replicated across the codebase: a change misses a copy, and the chain pulls
  high-level modules into transitive dependencies on low-level ones.
- Fix: a factory holds the single chain and returns a polymorphic object; each business rule becomes a
  method on the base type. Build the factory in `main` and pass it in.
- Keep the selector token an integer or string, not an enum declared above the boundary, so the boundary survives.
- Cost to watch: the base type grows a method per rule. Answer with ISP or the Acyclic Visitor pattern.
- Runtime cost is about equal for if/else, switch, and dynamic dispatch. Do not argue performance.

## Objects vs data structures are opposites

Source: [Objects and Data Structures](https://blog.cleancoder.com/uncle-bob/2019/06/16/ObjectsAndDataStructures.html)

An object exposes functions and hides data. A data structure exposes data and implies the functions.
DTOs and database rows are data structures; an ORM moves data between data structures, it does not map to objects.
Schema design and object design answer to different forces, so do not force one to mirror the other.

|                    | Classes (objects)             | Data structures (discriminated unions) |
| ------------------ | ----------------------------- | -------------------------------------- |
| Visible            | Functions                     | Data                                   |
| Add a new type     | Easy: one new class           | Hard: edit every function              |
| Add a new function | Hard: edit every class        | Easy: one new function                 |
| Source dependency  | Points against the call (DIP) | Points with the call; callers rebuild  |

Choose by expected change: new types often, use classes; new operations often, use data structures plus functions.

## Livable code: clean, not sterile

Source: [Can code be too clean?](https://blog.cleancoder.com/uncle-bob/2018/08/13/TooClean.html)

Code should be organized enough to find things and free of unneeded dependencies, yet allow small, transient
mess that makes daily work easier (for example, merging presenter and view while tuning a screen, then
re-separating). Fight the mess; do not outlaw it. Tidy before the mess spreads.
