---
name: typescript-type-system
description: >
  Deep dive into TypeScript's type system — narrowing, discriminated unions, mapped types, conditional types, type guards, branding, and escape hatches.
  TRIGGER when: user asks about unknown vs any, type narrowing, discriminated unions, exhaustiveness checking,
  mapped types, conditional types, infer keyword, user-defined type guards, type branding, companion object pattern,
  as const, escape hatches, type assertion, how do I narrow a type, how do I write a type predicate,
  how to create nominal types, how to prevent structural aliasing.
user-invocable: false
---

# TypeScript Type System

## Quick Concept Index

| Problem / Topic                              | Concept                        |
| -------------------------------------------- | ------------------------------ |
| Safely handle API responses / JSON.parse     | `unknown` vs `any`             |
| Narrow a union based on runtime checks       | Type narrowing & refinement    |
| Route on message type with different shapes  | Discriminated unions           |
| Fail at compile time when a case is missed   | Exhaustiveness / `assertNever` |
| Create `Partial`, `Readonly`, or custom maps | Mapped types                   |
| Unwrap `Promise<T>`, filter union members    | Conditional types + `infer`    |
| Carry narrowing across function boundaries   | User-defined type guards       |
| Prevent mixing `UserId` and `SessionToken`   | Type branding (nominal types)  |
| Pair a type and utility under one import     | Companion object pattern       |
| Preserve literal types in config objects     | `as const` / type widening     |
| Last-resort override of TypeScript's checks  | Escape hatches (`as T`, `!`)   |

## Concepts

**`unknown` vs `any`** — `any` disables checking; `unknown` forces narrowing before use. Default to `unknown` for external data (JSON.parse, API responses, user input).

```typescript
function process(value: unknown) {
  if (typeof value === "string") value.toUpperCase(); // OK — narrowed
  value.toUpperCase();                                // Error — unknown not narrowed
}
```

**Type narrowing** — TypeScript narrows union types through `typeof`, `instanceof`, `in`, equality checks, truthiness, and `Array.isArray`. Narrowing eliminates impossible branches.

```typescript
function format(val: string | number | null) {
  if (val === null) return "—";
  if (typeof val === "number") return val.toFixed(2);
  return val.trim();  // TS knows val is string here
}
```

**Discriminated unions** — A shared literal tag field (`kind`, `type`, `status`) lets `switch`/`if` dispatch on shape. Essential for Redux actions, WebSocket messages, API variants.

```typescript
type Event =
  | { kind: "login";  userId: string }
  | { kind: "logout"; userId: string; reason: string }
  | { kind: "error";  message: string };

function handle(e: Event) {
  switch (e.kind) {
    case "login":  return greet(e.userId);
    case "logout": return log(e.userId, e.reason);
    case "error":  return alert(e.message);
  }
}
```

**Exhaustiveness checking** — `assertNever(value: never)` produces a compile error when a new union member is added but not handled.

```typescript
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
// Add a new Event variant → handle()'s switch breaks at compile time
```

**Mapped types** — Transform every key of an existing type: `{ [K in keyof T]?: T[K] }`. Built-ins: `Partial`, `Required`, `Readonly`, `Pick`, `Record`.

```typescript
type Flags<T> = { [K in keyof T]: boolean };
// Flags<{ name: string; age: number }> → { name: boolean; age: boolean }
```

**Conditional types** — Type-level ternary: `T extends U ? X : Y`. With `infer`, extract type arguments at the type level.

```typescript
type Unwrap<T> = T extends Promise<infer U> ? U : T;
// Unwrap<Promise<string>> → string
// Unwrap<number>          → number
```

**User-defined type guards** — Return `value is T` to carry narrowing across function boundaries, where TypeScript can't infer the refinement.

```typescript
function isUser(v: unknown): v is User {
  return typeof v === "object" && v !== null && "id" in v;
}
```

**Type branding** — Prevents mixing structurally identical types (`UserId` vs `SessionToken`) at zero runtime cost. Use `unique symbol` for full nominal safety.

```typescript
declare const _brand: unique symbol;
type UserId      = string & { readonly [_brand]: "UserId" };
type SessionToken = string & { readonly [_brand]: "SessionToken" };

function createUserId(id: string): UserId { return id as UserId; }
// createUserId(rawToken)   → compile error — token ≠ userId
```

**Companion object pattern** — Bind the same name to both a type and const value. One import covers annotation and utilities.

**`as const`** — Freeze values to literal types. Use on configs/arrays to derive union types.

```typescript
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "user" | "guest"
```

**Escape hatches** — `as T`, `!`, `!:` override TypeScript checks. Last resort; frequent use signals refactoring needed.

→ Full examples with runnable code: `references/type-system.md`
