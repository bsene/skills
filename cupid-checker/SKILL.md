---
name: cupid-checker
description: >
  Review code against the CUPID properties for joyful coding: Composable, Unix philosophy, Predictable, Idiomatic, and Domain-based. Use this skill whenever the user wants to assess code quality using CUPID, asks "is this code CUPID?", wants a code review framed around CUPID principles, mentions any of the five CUPID properties by name, asks how to make code more joyful or habitable, or wants to refactor/improve code using Dan North's CUPID framework. Also trigger when the user pastes code and asks for feedback on structure, naming, dependencies, predictability, or domain alignment — even if they don't explicitly mention CUPID.
---

# CUPID Checker

A skill for reviewing code against Dan North's five CUPID properties for joyful coding.

## What is CUPID?

CUPID is a set of **properties** (not rules) that describe code that is a joy to work with. Code is never "CUPID compliant" or not — it is simply closer to or further from each property's centre. The five properties are:

| Letter | Property        | One-liner                                 |
| ------ | --------------- | ----------------------------------------- |
| **C**  | Composable      | Plays well with others                    |
| **U**  | Unix philosophy | Does one thing well                       |
| **P**  | Predictable     | Does what you expect                      |
| **I**  | Idiomatic       | Feels natural                             |
| **D**  | Domain-based    | Solution domain models the problem domain |

Read the full reference in `references/cupid-properties.md` for detailed sub-dimensions of each property.

---

## Review Workflow

### Step 1 — Understand Context

Before assessing, establish:

- **Language / framework** (affects Idiomatic assessment)
- **Purpose of the code** (affects Unix philosophy and Domain-based assessment)
- **Team context** (affects Local idioms under Idiomatic)
- **Scope** — single function, module, whole codebase?

If the user hasn't provided this context, ask briefly (one question is enough to get started).

### Step 2 — Assess Each Property

For each of the five CUPID properties, produce an assessment section:

```
### C — Composable
**Rating:** 🟢 Strong / 🟡 Moderate / 🔴 Weak
**Observations:** What you notice (concrete, code-referenced)
**Suggestions:** How to move towards the centre
```

Use the sub-dimensions in `references/cupid-properties.md` as your lens. Always cite specific line numbers, function names, or patterns in the code — never give generic advice that could apply to any codebase.

### Step 3 — Overall Summary

After all five properties, provide:

- A brief synthesis (2–4 sentences) of the overall picture
- The **top 1–3 highest-leverage improvements** — the changes most likely to positively affect multiple properties at once (since properties are mutually reinforcing)
- A note on what the code already does _well_ — CUPID is about moving towards a centre, not tearing code apart

### Step 4 — Optional: Refactoring Sketch

If the user wants to see improvements, offer a concrete refactoring sketch (not a full rewrite) demonstrating one or two of the highest-leverage changes. Keep it focused.

---

## Tone and Framing

CUPID is explicitly _not_ about rules or compliance. Frame all feedback as:

- **Direction of travel**, not pass/fail
- **Trade-offs acknowledged** — "more composable but at the cost of X"
- **Respect for existing choices** — assume earlier programmers made reasonable decisions in context

Avoid language like "this violates X" or "you must Y". Prefer: "moving towards more composable code might involve…", "one way to increase predictability here…".

---

## Quick Reference: What to Look For

| Property            | Green flags                                                                                         | Red flags                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Composable**      | Narrow focused API, clear intent from name/signature, few imports                                   | God objects, broad catch-all APIs, deep dependency trees                              |
| **Unix philosophy** | One clear purpose, can describe in one sentence, no surprise side effects                           | Does multiple unrelated things, hard to summarise purpose                             |
| **Predictable**     | Deterministic outputs, easy to test, observable (logs/metrics built in), handles edge cases visibly | Hidden state, silent failures, non-deterministic behaviour, hard to test              |
| **Idiomatic**       | Looks like other code in this language/codebase, uses standard library patterns, consistent naming  | Mixed paradigms, reinventing built-ins, inconsistent style                            |
| **Domain-based**    | Code reads like domain conversation, types named after domain concepts, structure mirrors use-cases | CS-speak names (HashMap, Controller, Manager), structure mirrors framework not domain |

---

## References

- `references/cupid-properties.md` — Full detail on each property's sub-dimensions + example review output; read when you need depth on a specific property
