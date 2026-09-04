---
name: composition
description: Functional programming composition in JavaScript/TypeScript — pipe/compose, currying, point-free, pure functions, factories, functional mixins, monoids. Reference bundle for the `typescript` skill; not independently triggered. For class-based OOP architecture or SOLID principles, the parent routes to `object-oriented-programming`.
metadata:
  role: reference-bundle
  parent-skill: typescript
---

# Composing Software in JavaScript & TypeScript

Source: Eric Elliott's [Composing Software](https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc) series.

## Workflow

1. **Identify the coupling** — is the problem inheritance, shared mutable state, or entangled side effects? See Composition Hierarchy below.
2. **Choose the composition tool** — pure function → factory → functional mixin → class (last resort). Use the Checklist below.
3. **Apply the pattern** — read the matching reference file for the concrete technique.
4. **Verify** — can the new unit be tested without mocks? Can it be reused without importing its collaborators?


**Central thesis**: all software design is composition — breaking problems down into small pieces and composing solutions back up. The choice of *how* to compose shapes everything about maintainability, testability, and flexibility.

---

## Core Vocabulary

| Term | Definition |
|---|---|
| **Pure function** | Same input → same output, no side effects |
| **Composition** | Combining small functions into a larger one by feeding each output as the next input |
| **Currying** | Transform `(a, b) => c` into `a => b => c` |
| **Partial application** | Fix some arguments, return a function for the rest |
| **Point-free** | Define functions without mentioning their arguments |

---

## Read On Demand

