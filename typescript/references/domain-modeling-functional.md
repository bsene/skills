# Domain Modeling, Functional Style

Source: _Domain Modeling Made Functional_ (Scott Wlaschin), translated from F# to TypeScript. Complements [illegal states](../type-system/references/illegal-states-and-exhaustiveness.md) and [branding](../type-system/references/structural-typing-and-branding.md); this file covers workflows, errors, boundaries, and persistence. Use when modeling a business process, not for one-off type questions.

## Model events and workflows, not tables

| Step | Practice                                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 1    | Start from domain events ("OrderPlaced") and the processes they trigger, not from entities and CRUD         |
| 2    | Partition the domain into bounded contexts; each owns its model, language, and data store                   |
| 3    | Use the domain experts' words for types and functions (ubiquitous language); no `Manager`/`Helper`/`Data`   |
| 4    | A workflow is a function: `Command -> Result<Event[], Error>`; its input is a command, its output is events |

## State machine by type, not by flag

Each stage of a workflow is its own type; a function takes the previous stage and returns the next. Illegal transitions do not compile.

```typescript
type UnvalidatedOrder = {
  kind: "unvalidated";
  customer: string;
  lines: unknown[];
};
type ValidatedOrder = {
  kind: "validated";
  customer: CustomerInfo;
  lines: OrderLine[];
};
type PricedOrder = {
  kind: "priced";
  customer: CustomerInfo;
  lines: PricedLine[];
  total: Money;
};

type ValidateOrder = (
  o: UnvalidatedOrder,
) => Result<ValidatedOrder, ValidationError>;
type PriceOrder = (o: ValidatedOrder) => Result<PricedOrder, PricingError>;
```

- No `isValidated: boolean` or `status: string` on one shared type.
- Name the dependency as a type, then pass it as a parameter: `ValidateOrder` takes `checkProductExists` as an argument. That is dependency injection with no container.

## Smart constructors and parse-don't-validate

Constrained primitives get a single creation function that returns a `Result`; the branded type cannot be built any other way.

```typescript
type String50 = string & { readonly __brand: "String50" };
const String50 = {
  create: (s: string): Result<String50, "empty" | "tooLong"> =>
    s.length === 0
      ? err("empty")
      : s.length > 50
        ? err("tooLong")
        : ok(s as String50),
};
```

Inside the bounded context every value is already valid; validation happens once, at the entry point (Zod `safeParse`, see `zod/SKILL.md`), and domain functions never re-check.

## Pipelines and errors

| Concern                       | Practice                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Compose steps                 | `pipe(validate, price, acknowledge)`; adapt steps with differing signatures to a common one (`map`, `flatMap` on `Result`) |
| Expected errors               | Typed union in the return (`Result<T, ValidationError \| PricingError>`); not exceptions                                   |
| Unexpected errors             | Throw; catch once at the workflow edge and log. Do not model `OutOfMemory` as a domain error                               |
| Many independent validations  | Collect all errors (applicative-style: gather every `Result`, return the list), do not stop at the first                   |
| Dependent steps               | Short-circuit on first error (`flatMap`)                                                                                   |
| Async + Result                | One type `Promise<Result<T, E>>` and one helper to chain it; avoid mixing `try/catch` and `Result` in a step               |
| Side effects (email, billing) | Return as events from the workflow; a separate handler performs them, so the core stays pure                               |

## Bounded-context boundaries

| Boundary rule                         | Practice                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Never leak domain types over the wire | Map to a serializable **DTO** (plain primitives, no brands/unions with methods) and back                   |
| Inbound                               | `unknown` JSON → Zod → DTO → `toDomain(dto): Result<Domain, Error>`; errors are structured, not thrown     |
| Outbound                              | `fromDomain(domain): Dto`; this direction cannot fail                                                      |
| Contracts between contexts            | Share event/command DTO schemas, not domain types; a downstream context translates (anti-corruption layer) |
| Versioning                            | Add optional fields; never rename or retype published DTO fields; tolerate unknown fields on read          |

## Integrity and consistency

- Enforce invariants in the type (smart constructor, discriminated union) first, then in the aggregate's functions; unit tests cover only what types cannot say.
- An **aggregate** is the consistency boundary: one transaction updates one aggregate; reference others by id.
- Across aggregates or contexts, design for eventual consistency (events, retries, idempotent handlers) rather than distributed transactions.
- Derived values (totals, status) are computed in a function from the state, or recomputed when any input changes; do not store them separately and hope they agree.

## Persistence

1. **Push persistence to the edges.** Load → pure workflow → save; the domain function never calls the database.
2. **Separate commands from queries.** Write path loads an aggregate and emits events; read path uses a purpose-built query/view with no domain logic.
3. **Each bounded context owns its store** and schema; no shared tables across contexts.
4. Map domain ↔ row/document explicitly in a repository module (`toRow`, `fromRow`); `fromRow` re-validates (`Result`) because the database can hold bad legacy data.
5. Optional: event sourcing (store events, derive state) when audit history matters; it is a deliberate commitment, not a default.

## Evolving the design

- Requirement change = change a type first and let the compiler list every function to fix.
- Add a case to a union (new payment method) and fix each `switch` flagged by the `never` check; do not add a boolean.
- Keep the domain core pure and dependency-free; if a new feature forces I/O into it, add a parameter or an event instead.
