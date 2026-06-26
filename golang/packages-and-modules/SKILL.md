---
name: golang-packages-and-modules
description: >
  Go modules and packages — go.mod, go.sum, versioning, proxies, internal packages, init functions.
  TRIGGER when: user asks about Go modules, go mod init, go mod tidy, go.mod, go.sum,
  Go package organization, Go imports, Go internal package, Go init function, Go module proxy,
  Go versioning, Go major version, Go replace directive, Go workspace, Go vendor,
  Go dependency management, GOPATH vs modules, GOPROXY, GOPRIVATE, go install vs go get.
user-invocable: false
---

# Go Packages and Modules

Modules are Go's dependency management system. A module is a collection of packages versioned together.

---

## Module Lifecycle

```bash
go mod init github.com/user/project   # create go.mod
go mod tidy                            # add missing, remove unused deps
go mod vendor                          # copy deps into vendor/ (optional)
go mod download                        # pre-fetch deps (CI caching)
go mod verify                          # check deps haven't been tampered with
```

---

## Package Organization Decision Table

| Directory | Purpose | Visibility |
|---|---|---|
| `cmd/appname/` | Entry point (`package main`) | — |
| `internal/` | Private packages | Compiler-enforced: can't be imported from outside module |
| `pkg/` | Public library packages | Convention only (not enforced) |
| Root | Small projects, single-package libraries | Depends on exported names |

**Rules:**
- One `package main` per binary in `cmd/`
- Use `internal/` liberally — it's the safest default
- Don't create `pkg/` unless you have real external consumers
- Package name = directory name (by convention)

---

## Init Functions

```go
func init() {
    // Runs automatically when package is loaded
    // Before main(), after variable declarations
}
```

| Use init() for | Don't use init() for |
|---|---|
| Registering drivers (`database/sql`, `image`) | Complex logic or I/O |
| Setting up package-level constants from env | Anything that can fail silently |
| One-line computed defaults | Business logic |

**Prefer explicit initialization in `main()`.** `init()` is invisible, hard to test, and order-dependent.

---

## Semantic Import Versioning

| Version | Import path | go.mod module path |
|---|---|---|
| v0.x.x or v1.x.x | `github.com/user/lib` | `module github.com/user/lib` |
| v2.x.x | `github.com/user/lib/v2` | `module github.com/user/lib/v2` |
| v3.x.x | `github.com/user/lib/v3` | `module github.com/user/lib/v3` |

Major version changes = new import path. This allows v1 and v2 to coexist in the same build.

---

## Replace and Exclude

```go
// go.mod

// Local development: point to local copy
replace github.com/user/lib => ../lib

// Fork: use your fork instead
replace github.com/original/pkg => github.com/myfork/pkg v0.0.0-...

// Exclude a known-bad version
exclude github.com/user/lib v1.2.3
```

Remove `replace` directives before releasing — they are for local development only.

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Circular imports | Compile error, design smell | Extract shared types into a separate package |
| Deep package nesting | `internal/service/order/v2/handler/` → hard to navigate | Flatten — Go packages are flat by convention |
| `init()` with side effects | Hidden, untestable execution | See [Init Functions](#init-functions) — prefer explicit setup in `main()` |
| Vendoring without reason | Repo bloat, merge conflicts | Only vendor when reproducibility can't be achieved otherwise |
| `go get` in scripts | Modifies go.mod | Use `go install pkg@version` for tools |

---

## Read On Demand

| Read When | File |
|---|---|
| go.mod syntax, go.sum, MVS, workspaces, proxies, private modules | [Modules Deep Dive](references/modules-deep-dive.md) |
