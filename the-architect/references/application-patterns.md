# Application Patterns Around the Core

Patterns that sit between entrypoints and the domain model. Each one costs indirection.
For a thin CRUD wrapper over a database that will stay that way, skip all of them and use
the framework directly. Adopt them in the order below, only when the pain shows up.

| Pain                                                  | Reach for                     |
| ----------------------------------------------------- | ----------------------------- |
| Domain code imports ORM or framework                  | Repository (inverted mapping) |
| Business steps scattered in controllers               | Use-case / service layer      |
| Partial writes, repositories created all over         | Unit of Work                  |
| Rules spanning several objects, concurrency surprises | Aggregate boundary            |
| Side effects tangled inside the main flow             | Domain events + handlers      |
| Slow or awkward reads on a rich model                 | Read models (light CQRS)      |

## Repository

- Looks like an in-memory collection of aggregates: `add`, `get`, maybe a few named
  queries. It is not a generic query builder.
- Invert the mapping: the persistence layer imports the domain classes, never the reverse
  (explicit mapper or ORM mapping kept outside the model). The model then runs and tests
  with no database.
- One repository per aggregate root. Cost: hand-maintained mappings; with an active-record
  style framework and simple rules this is not worth it.

## Use case / service layer

- A use case orchestrates: fetch aggregate through a repository, call a domain method,
  persist, publish. It holds no business rules and does not return ORM objects.
- Take a command or primitives in, return IDs or DTOs out. Entrypoints (HTTP, CLI, queue
  consumer) are thin adapters that parse input and call it.
- Composition happens once at startup (bootstrap / composition root); use cases receive
  their dependencies, they do not look them up.

## Unit of Work

- Wraps one use case in one atomic scope and exposes the repositories inside it.
  Success commits; leaving the scope without commit rolls back, so the default is safe.
- Narrow it: expose only begin, commit, rollback and the repositories, not the whole ORM
  session. Provide an in-memory fake for tests.
- Skip it if the ORM session passed explicitly already gives you this and the team is
  comfortable; add it when atomicity must also drive event publishing.

## Aggregate and consistency boundary

- An aggregate is the cluster that must be consistent after every operation. All changes
  go through its root; other code holds only the root's identity.
- Size it by the invariant, not by the data model: one transaction changes one aggregate.
  Large aggregates cause contention; use eventual consistency between aggregates.
- Guard concurrent writes with a version number (optimistic) or row locks / suitable
  isolation level (pessimistic) on the aggregate root.

## Commands, events, and the message bus

| Aspect     | Command                                      | Event                                                      |
| ---------- | -------------------------------------------- | ---------------------------------------------------------- |
| Meaning    | A request; imperative name (`AllocateStock`) | A fact; past tense (`StockAllocated`)                      |
| Handlers   | Exactly one                                  | Zero or many                                               |
| On failure | Caller sees the error                        | Isolated; logged and retried, does not fail the originator |
| Used for   | Inputs at the edge                           | Reactions inside and between modules                       |

- Aggregates record events; the unit of work (or the handler loop) collects and dispatches
  them after commit. Each handler runs in its own unit of work.
- Failures of event handlers are expected: log every message with its data so it can be
  replayed, retry transient errors with back-off, then give up visibly.
- Cost: duplicated fields between model and events, flow that is harder to trace. Do not
  convert the whole app to a bus unless several flows already react to each other.
- Between services, publish integration events through a thin outbound adapter on the
  same bus; do not share the database.

## Read models (CQRS, light)

| Option                               | Use when                                                               |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Reads through repositories           | Reads match the write model; simplest                                  |
| ORM query on the write schema        | Occasional reporting, same DB config                                   |
| Hand-written SQL views               | Reads are shaped differently, performance matters                      |
| Separate store fed by event handlers | Heavy read scale or very different shapes; accept eventual consistency |

- Commands never read from the read model to decide anything; decisions use the write
  model. Read models can be rebuilt by replaying history.
- Do not add a separate read store until a plain query has measurably failed.

## Domain-driven app layout (Rails-style example)

For a growing monolith, split code into an app layer and a domain layer:

- App layer: controllers, form objects, use-case services, read models. One per client
  (admin, public, mobile, webhooks) when the clients differ.
- Domain layer: modules per business area (pricing, inventory, ordering) that talk through
  commands in and events out; no module reaches into another's tables.
- Three building blocks cover most flows: aggregate (command to event), read model
  (event to data), process manager (event to command, for multi-step workflows).
- Keep CRUD areas CRUD; apply rich modelling only in the areas where the rules live.

Source: Percival and Gregory, "Architecture Patterns with Python" (repository, unit of
work, aggregates, events, commands, CQRS, trade-off tables); Krzywda, "15 Years with Rails
and DDD" (app/domain split, aggregate / read model / process manager).
