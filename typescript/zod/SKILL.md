---
name: typescript-zod
description: >
  Zod v4 best practices — schema design, error handling, transforms, coercion, branded types, and boundary validation.
  TRIGGER when: user mentions zod, zod validation, zod schema, zod v4, zod parse, zod transform, zod coerce,
  zod branded types, zod error handling, runtime validation, validate API response, schema composition,
  zod object, zod mini, zod infer.
user-invocable: false
---

# Zod v4 Best Practices

Requires TypeScript v5.5+ with `"strict": true`.

## Quick Reference

| Task | Pattern |
|---|---|
| Validate external input (API body, env vars, queue) | `schema.parse(data)` at the boundary |
| Get the inferred type from a schema | `z.infer<typeof Schema>` |
| Compose schemas | `.extend()`, `.merge()`, `.pick()`, `.omit()` |
| Transform data during parsing | `.transform(fn)` |
| Coerce strings to primitives | `z.coerce.number()`, `z.coerce.boolean()` |
| Custom error messages | `z.string({ error: "must be a string" })` |
| Validate string formats | `z.email()`, `z.uuid()`, `z.url()` (top-level in v4) |
| Exclusive union (exactly one matches) | `z.xor(schemaA, schemaB)` |
| Optional key without accepting `undefined` | `.exactOptional()` |
| Known keys + passthrough unknown keys | `z.looseRecord()` |
| Nominal/branded types | `.brand<"UserId">()` |
| Format errors | `z.treeifyError(error)` |
| Lightweight bundle (edge/serverless) | `@zod/mini` |

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

→ Full annotated examples and patterns: `references/zod.md`
