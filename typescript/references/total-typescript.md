# Total TypeScript: practical type design

Use for type derivation, literal widening, `satisfies`, generic inference, and conditional-type debugging. These are original examples and condensed guidance informed by Matt Pocock's public [Total TypeScript workshops](https://www.totaltypescript.com/workshops) and companion material; this is not a course transcript.

## Derive types when the relationship is intentional

Use `typeof` to obtain a value's type, `keyof` for its keys, `T[K]` for selected property types, and `T[number]` for array elements. Derive only when changes should propagate: a database row and a public API response may need independent contracts. See [Deriving Types](https://www.totaltypescript.com/books/total-typescript-essentials/deriving-types).

```typescript
const jobStates = ["queued", "running", "finished"] as const;
type JobState = (typeof jobStates)[number];

const jobLabels = {
  queued: "Waiting",
  running: "Working",
  finished: "Done",
} as const;
type LabelKey = keyof typeof jobLabels;
type JobLabel = (typeof jobLabels)[LabelKey];
```

Reuse existing domain types rather than reconstructing them from duplicate constants. For derived function results, use `ReturnType<typeof fn>` and `Awaited<ReturnType<typeof asyncFn>>` when that coupling is wanted.

## Choose annotations, `satisfies`, and `as const` deliberately

| Need                                                                    | Tool                    |
| ----------------------------------------------------------------------- | ----------------------- |
| A variable with a declared contract, including future assignments       | `: T`                   |
| Check a value against a contract while keeping its specific keys        | `satisfies T` (TS 4.9+) |
| Preserve literal values and readonly properties in a literal expression | `as const`              |
| Both literal preservation and a shape check                             | `as const satisfies T`  |

`satisfies` supplies contextual typing; it does not guarantee every property stays a literal. `as const` supplies compile-time readonly types, not runtime freezing. Avoid `as T` to silence a mismatch. Follow the project's public return-type policy. See [Annotations and Assertions](https://www.totaltypescript.com/books/total-typescript-essentials/annotations-and-assertions).

```typescript
type JobOptions = { retries: number; queue: "fast" | "bulk" };

const jobs = {
  email: { retries: 3, queue: "fast" },
  report: { retries: 1, queue: "bulk" },
} satisfies Record<string, JobOptions>;

type JobName = keyof typeof jobs; // "email" | "report"
const queue: "fast" = jobs.email.queue;
jobs.email.retries = 5; // number, not the literal 3
```

## Preserve relationships with generics

Use a union parameter when the output does not depend on the input's type. Use a generic when a relationship must survive the call. Use overloads for a small set of genuinely different call signatures; an implementation signature does not itself prove each overload's promised return type. See [Compare function overloads and generics](https://www.totaltypescript.com/tips/compare-function-overloads-and-generics).

```typescript
function getProperty<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const retries = getProperty(jobs.email, "retries"); // number
const selectedQueue = getProperty(jobs.email, "queue"); // "fast"
// @ts-expect-error: the key must exist on the supplied object
getProperty(jobs.email, "timeout");
```

Do not add a caller-chosen return-only generic to a parser or fetch wrapper unless runtime validation establishes that type. A type argument cannot validate a response.

## Choose which argument drives inference

When one argument defines the allowed values and another must fit them, use `NoInfer<T>` (TS 5.4+) on the dependent argument. Otherwise both arguments can contribute candidates and widen the inferred union. This controls inference, not runtime validation. See [NoInfer](https://www.totaltypescript.com/noinfer).

```typescript
function selectQueue<T extends string>(
  allowed: readonly T[],
  selected: NoInfer<T>,
): T {
  return selected;
}

selectQueue(["fast", "bulk"], "fast");
// @ts-expect-error: selected cannot introduce another allowed value
selectQueue(["fast", "bulk"], "urgent");
```

## Distinguish member filtering from whole-union checks

A conditional on a bare type parameter distributes across union members. Wrap both sides in tuples when the entire union must satisfy the condition. Prefer built-ins such as `Extract` and `Exclude` for filtering. See the workshop's [distributivity lesson](https://www.totaltypescript.com/workshops/type-transformations/conditional-types-and-infer/distributivity-in-conditional-types/solution) and the handbook's [distributive conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types).

```typescript
type KeepStrings<T> = T extends string ? T : never;
type OnlyStrings<T> = [T] extends [string] ? T : never;

type Filtered = KeepStrings<"fast" | 42>; // "fast"
type Rejected = OnlyStrings<"fast" | 42>; // never
```

## Check inferred types and rejected calls

Run the project's type checker as well as runtime tests: executing transpiled tests alone does not check inference. Pair valid calls with `@ts-expect-error` cases; the directive fails if the next line stops producing an error, but does not verify a particular diagnostic. See [error suppression directives](https://www.totaltypescript.com/books/total-typescript-essentials/annotations-and-assertions#error-suppression-directives).

Use existing `Expect<Equal<...>>` or `expectTypeOf` helpers for exact type checks when available. Without a helper, bidirectional assignments can check a simple inferred union:

```typescript
function checkJobName(name: JobName): void {
  const expected: "email" | "report" = name;
  void expected;
}

function checkExpectedJobName(name: "email" | "report"): JobName {
  return name;
}

checkJobName("email");
// @ts-expect-error: unknown job name
checkJobName("archive");
// @ts-expect-error: verifies inference did not widen the queue to string
const wrongQueue: "bulk" = selectedQueue;
```
