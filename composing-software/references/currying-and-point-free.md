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
