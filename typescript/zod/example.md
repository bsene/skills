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
