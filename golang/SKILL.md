---
name: golang
description: >
  Idiomatic Go — error handling, concurrency, web services, testing, and project structure.

  TRIGGER when: language (Go, Golang, .go files, go mod, go build, go run, go test, go fmt),
  concurrency (goroutine, channel, sync, context, select statement),
  errors (error interface, error wrapping, sentinel errors, panic/recover, errors.Is/As),
  web (net/http, HTTP handler, JSON encoding, REST API in Go, middleware),
  idioms (defer, nil, pointers vs values, struct embedding, interface satisfaction, receiver methods, slices, maps),
  tooling (Go modules, generics, table-driven tests, go vet),
  ask (idiomatic Go, Go best practices, Go code review, how to write Go).
  DO NOT USE when: user mentions "go" only as a verb in a different-language context.
user-invocable: false
---

# Go

Write simple, explicit, readable Go. The language rewards clarity over cleverness.

## Route to Sub-skills

→ **Error handling** (error interface, wrapping, sentinel errors, panic/recover) → `error-handling/` sub-skill
→ **Concurrency** (goroutines, channels, sync, context, errgroup) → `concurrency/` sub-skill
→ **Types and interfaces** (structs, interfaces, embedding, generics, slices, maps, enums) → `types-and-interfaces/` sub-skill
→ **Testing** (table-driven tests, benchmarks, fuzz, httptest, testify) → `testing/` sub-skill
→ **Web** (HTTP server/client, handlers, middleware, JSON, templates) → `web/` sub-skill
→ **Packages and modules** (go.mod, imports, versioning, proxies, workspaces) → `packages-and-modules/` sub-skill

---

## Go Fundamentals

### Variable Declaration

| Form | Use when |
|---|---|
| `x := value` | Inside functions, type is obvious from RHS |
| `var x T` | Zero value is meaningful, or type needs to be explicit |
| `var x = value` | Package-level variable (`:=` not allowed) |
| `const x = value` | Value known at compile time, never changes |

### Control Flow

| Construct | Go specifics |
|---|---|
| `if err != nil` | Always check errors immediately after the call |
| `for` | Only loop keyword — covers `while`, `do-while`, `foreach`, infinite |
| `switch` | No fallthrough by default; `fallthrough` keyword exists but is rare |
| `defer` | Runs at function exit (LIFO order); args evaluated at defer site |
| `range` | Iterate slices, maps, channels, strings; `for i, v := range slice` |

### Zero Values

Every type has a usable zero value — no null surprises.

| Type | Zero value |
|---|---|
| `bool` | `false` |
| Numeric (`int`, `float64`…) | `0` |
| `string` | `""` |
| Pointer, slice, map, channel, function, interface | `nil` |
| Struct | All fields zeroed |

### Naming

| Rule | Example |
|---|---|
| Exported = uppercase first letter | `ProcessOrder` (public), `processOrder` (private) |
| Acronyms stay all-caps | `HTTPServer`, `userID`, `xmlParser` |
| Receivers: 1-2 letter abbreviation of type | `func (s *Server) Start()` |
| Interfaces: verb + `-er` when single method | `Reader`, `Writer`, `Stringer`, `Closer` |
| No `Get` prefix for getters | `user.Name()` not `user.GetName()` |
| Package names: short, lowercase, no underscores | `strconv`, `httputil`, `bufio` |

### Formatting

`gofmt` is non-negotiable. No style debates. Run `gofmt` or `goimports` — the tool decides.

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Ignoring errors with `_` | Silent failures, impossible debugging | Handle every error or document why it's safe to ignore |
| `init()` with side effects | Hidden execution order, hard to test | Use explicit initialization in `main()` |
| Naked returns in long functions | Unreadable — reader must scroll to find return vars | Name return values only when it helps godoc; use explicit returns |
| Interface pollution | Declaring interfaces before a second implementation exists | Define interfaces at the consumer site, only when needed |
| Premature concurrency | Goroutines before measuring that sequential code is too slow | Profile first, add concurrency only when bottleneck is proven |

---

## Read On Demand

| Read When | File |
|---|---|
| Go proverbs, naming rules, formatting, zero value idioms | [Go Idioms](references/idioms.md) |
| Project layout decisions (cmd/, internal/, pkg/) | [Project Layout](references/project-layout.md) |
| Value vs pointer receivers, closures, defer semantics | [Functions, Methods & Pointers](references/functions-methods-pointers.md) |

---

## Specialist Skills

| Situation | Skill | Why |
|---|---|---|
| General testing philosophy (not Go-specific) | `testing` | Language-agnostic testing strategy and philosophy |
| OOP design principles | `oop-principles` | SOLID, design patterns (language-agnostic) |
| Hexagonal architecture in Go | `ports-adapters-architecture` | Ports and adapters pattern |

## Benchmark

Scenario: `.benchmarks/scenarios/golang-router-001-idiomatic.md` · Run: 2026-06-26

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 100% | +0%   |
| claude-sonnet-4-6 | 100%    | 100% | +0%   |
| claude-haiku-4-5  | 83%     | 83%  | +0%   |

> **NEUTRAL** (no regression). On idiomatic `readConfig` all baselines already use `defer f.Close()`, `%w`-wrapped errors, immediate error checks, and avoid over-abstraction — the feared "clarity over cleverness suppresses idioms" regression did not appear (haiku's one miss is identical with and without the skill). The router's fundamentals are not load-bearing on a straight-line task. Follow-up: a harder scenario (concurrency-vs-simplicity trade-off, or a dispatch case) to find real lift. Gate per `skill-optimizer/release-gates.md`.
