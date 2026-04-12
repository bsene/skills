# Transducers

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
