---
id: composing-software-001-compose-vs-inherit
skill: composing-software
---

# Prompt

I have a `User` class and want to add `Admin` and `Guest` that share some behaviour (logging, serialization)
but differ in permissions. My instinct is `class Admin extends User`. Is there a more functional way in
TypeScript?

(Note: this scenario also checks the anti-trigger — a follow-up asks "actually, should I instead apply the
Single Responsibility Principle to split my `User` class?", which must defer to `oop-principles`.)

# Criteria

- [ ] Recommends composition over `extends` (factory functions / functional mixins), citing fragile-base-class / gorilla-banana coupling
- [ ] Models shared behaviour (logging, serialization) as composable units rather than an inheritance chain
- [ ] Walks the Composition Hierarchy: pure function → factory → functional mixin → class as last resort
- [ ] Provides a concrete before/after (class `extends` → factory/mixin composition), not abstract advice
- [ ] Verifies the result is testable without mocks and reusable without importing collaborators
- [ ] On the SRP follow-up, correctly DEFERS to `oop-principles` (class-shape/SOLID concern), not answered here
