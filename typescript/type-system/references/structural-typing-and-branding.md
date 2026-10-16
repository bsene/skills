# Structural Typing and Branding

Detail for [type-system](../SKILL.md).

**Structural typing** — Compatibility is determined by shape, not by nominal inheritance. Prefer the narrowest useful shape; a name alone does not prevent mixing semantically different values. Use branding for domain IDs.

Avoid empty structures; they accept almost every value:

```typescript
// Bad — no contract
interface Empty {}
type Anything = {};
```

See _Type branding_ below for the full example.

**Type branding** — Prevents mixing structurally identical types (`UserId` vs `SessionToken`) at zero runtime cost. Use `unique symbol` for full nominal safety.

```typescript
declare const _brand: unique symbol;
type UserId = string & { readonly [_brand]: "UserId" };
type SessionToken = string & { readonly [_brand]: "SessionToken" };

function createUserId(id: string): UserId {
  return id as UserId;
}
// createUserId(rawToken)   → compile error — token ≠ userId
```

**Companion object pattern** — Bind the same name to both a type and const value. One import covers annotation and utilities.
