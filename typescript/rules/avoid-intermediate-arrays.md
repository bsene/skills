---
name: avoid-intermediate-arrays
description: >
  Prevent chains like filter().map() that allocate intermediate arrays on hot paths.
  Use a single reduce pass (with push) or a for-loop instead.
metadata:
  tags: typescript, javascript, performance, arrays
---

# Avoid intermediate arrays

Every chained array method (`filter`, `map`, `flatMap`, `slice`) allocates a new array.
On large inputs or hot paths this compounds: two passes over the data, one wasted allocation,
and extra GC pressure. Collapse the chain into a single pass.

## Banned patterns

| Pattern | Problem |
|---|---|
| `arr.filter(p).map(f)` | 2 passes, 1 intermediate array |
| `arr.filter(p).map(f).filter(q)` | N passes, N−1 intermediate arrays |
| `arr.reduce((r, n) => p(n) ? [...r, f(n)] : r, [])` | New array **per element** — worst case, O(n²) copies |

## Use instead

**Single `reduce` with `push` (functional style):**
```typescript
arr.reduce<number[]>((acc, n) => {
  if (n.num > 0.5) acc.push(n.num * 2);
  return acc;
}, []);
```

**`for…of` loop (imperative, often clearest):**
```typescript
const out: number[] = [];
for (const n of arr) {
  if (n.num > 0.5) out.push(n.num * 2);
}
```

**Diff — classic filter+map chain:**
```diff
- const doubled = arr.filter(n => n.num > 0.5).map(n => n.num * 2);
+ const doubled = arr.reduce<number[]>((acc, n) => {
+   if (n.num > 0.5) acc.push(n.num * 2);
+   return acc;
+ }, []);
```

## Benchmark (Chrome 124, n=10000)

| Approach | Relative cost |
|---|---|
| `reduce + push` | 1.00× (baseline) |
| `filter + map` | ~1.55× |
| `reduce` with spread `[...r, x]` | ~893× |

The spread variant degrades quadratically — never use it in a reducer accumulator.

Source: Nenashev, "Avoid intermediate arrays (filter/map) to make Javascript fast" (dev.to, 2024).

## Exceptions

- Small, bounded arrays (< ~100 items) off the hot path — readability wins.
- Single method calls (`.map` alone, `.filter` alone) — no intermediate exists.
- When you **need** an immutable fresh copy for downstream callers — the allocation is the point.
- Pipelines optimized by the engine (e.g. `Array.from(iterable, mapFn)` fuses creation + map).

## Linting

No off-the-shelf ESLint rule enforces this cleanly. `unicorn/no-array-reduce` takes the
opposite stance and should be **disabled** on performance-sensitive code. Rely on code
review and profiling, not lint.

## Related

- `as const` / type-assertion avoidance — see `avoid-type-assertions.md`.
- Future rules in this set: avoid iterators/generators, pre-allocate arrays, avoid spread in loops.
