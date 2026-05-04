---
name: favor-existing-types-over-as-const
description: >
  When a TypeScript type already exists, use it directly instead of using `as const`
  to derive a new type from a value literal.
metadata:
  tags: typescript, type-safety, as-const, types
---

# Favor existing types over `as const`

`as const` is useful for deriving types from values when no type exists yet.
When a type already exists, annotate with it — don't recreate it from a const.

## Banned patterns

| Pattern | Problem |
|---|---|
| `const STATUSES = ["a", "b"] as const; type S = typeof STATUSES[number]` | Derives type from value when type already exists elsewhere |
| `const config = { host: "localhost" } as const; type Cfg = typeof config` | Redundant type reconstruction |

## Use instead

**Annotate with the existing type:**

```typescript
// Bad — type exists but derived again via as const
type Status = "pending" | "active" | "inactive";
const STATUSES = ["pending", "active", "inactive"] as const;
type StatusFromConst = (typeof STATUSES)[number]; // duplicate of Status

// Good — use the existing type directly
type Status = "pending" | "active" | "inactive";
const STATUSES: Status[] = ["pending", "active", "inactive"];
```

```typescript
// Bad — as const where a type exists
const DEFAULT_CONFIG = { retries: 3, timeout: 5000 } as const;
type Config = typeof DEFAULT_CONFIG; // now two sources of truth

// Good — annotate with the type
const DEFAULT_CONFIG: Config = { retries: 3, timeout: 5000 };
```

**`satisfies` for shape checking without losing inference:**

```typescript
const palette = {
  red: [255, 0, 0],
  blue: [0, 0, 255],
} satisfies Record<string, [number, number, number]>;
// type known, literal types preserved, no as const needed
```

## When `as const` IS correct

- No type exists yet and you want to derive one from a value (first occurrence).
- Narrowing an inline literal that has no corresponding domain type.
- `satisfies` doesn't cover the case (e.g., you need `readonly` tuple inference).

```typescript
// Fine — no existing type; deriving from the value is the intention
const ROUTES = ["/home", "/about", "/contact"] as const;
type Route = (typeof ROUTES)[number]; // first and only definition
```

## Related

- `avoid-type-assertions.md` — `as const` is not a type assertion, but this rule still constrains when to use it.
