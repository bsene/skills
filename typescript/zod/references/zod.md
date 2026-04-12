# Zod v4 — Annotated Examples

## Contents

- [Boundary Validation](#boundary-validation)
- [Schema Composition](#schema-composition)
- [Transforms & Coercion](#transforms--coercion)
- [Branded Types](#branded-types)
- [Discriminated Unions](#discriminated-unions)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Async Validation](#async-validation)

---

## Boundary Validation

Parse once at the boundary; trust the type downstream.

```typescript
import { z } from "zod";

const CreateOrderSchema = z.object({
  productId: z.uuid(),
  quantity: z.int().positive(),
  couponCode: z.string().optional(),
});

type CreateOrder = z.infer<typeof CreateOrderSchema>;

// Express handler — boundary
app.post("/orders", (req, res) => {
  const result = CreateOrderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: z.treeifyError(result.error) });
  }
  // result.data: CreateOrder — fully typed, no re-validation needed
  orderService.create(result.data);
});
```

---

## Schema Composition

Build complex schemas from small, reusable pieces.

```typescript
const Address = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string(),
  country: z.string(),
});

const ContactInfo = z.object({
  email: z.email(),
  phone: z.string().optional(),
});

// Merge independent schemas
const Customer = z.object({ id: z.uuid(), name: z.string() })
  .merge(ContactInfo)
  .extend({ addresses: z.array(Address) });

// Pick / omit for variants
const CustomerPreview = Customer.pick({ id: true, name: true, email: true });

// Partial for updates — keep id required
const UpdateCustomer = Customer.partial().required({ id: true });
```

---

## Transforms & Coercion

Transform data shape during parsing. Coerce primitive types from strings.

```typescript
// Transform: reshape during parse
const ApiResponse = z.object({
  user_id: z.string(),
  display_name: z.string(),
  created_at: z.string(),
}).transform((dto) => ({
  id: dto.user_id,
  name: dto.display_name,
  createdAt: new Date(dto.created_at),
}));
// z.infer<typeof ApiResponse> = { id: string; name: string; createdAt: Date }

// Coercion: string → primitive (common with query params, env vars)
const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
// PaginationSchema.parse({ page: "3", limit: "50" })
// → { page: 3, limit: 50 }
```

---

## Branded Types

Prevent mixing structurally identical types at the type level.

```typescript
const UserId = z.uuid().brand<"UserId">();
const OrderId = z.uuid().brand<"OrderId">();

type UserId = z.infer<typeof UserId>;
type OrderId = z.infer<typeof OrderId>;

function getUser(id: UserId) { /* ... */ }
function getOrder(id: OrderId) { /* ... */ }

const userId = UserId.parse("550e8400-e29b-41d4-a716-446655440000");
const orderId = OrderId.parse("660e8400-e29b-41d4-a716-446655440000");

getUser(userId);   // ok
getUser(orderId);  // compile error — OrderId is not UserId
```

---

## Discriminated Unions

Model tagged unions with exhaustive parsing.

```typescript
const TextMessage = z.object({
  type: z.literal("text"),
  content: z.string(),
});

const ImageMessage = z.object({
  type: z.literal("image"),
  url: z.url(),
  alt: z.string().optional(),
});

const FileMessage = z.object({
  type: z.literal("file"),
  url: z.url(),
  filename: z.string(),
  size: z.int().positive(),
});

const Message = z.discriminatedUnion("type", [
  TextMessage,
  ImageMessage,
  FileMessage,
]);

type Message = z.infer<typeof Message>;
```

### Exclusive union with `z.xor()`

```typescript
// Exactly one must match — not both
const PaymentMethod = z.xor(
  z.object({ creditCard: z.string() }),
  z.object({ bankAccount: z.string() }),
);
```

---

## Error Handling

```typescript
const result = Schema.safeParse(input);

if (!result.success) {
  const tree = z.treeifyError(result.error);

  // Top-level errors
  console.log(tree.errors); // string[]

  // Per-field errors
  for (const [field, node] of Object.entries(tree.properties ?? {})) {
    console.log(`${field}: ${node.errors.join(", ")}`);
  }
}
```

### Custom error messages

```typescript
const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email" }),
  password: z.string({ error: "Password is required" }).min(8, {
    error: "Password must be at least 8 characters",
  }),
});
```

---

## Environment Variables

Validate env vars at startup. Fail fast if config is missing.

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  API_SECRET: z.string().min(32),
  ENABLE_CACHE: z.coerce.boolean().default(false),
});

// Parse once at startup — crash early if invalid
export const env = EnvSchema.parse(process.env);
```

---

## Async Validation

Use `.refine()` with async functions for database/API checks.

```typescript
const UniqueEmailSchema = z.email().refine(
  async (email) => {
    const existing = await db.user.findByEmail(email);
    return !existing;
  },
  { message: "Email already in use" },
);

// Must use parseAsync for schemas with async refinements
const email = await UniqueEmailSchema.parseAsync(input.email);
```
