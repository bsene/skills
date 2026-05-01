# Error Patterns

## Sentinel Errors

Predefined error values for well-known failure conditions. Callers match with `errors.Is`.

```go
package repository

import "errors"

var (
    ErrNotFound   = errors.New("not found")
    ErrConflict   = errors.New("conflict")
    ErrForbidden  = errors.New("forbidden")
)

func (r *Repo) FindUser(id string) (*User, error) {
    row := r.db.QueryRow("SELECT ... WHERE id = $1", id)
    if err := row.Scan(&u); err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, ErrNotFound
        }
        return nil, fmt.Errorf("querying user %s: %w", id, err)
    }
    return &u, nil
}
```

Caller:

```go
user, err := repo.FindUser(id)
if errors.Is(err, repository.ErrNotFound) {
    http.Error(w, "user not found", http.StatusNotFound)
    return
}
if err != nil {
    http.Error(w, "internal error", http.StatusInternalServerError)
    return
}
```

---

## Custom Error Types with Unwrap

For errors that carry structured data beyond a message:

```go
type NotFoundError struct {
    Resource string
    ID       string
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s %s not found", e.Resource, e.ID)
}

// Unwrap is not needed here — no wrapped cause.
// Add Unwrap when wrapping another error:

type QueryError struct {
    Query string
    Err   error
}

func (e *QueryError) Error() string {
    return fmt.Sprintf("query %q failed: %v", e.Query, e.Err)
}

func (e *QueryError) Unwrap() error {
    return e.Err
}
```

### Using errors.As

```go
var qe *QueryError
if errors.As(err, &qe) {
    log.Printf("failed query: %s", qe.Query)
    // qe.Err is the underlying cause
}
```

### Using errors.Is with Custom Types

Implement `Is` for semantic matching:

```go
type HTTPError struct {
    Code    int
    Message string
}

func (e *HTTPError) Error() string {
    return fmt.Sprintf("HTTP %d: %s", e.Code, e.Message)
}

func (e *HTTPError) Is(target error) bool {
    t, ok := target.(*HTTPError)
    if !ok { return false }
    return e.Code == t.Code
}

// Now this works:
var ErrNotFound = &HTTPError{Code: 404}
errors.Is(err, ErrNotFound) // matches any HTTPError with Code 404
```

---

## Error Wrapping Chains

Build context as errors propagate up the call stack:

```go
// Layer 1: database
func (r *Repo) GetOrder(id string) (*Order, error) {
    if err := r.db.QueryRow(...).Scan(&o); err != nil {
        return nil, fmt.Errorf("querying order %s: %w", id, err)
    }
    return &o, nil
}

// Layer 2: service
func (s *Service) ProcessOrder(id string) error {
    order, err := s.repo.GetOrder(id)
    if err != nil {
        return fmt.Errorf("processing order: %w", err)
    }
    // ...
    return nil
}

// Layer 3: handler
func (h *Handler) HandleProcess(w http.ResponseWriter, r *http.Request) {
    if err := h.service.ProcessOrder(id); err != nil {
        // Full chain: "processing order: querying order abc123: sql: no rows"
        log.Printf("error: %v", err)
        http.Error(w, "internal error", 500)
        return
    }
}
```

Each layer adds its own context. The chain reads like a stack trace but with business meaning.

---

## Panic and Recover

### When to Panic

- Programming errors: nil pointer where nil should be impossible, index out of range on validated data
- Initialization failures in `main()` that make the program useless
- **Never** for expected runtime errors (network, I/O, user input)

### Recover Pattern

```go
func safeHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                log.Printf("panic recovered: %v\n%s", rec, debug.Stack())
                http.Error(w, "internal server error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

`recover()` only works inside a deferred function. It returns `nil` if there is no panic.

---

## Multi-Error (Go 1.20+)

Join multiple errors into one:

```go
func validateUser(u User) error {
    var errs []error
    if u.Name == "" {
        errs = append(errs, errors.New("name is required"))
    }
    if u.Email == "" {
        errs = append(errs, errors.New("email is required"))
    }
    return errors.Join(errs...)
}
```

`errors.Join` returns `nil` if all errors are nil. The joined error supports `errors.Is` and `errors.As` against any of the wrapped errors.

---

## Error Handling at Package Boundaries

At package boundaries, consider whether to expose or hide internal errors:

```go
// Internal package uses sql.ErrNoRows
// Public API exposes domain-specific errors

func (s *Store) GetUser(id string) (*User, error) {
    user, err := s.db.QueryUser(id)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, ErrNotFound  // translate to domain error (no %w — hide sql dependency)
    }
    if err != nil {
        return nil, fmt.Errorf("fetching user: %w", err)  // wrap for unexpected errors
    }
    return user, nil
}
```
