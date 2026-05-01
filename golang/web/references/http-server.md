# HTTP Server

## Basic Server Setup

```go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /health", healthHandler)
    mux.HandleFunc("GET /api/users/{id}", getUserHandler)

    srv := &http.Server{
        Addr:         ":8080",
        Handler:      mux,
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  120 * time.Second,
    }

    log.Printf("listening on %s", srv.Addr)
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatal(err)
    }
}
```

Always set timeouts — the zero-value `http.Server` has no timeouts, leaving connections open indefinitely.

---

## Graceful Shutdown

```go
func main() {
    srv := &http.Server{Addr: ":8080", Handler: mux}

    // Start server in goroutine
    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("shutting down...")

    // Give active connections time to finish
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("forced shutdown: %v", err)
    }

    log.Println("server stopped")
}
```

`srv.Shutdown` stops accepting new connections and waits for active ones to complete.

---

## Middleware Composition

### Manual Chaining

```go
handler := logging(recovery(cors(auth(mux))))
```

### Chain Helper

```go
func chain(h http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        h = middlewares[i](h)
    }
    return h
}

handler := chain(mux, logging, recovery, cors, auth)
```

### Common Middleware

**Recovery:**
```go
func recovery(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                slog.Error("panic recovered", "error", rec, "stack", string(debug.Stack()))
                http.Error(w, "internal server error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

**CORS:**
```go
func cors(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

**Request ID:**
```go
func requestID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := uuid.New().String()
        ctx := context.WithValue(r.Context(), requestIDKey, id)
        w.Header().Set("X-Request-ID", id)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

---

## HTTP Client Best Practices

```go
client := &http.Client{
    Timeout: 10 * time.Second,
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
    },
}

// Reuse the client — do not create per request
req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
if err != nil {
    return err
}
req.Header.Set("Accept", "application/json")

resp, err := client.Do(req)
if err != nil {
    return fmt.Errorf("requesting %s: %w", url, err)
}
defer resp.Body.Close()

if resp.StatusCode != http.StatusOK {
    body, _ := io.ReadAll(resp.Body)
    return fmt.Errorf("unexpected status %d: %s", resp.StatusCode, body)
}

var result Result
if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
    return fmt.Errorf("decoding response: %w", err)
}
```

**Rules:**
- Always use `context` variant: `http.NewRequestWithContext`
- Always close `resp.Body` (even on error status codes)
- Always set a `Timeout` on the client
- Reuse `http.Client` — it pools connections internally

---

## Testing HTTP Handlers

### Unit Test with Recorder

```go
func TestGetUser(t *testing.T) {
    store := &FakeUserStore{
        users: map[string]User{"123": {Name: "Alice"}},
    }
    handler := NewUserHandler(store)

    req := httptest.NewRequest(http.MethodGet, "/api/users/123", nil)
    req.SetPathValue("id", "123")
    w := httptest.NewRecorder()

    handler.GetUser(w, req)

    res := w.Result()
    defer res.Body.Close()

    require.Equal(t, http.StatusOK, res.StatusCode)

    var user User
    json.NewDecoder(res.Body).Decode(&user)
    assert.Equal(t, "Alice", user.Name)
}
```

### Integration Test with Server

```go
func TestAPI(t *testing.T) {
    srv := httptest.NewServer(NewRouter(realDeps))
    defer srv.Close()

    resp, err := http.Get(srv.URL + "/api/users/123")
    require.NoError(t, err)
    defer resp.Body.Close()

    assert.Equal(t, http.StatusOK, resp.StatusCode)
}
```
