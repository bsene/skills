---
name: js-general-conventions
description: >
  JavaScript naming, syntax idioms, and modern patterns — the foundation TypeScript builds on.
  Strict equality, const/let, destructuring, template literals, optional chaining.
metadata:
  tags: javascript, typescript, conventions, naming, idioms
---

# Use JavaScript general conventions

These idioms apply to all JavaScript. TypeScript builds on them — type features augment, they do not replace these conventions.

## Naming

| Kind | Convention | Example |
|---|---|---|
| Variables, functions, methods | `camelCase` | `getUserById`, `isActive` |
| Types, interfaces, classes, enums | `PascalCase` | `UserProfile`, `HttpStatus` |
| Constants (true module-level) | `UPPER_SNAKE` or `camelCase` | `MAX_RETRIES` or `defaultTimeout` |
| Files | `kebab-case` | `user-service.ts` |
| Boolean variables/props | `is/has/can` prefix | `isLoading`, `hasPermission` |

## Variable declarations

```typescript
const count = 0;       // prefer const
let message = "hello"; // let when reassignment needed
// never var
```

## Modern syntax idioms

```typescript
// Destructuring over repeated property access
const { id, name } = user;
const [first, ...rest] = items;

// Template literals over concatenation
const msg = `User ${name} created at ${date}`;

// Optional chaining + nullish coalescing
const city = user?.address?.city ?? "Unknown";

// Short-circuit for defaults
const timeout = options.timeout ?? 5000;

// Arrow functions for callbacks
const ids = users.map(u => u.id);
```

## Equality

```typescript
x === y  // always strict equality
x !== y  // always strict inequality
// never == or !=
```

## Functions

Prefer named functions for module exports, arrow functions for inline callbacks:

```typescript
// Export
export function createUser(dto: CreateUserDTO): User { ... }

// Inline callback
users.filter(u => u.active).map(u => u.id);
```

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| `var x` | Hoisted, function-scoped, unexpected | `const` or `let` |
| `"foo" + bar + "baz"` | Verbose, error-prone | Template literal |
| `==` / `!=` (loose equality) | Coercion surprises | `===` / `!==` — sole exception: `== null` to test null+undefined together (see `null-undefined.md`) |
| Namespace-style imports (`import * as X`) when named imports work | Verbose | Named imports |
| Excessive type annotations on obvious inferences | Noise | Let TS infer |
