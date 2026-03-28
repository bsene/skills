---
name: composing-software
description: >
  Apply functional programming composition techniques in JavaScript. Use this skill
  whenever the user asks about function composition, pipe, compose, currying, partial
  application, point-free style, pure functions, immutability, functors, monads, lenses,
  functional mixins, factory functions, or object composition. Also trigger when the user
  asks how to avoid class inheritance, how to build reusable abstractions in JavaScript,
  how to compose async operations, or how to reduce coupling through FP patterns. Even if
  they just say "compose these functions", "pipe this data", or "make this more functional",
  use this skill.
---

# Composing Software in JavaScript

Source: Eric Elliott's [Composing Software](https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc) series.

**Central thesis**: all software design is composition — breaking problems down into small pieces and composing solutions back up. The choice of *how* to compose shapes everything about maintainability, testability, and flexibility.

---

## Core Vocabulary

| Term | Definition |
|---|---|
| **Pure function** | Same input → same output, no side effects |
| **Composition** | Output of one function becomes input of the next |
| **Currying** | Transform `(a, b) => c` into `a => b => c` |
| **Partial application** | Fix some arguments, return a function for the rest |
| **Point-free** | Define functions without mentioning their arguments |
| **Functor** | A container with a `.map()` method that obeys functor laws |
| **Monad** | A functor that also flattens nested contexts via `.chain()` |
| **Lens** | A composable getter/setter pair for immutable nested state |

---

## Pure Functions

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

---

## Function Composition

Composition chains functions so that data flows through each in sequence.

```
f ∘ g means: f(g(x))
```

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

---

## Currying and Partial Application

**Currying** transforms a multi-argument function into a chain of unary functions:

```js
const add = a => b => a + b;
add(2)(3);       // 5

const multiply = a => b => a * b;
const double   = multiply(2);   // partial application — `a` is fixed
const triple   = multiply(3);
```

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

## Reduce Is the Foundation

`reduce` can express `map`, `filter`, and function composition itself:

```js
// map via reduce
const map = (fn, arr) =>
  arr.reduce((acc, item) => [...acc, fn(item)], []);

// filter via reduce
const filter = (fn, arr) =>
  arr.reduce((acc, item) => fn(item) ? [...acc, item] : acc, []);

// compose via reduceRight
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
```

**Redux reducers** follow the same pattern: `(state, action) => newState`. They must be pure, and handle unknown action types by returning state unchanged.

---

## Object Composition

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

---

## Factory Functions

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

## Functors

A functor is a container with a `.map()` method that applies a function to the inner value and returns a new functor of the same type.

**Functor laws:**
1. **Identity**: `F.map(x => x)` ≡ `F` (equivalent functor)
2. **Composition**: `F.map(x => f(g(x)))` ≡ `F.map(g).map(f)`

```js
const Identity = value => ({
  map:      fn  => Identity(fn(value)),
  valueOf:  ()  => value,
  toString: ()  => `Identity(${value})`,
});

Identity(5)
  .map(x => x * 2)
  .map(x => x + 1)
  .valueOf();  // 11
```

Arrays and Promises are everyday functors. `Array.map` and `Promise.then` both satisfy the functor shape.

---

## Monads

A monad is a functor that can also **flatten** nested contexts. You need monads when composing functions that return wrapped values (Promises, arrays, Maybe types).

**Three operations:**
- `of` (unit / return): wraps a value — `a => M(a)`
- `map`: applies a function inside the context — `M(a) => M(b)`
- `chain` (flatMap / bind): maps then flattens — prevents `M(M(a))`

**The three monad laws:**
1. **Left identity**: `M.of(x).chain(f) === f(x)`
2. **Right identity**: `m.chain(M.of) === m`
3. **Associativity**: `m.chain(f).chain(g) === m.chain(x => f(x).chain(g))`

```js
// Promise is a monad — .then() acts as chain (auto-flattens)
fetch('/user')                       // Promise<Response>
  .then(r => r.json())              // Promise<User>  (not Promise<Promise<User>>)
  .then(user => saveToCache(user)); // Promise<void>

// Composing promise-returning functions
const asyncPipe = (...fns) => x => fns.reduce((p, f) => p.then(f), Promise.resolve(x));
```

**You're already using monads**: Promises, Arrays (`.flatMap()`), Observables (RxJS `.mergeMap()`).

---

## Lenses

A lens is a composable pair of pure getter/setter functions focused on a field inside an object.

```js
const lensProp = prop => ({
  view: store           => store[prop],
  set:  (value, store)  => ({ ...store, [prop]: prop }),
  over: (fn, store)     => ({ ...store, [prop]: fn(store[prop]) }),
});
```

**Three lens laws:**
1. **Get-Set**: `view(set(lens, a, s))` ≡ `a`
2. **Set-Set**: `set(lens, b, set(lens, a, s))` ≡ `set(lens, b, s)`
3. **Set-Get**: `set(lens, view(lens, s), s)` ≡ `s`

**Why use lenses**: isolate how you access nested state structure. When the shape changes, update only the lens — not every piece of code that touches the object.

```js
const nameLens = lensProp('name');

// Reading
nameLens.view({ name: 'Alice', role: 'admin' });  // 'Alice'

// Immutable update
nameLens.set('Bob', { name: 'Alice', role: 'admin' });  // { name: 'Bob', role: 'admin' }

// Transform
nameLens.over(s => s.toUpperCase(), { name: 'Alice' });  // { name: 'ALICE' }
```

Use libraries like Ramda for production-grade composable lenses.

---

## Transducers

A transducer is a **composable higher-order reducer**: `reducer => reducer`.

**Problem**: chained array methods create intermediate arrays at each step, and can't work on streams or custom data types.

```js
// Creates 3 intermediate arrays
const result = data
  .filter(isActive)
  .map(toUpperCase)
  .filter(longerThan5);
```

**Solution**: transducers compose operations into a single pass over any data source.

```js
// With Ramda transducers — single pass, works on arrays, streams, observables
import { transduce, filter, map, into } from 'ramda';

const xf = compose(
  filter(isActive),
  map(toUpperCase),
  filter(longerThan5),
);

transduce(xf, (acc, x) => [...acc, x], [], data);
```

Use transducers when: processing very large datasets, working with streams/observables, or building pipelines that must work across multiple data source types.

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
| Chaining array methods for large data | Intermediate allocations at each step | Transducers for performance-critical paths |

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
