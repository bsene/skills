---
name: no-interface-prefix
description: >
  Do not prefix interface names with I (e.g. IUser, IFoo).
  Use plain PascalCase names for all interfaces.
metadata:
  tags: typescript, naming, interfaces, conventions
---

# Do not prefix interfaces with `I`

The TypeScript standard library, compiler, and all major style guides (Airbnb, Google, Angular, React) use plain PascalCase names — not `IFoo`.

## Banned patterns

```typescript
interface IUser { id: string; name: string; }  // ← banned
interface IRepository<T> { findById(id: string): T; }  // ← banned
```

## Use instead

```typescript
interface User { id: string; name: string; }
interface Repository<T> { findById(id: string): T; }
```

## Rationale

- The `I` prefix comes from COM/Java/C# conventions — not JavaScript or TypeScript norms.
- TypeScript's own compiler types (`CompilerHost`, `EmitResult`, `LanguageService`) never use `I`.
- It adds noise without information: the type system already tells you something is an interface.
- Type aliases and interfaces are often interchangeable; the prefix creates false distinction.

## Exceptions

None. This applies to all interfaces, including generic and utility interfaces.
