# Zod v4 — Boundary Patterns

This repo's opinion lives in [zod/SKILL.md's Core Principles](../SKILL.md#core-principles); the runnable boundary-validation example is [`zod/example.md`](../example.md). For API behavior — transforms, coercion, error trees, `@zod/mini` — the [official Zod docs](https://zod.dev) are the source of truth; don't restate them here.

The three patterns worth a reminder at the boundary:

**Parse once at the boundary; trust the type downstream.**

```typescript
const result = CreateOrderSchema.safeParse(req.body);
if (!result.success) return res.status(400).json({ errors: z.treeifyError(result.error) });
orderService.create(result.data);  // fully typed, no re-validation
```

**Env vars: validate at startup, fail fast.**

```typescript
const env = EnvSchema.parse(process.env);  // crash early if config is missing
```

**Async refinement → `parseAsync`, never `.parse()`.**

```typescript
const email = await UniqueEmailSchema.parseAsync(input.email);
```