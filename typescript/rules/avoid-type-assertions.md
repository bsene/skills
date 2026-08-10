<!-- Reference rule, reached only via typescript/SKILL.md's rules table. No skill-style frontmatter needed. -->
<!-- tags: typescript, type-safety, type-assertions, narrowing -->

# Avoid type assertions

Type assertions promise correctness without proving it — the compiler cannot verify them.
Use narrowing and validation instead. Reference: [Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions).

## Banned patterns

| Pattern | Problem |
|---|---|
| `value as SomeType` | Unsound — compiler takes your word |
| `<SomeType>value` | Legacy syntax, same problem |
| `value as unknown as SomeType` | Force-cast — always wrong |
| `value!` | Hides real nullability |
| `// @ts-ignore` | Silences errors instead of fixing |

## Use instead

**Type guard (narrowing at runtime):**
```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" && value !== null &&
    "id" in value && typeof (value as Record<string, unknown>).id === "string"
  );
}
if (isUser(data)) { /* data is User */ }
```

**Zod at boundaries (preferred for external data):**
```typescript
const user = UserSchema.parse(apiResponse); // User — proven at runtime
```

**`satisfies` for shape checking without widening** ([reference](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)):
```typescript
const config = { host: "localhost", port: 3000 } satisfies Config;
```

**Fix return types instead of asserting:**
```diff
- function getUser(id: string) { return userMap.get(id) as User; }
+ function getUser(id: string): User | undefined { return userMap.get(id); }
```

## `as const` is not a type assertion

`as const` converts object literals to literal types — it narrows, not widens. Not banned. See [const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions).

```diff
- const req = { method: "GET" } as HttpConfig;   // assertion — banned
+ const req = { method: "GET" } as const;         // const assertion — fine
```

## Exceptions

- `as const` — literal type narrowing, not a bypass.
- DOM narrowing where TS only knows the base type: `document.getElementById("canvas") as HTMLCanvasElement`.
- Inside a type guard implementation: `value as Record<string, unknown>` to inspect `unknown` — acceptable, contained.
- Test fixtures where type accuracy is not the concern — add a comment.
- Framework integration where external type proof exists (typed event handlers, codegen output).

## ESLint enforcement

```json
"@typescript-eslint/consistent-type-assertions": ["error", { "assertionStyle": "never" }]
```
