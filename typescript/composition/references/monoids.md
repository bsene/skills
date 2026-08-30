# Monoids in TypeScript

A monoid is a minimal structure: a set of values + an **associative** binary operation (`combine`) + a **neutral element** (`empty`). Recognizing it in business code replaces ad hoc merge logic — a frequent source of edge-case bugs — with a generic API tested once.

Source: [Les monoïdes : une abstraction omniprésente (evryg)](https://kb.evryg.com/fr/ingenierie-logicielle-avancee/fondations/les-monoides-une-abstraction-omnipresente). For the Clojure/ClojureScript counterpart, see the `monoids` skill.

## Base interface

```typescript
interface Monoid<T> {
  empty: T;
  combine: (a: T, b: T) => T;
}
```

Two laws must hold — restate them when proposing a custom monoid, since they are what justify parallelization and short-circuiting empty cases:

- **Associativity**: `combine(combine(a, b), c) === combine(a, combine(b, c))`
- **Neutrality**: `combine(a, empty) === a` and `combine(empty, a) === a`

A generic `fold` works for any monoid:

```typescript
function fold<T>(monoid: Monoid<T>, items: T[]): T {
  return items.reduce(monoid.combine, monoid.empty);
}
```

## Basic monoids

```typescript
const numberSum: Monoid<number> = { empty: 0, combine: (a, b) => a + b };

const stringConcat: Monoid<string> = { empty: "", combine: (a, b) => a + b };

const arrayConcat = <T>(): Monoid<T[]> => ({
  empty: [],
  combine: (a, b) => [...a, ...b],  // ponytail: fixed two-array combine, not a per-element reducer accumulator
});

const boolAnd: Monoid<boolean> = { empty: true, combine: (a, b) => a && b };
const boolOr: Monoid<boolean> = { empty: false, combine: (a, b) => a || b };

// Functions A -> A under composition
const endoCompose = <A>(): Monoid<(a: A) => A> => ({
  empty: (a) => a,
  combine: (f, g) => (a) => g(f(a)),
});
```

## Associativity → parallelization

Associativity guarantees grouping order doesn't matter — hence Map-Reduce: split, reduce each chunk independently, combine the partial results.

```typescript
function parallelFold<T>(monoid: Monoid<T>, items: T[], chunks = 4): T {
  const size = Math.ceil(items.length / chunks);
  const partials = Array.from({ length: chunks }, (_, i) =>
    fold(monoid, items.slice(i * size, (i + 1) * size))
  );
  return fold(monoid, partials);
}
```

Typical use: aggregate metrics per Kafka partition, then combine the partial aggregates — a distributed `reduce` is a monoidal fold.

## Domain modeling

Recurring cases where spotting a monoid avoids ad hoc logic:

```typescript
// Shopping cart — the empty cart is the neutral element
interface Cart {
  items: Map<string, number>;
}

const cartMonoid: Monoid<Cart> = {
  empty: { items: new Map() },
  combine: (a, b) => {
    const items = new Map(a.items);
    for (const [id, qty] of b.items) {
      items.set(id, (items.get(id) ?? 0) + qty);
    }
    return { items };
  },
};

// Permissions — absence of permission is the neutral element
type Permissions = Set<string>;

const permissionsMonoid: Monoid<Permissions> = {
  empty: new Set(),
  combine: (a, b) => new Set([...a, ...b]),
};

// Logs / events — temporal concatenation
type EventLog<E> = E[];
const eventLogMonoid = <E>(): Monoid<EventLog<E>> => arrayConcat<E>();
```

Other domains worth recognizing: metrics and counters (additive), weighted averages (product of sum+weight monoids), config objects merged layer by layer.

## Neutral element → robustness

The neutral element eliminates the special branch for the empty case:

```typescript
// Without a monoid: special case to handle
function sumUnsafe(nums: number[]): number {
  if (nums.length === 0) throw new Error("empty list");
  return nums.reduce((a, b) => a + b);
}

// With a monoid: the neutral element handles the empty case naturally
function sumSafe(nums: number[]): number {
  return fold(numberSum, nums); // [] -> 0, no exception, no Option
}
```

When you see an API that returns `Option<Result>` or throws just for the "empty list" case, check whether the domain has a natural neutral element rather than adding an error branch.

## Composability

Three composition patterns to reuse instead of reinventing:

```typescript
// 1. Product of monoids — combine component-wise
function productMonoid<A, B>(ma: Monoid<A>, mb: Monoid<B>): Monoid<[A, B]> {
  return {
    empty: [ma.empty, mb.empty],
    combine: ([a1, b1], [a2, b2]) => [ma.combine(a1, a2), mb.combine(b1, b2)],
  };
}
// Aggregates several metrics at once: fold(productMonoid(count, sum), ...)

// 2. Functions X -> M into a monoid
function functionMonoid<X, M>(m: Monoid<M>): Monoid<(x: X) => M> {
  return {
    empty: () => m.empty,
    combine: (f, g) => (x) => m.combine(f(x), g(x)),
  };
}

// 3. Map<K, V> where V is a monoid — merge by key
function mapMonoid<K, V>(mv: Monoid<V>): Monoid<Map<K, V>> {
  return {
    empty: new Map(),
    combine: (a, b) => {
      const result = new Map(a);
      for (const [k, v] of b) {
        result.set(k, result.has(k) ? mv.combine(result.get(k)!, v) : v);
      }
      return result;
    },
  };
}
// e.g. event counters per type/topic: mapMonoid<string, number>(numberSum)
```

## Guardrails

- Don't force the abstraction if the operation isn't truly associative (subtraction, division) — verify the law before proposing it; one quick counter-example is enough.
- If the domain has no natural neutral element, it's a semigroup, not a monoid — say so rather than inventing an artificial one.
- Stay pragmatic: the goal is replacing buggy ad hoc code with a generic API, not imposing functional vocabulary. If `Array.prototype.reduce` with a literal initializer is already clear, don't over-architect.