# Object Composition & Factories

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
