# Currying & Point-Free Style

## Currying and Partial Application

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
