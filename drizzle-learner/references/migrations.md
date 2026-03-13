# Migrations

## drizzle.config.ts

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true, // ✅ prompts on destructive changes (column renames etc.)
  verbose: true,
});
```

## The workflow

```bash
# 1. Edit your schema .ts files
# 2. Generate the migration SQL
npx drizzle-kit generate

# 3. ✅ READ the generated SQL in ./drizzle/ before applying
#    Check for: DROP COLUMN, unexpected renames (drop+add = data loss)

# 4. Apply
npx drizzle-kit migrate
```

## In production (at app startup or deploy step)

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const db = drizzle(process.env.DATABASE_URL!);
await migrate(db, { migrationsFolder: "./drizzle" });
```

## `db push` — development only

```bash
npx drizzle-kit push  # ⚠️ never in production — no migration history, can drop columns
```

Use only for local throwaway databases when iterating on a new schema.

## Column renames (gotcha)

Without `strict: true`, renaming a column generates drop+add (= **data loss**).
With `strict: true`, Drizzle asks: "rename or drop+add?" — always pick rename.

## Never touch `drizzle/meta/`

Drizzle Kit manages these snapshot files. Editing them manually corrupts migration history.
