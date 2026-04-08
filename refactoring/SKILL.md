---
name: refactoring
description: Detect code smells and apply refactoring techniques to improve clarity, testability, and maintainability.
triggers:
  - refactoring
  - code smell
  - long method
  - large class
  - primitive obsession
  - long parameter list
  - data clumps
  - comments code
  - extract method
  - extract class
  - replace conditional
  - simplify conditional
  - introduce variable
  - move method
  - rename variable
  - code review smell
  - refactoring decision guide
  - when to refactor
  - when not to refactor
  - inline method
  - inline variable
  - change function declaration
  - introduce parameter object
  - replace magic number
  - magic literal
  - decompose conditional
  - consolidate conditional
  - replace temp with query
  - remove dead code
  - remove flag argument
  - separate query from modifier
  - command query separation
---

# Refactoring: Smells & Techniques

A comprehensive guide to detecting code smells and applying refactoring techniques to improve design, clarity, and maintainability.

---

## Read On Demand

| Read When | File |
|---|---|
| Identifying code smells in your codebase | [Code Smell Catalog](references/smells.md) |
| Deciding which refactoring technique to use | [Refactoring Techniques](references/techniques.md) |
| Choosing the right pattern for a specific scenario | [Decision Guide](references/decision-guide.md) |
| Step-by-step code review and refactoring workflow | [Code Review Workflow](references/code-review-workflow.md) |
| Quickly matching smells to activation triggers | [Pattern Triggers](references/pattern-triggers.md) |
| Understanding where patterns apply in your code | [Language Patterns](references/language-patterns.md) |
| Seeing real-world before/after examples | [Real-World Examples](references/real-world-examples.md) |

---

## Part 3 — Quick Reference Tables

### Smells → Techniques Mapping

| Smell                   | Detection Signal                                | Technique(s)               | Payoff                                   |
| ----------------------- | ----------------------------------------------- | -------------------------- | ---------------------------------------- |
| **Long Method**         | >10 lines, multiple responsibilities             | Extract Method             | Testable, reusable, clear intent         |
| **Large Class**         | >10 methods, multiple concerns, hard to test    | Extract Class              | Focused, maintainable, easier to extend  |
| **Primitive Obsession** | String/int constants for domain concepts        | Create Type/Object         | Type-safe, validation once, intent clear |
| **Long Parameter List** | >3-4 parameters, related params                 | Parameter Objects/Enums    | Self-documenting, testable, extensible   |
| **Data Clumps**         | Same variables in multiple places               | Extract Class              | Validation once, consistency, clarity    |
| **Comments (What)**     | Complex expression needs comment                | Extract Variable           | Self-documenting, testable, reusable     |
| **Comments (What)**     | Code block needs comment                        | Extract Method             | Clear intent, reusable, testable         |
| **Comments (What)**     | Method purpose unclear from name                | Rename Method              | Self-documenting, faster onboarding      |
| **Comments (Precond)**  | Comment documents a required precondition       | Introduce Assertion        | Fail-fast, explicit contracts            |
| **Comments (Behavior)** | Comment documents expected behavior/edge cases  | Write Tests                | Executable spec, living documentation    |

### Techniques → When to Use

| Technique                      | Use When                                                            | Payoff                                           |
| ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------ |
| **Extract Method**             | Logic has single purpose, appears multiple times, hard to test      | Reusable, testable, clearer intent               |
| **Extract Class**              | Class has multiple responsibilities or mixed concerns               | Focused, reusable, easier to test                |
| **Replace Conditional**        | Same type/status check scattered in multiple places                 | Open/Closed Principle, localized behavior, ext.  |
| **Introduce Variable**         | Complex expression is hard to read or repeated                      | Self-documenting, testable, reusable             |
| **Simplify Conditional**       | Nested or complex if/else logic                                     | Readable, fail-fast, happy path clear            |
| **Move Method/Field**          | Method/field belongs logically elsewhere                            | Better cohesion, less coupling, reusable         |
| **Rename**                     | Name doesn't express intent                                         | Self-documenting, faster onboarding, clarity     |
| **Inline Method/Variable**     | Indirection adds noise; body is as clear as the name                | Less ceremony, more direct                       |
| **Change Function Declaration**| Name/parameters no longer match purpose                             | Clearer API, safer call sites                    |
| **Introduce Parameter Object** | Same parameter group travels together                               | Reveals domain concept, shorter signatures       |
| **Replace Magic Literal**      | Literal carries non-obvious domain meaning                          | Self-documenting, single source of truth         |
| **Decompose Conditional**      | Complex predicate + branches obscure intent                         | Reads like prose, each part named & testable     |
| **Consolidate Conditional**    | Multiple checks all return the same result                          | One predicate, easier to extend                  |
| **Replace Temp with Query**    | Local temp holds a pure expression reused elsewhere                 | Reusable, smaller function                       |
| **Remove Dead Code**           | Unreachable code, unused exports, dead flags                        | Less to read, less to maintain                   |
| **Remove Flag Argument**       | Boolean parameter selects between two behaviors                     | Self-documenting call sites                      |
| **Separate Query from Modifier** | Function both returns a value and mutates                         | CQS — safe to query without side effects         |

---

---

## Part 5 — When NOT to Refactor

Sometimes code size, complexity, or structure is justified:

- **Complex algorithms** that genuinely need many lines (with clear comments explaining why)
- **Declarative structures** like configuration objects or test data (accept longer parameter lists)
- **Temporary code** that will be replaced soon (refactoring cost > benefit)
- **One-off utilities** where extracting adds more boilerplate than it saves
- **Unstable code** that's still in flux — wait until requirements stabilize
- **Performance-critical paths** where refactoring would harm speed (profile first)
- **Code without tests** — refactor only with a safety net; don't refactor blind
- **Only two occurrences of similar code** — per the **Rule of Three** (Don Roberts, via Fowler), wait for the third duplication before extracting. Two points don't reliably reveal the right abstraction, and premature DRY tends to produce the wrong one.

Always ask: **"Does this complexity serve the code's purpose, or does it obscure it?"**

---

## References

- **Refactoring Guru:** [Code Smells - Bloaters](https://refactoring.guru/refactoring/smells/bloaters)
- **Martin Fowler:** [Refactoring Catalog](https://refactoring.com/catalog/) — 72+ techniques organized by operation
- **Principles:** Single Responsibility Principle (SRP), Open/Closed Principle (OCP), DRY (Don't Repeat Yourself)
- **Attribution:** Tim Ottinger on comments; Martin Fowler's "Refactoring: Improving the Design of Existing Code"
