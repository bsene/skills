---
name: ports-adapters-architecture
description: >
  Ports and Adapters (hexagonal) architecture — isolate business logic from external concerns via well-defined boundaries.
  TRIGGER when: user asks about ports and adapters, hexagonal architecture, Alistair Cockburn, hexagon architecture,
  driving adapter, driven adapter, primary adapter, secondary adapter, inbound port, outbound port, adapter pattern,
  application boundary, dependency inversion.
  DO NOT USE when: user is asking about general OOP or SOLID principles in the abstract — use `oop-principles`
  instead. Note: Dependency Inversion Principle (DIP) from `oop-principles/solid` is the theoretical foundation
  of this pattern.
---

# Ports and Adapters Architecture

Also called "Hexagonal Architecture" by Alistair Cockburn.

## Core Idea

Isolate your business logic in the center ("hexagon"). Everything outside—databases, web frameworks, message queues, UI—connects through explicit **ports** and **adapters**. This inversion of dependencies makes business logic reusable and testable.

---

## Structure

```
hexagon/
├── domain/              ← Business logic (center), no dependencies on outside
├── ports/
│   ├── driving/        ← Interfaces for external actors to call in
│   │   └── UserService.ts
│   └── driven/         ← Interfaces for the domain to call out
│       └── UserRepository.ts
├── use-cases/          ← Application layer, orchestrates domain
│   └── CreateUserUseCase.ts

adapters/
├── driving/            ← How external actors call the domain
│   ├── http/           ← REST controller
│   └── cli/            ← Command-line interface
└── driven/             ← How the domain calls external systems
    ├── postgres/       ← Concrete database implementation
    ├── email/          ← Email service implementation
    └── cache/          ← Cache service implementation
```

---

## Key Concepts

| Term | Meaning |
|---|---|
| **Port** | Interface defined by the hexagon (domain). External systems implement it. |
| **Adapter** | Concrete implementation of a port. Translates between domain logic and external tools. |
| **Driving / Primary** | Ports where external actors (HTTP client, CLI user, scheduler) call **into** the domain. |
| **Driven / Secondary** | Ports where the domain calls **out** to external systems (database, cache, email). |

**Naming convention:** For driving ports, use `for_<action>` (e.g., `for_creating_users`).

---

## Advantages

- Business logic is framework-agnostic — swap HTTP for gRPC without touching the domain
- Testability: inject fakes for driven ports; test domain in isolation
- Clarity: dependencies flow inward only; domain never depends on adapters
- Scalability: add new adapters (new databases, new APIs) without changing the core

---

## Application Workflow

When the user wants to apply or review Ports & Adapters:

1. **Identify the boundary** — where does business logic end and infrastructure begin? The hexagon edge is the answer.
2. **Define the ports** — write interfaces (not implementations) for every outbound dependency. Name them `for_<action>`.
3. **Move logic inward** — ensure domain code imports only other domain code, never framework/DB packages.
4. **Write adapters** — one concrete class per external system, implementing the matching port interface.

## Before / After (TypeScript)

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

---

## References

- **Alistair Cockburn** — [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- **Martin Fowler** — [Ports and Adapters Pattern](https://martinfowler.com/bliki/HexagonalArchitecture.html)
