```typescript
// SOLID example: Liskov Substitution
class Bird {
  fly() { console.log("Flying"); }
}
class Duck extends Bird {
  quack() { console.log("Quack"); }
}
class Penguin extends Bird {
  // Penguins can't fly
}

function makeItFly(bird: Bird) {
  bird.fly();
}

makeItFly(new Duck()); // OK
makeItFly(new Penguin()); // runtime error – violates LSP
```
