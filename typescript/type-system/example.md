```typescript
// Exhaustiveness checking with assertNever
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    default:
      return assertNever(shape); // compile error if a new Shape variant is added and unhandled
  }
}
```
