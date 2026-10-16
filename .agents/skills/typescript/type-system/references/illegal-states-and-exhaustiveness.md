# Illegal States and Exhaustiveness

Detail for [type-system](../SKILL.md).

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

type PendingTask = AbstractTask & { status: "PENDING" };
type InProgressTask = AbstractTask & { status: "IN_PROGRESS"; startedAt: Date };
type CompletedTask = AbstractTask & {
  status: "COMPLETED";
  startedAt: Date;
  finishedAt: Date;
};
type FailedTask = AbstractTask & {
  status: "FAILED";
  startedAt: Date;
  finishedAt: Date;
  error: string;
};
type CancelledTask = AbstractTask & {
  status: "CANCELLED";
  cancelledBy: string;
  cancelledAt: Date;
};

type Task =
  PendingTask | InProgressTask | CompletedTask | FailedTask | CancelledTask;

function handleTask(task: Task): void {
  switch (task.status) {
    case "COMPLETED":
      console.log(
        `Done in ${task.finishedAt.getTime() - task.startedAt.getTime()}ms`,
      );
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

**Exhaustiveness checking** — `assertNever(value: never)` produces a compile error when a new union member is added but not handled:

```typescript
type Shape =
  { kind: "circle"; radius: number } | { kind: "square"; side: number };

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

See [Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking).
