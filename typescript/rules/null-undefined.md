---
name: null-undefined
description: >
  Use `undefined` for absence of a value. Use `null` only where it is part of an API
  contract or external convention (Node.js callbacks, JSON serialization).
metadata:
  tags: typescript, null, undefined, nullability
---

# `undefined` for absence, `null` for API contracts

JavaScript has two "nothing" values. TypeScript preserves both. Choose deliberately.

## Rule

| Situation | Use |
|---|---|
| Property/variable not provided or not yet set | `undefined` |
| Explicit "no value" in an API or external contract | `null` |
| Node.js callback first argument on success | `null` (Node convention) |
| JSON field intentionally empty | `null` (JSON has no `undefined`) |
| Optional function parameter | `undefined` (omit or pass `undefined`) |

## Checking for both null and undefined

Use `== null` (loose equality) to catch both with one check:

```typescript
// Checks for null AND undefined — intentional
if (value == null) return defaultValue;

// Only checks for null
if (value === null) return defaultValue;

// Only checks for undefined
if (value === undefined) return defaultValue;
```

`== null` is the one legitimate use of `==` over `===` in TypeScript.

## Objects: use truthy checks

For objects, prefer truthiness over explicit null/undefined checks:

```typescript
// Good
if (error) handleError(error);

// Verbose, unnecessary
if (error !== null && error !== undefined) handleError(error);
```

## Avoid mixing both

Pick one sentinel per domain concept. Mixing `null` and `undefined` for the same field forces callers to check both separately or use `== null` everywhere.

```typescript
// Bad — two nullables for the same concept
interface User {
  middleName: string | null | undefined;
}

// Good — single sentinel
interface User {
  middleName?: string;  // undefined when absent
}
```

## Nullable return types

```typescript
// For internal functions: use undefined (optional)
function findUser(id: string): User | undefined {
  return users.get(id);
}

// For API/external-facing functions: null is acceptable
function getUserOrNull(id: string): User | null {
  return users.get(id) ?? null;
}
```
