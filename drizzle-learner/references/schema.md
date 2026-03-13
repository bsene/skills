# Schema — PostgreSQL

## Table definition

```ts
import {
  pgTable,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ✅ Primary key: use generatedAlwaysAsIdentity (modern standard, not serial)
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});
```

## Reusable timestamps (use on every table)

```ts
// db/schema/shared.ts
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()), // auto-sets on every UPDATE
};
```

## Foreign keys + indexes

```ts
import { index } from "drizzle-orm/pg-core";

export const posts = pgTable(
  "posts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    title: text("title").notNull(),
    published: boolean("published").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    // ✅ Always add index on FK columns — never automatic
    index("posts_author_id_idx").on(table.authorId),
  ],
);
```

## Relations (for db.query.\* API)

```ts
// These are query metadata — they do NOT create FK constraints in the DB
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

## Type inference

```ts
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
```

## Enums

```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user", "moderator"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  role: roleEnum("role").default("user").notNull(),
});
```
