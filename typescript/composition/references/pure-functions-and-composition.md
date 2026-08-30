# Pure Functions & Composition

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
