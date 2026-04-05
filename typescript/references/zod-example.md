```typescript
import { z } from "zod";

const UserSchema = z.object({ id: z.string(), name: z.string() });

// In an API handler — validated once, typed for the rest of the app
const user = UserSchema.parse(req.body); // throws ZodError on mismatch
```
