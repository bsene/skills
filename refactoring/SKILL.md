---
name: refactoring
description: >
  Detect code smells and apply *in-place* refactoring techniques (Extract Method/Class, Replace Conditional,
  Introduce Parameter Object, Rename, Move) to improve clarity, testability, and maintainability of a single
  function, class, or file.

  TRIGGER when: user mentions refactoring opportunities, code smell, long method, large class, primitive obsession,
  long parameter list, data clumps, feature envy, shotgun surgery, switch statement smell, extract method,
  extract class, replace conditional with polymorphism, introduce parameter object, simplify single file,
  improve readability, tidying, tidy first, "clean up this function", "refactor this class".

  DO NOT USE when: no tests exist (unsafe to refactor blind — add tests first), the change is behavior-altering
  rather than structure-only (use `tcrdd` instead), or the user needs to safely untangle a *cross-file*
  dependency graph where one change ripples to many call sites (use `mikado-method` instead).
---

# Refactoring: Smells & Techniques

A comprehensive guide to detecting code smells and applying refactoring techniques to improve design, clarity, and maintainability.

---

## Read On Demand

| Read When                                                              | File                                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| Identifying code smells or reviewing a diff/PR for bloaters            | [Code Smell Catalog](references/smells.md)                 |
| Deciding which refactoring technique to use                            | [Refactoring Techniques](references/techniques.md)         |
| Choosing the right pattern, scenario-based decisions, or review workflow | [Decision Guide](references/decision-guide.md)            |
| **Only** when user asks where a pattern applies in a specific language | [Language Idioms](references/language-idioms.md)            |

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
| **Comments**            | Code needs a comment to be understood (see smells.md for subtypes) | Extract Method/Variable, Rename, Introduce Assertion, Write Tests |
| **Uncommunicative Name** | Name needs a comment, single letters, generic placeholders, missing units | Rename / Introduce Variable      |

For the full Techniques → When to Use table, see [techniques.md](references/techniques.md).

---

## Techniques by Goal

- **Testability:** Extract Method → Extract Class → Replace Conditional
- **Reduce duplication:** Extract Method → Replace Conditional → Introduce Variable
- **Readability:** Rename → Introduce Variable → Simplify Conditional → Extract Method
- **Better design/coupling:** Extract Class → Move Method/Field → Replace Conditional

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

## External References

- **Refactoring Guru:** [Code Smells - Bloaters](https://refactoring.guru/refactoring/smells/bloaters)
- **Martin Fowler:** [Refactoring Catalog](https://refactoring.com/catalog/) — 72+ techniques organized by operation
- **Principles:** SRP, OCP, DRY
- **Attribution:** Tim Ottinger (comments); Fowler *Refactoring*; Martin *Clean Code*

---

## Benchmark

Scenario: `.benchmarks/scenarios/refactoring-001-long-method.md` · Run: 2026-06-14

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 100% | +17%  |
| claude-sonnet-4-6 | 33%     | 100% | +67%  |
| claude-haiku-4-5  | 0%      | 100% | +100% |

> **PASS** (strongest signal). Decisive on weak models (haiku 0→100%): enforces smell-naming, Extract-Method-first, in-place scope, rule-of-three. Keep as-is. Gate per `skill-optimizer/release-gates.md`.
