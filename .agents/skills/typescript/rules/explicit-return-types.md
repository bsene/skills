<!-- Reference rule, reached only via typescript/SKILL.md's rules table. No skill-style frontmatter needed. -->
<!-- tags: typescript, type-safety, return-types, noImplicitAny -->

# Infer local returns; annotate public boundaries and risky inference

TypeScript infers obvious local return types. Explicit annotations document public contracts and catch incompatible typed returns. They do not make dependency `any` safe: fix the dependency's types or validate its output as `unknown` at the boundary. Reference: [Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html).

## Inference-first policy

- Infer local, obvious, private expressions; redundant annotations are noise.
- Annotate exported and public API parameters and return types.
- Annotate when the inferred type would be `any`, too broad, or a semantically important union.
- Enable `noImplicitAny` — included in `strict: true`.

```typescript
// Good — local inference; the result is already narrowed and stable
const activeUsers = users.filter(user => user.isActive);

// Good — public boundary documents its contract
export function getUser(id: string): User | undefined { ... }
```

## Risky inference

```typescript
// Bad — exported contract changes when the store's return type changes
export function getUser(id: string) {
  return userStore.get(id);
}

// Bad — exported lookup leaves its nullable contract implicit
export function findRole(userId: string) {
  return roleMap[userId];
}
```

## Use instead

```typescript
export function getUser(id: string): User | undefined {
  return userStore.get(id);
}

export function findRole(userId: string): Role | undefined {
  return roleMap[userId] ?? undefined;
}
```

## Rule: enable `noImplicitAny`

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true // includes noImplicitAny
  }
}
```

[`noImplicitAny`](https://www.typescriptlang.org/tsconfig/#noImplicitAny) forces TypeScript to error when it cannot infer a type. It is included in `"strict": true`. Never disable it.

## Prefer inference for local or contextually typed code

- Short, obvious one-liner utilities where the return type is self-evident from the expression:
  ```typescript
  const double = (n: number) => n * 2; // return type number is obvious
  ```
- Arrow functions assigned to a typed variable (type flows from the annotation):
  ```typescript
  const handler: RequestHandler = (req, res) => {
    res.send("ok");
  };
  ```

`@ts-expect-error` over `@ts-ignore`: see `avoid-type-assertions.md`.
