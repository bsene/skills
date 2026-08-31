---
id: zod-001-v4-migration
skill: zod
---

# Prompt

We're on Zod v3 in this code and need to move to Zod v4 and fix what's broken while we're at it. Here's the code:

```typescript
import { z } from "zod";

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

const BaseUser = z
  .object({
    id: z.string().uuid({ message: "must be a uuid" }),
    email: z.string().email({ message: "must be an email" }),
    role: z.enum(["admin", "user"]),
  })
  .refine((u) => u.email.endsWith("@acme.com"), { message: "must be an acme email" });

const CreateUserSchema = BaseUser.omit({ id: true });
type CreateUserInput = z.infer<typeof CreateUserSchema>;

export async function handleCreateUser(req: Request, res: Response) {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  const user = await userService.create(parsed.data);
  const recheck = BaseUser.safeParse(user);
  if (!recheck.success) throw new Error("invalid user from service");
  return res.status(201).json(user);
}
```

# Criteria

- [ ] Uses v4 top-level format APIs (`z.uuid()`, `z.email()`) instead of `z.string().uuid()` / `z.string().email()`
- [ ] Replaces the `message:` / `{ message: ... }` options with the unified `error` field
- [ ] Replaces `parsed.error.flatten()` (or `.format()`) with `z.treeifyError(parsed.error)`
- [ ] Restructures the composition so `.omit()` is applied to the unrefined object and `.refine()` runs after — no `.pick()`/`.omit()` on a refined schema
- [ ] Deletes the hand-maintained `interface User` and derives the type solely via `z.infer<typeof ...>` (schema is the single source of truth)
- [ ] Does NOT re-validate already-parsed data deeper in the stack — drops the second `safeParse` on the value returned by `userService.create`