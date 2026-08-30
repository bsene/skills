# Functors, Monads & Lenses

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