| Read When | Section |
|---|---|
| Writing pure functions, composing with pipe/compose, debugging pipelines | [Pure Functions & Composition](#pure-functions--composition) |
| Currying, partial application, data-last convention, point-free style | [Currying & Point-Free](#currying--point-free-style) |
| Factory functions, functional mixins, object composition patterns | [Object Composition & Factories](#object-composition--factories) |
| Aggregating/merging/reducing data — merge, combine, shopping carts, permissions, counters | [Monoids](#monoids) |

---

## Composition vs. Inheritance Checklist

When designing a new abstraction, ask:

- [ ] Is this a **has-a** / **can-do** relationship? → use composition / functional mixin
- [ ] Is this a strict **is-a** relationship at the type system level? → composition still preferred; classes only if framework requires it
- [ ] Does the calling code need `new`? → switch to a factory
- [ ] Do you use `instanceof` for branching? → use duck-typing or tagged union instead
- [ ] Does a mixin import another mixin? → avoid implicit dependency chains; prefer explicit composition
- [ ] Is a class extending a custom class? → stop; compose instead

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Class inheritance | Tight coupling, fragile base class, gorilla/banana | Functional mixins or factory composition |
| Mutation of shared state | Hidden bugs, concurrency issues | Return new objects; use spread |
| Side effects mixed with logic | Hard to test, unpredictable | Isolate effects to system edges |
| Multi-argument functions in pipelines | Can't compose without wrapper | Curry + data-last convention |
| Writing tests after the fact with mocks | Mocks reveal coupling; tests don't shape design | Write pure functions; integration-test I/O |
| Chaining array methods for large data | Intermediate allocations at each step | Single-pass `reduce`, but never with a spread accumulator — see `../rules/avoid-intermediate-arrays.md` |

---

## Composition Hierarchy (simplest → most complex)

Always use the simplest tool that solves the problem:

```
Pure functions
    ↓
Factory functions
    ↓
Functional mixins
    ↓
Classes (only when a framework forces it)
```

---

## Pure Functions & Composition

A pure function:
1. Given the same input, always returns the same output
2. Produces no side effects

```js
// Pure
const double = x => x * 2;
const add    = (a, b) => a + b;

// Impure — reads external state, causes side effects
const getTotal = () => cart.items.reduce(...);  // depends on external `cart`
const save = user => db.save(user);             // side effect
```

**Immutability follows from purity.** Never mutate parameters — return new objects:

```js
// Bad — mutation
const addTag = (post, tag) => { post.tags.push(tag); return post; };

// Good — new object
const addTag = (post, tag) => ({ ...post, tags: [...post.tags, tag] });
```

**Benefits**: safe for parallel execution, trivial to test, freely refactorable, memoizable.

**Side effects are necessary** (you need I/O, DB calls, etc.) — isolate them at the edges of your system, keep the core logic pure.

Composition chains functions so that data flows through each in sequence: `f ∘ g` means `f(g(x))`.

### `compose` (right-to-left)

```js
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const transform = compose(trim, toLowerCase, stripHTML);
// equivalent to: x => trim(toLowerCase(stripHTML(x)))
```

### `pipe` (left-to-right — preferred for readability)

```js
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const transform = pipe(stripHTML, toLowerCase, trim);
// reads in execution order, top to bottom
```

### Debugging pipelines with `trace`

```js
const trace = label => value => {
  console.log(`${label}:`, value);
  return value;
};

const transform = pipe(
  stripHTML,
  trace('after stripHTML'),
  toLowerCase,
  trace('after toLowerCase'),
  trim,
);
```

### Composing async operations

```js
const asyncPipe = (...fns) => x => fns.reduce((p, f) => p.then(f), Promise.resolve(x));

const processOrder = asyncPipe(validateOrder, chargeCard, sendConfirmation);
```

> Never build arrays with a spread accumulator in a loop — `(acc, x) => [...acc, x]` inside `reduce` is the ~893× anti-pattern this repo's perf rule bans. See `../rules/avoid-intermediate-arrays.md`.

**Redux reducers** follow the composition pattern: `(state, action) => newState`. They must be pure, and handle unknown action types by returning state unchanged.

---

## Currying & Point-Free Style

**Currying** transforms a multi-argument function into a chain of unary functions:

```js
const add = a => b => a + b;
add(2)(3);       // 5

const multiply = a => b => a * b;
const double   = multiply(2);   // partial application — `a` is fixed
const triple   = multiply(3);
```

The two are distinct:

| | Currying | Partial application |
|---|---|---|
| Shape | `f(a)(b)(c)` — chain of unary calls | `g(a, b)` then call rest later |
| Trigger | Runs only once all args arrive, in stages | Fixes a subset of args **now**, returns a specialized fn |
| Goal | Compose unary functions | Pre-configure a function for reuse |

A curried function supports partial application for free (each call fixes the next arg). For a non-curried, multi-arg function, fix leading args with a generic helper:

```js
const partial = (fn, ...fixed) => (...rest) => fn(...fixed, ...rest);

const logError = partial(logger, "ERROR");   // logger(level, message)
logError("disk full");                       // logger("ERROR", "disk full")
```

This generalizes specialization — it removes the boilerplate of hand-written wrappers like `const logError = msg => logger("ERROR", msg)`. Name it `partial`, not `curry`: it fixes a subset of args in one step rather than building a staged unary chain.

**Data-last convention**: place the data argument last so that partial application produces a ready-to-pipe function:

```js
// Data-last: map(fn) returns a function waiting for the array
const map    = fn => arr => arr.map(fn);
const filter = fn => arr => arr.filter(fn);

const doubleAll   = map(x => x * 2);
const onlyEvens   = filter(x => x % 2 === 0);

const process = pipe(onlyEvens, doubleAll);
process([1, 2, 3, 4]);  // [4, 8]
```

**Point-free style** — define specialized functions by partially applying, without naming the data argument:

```js
// Not point-free
const incAll = arr => arr.map(x => x + 1);

// Point-free
const inc    = add(1);
const incAll = map(inc);
```

---

## Object Composition & Factories

**Favor composition over class inheritance** (Gang of Four). Inheritance is the tightest coupling available — it creates fragile base classes, gorilla/banana problems, and inflexible hierarchies.

Three forms of object composition:

### Aggregation

An object formed from a collection of subobjects that maintain their own identity.

```js
// Arrays, maps, sets, trees, DOM trees are all aggregates
const collection = (acc, item) => [...acc, item];
```

### Concatenation (mixins)

Forming objects by merging properties. Last-in wins on collision.

```js
const withTimestamps = o => ({ createdAt: Date.now(), updatedAt: Date.now(), ...o });
const withId         = o => ({ id: crypto.randomUUID(), ...o });

const createRecord = data => pipe(withId, withTimestamps)(data);
```

### Delegation

Objects forwarding requests through the prototype chain.

```js
const animal = { breathe() { return 'breathing'; } };
const dog    = Object.assign(Object.create(animal), { bark() { return 'woof'; } });
```

A factory function is any non-class function that returns a new object. Prefer factories over classes in public APIs.

```js
// Class — leaks `new` into the API; refactoring is a breaking change
class User { constructor(name) { this.name = name; } }

// Factory — no `new`, same usage, easier to evolve
const createUser = ({ name, role = 'viewer' } = {}) => ({ name, role });
```

**Why factories win:**
- No `new` keyword leaking into call sites
- Can return any object type, including from object pools
- `instanceof` is unreliable across execution contexts; factories avoid the need for it
- Easier to compose via functional mixins

### Functional Mixins

Composable factory functions that add capabilities through a pipeline:

```js
const withFlying = o => {
  let isFlying = false;
  return {
    ...o,
    fly()  { isFlying = true;  return this; },
    land() { isFlying = false; return this; },
    get flying() { return isFlying; },
  };
};

const withQuacking = sound => o => ({
  ...o,
  quack() { return sound; },
});

const createDuck = sound => pipe(withFlying, withQuacking(sound))({});

const duck = createDuck('quack');
duck.fly().quack();  // 'quack'
```

**Use mixins for**: has-a / can-do relationships (not is-a). Great for cross-cutting concerns like logging, event emission, validation.

---

## Monoids

A monoid is a minimal structure: a set of values + an **associative** binary operation (`combine`) + a **neutral element** (`empty`). Recognizing it in business code replaces ad hoc merge logic — a frequent source of edge-case bugs — with a generic API tested once.

Source: [Les monoïdes : une abstraction omniprésente (evryg)](https://kb.evryg.com/fr/ingenierie-logicielle-avancee/fondations/les-monoides-une-abstraction-omnipresente). For the Clojure/ClojureScript counterpart, see the `monoids` skill.

### Base interface

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

### Basic monoids

```typescript
const numberSum: Monoid<number> = { empty: 0, combine: (a, b) => a + b };

const stringConcat: Monoid<string> = { empty: "", combine: (a, b) => a + b };

const arrayConcat = <T>(): Monoid<T[]> => ({
  empty: [],
  combine: (a, b) => [...a, ...b],  // ponytail: fixed two-array combine, not a per-element reducer accumulator
});

const boolAnd: Monoid<boolean> = { empty: true, combine: (a, b) => a && b };
const boolOr: Monoid<boolean> = { empty: false, combine: (a, b) => a || b };

const endoCompose = <A>(): Monoid<(a: A) => A> => ({
  empty: (a) => a,
  combine: (f, g) => (a) => g(f(a)),
});
```

### Associativity → parallelization

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

### Domain modeling

Recurring cases where spotting a monoid avoids ad hoc logic:

```typescript
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

type Permissions = Set<string>;

const permissionsMonoid: Monoid<Permissions> = {
  empty: new Set(),
  combine: (a, b) => new Set([...a, ...b]),
};

type EventLog<E> = E[];
const eventLogMonoid = <E>(): Monoid<EventLog<E>> => arrayConcat<E>();
```

Other domains worth recognizing: metrics and counters (additive), weighted averages (product of sum+weight monoids), config objects merged layer by layer.

### Neutral element → robustness

The neutral element eliminates the special branch for the empty case:

```typescript
function sumUnsafe(nums: number[]): number {
  if (nums.length === 0) throw new Error("empty list");
  return nums.reduce((a, b) => a + b);
}

function sumSafe(nums: number[]): number {
  return fold(numberSum, nums); // [] -> 0, no exception, no Option
}
```

When you see an API that returns `Option<Result>` or throws just for the "empty list" case, check whether the domain has a natural neutral element rather than adding an error branch.

### Composability

Three composition patterns to reuse instead of reinventing:

```typescript
function productMonoid<A, B>(ma: Monoid<A>, mb: Monoid<B>): Monoid<[A, B]> {
  return {
    empty: [ma.empty, mb.empty],
    combine: ([a1, b1], [a2, b2]) => [ma.combine(a1, a2), mb.combine(b1, b2)],
  };
}

function functionMonoid<X, M>(m: Monoid<M>): Monoid<(x: X) => M> {
  return {
    empty: () => m.empty,
    combine: (f, g) => (x) => m.combine(f(x), g(x)),
  };
}

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
```

### Guardrails

- Don't force the abstraction if the operation isn't truly associative (subtraction, division) — verify the law before proposing it; one quick counter-example is enough.
- If the domain has no natural neutral element, it's a semigroup, not a monoid — say so rather than inventing an artificial one.
- Stay pragmatic: the goal is replacing buggy ad hoc code with a generic API, not imposing functional vocabulary. If `Array.prototype.reduce` with a literal initializer is already clear, don't over-architect.

---


## Benchmark

Scenario: `.benchmarks/scenarios/composing-software-001-compose-vs-inherit.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/composing-software-001-compose-vs-inherit.json`

| Model             | Without | With  | Delta |
| ----------------- | ------- | ----- | ----- |
| claude-opus-4-8   | 33%     | 67%     | +34%   |
| claude-sonnet-4-6 | 50%     | 83%     | +33%   |
| claude-haiku-4-5  | 50%     | 100%    | +50%   |

> **PASS (run 2026-08-31)**. Lift on every model; baselines still reach for `extends` where factory/composition fits better. Consistent with the 2026-06-25 run (strongest signal). Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
