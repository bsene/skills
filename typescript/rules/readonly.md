---
name: readonly
description: >
  Mark properties and arrays as readonly to signal immutability and prevent accidental mutation.
  Use ReadonlyArray<T> or readonly T[] for immutable arrays.
metadata:
  tags: typescript, immutability, readonly, react
---

# Use `readonly` to signal immutability

`readonly` on a property prevents reassignment after initialization. It communicates intent and catches accidental mutations at compile time.

## Property immutability

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 1, y: 2 };
p.x = 3;  // Error: cannot assign to 'x' because it is a read-only property
```

## Immutable arrays

Prefer `readonly T[]` (shorthand) or `ReadonlyArray<T>` for arrays that should not be mutated:

```typescript
function sum(nums: readonly number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Correct: create a new array instead of mutating
const next = [...nums, 4];
```

## React: mark Props and State as readonly

```typescript
interface Props {
  readonly userId: string;
  readonly onSubmit: (data: FormData) => void;
}

interface State {
  readonly isLoading: boolean;
  readonly error: string | null;
}
```

Prevents accidental `this.props.userId = ...` or `this.state.isLoading = ...` — both silent runtime bugs.

## Class properties

```typescript
class Config {
  readonly maxRetries: number;
  readonly baseUrl: string;

  constructor(maxRetries: number, baseUrl: string) {
    this.maxRetries = maxRetries;  // allowed in constructor
    this.baseUrl = baseUrl;
  }
}
```

After construction, `maxRetries` and `baseUrl` are frozen.

## `const` vs `readonly`

| | `const` | `readonly` |
|---|---|---|
| Scope | Variable binding | Object property |
| Prevents | Variable reassignment | Property mutation |
| Runtime cost | None | None |

Use both: `const obj: { readonly x: number } = { x: 1 }`.

## Caveat

`readonly` prevents *you* from mutating, but not code that holds a mutable reference to the same object. It is a compile-time check, not a runtime freeze. For deep immutability, use `Object.freeze` or an immutable data library.
