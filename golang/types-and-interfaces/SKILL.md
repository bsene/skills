---
name: golang-types-and-interfaces
description: >
  Go type system — structs, interfaces, embedding, composition, generics, slices, maps, enums with iota.
  TRIGGER when: user asks about Go structs, Go interfaces, Go embedding, composition in Go,
  Go generics, type parameters, Go type constraints, Go slices, Go maps, Go iota, Go enum,
  Go bitmask, implicit interface, interface satisfaction, small interfaces, accept interfaces return structs,
  Go type assertion, Go type switch, when to use generics in Go, Go collections, Go struct tags,
  Go composition vs inheritance, Go polymorphism.
user-invocable: false
---

# Go Types and Interfaces

Go has no classes, no inheritance, no `implements` keyword. It uses composition, small interfaces, and implicit satisfaction to achieve polymorphism.

---

## Interface Design Rules

| Rule | Rationale |
|---|---|
| Accept interfaces, return structs | Callers define the contract they need; implementations stay concrete |
| Keep interfaces small (1-3 methods) | `io.Reader` is the gold standard — one method, universally useful |
| Define interfaces at the consumer site | The package that *uses* the interface defines it, not the package that implements it |
| Implicit satisfaction — no `implements` | Types satisfy interfaces by having the right methods, no declaration needed |
| Don't export interfaces from implementation packages | Let consumers define what they need |

```go
// Consumer defines the interface it needs
type UserStore interface {
    FindByID(ctx context.Context, id string) (*User, error)
}

// Implementation satisfies it without knowing
type PostgresStore struct { db *sql.DB }

func (s *PostgresStore) FindByID(ctx context.Context, id string) (*User, error) {
    // ...
}
```

---

## Composition Decision Table

| Need | Go pattern | Not this |
|---|---|---|
| Reuse behavior | Struct embedding | Inheritance |
| Polymorphism | Interfaces | Abstract base class |
| Has-a relationship | Regular field | Embedding |
| Extend interface contract | Interface embedding | Interface inheritance |
| Share code across types | Package-level functions | Base class methods |

```go
// Embedding — promoted methods
type Server struct {
    http.Server              // embeds net/http Server
    logger *slog.Logger
}
// s.ListenAndServe() works — promoted from http.Server

// Interface embedding
type ReadCloser interface {
    Reader
    Closer
}
```

---

## Generics Quick Guide (Go 1.18+)

| Use generics when | Don't use generics when |
|---|---|
| Writing containers (stack, queue, set) | An interface already solves it |
| Algorithms over any ordered/comparable type | It adds complexity without reducing duplication |
| Reducing duplication across type-safe functions | Only 1-2 concrete types exist |

```go
func Map[T, U any](s []T, f func(T) U) []U {
    result := make([]U, len(s))
    for i, v := range s {
        result[i] = f(v)
    }
    return result
}

names := Map(users, func(u User) string { return u.Name })
```

Type constraints:

```go
type Number interface {
    ~int | ~int64 | ~float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}
```

---

## Enums with Iota

Go has no `enum` keyword. Use `iota` with typed constants:

```go
type Status int

const (
    StatusPending  Status = iota // 0
    StatusActive                 // 1
    StatusInactive               // 2
)

func (s Status) String() string {
    switch s {
    case StatusPending:  return "pending"
    case StatusActive:   return "active"
    case StatusInactive: return "inactive"
    default:             return fmt.Sprintf("Status(%d)", s)
    }
}
```

Bitmask pattern with `1 << iota`:

```go
type Permission uint8

const (
    PermRead    Permission = 1 << iota // 1
    PermWrite                          // 2
    PermExecute                        // 4
)

perms := PermRead | PermWrite
hasRead := perms&PermRead != 0  // true
```

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Interface pollution (10+ methods) | Weak abstraction, hard to implement/mock | Split into focused 1-3 method interfaces |
| Premature interfaces | Interface defined before second implementation exists | Wait until you need polymorphism |
| Embedding for code reuse without is-a | Promoted methods leak into API surface | Use a regular field instead |
| `any` / `interface{}` everywhere | Erases type safety | Use specific interfaces or generics |
| Generics for 1-2 concrete types | Over-engineering | Write the concrete functions |

---

## Read On Demand

| Read When | File |
|---|---|
| Struct embedding mechanics, promoted fields/methods, struct tags | [Structs & Composition](references/structs-composition.md) |
| Standard library interfaces, type assertions, type switches | [Interfaces Deep Dive](references/interfaces.md) |
| Slice internals, map patterns, generics syntax, type constraints | [Collections & Generics](references/collections-generics.md) |
