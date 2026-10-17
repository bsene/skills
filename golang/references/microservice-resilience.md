# Microservice Resilience and Operations

Source: _Building Microservices with Go_. Complements `web/` (HTTP server, graceful shutdown) and `concurrency/`. Use the standard library first; add libraries (go-kit, gobreaker) only when the pattern is non-trivial.

## Outbound calls checklist

| Concern          | Rule                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Timeouts         | Never use `http.DefaultClient`; set `Client.Timeout` and pass `ctx` to every request               |
| Connection reuse | One shared `http.Client`/`Transport`; drain and close `resp.Body` or the connection leaks          |
| Retries          | Only idempotent calls (GET, PUT, or POST with idempotency key); exponential backoff with jitter    |
| Retry budget     | Cap attempts and total time; stop on `ctx.Done()` and on non-retryable status (4xx except 408/429) |
| Circuit breaker  | Trip after N consecutive failures, fail fast while open, probe with one request in half-open       |
| Bulkhead         | Bounded concurrency per dependency (semaphore) so one slow service cannot exhaust all goroutines   |
| Fallback         | Cached or degraded response, decided per endpoint; never silent data loss                          |

Backoff with jitter:

```go
func Retry(ctx context.Context, attempts int, base time.Duration, op func() error) error {
    var err error
    for i := range attempts {
        if err = op(); err == nil {
            return nil
        }
        d := base << i
        d = d/2 + rand.N(d/2+1) // jitter avoids synchronized retry storms
        select {
        case <-time.After(d):
        case <-ctx.Done():
            return errors.Join(err, ctx.Err())
        }
    }
    return fmt.Errorf("after %d attempts: %w", attempts, err)
}
```

Minimal circuit breaker states: `closed -> open (after threshold) -> half-open (after cooldown) -> closed on success / open on failure`. Guard state with a mutex; expose state as a metric.

## API design

| Topic        | Guidance                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Versioning   | Version in the path (`/v1/`) or header; additive changes only within a version                 |
| Status codes | 400 validation, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, 429 throttled   |
| Error bodies | Stable machine code + human message + request ID; never leak internals or stack traces         |
| Idempotency  | Accept an `Idempotency-Key` on unsafe operations and store the result for replay               |
| Pagination   | Cursor-based for large or changing sets; include a limit cap                                   |
| Validation   | Decode with `DisallowUnknownFields` and `http.MaxBytesReader`; validate before touching the DB |
| RPC vs REST  | REST for public/resource APIs; gRPC for internal low-latency typed calls                       |

## Service discovery and load balancing

- Prefer the platform (Kubernetes DNS, service mesh) over in-process registries.
- Client-side balancing: round-robin or least-pending across healthy endpoints; refresh on a timer; remove endpoints that fail health checks.
- Register on startup and deregister on shutdown; handle `SIGTERM` by failing readiness first, then draining.

## Health, logging, metrics

| Signal    | Practice                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------- |
| Liveness  | `/healthz`: process is up; no dependency checks (avoids restart storms)                           |
| Readiness | `/readyz`: dependencies reachable and warm; return 503 while draining                             |
| Logging   | Structured `slog` JSON to stdout; one request ID per request propagated via `context` and headers |
| Metrics   | Request count, latency histogram, error rate per route; bounded label cardinality (no user IDs)   |
| Tracing   | Propagate trace context headers across calls (OpenTelemetry)                                      |
| Alerting  | Alert on symptoms (error rate, latency SLO), not causes (CPU)                                     |

Request-ID middleware:

```go
type ctxKey struct{}

func RequestID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := r.Header.Get("X-Request-ID")
        if id == "" {
            id = uuid.NewString()
        }
        w.Header().Set("X-Request-ID", id)
        next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ctxKey{}, id)))
    })
}
```

## Security

| Topic           | Guidance                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------- |
| Auth tokens     | Validate JWT signature, `exp`, `aud`, `iss`, and pin the algorithm; centralize in middleware |
| Transport       | TLS everywhere, including service-to-service; mTLS or mesh for zero-trust                    |
| Secrets         | From environment or secret manager, never in the image or repo                               |
| Input           | Treat every request and message as hostile; limit sizes, parameterize SQL                    |
| Least privilege | Per-service credentials and scopes; non-root, minimal (distroless/scratch) containers        |

## Testing services

| Level       | Approach                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------- |
| Unit        | Table tests on handlers with `httptest.NewRecorder`; fake dependencies via small interfaces |
| Contract    | Consumer-driven contracts (e.g. Pact) so provider changes cannot silently break callers     |
| Integration | Real DB/queue in containers (`testcontainers-go`) behind a build tag                        |
| Behavior    | Black-box tests against a running instance for critical flows                               |
| Performance | `go test -bench` for hot paths; load test the deployed service                              |

## Event-driven collaboration

| Pattern             | Guidance                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Events vs commands  | Event = past-tense fact (`OrderPlaced`), many consumers; command = request to one handler    |
| Delivery            | Assume at-least-once; consumers must be idempotent (dedupe on event ID)                      |
| Outbox              | Write state and event in one DB transaction, publish from the outbox; avoids dual-write loss |
| Poison messages     | Bounded retries then a dead-letter queue with alert                                          |
| Schema evolution    | Additive fields, versioned event types; never reuse a name for a different meaning           |
| Ubiquitous language | Name events and types with domain terms shared with the business (DDD)                       |

## Delivery

- Build static binaries (`CGO_ENABLED=0`), multi-stage Docker, pin base image digests.
- One process per container; config via env; log to stdout.
- Automate `go vet`, `go test -race ./...`, and image scan in CI; promote the same artifact through environments.
