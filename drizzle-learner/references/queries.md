# Queries — The Essential 20%

## DB client setup

```ts
// db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// ✅ Pass schema — required for db.query.* to work
export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

---

## SELECT

```ts
import { eq, and, or, ilike, inArray, isNull, desc, asc } from "drizzle-orm";

// All rows
await db.select().from(users);

// ✅ Prefer partial select in production
await db.select({ id: users.id, email: users.email }).from(users);

// WHERE (operators must be imported)
await db.select().from(users).where(eq(users.id, 1));
await db
  .select()
  .from(users)
  .where(and(eq(users.isActive, true), ilike(users.email, "%@gmail.com")));

// ORDER, LIMIT, OFFSET
await db
  .select()
  .from(users)
  .orderBy(desc(users.createdAt))
  .limit(20)
  .offset(40);
```

## INSERT

```ts
// ⚠️ Without .returning() you get [] — not the created row
const [user] = await db
  .insert(users)
  .values({ email: "a@b.com", name: "Alice" })
  .returning(); // ✅ always add this

// Bulk insert
await db.insert(users).values([
  { email: "a@b.com", name: "Alice" },
  { email: "b@c.com", name: "Bob" },
]);

// Upsert
await db
  .insert(users)
  .values({ email: "a@b.com", name: "Alice" })
  .onConflictDoUpdate({ target: users.email, set: { name: "Alice" } });
```

## UPDATE

```ts
// ⚠️ Without .where() — ALL rows are updated
const [updated] = await db
  .update(users)
  .set({ name: "New Name" })
  .where(eq(users.id, 1))
  .returning(); // optional but useful
```

## DELETE

```ts
// ⚠️ Without .where() — ALL rows are deleted
await db.delete(users).where(eq(users.id, 1));
```

---

## Relational API (for nested data — replaces JOIN boilerplate)

```ts
// Requires: schema passed to drizzle() + relations() defined

// findMany with relations
const users = await db.query.users.findMany({
  where: eq(users.isActive, true),
  with: {
    posts: {
      where: eq(posts.published, true),
      orderBy: [desc(posts.createdAt)],
      limit: 5,
    },
  },
});

// findFirst (single row)
const user = await db.query.users.findFirst({
  where: eq(users.email, "a@b.com"),
  with: { posts: true },
});
```

---

## Transactions

```ts
// ✅ Use tx everywhere inside the callback — never db
const result = await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ email: "a@b.com", name: "Alice" })
    .returning();
  await tx.insert(accounts).values({ userId: user.id, balance: 0 });
  return user;
  // Any throw → full rollback
});
```

---

## Raw SQL (when you need to escape the abstraction)

```ts
import { sql } from "drizzle-orm";

// Inline in a query
await db
  .update(accounts)
  .set({ balance: sql`balance + ${amount}` })
  .where(eq(accounts.id, id));
```
