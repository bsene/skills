```typescript
// Factory pattern example
interface Shape {
  draw(): void;
}
class Circle implements Shape {
  draw() { console.log("Circle"); }
}
class Square implements Shape {
  draw() { console.log("Square"); }
}
class ShapeFactory {
  static create(shape: string): Shape {
    if (shape === "circle") return new Circle();
    if (shape === "square") return new Square();
    throw new Error("Unknown shape");
  }
}
```
