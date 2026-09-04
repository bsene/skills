---
id: ports-adapters-001-hexagonal-refactor
skill: ports-adapters-architecture
---

# Prompt

Our team wants to adopt ports and adapters (hexagonal). Here's the TypeScript we have today:

```typescript
// src/users/UserService.ts
import { pool } from "../infrastructure/postgres";
import { sendMail } from "../infrastructure/mailer";
import { User } from "./User";

export class UserService {
  async getUser(id: string): Promise<User | null> {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0] ?? null;
  }

  async createUser(email: string, name: string): Promise<User> {
    if (!email.includes("@")) throw new Error("invalid email");
    const res = await pool.query(
      "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
      [email, name],
    );
    await sendMail(email, "Welcome!");
    return res.rows[0];
  }
}

// src/http/usersController.ts — calls userService.getUser / userService.createUser
```

Refactor this to ports and adapters. Show the target structure and the key code, and explain the boundaries. We want to swap Postgres later and test the core without a database.

# Criteria

- [ ] Extracts outbound (driven) port interfaces owned by the core for the DB and mail dependencies, and `UserService` depends on those interfaces via constructor injection instead of importing concrete infrastructure
- [ ] Postgres and the mailer become concrete adapters that implement the matching port, living outside the core/domain layer
- [ ] Correctly distinguishes driving/primary (the HTTP controller calling into the core) from driven/secondary (the core calling out to DB/email) when describing the structure
- [ ] After the refactor, no core/user code imports `../infrastructure/*` — dependencies point inward toward the core
- [ ] Calls out testability explicitly: inject an in-memory/fake implementation of the driven ports to test `UserService` without Postgres or a real mailer
- [ ] Does NOT wrap the pure internal logic (the email-validation check) in a port/interface or introduce adapters for things with no external dependency
