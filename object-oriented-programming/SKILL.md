---
name: object-oriented-programming
description: >
  Evaluate and write OOP code — class-shape smells, SOLID, GoF design patterns, Tell Don't Ask, and Object
  Calisthenics — in TypeScript/Node.js/NestJS. Use for code review, refactoring, or new class/service design.

  TRIGGER when: class has only static methods; single public method + constructor; invalid until setters are
  called; data class with only constructor + properties; getters read externally to decide (Tell Don't Ask);
  GoF pattern names (Decorator/Factory/Strategy/Builder/Command/Observer/Mixin/Proxy/Flyweight/Mediator); SOLID,
  SRP, OCP, LSP, ISP, DIP, god class, fat interface, reduce coupling, testability; object calisthenics, primitive
  obsession, first-class collections, one dot per line, Law of Demeter; "is this an OOP anti-pattern?", "should
  this be a class or a function?", "why does my code feel procedural?", or a stricter pass on existing code.
---

# Object Oriented Programming

One skill covering the full OOP review/design lens: whether something should be a class at all, SOLID, GoF
patterns, Tell Don't Ask, and Object Calisthenics. Don't recite theory — point at the specific line, name the
violation, propose the concrete refactor.

**Core rule:** Use a class only when it creates multiple instances with their own state. Otherwise prefer
functions, object literals, or types. — Dave Thomas

## Step 0 — Should this even be a class?

Before applying any other rule, run new or reviewed code through this first:

1. Does it hold instance state (remembers things between method calls)? → No: skip to utility-object check.
2. Will it be instantiated more than once with different state? → No: continue below, it's probably not a class.
3. Is it a collection of static methods? → convert to standalone functions / `const X = {...} as const`.
4. Does it have exactly one public method (`perform`/`call`/`execute`/`run`)? → convert to a function.
5. Is it invalid immediately after construction (needs setters before use)? → take all required args at once.
6. Is it named after a design pattern (Decorator/Factory/Strategy/Command)? → consider composition/functions/HOFs.
7. Is it a pure data class (constructor + properties, no behavior)? → use a `type`/`interface` + object literal.
8. None of the above? → ✅ legitimately a class. Now apply SOLID, Tell Don't Ask, and (optionally) Calisthenics below.

Full decision tree + walkthrough: `references/refactoring-checklist.md`
Anti-pattern catalog with before/after code for each numbered item above: `references/anti-patterns.md`

## SOLID — quick reference

| Principle | Rule | Signal it's violated | Fix |
|---|---|---|---|
| **SRP** | One reason to change | Class handles auth, hashing, and persistence | Split into `Validator` / `Hasher` / `Repository` |
| **OCP** | Extend via subclass; don't modify proven code | Adding a new format requires editing the existing formatter | Add a subclass without touching the base |
| **LSP** | Subtypes substitutable without surprising callers | `instanceof` checks in calling code; subclass throws "not supported" | Split into separate interfaces instead of one class hierarchy that only partially fits |
| **ISP** | Many focused interfaces over one fat one | Read-only client forced to implement write methods | Slice the fat interface by capability |
| **DIP** | Depend on abstractions, not concretions | A service directly instantiates a concrete client (`new SendgridClient()`) | Inject an interface/abstract transport instead |

Full annotated TypeScript examples for all five: `references/solid.md`

## Design patterns — quick selector

| Problem | Pattern |
|---|---|
| One shared instance (DB, config, logger) | **Singleton** |
| Swap algorithms at runtime | **Strategy** |
| Create families of related objects | **Abstract Factory** |
| Create objects without naming the concrete class | **Factory** |
| Construct complex objects step-by-step | **Builder** |
| Pair a type and utility object under one name | **Companion Object** |
| Notify subscribers on state change | **Observer** |
| Add cross-cutting behavior non-invasively | **Decorator** |
| Intercept/validate/log property access | **Proxy** |
| Share behavior across unrelated classes | **Mixin** |
| Reuse instances to reduce memory | **Flyweight** |
| Decouple via a central hub | **Mediator** |

When answering a pattern question, cover: what it is (1 sentence), when to use / not use, a minimal runnable
TypeScript example, trade-offs, and any TS-specific caveat (e.g. standard vs `experimentalDecorators`).

Full pattern examples + trade-offs (Factory, Strategy, Abstract Factory, Builder, Mixins, Decorators, Generics,
open recursion, delegation, structural polymorphism, simulating `final`): `references/patterns.md`

## Tell, Don't Ask

Don't let callers query an object's state and decide externally — move the decision into the object. Red flags:
getter chains used to make a decision, `if (obj.getX() > obj.getLimit())` outside the class, `get` then `set` in
sequence from the caller. Legitimate exceptions: DTOs, value objects, serialization/persistence boundaries, and
query methods that genuinely transform data for the caller — don't be a "getter eradicator."

Full guide, refactor steps, and review checklist: `references/tell-dont-ask.md`

## Object Calisthenics (stricter pass)

Once class-shape, SOLID, and Tell Don't Ask are clean, Jeff Bay's 9 rules (one indent level per method, no
`else`, wrap primitives, first-class collections, one dot per line, no abbreviations, small entities, ≤2 instance
variables, no bare getters/setters) push further. Apply as a lens during deliberate refactor passes or when the
user explicitly wants a more disciplined review — not as a default blocking gate.

Full rule-by-rule checklist with TS/NestJS examples and gotchas: `references/object-calisthenics.md`

## Testing implications

| Pattern | Setup | Testing |
|---|---|---|
| Pure functions | Pass args | Isolated, no mocks |
| Stateful classes | Factories, mocks | Tangled |
| Inheritance chains | Heavy fixtures | Nightmare |

## Reference files

- `references/refactoring-checklist.md` — class-vs-function decision tree
- `references/anti-patterns.md` — 9 anti-patterns with TS before/after fixes
- `references/solid.md` — SOLID, annotated TypeScript examples
- `references/patterns.md` — GoF + modern TS pattern catalog with trade-offs
- `references/tell-dont-ask.md` — encapsulation deep dive
- `references/object-calisthenics.md` — Jeff Bay's 9 rules, NestJS/DDD-flavored
