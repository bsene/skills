# Modules Deep Dive

## go.mod Syntax

```go
module github.com/user/myproject

go 1.22

require (
    github.com/go-chi/chi/v5 v5.0.12
    github.com/stretchr/testify v1.9.0
    golang.org/x/sync v0.6.0
)

require (
    // indirect dependencies (managed by go mod tidy)
    github.com/davecgh/go-spew v1.1.1 // indirect
    github.com/pmezard/go-difflib v1.0.0 // indirect
)

replace github.com/user/shared => ../shared

exclude github.com/user/broken v1.0.0
```

| Directive | Purpose |
|---|---|
| `module` | Module path (used as import prefix) |
| `go` | Minimum Go version |
| `require` | Direct and indirect dependencies |
| `replace` | Override dependency source (local dev, forks) |
| `exclude` | Skip specific versions |
| `retract` | Mark own versions as bad (for library authors) |

---

## go.sum

Cryptographic checksums for every dependency version. Ensures reproducible builds.

```
github.com/go-chi/chi/v5 v5.0.12 h1:...
github.com/go-chi/chi/v5 v5.0.12/go.mod h1:...
```

- **Always commit go.sum** — it's a lock file
- Two entries per module: one for the zip, one for go.mod
- `go mod verify` checks local cache against go.sum

---

## Minimum Version Selection (MVS)

Go uses the minimum version that satisfies all requirements — not the latest.

If A requires `lib v1.2.0` and B requires `lib v1.3.0`, Go selects `v1.3.0` (minimum that works for both). It will **not** upgrade to `v1.5.0` even if available.

Upgrade explicitly:
```bash
go get github.com/user/lib@latest        # latest version
go get github.com/user/lib@v1.5.0        # specific version
go get -u ./...                            # upgrade all direct deps
go get -u -t ./...                         # upgrade all deps including test deps
```

---

## Workspaces (Go 1.18+)

Develop multiple modules together without `replace` directives:

```bash
# Create workspace
go work init ./api ./shared ./worker

# go.work file
go 1.22

use (
    ./api
    ./shared
    ./worker
)
```

Each directory has its own `go.mod`. The workspace links them during development.

```bash
go work use ./new-module      # add a module
go work sync                  # sync go.mod files with workspace
```

**Don't commit go.work** — it's for local development. CI builds each module independently.

---

## Module Proxies

```bash
# Default proxy (Google-operated)
GOPROXY=https://proxy.golang.org,direct

# Comma-separated fallback chain
GOPROXY=https://company-proxy.internal,https://proxy.golang.org,direct

# Direct only (no proxy)
GOPROXY=direct
```

Proxies cache modules, validate checksums, and improve download speed.

### Private Modules

```bash
# Skip proxy for private repos
GOPRIVATE=github.com/mycompany/*

# Or more granular
GONOSUMCHECK=github.com/mycompany/*
GONOSUMDB=github.com/mycompany/*
```

Set these in your shell profile or CI environment.

---

## go install vs go get

| Command | Purpose | Modifies go.mod? |
|---|---|---|
| `go install pkg@version` | Install a binary tool | No |
| `go get pkg@version` | Add/update dependency in go.mod | Yes |
| `go get -u ./...` | Update all dependencies | Yes |

```bash
# Install tools
go install golang.org/x/tools/cmd/stringer@latest
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Add dependency
go get github.com/go-chi/chi/v5@latest
```

---

## Import Path Conventions

```go
import (
    // Standard library (first group)
    "context"
    "fmt"
    "net/http"

    // Third-party (second group, blank line above)
    "github.com/go-chi/chi/v5"
    "github.com/stretchr/testify/assert"

    // Internal (third group, blank line above)
    "github.com/user/myproject/internal/domain"
    "github.com/user/myproject/internal/ports"
)
```

`goimports` handles grouping automatically. Three groups: stdlib, third-party, internal.

---

## Dependency Management Commands

```bash
go mod tidy          # sync go.mod/go.sum with actual imports
go mod graph         # print dependency graph
go mod why pkg       # explain why a dependency exists
go mod edit -json    # view go.mod as JSON
go list -m all       # list all dependencies
go list -m -u all    # list dependencies with available updates
```
