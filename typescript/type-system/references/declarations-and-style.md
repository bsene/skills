# Declarations and Style

Interface vs type, generics, enums, and object initialization. Detail for [type-system](../SKILL.md).

## Interface vs Type Alias

| Use `interface` when                                         | Use `type` when                                |
| ------------------------------------------------------------ | ---------------------------------------------- |
| Defining an object shape others will `extend` or `implement` | Unions and intersections                       |
| You need declaration merging (augmenting third-party types)  | Mapped/conditional/utility types               |
| Modeling a class contract                                    | Simple semantic alias (`type UserId = string`) |

```typescript
// interface — extendable contract
interface Repository<T> {
  findById(id: string): T | undefined;
  save(entity: T): void;
}

// type — union (can't be done with interface)
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
```

**Why `interface extends` over `type &` for composition:** TypeScript caches an interface's resolved shape by name, so it doesn't get recomputed each time it's referenced; a `type` intersection is recomputed at each use site. Interfaces also catch conflicting property types across the merged shapes as a compile error, where an intersection can silently collapse the conflicting property to `never`. This gap narrows a lot under the Go-ported TypeScript 7 compiler, since the overall baseline gets much faster — but `interface extends` remains the safer default for composed object shapes; reach for `type` when you need unions, primitives, tuples, or mapped/conditional types that `interface` can't express.

Do NOT prefix interfaces with `I`. See `../../rules/no-interface-prefix.md`.

---

## Generics: when (not) to use

**Don't use generics at a single location** — it provides no type safety over `any`:

```typescript
// Bad — T appears only in return; equivalent to returning any
declare function parse<T>(name: string): T;

// Good — T appears in both parameter and return (meaningful constraint)
function identity<T>(x: T): T {
  return x;
}
function reverse<T>(items: T[]): T[] {
  return [...items].reverse();
}
```

Use descriptive names for multi-parameter generics:

```typescript
class Dictionary<TKey, TValue> {
  get(key: TKey): TValue | undefined { ... }
  set(key: TKey, value: TValue): void { ... }
}
```

---

## Enums best practices

```typescript
enum Status {
  Inactive = 1, // start at 1 — avoids falsy 0 bugs
  Active = 2,
  Pending = 3,
}

enum DocumentType {
  // string enums — better logs and API interop
  Passport = "passport",
  Visa = "passport_visa",
  DriversLicense = "drivers_license",
}

const enum Direction {
  Up = "UP",
  Down = "DOWN",
} // inlined at compile time; avoid in libraries and with isolatedModules/Babel (use a plain object + `as const`)
```

---

## Lazy object initialization anti-pattern

Avoid initializing an empty object and adding properties later — TypeScript infers `{}` and later assignments fail:

```typescript
// Bad
let config = {};
config.host = "localhost"; // Error: property 'host' does not exist on type '{}'

// Good — initialize all properties together
const config = { host: "localhost", port: 3000 };

// Or annotate first
let config: Config = { host: "localhost", port: 3000 };
```
