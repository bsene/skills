# Go Project Layout

## Standard Directories

| Directory | Purpose | Enforced by compiler? |
|---|---|---|
| `cmd/` | Entry points — each subdirectory is a `package main` with a `main()` | No (convention) |
| `internal/` | Private packages — cannot be imported outside parent module | **Yes** |
| `pkg/` | Public library code intended for external consumption | No (convention, debated) |
| Root | Package code for small projects or single-package libraries | — |

## Decision Guide

| Project type | Layout |
|---|---|
| Single binary, small project | Root package + `main.go` |
| Single binary, growing project | `main.go` at root, packages in subdirectories |
| Multiple binaries sharing code | `cmd/app1/`, `cmd/app2/`, shared code in `internal/` |
| Library (others import it) | Root package or organized sub-packages |
| Large service with adapters | `cmd/`, `internal/domain/`, `internal/adapters/`, `internal/ports/` |

## Example: Multi-Binary Service

```
myproject/
├── cmd/
│   ├── api/
│   │   └── main.go           # HTTP server entry point
│   ├── worker/
│   │   └── main.go           # Background worker entry point
│   └── migrate/
│       └── main.go           # DB migration CLI
├── internal/
│   ├── domain/
│   │   ├── order.go          # Domain types and business logic
│   │   └── order_test.go
│   ├── ports/
│   │   ├── order_service.go  # Interfaces (driving ports)
│   │   └── order_repo.go     # Interfaces (driven ports)
│   └── adapters/
│       ├── http/
│       │   └── handler.go    # HTTP handlers
│       ├── postgres/
│       │   └── order_repo.go # PostgreSQL implementation
│       └── redis/
│           └── cache.go      # Redis cache implementation
├── go.mod
├── go.sum
└── README.md
```

## Example: Simple Library

```
mylib/
├── mylib.go          # Main package code
├── mylib_test.go     # Tests
├── parser/
│   ├── parser.go     # Sub-package
│   └── parser_test.go
├── go.mod
└── README.md
```

## Rules

- `internal/` is the only compiler-enforced boundary — use it for code that must stay private
- Don't create `pkg/` unless you have a clear external consumer; `internal/` is the safer default
- Keep `main.go` thin — it wires dependencies and calls `run()`; business logic lives elsewhere
- Test files (`_test.go`) live next to the code they test, not in a separate `tests/` directory
- Avoid deep nesting: `internal/service/order/v2/handler/` is a smell — flatten

## External References

- [How to Write Go Code](https://go.dev/doc/code) — official Go documentation on organizing code, modules, and workspaces
