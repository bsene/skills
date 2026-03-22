# JavaScript Design Patterns Reference

Source: https://www.patterns.dev/vanilla

---

## Singleton Pattern

**What**: Ensure a class has only one instance and provide a global access point to it.

**When to use**: Shared resources like a database connection, config manager, or logging service.

**When NOT to use**: Singletons make testing hard (global state). Avoid when you need multiple independent instances.

```js
// Modern JS Singleton using module scope
let instance;

class DatabaseConnection {
  constructor(url) {
    if (instance) return instance;
    this.url = url;
    this.connected = false;
    instance = this;
  }

  connect() {
    this.connected = true;
    console.log(`Connected to ${this.url}`);
  }
}

const db1 = new DatabaseConnection("postgres://localhost/mydb");
const db2 = new DatabaseConnection("postgres://other/db");
console.log(db1 === db2); // true — same instance
```

**Trade-offs**: Simple, prevents duplicate resources. But: global mutable state, hard to test, couples code.

---

## Proxy Pattern

**What**: Intercept and control access to an object via a wrapper (ES6 `Proxy`).

**When to use**: Validation, logging, caching, access control, reactive systems.

```js
const user = { name: "Alice", age: 17 };

const validatedUser = new Proxy(user, {
  set(target, key, value) {
    if (key === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    if (key === "name" && value.length < 2) {
      throw new Error("Name too short");
    }
    target[key] = value;
    return true;
  },
  get(target, key) {
    console.log(`Getting ${key}`);
    return target[key];
  },
});

validatedUser.name = "Bob"; // OK
validatedUser.age = "old"; // Throws TypeError
```

**Trade-offs**: Very flexible. Can hurt performance on hot paths (Proxy traps add overhead).

---

## Prototype Pattern

**What**: Share properties/methods by setting them on the prototype chain rather than each instance.

**When to use**: When creating many objects of the same type that share behavior.

```js
class Dog {
  constructor(name) {
    this.name = name;
  }
}

// Shared via prototype — not duplicated per instance
Dog.prototype.bark = function () {
  return `${this.name} says: Woof!`;
};

const d1 = new Dog("Rex");
const d2 = new Dog("Spot");
console.log(d1.bark === d2.bark); // true — same function reference
```

**Trade-offs**: Memory efficient. But prototype mutation affects all instances (global side effect risk).

---

## Observer Pattern

**What**: When one object changes state, all dependent objects (subscribers) are notified automatically.

**When to use**: Event systems, reactive state, pub/sub, real-time data feeds.

```js
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, fn) {
    (this.listeners[event] ||= []).push(fn);
    return () => this.off(event, fn); // returns unsubscribe fn
  }

  off(event, fn) {
    this.listeners[event] = this.listeners[event]?.filter((l) => l !== fn);
  }

  emit(event, data) {
    this.listeners[event]?.forEach((fn) => fn(data));
  }
}

const bus = new EventEmitter();
const unsub = bus.on("login", (user) => console.log(`Welcome, ${user.name}`));
bus.emit("login", { name: "Alice" }); // "Welcome, Alice"
unsub(); // cleanup
```

**Trade-offs**: Decouples producers from consumers. Beware: memory leaks if listeners aren't removed; hard to trace event flows.

---

## Module Pattern

**What**: Encapsulate private state and expose a clean public API.

**When to use**: Organizing code, avoiding global scope pollution, creating reusable utilities.

```js
// ES Module (preferred — static, tree-shakeable)
// math.js
const PI = 3.14159;

function circleArea(r) {
  return PI * r * r;
}

export { circleArea }; // only expose what's needed
// PI stays private

// IIFE Module (legacy)
const Counter = (() => {
  let count = 0; // private
  return {
    increment() {
      count++;
    },
    getCount() {
      return count;
    },
  };
})();
```

**Trade-offs**: ES modules are statically analyzable (tree shaking works). IIFEs work without a bundler.

---

## Mixin Pattern

**What**: Copy methods from one object into another's prototype to add behavior without inheritance.

**When to use**: Adding cross-cutting capabilities (serialization, logging, timestamping) to classes.

```js
const Serializable = {
  serialize() {
    return JSON.stringify(this);
  },
  deserialize(json) {
    return Object.assign(this, JSON.parse(json));
  },
};

const Timestamped = {
  setCreatedAt() {
    this.createdAt = new Date().toISOString();
  },
};

class User {
  constructor(name) {
    this.name = name;
  }
}

Object.assign(User.prototype, Serializable, Timestamped);

const u = new User("Alice");
u.setCreatedAt();
console.log(u.serialize()); // {"name":"Alice","createdAt":"..."}
```

**Trade-offs**: Flexible composition. But: name collisions, no formal contract, hard to debug source of methods.

---

## Mediator/Middleware Pattern

**What**: A central hub handles communication between components so they don't reference each other directly.

**When to use**: Chat apps, event buses, Express-style middleware pipelines, complex form orchestration.

```js
// Middleware pipeline (Express-style)
class Pipeline {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  async run(ctx) {
    const next = async (i) => {
      if (i >= this.middlewares.length) return;
      await this.middlewares[i](ctx, () => next(i + 1));
    };
    await next(0);
  }
}

const app = new Pipeline();
app.use(async (ctx, next) => {
  console.log("Auth check");
  await next();
});
app.use(async (ctx, next) => {
  console.log("Rate limit");
  await next();
});
app.use(async (ctx) => {
  console.log(`Handle: ${ctx.path}`);
});

app.run({ path: "/api/users" });
```

---

## Flyweight Pattern

**What**: Share a common core among many fine-grained objects to reduce memory.

**When to use**: Rendering thousands of similar objects (game entities, DOM elements, icons).

```js
class TreeType {
  constructor(name, color, texture) {
    this.name = name;
    this.color = color;
    this.texture = texture; // heavy shared data
  }
}

const treeTypes = new Map();

function getTreeType(name, color, texture) {
  const key = `${name}-${color}`;
  if (!treeTypes.has(key)) {
    treeTypes.set(key, new TreeType(name, color, texture));
  }
  return treeTypes.get(key);
}

// 10,000 trees share only 3 TreeType instances
const forest = Array.from({ length: 10000 }, (_, i) => ({
  x: Math.random() * 1000,
  y: Math.random() * 1000,
  type: getTreeType(["Oak", "Pine", "Maple"][i % 3], "green", "bark.png"),
}));
```

---

## Factory Pattern

**What**: Use a function/class to create objects without specifying their exact type at call site.

**When to use**: Creating objects of varied types based on runtime input; hiding instantiation complexity.

```js
class Dog {
  speak() {
    return "Woof!";
  }
}
class Cat {
  speak() {
    return "Meow!";
  }
}
class Bird {
  speak() {
    return "Tweet!";
  }
}

function createAnimal(type) {
  const animals = { dog: Dog, cat: Cat, bird: Bird };
  const Animal = animals[type];
  if (!Animal) throw new Error(`Unknown animal: ${type}`);
  return new Animal();
}

const pet = createAnimal("cat");
pet.speak(); // "Meow!"
```

**Trade-offs**: Decouples creation from usage. Adding new types requires updating the factory.
