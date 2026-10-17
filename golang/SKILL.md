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
metadata:
  user-invocable: "false"
---

# Go

Write simple, explicit, readable Go. The language rewards clarity over cleverness.

"Simple" means obvious, not minimal — standard idioms (`defer f.Close()`, `%w`-wrapped errors, immediate `if err != nil` checks) ARE the clarity, not cleverness. Never strip a required idiom in the name of simplicity.

## Route to Sub-skills

→ **Error handling** (error interface, wrapping, sentinel errors, panic/recover) → `error-handling/` sub-skill
→ **Concurrency** (goroutines, channels, sync, context, errgroup) → `concurrency/` sub-skill
→ **Types and interfaces** (structs, interfaces, embedding, generics, slices, maps, enums) → `types-and-interfaces/` sub-skill
→ **Testing** (table-driven tests, benchmarks, fuzz, httptest, testify) → [golang-testing](testing/SKILL.md) sub-skill
→ **Web** (HTTP server/client, handlers, middleware, JSON, templates) → `web/` sub-skill
→ **Packages and modules** (go.mod, imports, versioning, proxies, workspaces) → `packages-and-modules/` sub-skill

---

## Go Fundamentals

### Variable Declaration

| Form              | Use when                                               |
| ----------------- | ------------------------------------------------------ |
| `x := value`      | Inside functions, type is obvious from RHS             |
| `var x T`         | Zero value is meaningful, or type needs to be explicit |
| `var x = value`   | Package-level variable (`:=` not allowed)              |
| `const x = value` | Value known at compile time, never changes             |

### Control Flow

| Construct       | Go specifics                                                        |
| --------------- | ------------------------------------------------------------------- |
| `if err != nil` | Always check errors immediately after the call                      |
| `for`           | Only loop keyword — covers `while`, `do-while`, `foreach`, infinite |
| `switch`        | No fallthrough by default; `fallthrough` keyword exists but is rare |
| `defer`         | Runs at function exit (LIFO order); args evaluated at defer site    |
| `range`         | Iterate slices, maps, channels, strings; `for i, v := range slice`  |

### Zero Values

Every type has a usable zero value — no null surprises.

| Type                                              | Zero value        |
| ------------------------------------------------- | ----------------- |
| `bool`                                            | `false`           |
| Numeric (`int`, `float64`…)                       | `0`               |
| `string`                                          | `""`              |
| Pointer, slice, map, channel, function, interface | `nil`             |
| Struct                                            | All fields zeroed |

### Naming and Formatting

Exported = uppercase first letter; `gofmt`/`goimports` decide style. Full rules (acronyms, receivers, `-er` interfaces, no `Get` prefix, package names) live in [Go Idioms](references/idioms.md).

---

## Anti-patterns

Never ignore errors with `_`, use side-effecting `init()`, or add interfaces/goroutines before they are needed. Details and fixes live in the leaf skills: `error-handling/`, `types-and-interfaces/`, `concurrency/`.

---

## Read On Demand

| Read When                                                                                    | File                                                                                                                  |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Go proverbs, naming rules, formatting, zero value idioms                                     | [Go Idioms](references/idioms.md)                                                                                     |
| Project layout decisions (cmd/, internal/, pkg/)                                             | [Project Layout](references/project-layout.md) · [go.dev/doc/code](https://go.dev/doc/code)                           |
| Value vs pointer receivers, closures, defer semantics                                        | [Functions, Methods & Pointers](references/functions-methods-pointers.md)                                             |
| Verification gate, table-driven tests, don't pre-DRY                                         | [Verification Gate & Discipline](references/verification-gate-and-discipline.md)                                      |
| GoF patterns as Go idioms, extra concurrency patterns (future, pub/sub), fundamentals recap  | [Design Patterns in Go](references/design-patterns-in-go.md)                                                          |
| Retries/backoff, circuit breaker, health, observability, service security, event-driven      | [Microservice Resilience](references/microservice-resilience.md)                                                      |
| Go 1.24–1.27 features (`b.Loop`, `wg.Go`, `synctest`, `new(expr)`, `errors.AsType`, json/v2) | [Modern Go Releases](references/modern-go-releases.md) · [go.dev/doc/devel/release](https://go.dev/doc/devel/release) |

---

## Specialist Skills

| Situation                                    | Skill                         | Why                                               |
| -------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| General testing philosophy (not Go-specific) | `testing`                     | Language-agnostic testing strategy and philosophy |
| OOP design principles                        | `object-oriented-programming` | SOLID, design patterns (language-agnostic)        |
| Hexagonal architecture in Go                 | `the-architect`               | Ports and adapters reference                      |

---

## Benchmark

Scenario: `.benchmarks/scenarios/golang-router-001-idiomatic.md` · Run: 2026-08-31 (salience re-run `wf_9a5588bc`) · Log: `.benchmarks/runs/2026-08-31/golang-router-001-idiomatic.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 100% | +17%  |
| claude-sonnet-4-6 | 100%    | 100% | +0%   |
| claude-haiku-4-5  | 67%     | 83%  | +16%  |

> **PASS (run 2026-08-31)**. Over-broad-'simplicity' regression cleared after the intro edit ('idioms ARE the clarity', wf_9a5588bc): opus's lost `defer f.Close()` criterion is back with-skill on all models. Supersedes the 2026-06-26 NEUTRAL run. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
