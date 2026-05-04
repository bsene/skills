---
name: explicit-return-types
description: >
  Always annotate function return types explicitly. Prevents silent `any` propagation
  from untyped dependencies and makes intent clear at the call site.
metadata:
  tags: typescript, type-safety, return-types, noImplicitAny
---

# Annotate function return types explicitly

TypeScript infers return types, but inference can silently widen to `any` when calling untyped or loosely-typed dependencies. Explicit return types catch this at the function boundary.

## Banned patterns

```typescript
// Bad — return type inferred; if userStore.get() returns any, result is any
function getUser(id: string) {
  return userStore.get(id);
}

// Bad — could return string | undefined | null depending on lookup
function findRole(userId: string) {
  return roleMap[userId];
}
```

## Use instead

```typescript
function getUser(id: string): User | undefined {
  return userStore.get(id);
}

function findRole(userId: string): Role | null {
  return roleMap[userId] ?? null;
}
```

## Rule: enable `noImplicitAny`

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true  // includes noImplicitAny
  }
}
```

`noImplicitAny` forces TypeScript to error when it cannot infer a type. It is included in `"strict": true`. Never disable it.

## Exceptions

- Short, obvious one-liner utilities where the return type is self-evident from the expression:
  ```typescript
  const double = (n: number) => n * 2;  // return type number is obvious
  ```
- Arrow functions assigned to a typed variable (type flows from the annotation):
  ```typescript
  const handler: RequestHandler = (req, res) => { res.send("ok"); };
  ```

## `@ts-expect-error` over `@ts-ignore`

When suppression is truly needed:

```typescript
// Bad — silences all errors, even future unrelated ones
// @ts-ignore
doSomethingUntyped();

// Good — errors if the suppression becomes unnecessary
// @ts-expect-error: third-party lib missing types
doSomethingUntyped();
```
