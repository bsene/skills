---
name: zod
description: Zod v4 best practices — schema design, error handling, transforms, coercion, branded types, and boundary validation. Reference bundle for the `typescript` skill; not independently triggered.
metadata:
  role: reference-bundle
  parent-skill: typescript
---

# Zod v4 Best Practices

Primary reference: [official Zod docs](https://zod.dev). Requires TypeScript v5.5+ with `"strict": true` ([Compiler Options](https://www.typescriptlang.org/tsconfig/#strict)). Zod itself is not part of the TypeScript project; this skill covers the community pattern for runtime validation that pairs with TypeScript's static types. When the docs and a rule here disagree, the docs win and the rule should be updated.

## Quick Reference

| Task                                                | Pattern                                              |
| --------------------------------------------------- | ---------------------------------------------------- |
| Validate external input (API body, env vars, queue) | `schema.parse(data)` at the boundary                 |
| Get the inferred type from a schema                 | `z.infer<typeof Schema>`                             |
| Compose schemas                                     | `.extend()`, `.merge()`, `.pick()`, `.omit()`        |
| Transform data during parsing                       | `.transform(fn)`                                     |
| Coerce strings to primitives                        | `z.coerce.number()`, `z.coerce.boolean()`            |
| Custom error messages                               | `z.string({ error: "must be a string" })`            |
| Validate string formats                             | `z.email()`, `z.uuid()`, `z.url()` (top-level in v4) |
| Exclusive union (exactly one matches)               | `z.xor(schemaA, schemaB)`                            |
| Optional key without accepting `undefined`          | `.exactOptional()`                                   |
| Known keys + passthrough unknown keys               | `z.looseRecord()`                                    |
| Nominal/branded types                               | `.brand<"UserId">()`                                 |
| Format errors                                       | `z.treeifyError(error)`                              |
| Lightweight bundle (edge/serverless)                | `@zod/mini`                                          |

## Core Principles

**Validate at boundaries, trust internally.** Parse external data (API bodies, env vars, queue messages, file reads) once at entry. After that, rely on the inferred type — no re-validation deeper in the stack.

**Single source of truth.** Define the Zod schema first, derive the TypeScript type with `z.infer<>`. Never maintain parallel type + schema definitions.

**Fail fast, fail clearly.** Use `.parse()` when invalid data is a bug. Use `.safeParse()` when invalid data is expected and you need to handle the error path.

**Keep schemas close to their boundary.** Co-locate the schema with the handler/loader/consumer that validates, not in a shared `schemas/` barrel.

## v4 Migration Essentials

**String formats are top-level.** `z.string().email()` → `z.email()`. Better tree-shaking, less verbose.

**Unified error parameter.** `message`, `invalid_type_error`, `required_error` are replaced by a single `error` field.

**Error formatting.** `.format()` and `.flatten()` are gone. Use `z.treeifyError(error)` instead.

**Stricter numbers.** Infinity rejected by default. `.int()` only accepts safe integers.

**Object refinement limits.** `.pick()` and `.omit()` disallowed on refined schemas — restructure to refine after picking.

## Schema Composition

```typescript
const BaseUser = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});

// Extend for creation (no id yet)
const CreateUser = BaseUser.omit({ id: true });

// Extend for update (all optional)
const UpdateUser = BaseUser.partial().required({ id: true });

// Derive types — never duplicate
type User = z.infer<typeof BaseUser>;
type CreateUser = z.infer<typeof CreateUser>;
type UpdateUser = z.infer<typeof UpdateUser>;
```

## Error Handling

```typescript
const result = Schema.safeParse(input);
if (!result.success) {
  const tree = z.treeifyError(result.error);
  // tree.errors — top-level errors
  // tree.properties.fieldName.errors — field-level errors
}
```

## Boundary Example

```typescript
import { z } from "zod";

// Schema is the single source of truth
const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: z.enum(["admin", "user"]),
});

// Type derived from schema — never maintained separately
type User = z.infer<typeof UserSchema>;

// Validate at the boundary, trust internally
const result = UserSchema.safeParse(req.body);
if (!result.success) {
  const tree = z.treeifyError(result.error);
  return res.status(400).json({ errors: tree });
}
// result.data is fully typed as User from here on
```

The three patterns worth a reminder at the boundary:

**Env vars: validate at startup, fail fast.**

```typescript
const env = EnvSchema.parse(process.env); // crash early if config is missing
```

**Async refinement → `parseAsync`, never `.parse()`.**

```typescript
const email = await UniqueEmailSchema.parseAsync(input.email);
```

For API behavior (transforms, coercion, error trees, `@zod/mini`), the [official Zod docs](https://zod.dev) are the source of truth — don't restate them here.

---

## Benchmark

Scenario: `.benchmarks/scenarios/zod-001-v4-migration.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/zod-001-v4-migration.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 50%     | 83%  | +33%  |
| claude-sonnet-4-6 | 50%     | 83%  | +33%  |
| claude-haiku-4-5  | 67%     | 100% | +33%  |

> **PASS (run 2026-08-31)**. Uniform +33 on every model — the v4 migration checklist applies cleanly. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
