<!-- Reference rule, reached only via typescript/SKILL.md's rules table. No skill-style frontmatter needed. -->
<!-- tags: typescript, immutability, readonly, react -->

# Use `readonly` to signal immutability

`readonly` on a property prevents reassignment after initialization. It communicates intent and catches accidental mutations at compile time. What it is and how it works: [official docs — Readonly Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties).

## Rules

- Mark interface properties `readonly` when callers must not reassign them (`Props`, `State`, config, DTO shapes).
- Prefer `readonly T[]` for arrays that should not be mutated — create a new array instead of mutating.
- Class properties: `readonly` members assigned in the constructor; after construction they are frozen.

```typescript
interface Props {
  readonly userId: string;
  readonly onSubmit: (data: FormData) => void;
}

function sum(nums: readonly number[]): number {
  return nums.reduce((a, b) => a + b, 0); // no mutation; correct on any readonly array
}
```

Prevents accidental `this.props.userId = ...` or `this.state.isLoading = ...` — both silent runtime bugs.

## Caveat

`readonly` prevents _you_ from mutating, but not code that holds a mutable reference to the same object. It is a compile-time check, not a runtime freeze. For deep immutability, use `Object.freeze` or an immutable data library.
