---
name: typescript-type-system
description: >
  Deep dive into TypeScript's type system — narrowing, discriminated unions, mapped types, conditional types, type guards, branding, and escape hatches.
  TRIGGER when: user asks about unknown vs any, type narrowing, discriminated unions, exhaustiveness checking,
  mapped types, conditional types, infer keyword, user-defined type guards, type branding, companion object pattern,
  as const, escape hatches, type assertion, how do I narrow a type, how do I write a type predicate,
  how to create nominal types, how to prevent structural aliasing,
  make illegal states unrepresentable, illegal states, state machine types, entity lifecycle types,
  optional field anti-pattern, discriminated union state modeling,
  interface vs type alias, when to use interface vs type, enum best practices, typescript enum,
  const enum, readonly property, ReadonlyArray, lazy object initialization, barrel exports,
  when to use generics, generic naming conventions, no interface prefix.
  DO NOT USE when: runtime/schema validation at boundaries (parsing external input, API responses) →
  use `typescript-zod`; plain naming or JS idiom questions → use `javascript`.
user-invocable: false
---

# TypeScript Type System

## Quick Concept Index

| Problem / Topic                              | Concept                        |
| -------------------------------------------- | ------------------------------ |
| Safely handle API responses / JSON.parse     | `unknown` vs `any`             |
| Narrow a union based on runtime checks       | Type narrowing & refinement    |
| Route on message type with different shapes  | Discriminated unions           |
| Model entity lifecycle without invalid states | Make Illegal States Unrepresentable |
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

**Make Illegal States Unrepresentable** — Model each state of an entity lifecycle as its own type in a discriminated union. Eliminates incoherent field combinations that optional fields allow.

Anti-pattern — single type with optional fields permits invalid states:

```typescript
type Task = {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  startedAt?: Date;
  finishedAt?: Date;
  error?: string;
  cancelledBy?: string;
};
// Compiles fine: { status: "PENDING", finishedAt: new Date() } — incoherent
```

Fix — one type per state, shared base via intersection:

```typescript
type AbstractTask = { id: string; title: string; createdAt: Date };

type PendingTask    = AbstractTask & { status: "PENDING" };
type InProgressTask = AbstractTask & { status: "IN_PROGRESS"; startedAt: Date };
type CompletedTask  = AbstractTask & { status: "COMPLETED"; startedAt: Date; finishedAt: Date };
type FailedTask     = AbstractTask & { status: "FAILED"; startedAt: Date; finishedAt: Date; error: string };
type CancelledTask  = AbstractTask & { status: "CANCELLED"; cancelledBy: string; cancelledAt: Date };

type Task = PendingTask | InProgressTask | CompletedTask | FailedTask | CancelledTask;

function handleTask(task: Task): void {
  switch (task.status) {
    case "COMPLETED":
      console.log(`Done in ${task.finishedAt.getTime() - task.startedAt.getTime()}ms`);
      break;
    case "FAILED":
      console.error(task.error);
      break;
    case "CANCELLED":
      console.log(`Cancelled by ${task.cancelledBy}`);
      break;
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

**`as const`** — Freeze values to literal types. Use on configs/arrays to derive union types **only when no type exists yet**. If a type already exists, annotate with it instead.

```typescript
// Good — no existing type; deriving is the intention
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "user" | "guest"

// Bad — Role already exists; don't derive it again
type Role = "admin" | "user" | "guest";
const ROLES = ["admin", "user", "guest"] as const;        // ← redundant
type RoleAgain = (typeof ROLES)[number];                  // ← duplicate

// Good — annotate with the existing type
type Role = "admin" | "user" | "guest";
const ROLES: Role[] = ["admin", "user", "guest"];
```

⚠️ See rule: `rules/favor-existing-types-over-as-const.md`

**Escape hatches** — `as T`, `!`, `!:` override TypeScript checks. Last resort; frequent use signals refactoring needed.

---

## Interface vs Type Alias

| Use `interface` when | Use `type` when |
|---|---|
| Defining an object shape others will `extend` or `implement` | Unions and intersections |
| You need declaration merging (augmenting third-party types) | Mapped/conditional/utility types |
| Modeling a class contract | Simple semantic alias (`type UserId = string`) |

```typescript
// interface — extendable contract
interface Repository<T> {
  findById(id: string): T | undefined;
  save(entity: T): void;
}

// type — union (can't be done with interface)
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
```

Do NOT prefix interfaces with `I`. See `rules/no-interface-prefix.md`.

---

## Generics: when (not) to use

**Don't use generics at a single location** — it provides no type safety over `any`:

```typescript
// Bad — T appears only in return; equivalent to returning any
declare function parse<T>(name: string): T;

// Good — T appears in both parameter and return (meaningful constraint)
function identity<T>(x: T): T { return x; }
function reverse<T>(items: T[]): T[] { return [...items].reverse(); }
```

Use descriptive names for multi-parameter generics:

```typescript
class Dictionary<TKey, TValue> {
  get(key: TKey): TValue | undefined { ... }
  set(key: TKey, value: TValue): void { ... }
}
```

---

## Enums best practices

```typescript
enum Status {
  Inactive = 1,  // start at 1 — avoids falsy 0 bugs
  Active   = 2,
  Pending  = 3,
}

enum DocumentType {            // string enums — better logs and API interop
  Passport       = 'passport',
  Visa           = 'passport_visa',
  DriversLicense = 'drivers_license',
}

const enum Direction { Up = 'UP', Down = 'DOWN' }  // zero runtime cost (inlined)
```

---

## Lazy object initialization anti-pattern

Avoid initializing an empty object and adding properties later — TypeScript infers `{}` and later assignments fail:

```typescript
// Bad
let config = {};
config.host = "localhost";  // Error: property 'host' does not exist on type '{}'

// Good — initialize all properties together
const config = { host: "localhost", port: 3000 };

// Or annotate first
let config: Config = { host: "localhost", port: 3000 };
```

→ Full examples with runnable code: `references/type-system.md`

---

## Benchmark

Scenario: `.benchmarks/scenarios/typescript-001-illegal-states.md` · Run: 2026-06-14

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 100% | +0%   |
| claude-sonnet-4-6 | 83%     | 100% | +17%  |
| claude-haiku-4-5  | 100%    | 100% | +0%   |

> **SOFT PASS** (ceiling effect — frontier baselines already produce textbook discriminated unions). Only lift is shared-base on sonnet. A harder variant — `.benchmarks/scenarios/typescript-002-state-transitions.md` (typed transitions + branded ids) — is authored and **pending a run** to differentiate models. Gate per `skill-optimizer/release-gates.md`.
