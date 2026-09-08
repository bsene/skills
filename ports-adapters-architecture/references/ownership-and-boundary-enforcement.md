# Ownership Tables & Boundary Enforcement (from real NestJS hex repos)

Patterns reinforced across several production hexagonal NestJS monorepos. They turn the
"hexagon" idea from a diagram into enforced structure.

## 1. One-Way Dependency Flow, Enforced by Tooling

State the dependency direction explicitly and verify it with a tool as part of `verify`, not
just docs:

```
apps/* → infra/* → domains/*
infra/* → packages/*
```

- `eslint-plugin-boundaries` — enforce at compile/lint time that a layer may only import
  `own + shared/domain`, never a sibling or higher layer.
- `dependency-cruiser` (`depcruise`) — render/validate the module graph against declared
  rules; run in CI.

## 2. Ownership Table Per Layer

The strongest single pattern: a table stating each layer's **Owns** vs **Must NOT own**. This
is more actionable than prose.

| Layer     | Owns                                               | Must NOT own                                 |
| --------- | -------------------------------------------------- | -------------------------------------------- |
| `domains` | business contracts, ports, entities, domain errors | NestJS/ORM/framework decorators, controllers |
| `infra`   | controllers, DB adapters, DI wiring                | cross-domain business rules                  |
| `common`  | shared utility safe for any layer                  | domain-specific rules                        |

- **Ports as abstract classes** in `domain/`, implemented by adapters in `infra/`. The abstract
  class itself is the DI token (no `@Inject`, no Symbol) — the port IS the seam.
- **Cross-context imports forbidden** inside `domains/`/`infra/` except through a shared
  `common` package. No direct cross-component imports.

## 3. Errors as Values, Not Exceptions

- Ports return `neverthrow` `Result<T, E>` (`ok()`/`err()`), so error handling stays in the
  value domain and callers must handle both arms.
- Endpoint contract: each `Endpoint` declares a `static PATH`, a list of `EXCEPTIONS` with
  `{code, status, exception}`, used by the exception filter and by coverage tests. Adding a new
  usecase exception means adding it to the endpoint's `EXCEPTIONS` array — a discoverable
  contract, not an implicit throw.

## 4. Domain Is Time-Source-Agnostic

Forbid `Date` in the domain layer (ESLint rule); inject a `TimePort` (`now(): number`). Keeps
domain logic testable and removes nondeterminism.
