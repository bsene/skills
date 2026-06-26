---
name: golang-error-handling
description: >
  Go error handling — error interface, custom error types, wrapping, sentinel errors, errors.Is/As, panic/recover.
  TRIGGER when: user asks about Go error handling, if err != nil, custom errors, error wrapping,
  fmt.Errorf %w, errors.Is, errors.As, sentinel errors, panic recover, when to panic in Go,
  error types in Go, Go error best practices, Go error propagation, error chains,
  Go error interface, handling errors in Go, Go error patterns.
user-invocable: false
---

# Go Error Handling

Errors are values, not exceptions. They flow through return values, are inspected with standard tools, and always carry context about what went wrong.

---

## Error Strategy Decision Table

| Situation | Strategy | Example |
|---|---|---|
| Expected failure (file not found, bad input) | Return `error` | `return fmt.Errorf("open %s: %w", path, err)` |
| Caller needs to distinguish error kinds | Sentinel or custom type | `var ErrNotFound = errors.New("not found")` |
| Adding context (see Wrapping vs Formatting) | Wrap `%w` / format `%v` | `fmt.Errorf("loading config: %w", err)` |
| Truly unrecoverable (programmer bug) | `panic` | Nil map write, index out of bounds |
| Library boundary cleanup | `recover` in deferred func | HTTP middleware, plugin host |

---

## The Error Interface

```go
type error interface {
    Error() string
}
```

Any type implementing `Error() string` is an error. This simplicity is the entire design.

---

## Wrapping vs Formatting

| Verb | Preserves chain? | `errors.Is`/`As` work? | Use when |
|---|---|---|---|
| `%w` | Yes | Yes | Caller may need to match the cause |
| `%v` | No | No | Adding context, hiding implementation details |

**Rule:** Wrap (`%w`) by default. Format (`%v`) only when you explicitly want to hide the cause from callers (e.g., at package boundaries).

---

## Custom Error Types

```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Message)
}

// Usage
func validateAge(age int) error {
    if age < 0 {
        return &ValidationError{Field: "age", Message: "must be non-negative"}
    }
    return nil
}

// Caller inspects with errors.As
var ve *ValidationError
if errors.As(err, &ve) {
    log.Printf("field %s: %s", ve.Field, ve.Message)
}
```

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| `_ = doSomething()` | Silent failure | Handle every error, or add `//nolint` with justification |
| `panic` for expected failures | Crashes the program | Return `error` — panic is for programmer bugs only |
| `return err` without context | Error message is cryptic at the top of the chain | `return fmt.Errorf("doing X: %w", err)` |
| Stuttering: `"failed to open file: open /x: no such file"` | Redundant prefixes | Add context about *your* operation, not the callee's |
| Comparing error strings | Fragile, breaks on reword | Use `errors.Is` for sentinel errors, `errors.As` for types |

---

## Read On Demand

| Read When | File |
|---|---|
| Full patterns: sentinel errors, custom types, wrapping chains, panic/recover, multi-error | [Error Patterns](references/error-patterns.md) |

---

## Benchmark

Scenario: `.benchmarks/scenarios/golang-error-handling-001-wrap-vs-format.md`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 100% | +0%   |
| claude-sonnet-4-6 | 83%     | 100% | +17%  |
| claude-haiku-4-5  | 50%     | 83%  | +33%  |

> **PASS** (run 2026-06-25). Strong lift on weak models (haiku +33, sonnet +17); opus saturated. Skill flips `%v`→`%w` and the `panic`→returned-error fix that baselines under-apply. Gate per `skill-optimizer/release-gates.md`.
