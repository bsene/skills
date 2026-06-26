---
name: golang-web
description: >
  Go web development — HTTP server, handlers, middleware, routing, JSON encoding, XML, templates.
  TRIGGER when: user asks about Go HTTP server, net/http, Go handler, Go middleware,
  Go routing, Go JSON, encoding/json, json.Marshal, json.Unmarshal, Go XML, Go templates,
  html/template, Go REST API, Go web service, http.ListenAndServe, http.HandlerFunc,
  Go request handling, Go response writer, Go ServeMux, Go router, chi router,
  Go graceful shutdown, Go HTTP client.
  DO NOT USE when: non-web JSON/struct marshaling or general Go with no HTTP server/handler/router →
  use the relevant `golang` sub-skill; non-Go web work.
user-invocable: false
---

# Go Web Development

Go's `net/http` standard library is production-ready. Most projects don't need a framework.

---

## Handler Pattern

Everything revolves around one interface:

```go
type Handler interface {
    ServeHTTP(http.ResponseWriter, *http.Request)
}
```

Two ways to implement:

```go
// 1. Implement the interface on a struct
type HealthHandler struct{}

func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"ok"}`))
}

// 2. Use http.HandlerFunc adapter (most common)
func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"ok"}`))
}

mux.HandleFunc("GET /health", healthHandler)
```

---

## Routing Decision Table

| Need | Approach |
|---|---|
| Simple REST API (Go 1.22+) | `http.NewServeMux` with method+pattern: `"GET /api/users/{id}"` |
| Complex routing, groups, middleware chaining | `chi` router |
| Pre-Go 1.22 projects needing path params | `gorilla/mux` or `chi` |
| gRPC services | `google.golang.org/grpc` |

### Go 1.22+ Enhanced ServeMux

```go
mux := http.NewServeMux()

mux.HandleFunc("GET /api/users", listUsers)
mux.HandleFunc("GET /api/users/{id}", getUser)
mux.HandleFunc("POST /api/users", createUser)
mux.HandleFunc("DELETE /api/users/{id}", deleteUser)

// Extract path params
func getUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    // ...
}
```

---

## Middleware Pattern

Middleware wraps a handler and returns a handler:

```go
func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        slog.Info("request", "method", r.Method, "path", r.URL.Path, "duration", time.Since(start))
    })
}

func auth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if !isValid(token) {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
        next.ServeHTTP(w, r)
    })
}

// Chain: logging → auth → handler
handler := logging(auth(mux))
```

---

## JSON Quick Reference

| Operation | Code |
|---|---|
| Struct → JSON bytes | `json.Marshal(v)` |
| JSON bytes → struct | `json.Unmarshal(data, &v)` |
| Write JSON to response | `json.NewEncoder(w).Encode(v)` |
| Read JSON from request | `json.NewDecoder(r.Body).Decode(&v)` |
| Omit zero-value field | Tag: `json:",omitempty"` |
| Rename field | Tag: `json:"field_name"` |
| Ignore field | Tag: `json:"-"` |

```go
func createUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid JSON", http.StatusBadRequest)
        return
    }

    user, err := svc.CreateUser(r.Context(), req)
    if err != nil {
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}
```

---

## Anti-patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Not closing `resp.Body` on HTTP client calls | Resource leak | `defer resp.Body.Close()` after nil-error check |
| Writing after `http.Error` | Double write, corrupted response | `return` after `http.Error(w, ...)` |
| Panic in handlers without recover | Server crashes on one bad request | Add recover middleware |
| Global default mux | No middleware control, test pollution | Create `http.NewServeMux()` explicitly |
| Unbounded request body | DoS vector | `http.MaxBytesReader(w, r.Body, maxBytes)` |

---

## Read On Demand

| Read When | File |
|---|---|
| ServeMux patterns, middleware composition, graceful shutdown, timeouts | [HTTP Server](references/http-server.md) |
| encoding/json details, XML, html/template patterns | [JSON & Templates](references/json-templates.md) |
