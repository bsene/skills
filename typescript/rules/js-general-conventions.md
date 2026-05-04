---
name: js-general-conventions
description: >
  TypeScript code follows JavaScript general conventions — naming, syntax idioms, modern patterns.
  TS-specific features augment; they don't replace JS conventions.
metadata:
  tags: typescript, javascript, conventions, naming, idioms
---

# Use JavaScript general conventions

TypeScript is a superset of JavaScript. Follow JS conventions first; use TS-specific features to augment, not replace.

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
| `== null` check | Coercion surprises | `=== null` or `?? ` |
| Namespace-style imports (`import * as X`) when named imports work | Verbose | Named imports |
| Excessive type annotations on obvious inferences | Noise | Let TS infer |

## TypeScript augments, not replaces

```typescript
// Bad — TS-isms where JS convention is cleaner
const result: Array<string> = new Array<string>();

// Good — JS convention with TS inference
const result: string[] = [];
```
