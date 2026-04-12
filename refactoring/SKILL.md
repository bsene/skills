---
name: refactoring
description: Detect code smells and apply refactoring techniques to improve clarity, testability, and maintainability.
triggers:
  - refactoring opportunities
  - code smell
  - long method
  - large class
  - primitive obsession
  - long parameter list
  - data clumps
  - extract method
  - extract class
  - replace conditional
  - introduce parameter object
  - when to refactor
  - tidying
  - tidy first
---

# Refactoring: Smells & Techniques

A comprehensive guide to detecting code smells and applying refactoring techniques to improve design, clarity, and maintainability.

---

## Read On Demand

| Read When                                                              | File                                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| Identifying code smells in your codebase                               | [Code Smell Catalog](references/smells.md)                 |
| Deciding which refactoring technique to use                            | [Refactoring Techniques](references/techniques.md)         |
| Choosing the right pattern for a specific scenario                     | [Decision Guide](references/decision-guide.md)             |
| Reviewing a diff/PR for bloater smells                                 | [Detection Checklist](references/detection-checklist.md)   |
| Step-by-step code review and refactoring workflow                      | [Code Review Workflow](references/code-review-workflow.md) |
| **Only** when user asks where a pattern applies in a specific language | [Language Patterns](references/language-patterns.md)       |
| **Only** when user asks for a multi-file before/after walkthrough      | [Real-World Examples](references/real-world-examples.md)   |

---

## Always-On Guardrails

- **Never auto-remove TODO comments.** TODOs require manual human decision — surface them, don't delete them.
- **Rule of Three before extracting.** Wait for the _third_ duplication before Extract Method / Extract Class. Two points don't reliably reveal the right abstraction.
- **No tests, no refactor.** Don't refactor blind — add a safety net first.
- **Pair comment tidyings.** When deleting redundant comments, also scan for missing _why_ comments worth adding.

---

## Smells → Techniques (Quick Reference)

| Smell                   | Detection Signal                               | Technique(s)                     |
| ----------------------- | ---------------------------------------------- | -------------------------------- |
| **Long Method**         | >10 lines, multiple responsibilities           | Extract Method _(Rule of Three)_ |
| **Large Class**         | >10 methods, multiple concerns, hard to test   | Extract Class _(Rule of Three)_  |
| **Primitive Obsession** | String/int constants for domain concepts       | Create Type/Object               |
| **Long Parameter List** | >3-4 parameters, related params                | Introduce Parameter Object       |
| **Data Clumps**         | Same variables in multiple places              | Extract Class                    |
| **Comments (What)**     | Complex expression needs comment               | Extract Variable                 |
| **Comments (What)**     | Code block needs comment                       | Extract Method                   |
| **Comments (What)**     | Method purpose unclear from name               | Rename Method                    |
| **Comments (Precond)**  | Comment documents a required precondition      | Introduce Assertion              |
| **Comments (Behavior)** | Comment documents expected behavior/edge cases | Write Tests                      |

For the full Techniques → When to Use table, see [techniques.md](references/techniques.md).

---

## When NOT to Refactor

Sometimes code size, complexity, or structure is justified:

- **Complex algorithms** that genuinely need many lines (with clear comments explaining why)
- **Declarative structures** like configuration objects or test data (accept longer parameter lists)
- **Temporary code** that will be replaced soon (refactoring cost > benefit)
- **One-off utilities** where extracting adds more boilerplate than it saves
- **Unstable code** that's still in flux — wait until requirements stabilize
- **Performance-critical paths** where refactoring would harm speed (profile first)
- **Code without tests** — refactor only with a safety net (see Always-On Guardrails)
- **Only two occurrences of similar code** — Rule of Three (see Always-On Guardrails); premature DRY tends to produce the wrong abstraction

Always ask: **"Does this complexity serve the code's purpose, or does it obscure it?"**

---

## References

- **Refactoring Guru:** [Code Smells - Bloaters](https://refactoring.guru/refactoring/smells/bloaters)
- **Martin Fowler:** [Refactoring Catalog](https://refactoring.com/catalog/) — 72+ techniques organized by operation
- **Principles:** Single Responsibility Principle (SRP), Open/Closed Principle (OCP), DRY (Don't Repeat Yourself)
- **Attribution:** Tim Ottinger on comments; Martin Fowler's "Refactoring: Improving the Design of Existing Code"
