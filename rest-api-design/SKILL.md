---
name: rest-api-design
description: >
  REST API design best practices — URI naming, HTTP verbs/status codes, pagination,
  filtering, error envelopes, versioning, security. Based on Octo's API design guide
  with modern updates.

  TRIGGER when: designing REST API, designing endpoint, API design review, URL design,
  resource naming, HTTP verb choice, status code choice, pagination strategy, cursor vs
  page pagination, error format, response envelope, API versioning, REST conventions,
  RESTful, "/users vs /user", PATCH vs PUT, 201 vs 200, 400 vs 422, idempotency key,
  rate limiting headers, expand/include parameter, HATEOAS, OAuth2, reviewing
  routes/controllers/handlers.

  DO NOT USE when: GraphQL, gRPC, WebSocket, or RPC-style APIs; pure backend logic
  unrelated to HTTP surface; OpenAPI/Swagger tooling questions only (use generic tools).
---

# REST API Design

API designed for the developer-client. KISS, standard vocabulary, predictable shapes — expose what clients need, not the internal data model.

## Workflow

1. Identify resources — nouns, plural, ≤2 levels of nesting
2. Map operations to HTTP verbs + status codes (table below)
3. Define pagination / filter / error envelope / auth **upfront**, not retrofitted
4. Document with copy-paste-ready `curl` examples per endpoint

## URI Rules

| Rule                     | Do                                                  | Don't                              |
| ------------------------ | --------------------------------------------------- | ---------------------------------- |
| Nouns, plural everywhere | `GET /v1/users/007`                                 | `getUser(007)`, `/v1/user/007`     |
| Versioning in path       | `/v1/orders`                                        | header-only or no version          |
| Nesting depth            | max 2: `/users/42/orders`                           | `/users/42/orders/7/items/3`       |
| Case consistency         | pick `snake_case` or `spinal-case`, stay consistent | mixed per endpoint                 |
| Action endpoints         | rare, scoped: `POST /carts/7/commit`                | `POST /createCart`, `GET /getUser` |

Domain segregation: `api.example.com`, `oauth2.example.com`, `developers.example.com`, plus `.sandbox.` mirror.

## HTTP Verbs ↔ CRUD

| Verb     | On collection                | On instance    | Idempotent | Notes                          |
| -------- | ---------------------------- | -------------- | ---------- | ------------------------------ |
| `GET`    | list                         | read           | yes        | safe                           |
| `POST`   | create → `201` + `Location:` | —              | no         | also for non-resource actions  |
| `PUT`    | —                            | full replace   | yes        | unspecified fields **cleared** |
| `PATCH`  | —                            | partial update | no         | preferred for partial          |
| `DELETE` | —                            | delete → `204` | yes        |                                |

```
POST /v1/clients/007/orders
< 201 Created
< Location: https://api.example.com/v1/clients/007/orders/1234
```

## Status Codes

**Success** — `200` OK · `201` Created (+`Location:`) · `202` Accepted (async) · `204` No Content (DELETE) · `206` Partial Content (paginated)

**Client error** — `400` Bad Request · `401` Unauthorized (no/invalid creds) · `403` Forbidden (authenticated but not allowed) · `404` Not Found · `405` Method Not Allowed · `406` Not Acceptable (content negotiation) · `409` Conflict (state) · `422` Unprocessable Entity (validation) · `429` Too Many Requests

**Server error** — `500` Internal · `502` Bad Gateway · `503` Service Unavailable

**`400` vs `422`** — `422` = format/schema/type wrong (Pydantic/validator failure). `400` = format valid but operation illegal (cancel an already-shipped order, transfer more than balance). Different signals to the client; don't conflate.

## Read on demand

| Read when                                                               | Reference                                                                |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Choosing consistent success and error envelopes                         | [Response shapes](references/response-shapes.md)                         |
| Designing pagination, filters, expansions, partial responses or HATEOAS | [Collections and navigation](references/collections-and-navigation.md)   |
| Implementing idempotency, rate limiting or content negotiation          | [Reliability and negotiation](references/reliability-and-negotiation.md) |

## Cross-endpoint rules

