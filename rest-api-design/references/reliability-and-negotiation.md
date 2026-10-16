## Idempotency

For non-idempotent ops (`POST` payments, transfers, order creation), accept an `Idempotency-Key` request header. Cache the response keyed by it; replay returns the same body + `X-Idempotent-Replayed: true`.

```
POST /v1/payments
Idempotency-Key: 8b2f7e6c-...
{ "amount": 4200, "currency": "EUR" }

→ first call:  201 Created  + Location: ...
→ replay:      201 Created  + X-Idempotent-Replayed: true  (same body)
```

- TTL ~24h is the Stripe default.
- Apply only to state-changing methods: `POST`, `PUT`, `PATCH`. `GET`/`DELETE` are already idempotent.
- Cache 2xx **and** 4xx (not 5xx — let the client retry transient server errors).

## Rate Limiting

Return limit state in headers on every response; reject with `429` + `Retry-After` when exceeded.

```
< X-RateLimit-Limit:     1000
< X-RateLimit-Remaining: 42
< X-RateLimit-Reset:     1735689600   # epoch seconds

429 Too Many Requests
Retry-After: 30
{ "error": "rate_limited", "error_description": "Try again in 30s." }
```

## Content Negotiation

```
GET /v1/users
Accept: application/json
< 200 OK
< Content-Type: application/json
```

- Honor `Accept:` order; respond `406 Not Acceptable` if no supported format matches.
- JSON is the default. XML only if a client explicitly requires it (no longer mandatory).
