# Before / After (TypeScript)

**Before** — domain directly imports infrastructure:

```typescript
// ❌ domain knows about postgres
import { db } from "../infrastructure/postgres";

class UserService {
  async getUser(id: string) {
    return db.query("SELECT * FROM users WHERE id = $1", [id]);
  }
}
```

**After** — domain depends only on a port interface:

```typescript
// ✅ domain defines what it needs
interface UserRepository {
  findById(id: string): Promise<User | null>;
}

class UserService {
  constructor(private readonly users: UserRepository) {}
  async getUser(id: string) { return this.users.findById(id); }
}

// adapter lives outside the hexagon
class PostgresUserRepository implements UserRepository {
  async findById(id: string) { /* postgres query */ }
}
```
