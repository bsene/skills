---
name: prefer-explicit-context-over-this
description: >
  Pass the data a function needs as explicit arguments instead of relying on the implicit `this` context.
  "this-free" code is data-flow transparent and avoids broken-binding bugs (detached methods, leaked `this` in callbacks).
metadata:
  tags: typescript, javascript, this, purity, predictability, functional
---

# Prefer explicit context over implicit `this`

"this-free" is not about removing variables — it is about removing reliance on the **implicit execution context (`this`)** to access state. When a function needs external data, pass it as an explicit argument rather than assuming it is reachable via `this`.

This is data-flow transparency: a function states its dependencies in its signature instead of depending on an invisible contract about what `this` points to.

## Why it matters

- **Detached methods break.** A method that reads `this.x` returns `NaN` or throws once it is pulled off its object (passed as a callback, destructured, reassigned) because `this` is no longer the instance.
- **Leaked `this` corrupts state.** When a call site binds `this` to an internal structure, a callback can mutate state it does not own.

## Example 1 — callback context (pub/sub)

Calling subscribers by index binds `this` to the `subscribers` array, so any subscriber can wipe the registry:

```typescript
// Bad — index call leaks `this` as the subscribers array
function pubsub() {
  const subscribers: Array<(p: unknown) => void> = [];
  return {
    subscribe(fn: (p: unknown) => void) { subscribers.push(fn); },
    publish(publication: unknown) {
      for (let i = 0; i < subscribers.length; i += 1) {
        subscribers[i](publication); // `this` === subscribers
      }
    },
  };
}

bus.subscribe(function (this: unknown[]) {
  this.length = 0; // wipes every subscriber
});
```

```typescript
// Good — forEach calls each handler as a plain function; pass only the data
function pubsub() {
  const subscribers: Array<(p: unknown) => void> = [];
  return {
    subscribe(fn: (p: unknown) => void) { subscribers.push(fn); },
    publish(publication: unknown) {
      subscribers.forEach(subscriber => subscriber(publication));
    },
  };
}

bus.subscribe(publication => {
  console.log("Received:", publication); // can only use its argument
});
```

## Example 2 — method vs pure function

A method that depends on `this` works only when called with the right binding:

```typescript
// Bad — depends on `this`; breaks when detached
class Rectangle {
  constructor(readonly width: number, readonly height: number) {}
  calculateArea(): number {
    return this.width * this.height;
  }
}

const rect = new Rectangle(5, 10);
const calc = rect.calculateArea;
calc(); // throws / NaN — `this` is undefined
```

```typescript
// Good — pure function takes the data as an argument; call site is irrelevant
type Rectangle = { readonly width: number; readonly height: number };

function calculateArea(rect: Rectangle): number {
  return rect.width * rect.height;
}

calculateArea({ width: 5, height: 10 }); // 50, always
```

## Summary

| Using `this` | this-free |
|---|---|
| Invisible contract: "`this` is whatever created me" | Stated contract: "I need these args, I use only these args" |
| Breaks on detach/reassign/callback | Works regardless of call site |

Often slightly more verbose, but radically more predictable — it removes a whole class of runtime bugs.

> Broader functional framing (pure functions, composition, isolating side effects): see the `composing-software` skill. This rule is the narrow, mechanical `this`-binding case.
