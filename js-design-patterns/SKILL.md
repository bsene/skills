---
name: js-design-patterns
description: >
  Apply classic JavaScript design patterns (Singleton, Observer, Factory, Proxy, Prototype, Module, Mixin, Mediator, Flyweight) to solve structural and behavioral problems in vanilla JS and Node.js. Use this skill whenever the user asks about a design pattern by name, asks how to structure objects or classes, needs to share behavior without inheritance, wants to decouple components, manage a single shared resource, intercept object access, or build an event/pub-sub system. Also trigger when the user describes a problem that a well-known pattern solves — even if they don't name the pattern — such as "how do I make sure only one instance exists?", "how do I notify multiple parts of my app when something changes?", or "how do I create objects without knowing their type upfront?". Based on patterns.dev.
---

# JavaScript Design Patterns Skill

Classic GoF-inspired design patterns implemented in modern JavaScript (ES2017+). Based on [patterns.dev/vanilla](https://www.patterns.dev/vanilla).

---

## Quick Pattern Selector

| Problem                                                 | Pattern       |
| ------------------------------------------------------- | ------------- |
| Need exactly one shared instance (DB, config, logger)   | **Singleton** |
| Intercept, validate, or log object property access      | **Proxy**     |
| Share methods across many instances without duplication | **Prototype** |
| Notify multiple parts of the app when state changes     | **Observer**  |
| Encapsulate private state; expose a clean public API    | **Module**    |
| Add reusable behavior to classes without inheritance    | **Mixin**     |
| Decouple components via a central communication hub     | **Mediator**  |
| Reuse instances to reduce memory (thousands of objects) | **Flyweight** |
| Create objects without specifying their exact type      | **Factory**   |

---

## Response Format

For every pattern question, provide:

1. **What it is** — one sentence
2. **When to use / when NOT to use** — concrete conditions
3. **Code example** — minimal, modern JS (ES6+), runnable
4. **Trade-offs** — what you gain and what you give up

---

## Pattern Summaries

### Singleton

One instance, globally accessible. Use for shared resources. Avoid when you need testability or multiple independent instances.

### Proxy (ES6 `Proxy`)

Wrap an object to intercept `get`/`set`/`apply` traps. Use for validation, logging, caching, reactive systems. Has runtime overhead — avoid on hot paths.

### Prototype

Add shared methods to `.prototype` rather than each instance. Memory-efficient. Mutating the prototype affects all instances.

### Observer / EventEmitter

Subscribers register for events; publisher emits without knowing who's listening. Great for decoupling. Risk: memory leaks if listeners aren't removed.

### Module (ES Modules / IIFE)

Expose only a public API; keep internals private. Prefer ES `import/export` for tree-shaking. Use IIFE only in non-bundled environments.

### Mixin

Copy methods from plain objects onto a class prototype with `Object.assign`. Enables multiple-behavior composition. Risk: name collisions, hard to trace origins.

### Mediator / Middleware

Components communicate through a central hub, not directly. Pipeline variant (Express-style) chains async handlers. Decouples senders from receivers.

### Flyweight

Share a common "intrinsic state" object across many instances; each instance only stores unique "extrinsic state". Best for large numbers of similar objects.

### Factory

A function or class that creates and returns objects based on input, hiding instantiation details. Useful for polymorphism and plugin architectures.

---

## Reference File

For full examples with runnable code and detailed trade-offs, read:
→ `references/design-patterns.md`
