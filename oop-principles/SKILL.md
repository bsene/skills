---
name: oop-principles
description: >
  Evaluate TypeScript/JavaScript code against Dave Thomas's OO principles and the Tell Don't Ask rule. Trigger when:
  class has only static methods; class has a single public method + constructor; code uses GoF pattern names (Decorator/Factory/Strategy/Builder/Command/Observer); class is invalid until setters are called; data class with only constructor + properties; external code reads getters to make decisions (Tell Don't Ask); user asks "is this a code smell?", "should this be a class or a function?", or "why does my code feel procedural?".
---

# OO Principles

Distinguish true object-oriented design from class-oriented anti-patterns in TypeScript/JavaScript.

**Core rule:** Use a class only when it creates multiple instances with their own state. Otherwise prefer functions, object literals, or types.

## The Seven Rules

For each rule below, full code examples live in `references/anti-patterns.md`.

1. **Not an object factory → don't use a class.** Class with only static methods is just a namespace. → use standalone functions or `const X = { ... } as const`. (anti-patterns.md §1)
2. **Named after a design pattern → don't use a class.** GoF patterns (Decorator/Factory/Strategy/Command) collapse to functions or HOFs in TS. (anti-patterns.md §3)
3. **Abstract base classes are rarely necessary.** Prefer composition + structural typing over inheritance. (anti-patterns.md §5)
4. **No state, no class.** A class with one public method (`perform`/`call`/`execute`) instantiated only to call it once is just a function. (anti-patterns.md §2)
5. **Invalid after construction → don't use a class.** Builders requiring setters before use → take all required args in one function or constructor. (anti-patterns.md §4, §9)
6. **Stop writing data classes.** Constructor + properties + no behavior → use `type`/`interface` + object literal. (anti-patterns.md §6)
7. **Test-first implications:**

   | Pattern | Setup | Testing |
   |---|---|---|
   | Pure functions | Pass args | Isolated, no mocks |
   | Stateful classes | Factories, mocks | Tangled |
   | Inheritance chains | Heavy fixtures | Nightmare |

## Tell Don't Ask

When you *do* use a class, don't let callers query state and decide externally — move the decision into the object. Watch for getter chains, `if (obj.getX()) obj.setY()` patterns, and decision logic scattered across callers.

→ Full guide, refactoring steps, nuance, and review checklist: `references/tell-dont-ask.md`

## Workflow

- **Decision tree:** `references/refactoring-checklist.md`
- **Anti-pattern catalog with fixes:** `references/anti-patterns.md`
- **Tell Don't Ask:** `references/tell-dont-ask.md`

> "If it's not making multiple instances, it's not a class." — Dave Thomas