- Pick bare or wrapped responses and one error shape project-wide; include machine-readable errors, a human message and field-level validation details.
- Paginate lists from day one. Prefer opaque cursors for large mutable feeds; fetch `limit + 1` to detect another page. Page-based pagination suits small/admin datasets requiring random-page access.
- Whitelist filter, sort and expand fields server-side; eager-load expansions to avoid N+1 queries and accidental data exposure.
- Use `Idempotency-Key` for state-changing side effects. Replay the same response; cache 2xx and 4xx, allow retries on 5xx. See the reference for method scope, headers and TTL.
- Expose rate-limit headers on every response; reject excess requests with `429` and `Retry-After`.
- Honor `Accept` preference order; return `406` when no supported format matches. Default to JSON; use XML only when required.

## Example: create and replay a payment

```http
POST /v1/payments
Idempotency-Key: 8b2f7e6c-example
Content-Type: application/json

{ "amount": 4200, "currency": "EUR" }
```

Return `201 Created` plus `Location` for creation; a replay returns the same body with `X-Idempotent-Replayed: true`. Use `422` for schema/type failure, `400` for a valid request that exceeds the balance, and `409` for conflicting resource state. Keep the error shape consistent across all three.

## Security

- **OAuth2 + HTTPS everywhere** — no OAuth1, no plain HTTP for auth or API.
- **Bearer JWT** for stateless services; **OIDC** when identity claims needed.
- **Scopes per endpoint** — least privilege; document required scope in API reference.
- Validate tokens; rotate signing keys; never log tokens.

## Review / Pre-Launch Checklist

Run before any endpoint ships. Tier = severity if violated.

| Tier        | Check                                                                                                                                                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Blocker** | Missing/broken auth; plain HTTP for auth or API; wrong verb (`PUT` for partial — clears unspecified fields); 2xx returned on error; no input validation; no `Idempotency-Key` on state-changing side-effect endpoints (payments, orders, sends)                                                                     |
| **Blocker** | Status codes correct: `201` create (+`Location:`), `204` delete, `409` conflict, `422` validation, `400` illegal-but-valid op                                                                                                                                                                                       |
| **Concern** | Inconsistent case; ad-hoc/HTML error shape that varies per endpoint; missing pagination headers; list endpoints not paginated from day one (adding later = breaking); no version in path; nesting > 2 levels; missing rate-limit headers + `429`/`Retry-After`; free-form sort/filter without server-side whitelist |
| **Concern** | Response shape not consistent project-wide (bare or wrapped — never mixed); deprecation policy undocumented (≤2 versions parallel, ≥6 month sunset)                                                                                                                                                                 |
| **Concern** | Errors lack machine-readable `error_code` + human message; validation errors lack field-level detail                                                                                                                                                                                                                |
| **Nit**     | Singular noun for instance (`/user/7` beside `/users` — pick plural); missing `Location:` on `201`; no `X-RateLimit-*` exposed; missing `curl` example / OpenAPI 3.x spec in docs                                                                                                                                   |
| **Smell**   | Frequent verbs in URLs (`/getUsers`, `/createOrder`) ⇒ you have **RPC**, not REST — revisit; `?page=2&size=20` without standardized headers is OK but document; JSONP is deprecated — use CORS                                                                                                                      |

## References

- [Octo blog — Designer une API REST](https://blog.octo.com/designer-une-api-rest)
- Anas Issath — API Design Patterns I Stole From Companies Like Stripe and GitHub (envelope, cursor `limit+1`, expand, idempotency-key, rate-limit headers)
- [Stripe API reference](https://stripe.com/docs/api) — cursor pagination, idempotency, expand
- RFC 6749 (OAuth 2.0), RFC 5988 (Link header), RFC 7807 (Problem Details), RFC 3986 (URIs)
- [interagent/http-api-design](https://github.com/interagent/http-api-design)

---

## Benchmark

Scenario: `.benchmarks/scenarios/rest-api-001-status-code.md` · Run: 2026-06-14

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 40%     | 100% | +60%  |
| claude-sonnet-4-6 | 40%     | 60%  | +20%  |
| claude-haiku-4-5  | 40%     | 60%  | +20%  |

> **PASS.** Flips the core 400-vs-422 call on all 3 models (every baseline wrongly chose 422). Weaker models under-apply secondary idempotency/409 guidance — candidate for higher salience. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

2026-10-14: detailed endpoint guidance moved into linked references; these historical scores have not been rerun against the new layout.
