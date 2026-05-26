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

| Rule | Do | Don't |
|---|---|---|
| Nouns, plural everywhere | `GET /v1/users/007` | `getUser(007)`, `/v1/user/007` |
| Versioning in path | `/v1/orders` | header-only or no version |
| Nesting depth | max 2: `/users/42/orders` | `/users/42/orders/7/items/3` |
| Case consistency | pick `snake_case` or `spinal-case`, stay consistent | mixed per endpoint |
| Action endpoints | rare, scoped: `POST /carts/7/commit` | `POST /createCart`, `GET /getUser` |

Domain segregation: `api.example.com`, `oauth2.example.com`, `developers.example.com`, plus `.sandbox.` mirror.

## HTTP Verbs ↔ CRUD

| Verb | On collection | On instance | Idempotent | Notes |
|---|---|---|---|---|
| `GET` | list | read | yes | safe |
| `POST` | create → `201` + `Location:` | — | no | also for non-resource actions |
| `PUT` | — | full replace | yes | unspecified fields **cleared** |
| `PATCH` | — | partial update | no | preferred for partial |
| `DELETE` | — | delete → `204` | yes | |

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

## Response Envelope (optional)

Two stylistic choices — pick one project-wide:

**Bare** (HTTP-native, Octo): return the resource directly. Status code + headers carry meta. `200 OK` body = `{"id": 7, ...}`. Errors use a separate envelope (below).

**Wrapped** (Stripe/GitHub-flavored): every response — success or error — wears the same shell:
```json
// success
{ "success": true, "data": {...}, "pagination": {...} }
// error
{ "success": false, "error_code": "NOT_FOUND", "message": "...", "details": null }
```
Tradeoff: wrapped is friendlier to one generic client handler; bare is leaner and reuses HTTP semantics. **Don't mix.** Consistency across the whole API is the point.

## Error Envelope

Pick one shape, apply across the **whole** API.

**OAuth2-style** (Octo recommendation, reuses OAuth2 spec):
```json
{
  "error": "invalid_request",
  "error_description": "There is no 'payed' property on users.",
  "error_uri": "https://developers.example.com/errors/invalid_request"
}
```

**RFC 7807 Problem Details** (modern alternative, `Content-Type: application/problem+json`):
```json
{
  "type": "https://example.com/probs/out-of-credit",
  "title": "You do not have enough credit.",
  "status": 403,
  "detail": "Your balance is 30, but charge was 50.",
  "instance": "/account/12345/msgs/abc"
}
```

## Pagination

**HTTP Range semantics** (Octo, reuses HTTP):
```
GET /v1/restaurants?range=0-24
< 206 Partial Content
< Content-Range: 0-24/48
< Accept-Range: restaurant 50
< Link: <https://api.example.com/v1/restaurants?range=25-49>; rel="next",
        <https://api.example.com/v1/restaurants?range=0-24>; rel="first",
        <https://api.example.com/v1/restaurants?range=25-47>; rel="last"
```
- `400 Bad Request` if range exceeds `Accept-Range` max.
- Navigation links use **RFC 5988** `Link:` header.

**Cursor pagination** (Stripe-style, prefer for large/mutable/streaming sets):
```
GET /v1/events?limit=25&after=evt_abc123
< 200 OK
< {"data":[...], "has_more": true, "next_cursor": "evt_xyz789"}
```
- **Opaque cursor**: base64-encode the position key (e.g. `{id, created_at}`). Clients pass it back blindly — you can change the encoding later without breaking them.
- **`limit + 1` trick**: fetch `limit + 1` rows; if you got the extra, set `has_more: true` and slice it off. Avoids a separate `COUNT(*)` on the full table.
- Tradeoff: avoids skip-cost and shifting-offset duplicates; loses random-page access ("go to page 7").

**When**: page-based for admin panels / small datasets / "go to page N" UIs. Cursor for feeds, timelines, infinite scroll, high-volume, mutable.

## Filter, Sort, Search

```
GET /v1/restaurants?type=thai,japanese&rating=4,5      # filter (CSV multi-value)
GET /v1/restaurants?sort=rating,name&desc=rating       # Octo: asc default; mark desc fields
GET /v1/restaurants?sort=-rating,name                  # Stripe/GitHub: -prefix = desc (more common)
GET /v1/orders?min_total=10&max_total=500              # range filters: min_/max_ prefix
GET /v1/orders?created_after=2026-01-01                # date filters: _after/_before suffix
GET /v1/restaurants/search?name=la*&zipcode=75*        # scoped search (wildcards)
GET /v1/search?q=running+paid                          # global search
```

**Whitelist sortable + filterable fields server-side.** Free-form `?sort=<anything>` exposes you to surprise `ORDER BY` on unindexed columns and JOIN explosions. Same for `?filter=`.

## Expand / Include (related resources)

Let clients pull nested data in one call instead of N round-trips:
```
GET /v1/orders/123                          # order only
GET /v1/orders/123?expand=customer,items    # order + nested customer + items
```
- **Whitelist allowed expansions** (set intersection). Blocks random JOIN chains and accidental data exposure.
- Eager-load on the server (`JOIN` / `selectinload`); never N+1 inside a loop.
- Pattern from Stripe, Shopify. Clients control payload size — mobile gets the lean version, dashboard the full version, same endpoint.

## Partial Responses

Google syntax — let clients shrink payloads:
```
GET /v1/clients/007?fields=firstname,name,address(street)
```

## HATEOAS

Make resources discoverable. Pick one approach project-wide.

**RFC 5988 `Link:` header** (preferred — no body coupling):
```
GET /v1/clients/007
< 200 OK
< {"id":"007", "firstname":"James"}
< Link: <https://api.example.com/v1/addresses/42>; rel="addresses"; method="GET",
        <https://api.example.com/v1/orders/1234>; rel="orders"; method="GET"
```

**Embedded JSON** (PayPal-style):
```json
"_links": [
  {"href": "...", "rel": "self", "method": "GET"},
  {"href": "...", "rel": "approval_url", "method": "REDIRECT"}
]
```

## Security

- **OAuth2 + HTTPS everywhere** — no OAuth1, no plain HTTP for auth or API.
- **Bearer JWT** for stateless services; **OIDC** when identity claims needed.
- **Scopes per endpoint** — least privilege; document required scope in API reference.
- Validate tokens; rotate signing keys; never log tokens.

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

## Anti-Patterns

- Verbs in URLs: `/getUsers`, `/createOrder`, `/updateUser`
- Singular for instance + plural for collection (`/user/7` next to `/users`) — pick plural, stay
- `PUT` for partial update (it clears unspecified fields)
- `POST` create returning `200` without `Location:` header
- HTML error bodies, or error shape that varies per endpoint
- Nesting > 2 levels — flatten or move to query params
- JSONP — deprecated; use CORS
- Custom `?page=2&size=20` without standardized response headers — OK but document
- Frequent verbs in URLs ⇒ you have **RPC**, not REST — revisit design

## Review Checklist

| Tier | Examples |
|---|---|
| **Blocker** | Missing/broken auth, wrong verb (PUT for partial), 2xx returned on error, plain HTTP for auth, no input validation, no idempotency on payment/order create |
| **Concern** | Inconsistent case, ad-hoc error shape, missing pagination headers, no version in path, deep nesting, no rate-limit headers, free-form sort/filter without whitelist |
| **Nit** | Singular noun for instance, missing `Location:` on `201`, missing `curl` example in docs, no `X-RateLimit-*` exposed |

## Pre-Launch Checklist

Run before any endpoint ships:

- [ ] Response shape consistent (bare or wrapped — same across every endpoint)
- [ ] List endpoints paginated from day one (adding pagination later = breaking change)
- [ ] Filter / sort params validated and **whitelisted**
- [ ] Errors return machine-readable `error_code` + human-readable message; validation errors include field-level detail
- [ ] Status codes correct: `201` create, `204` delete, `409` conflict, `422` validation, `400` illegal op
- [ ] Rate-limit headers on every response; `429` + `Retry-After` when exceeded
- [ ] Idempotency-Key supported on every state-changing endpoint with side effects (payments, orders, sends)
- [ ] Version in path; deprecation policy documented (≤2 versions parallel, ≥6 month sunset)
- [ ] `curl` example per endpoint in docs; OpenAPI 3.x spec generated

## Modern Notes (diverge from 2014 source)

- JSON-only is fine — drop the XML-mandatory stance.
- JSONP is deprecated — CORS only.
- RFC 7807 Problem Details is an acceptable alternative to the OAuth2 error envelope.
- Cursor pagination acceptable (often preferred) for high-volume / mutable datasets.
- Document the API with **OpenAPI 3.x**; generate client SDKs from the spec.
- Idempotency keys (`Idempotency-Key:` header) for non-idempotent ops (`POST` payment) — Stripe pattern.

## References

- [Octo blog — Designer une API REST](https://blog.octo.com/designer-une-api-rest)
- [Anas Issath — API Design Patterns I Stole From Companies Like Stripe and GitHub](https://medium.com/gitconnected) (envelope, cursor `limit+1`, expand, idempotency-key, rate-limit headers)
- [Stripe API reference](https://stripe.com/docs/api) — cursor pagination, idempotency, expand
- RFC 6749 (OAuth 2.0), RFC 5988 (Link header), RFC 7807 (Problem Details), RFC 3986 (URIs)
- [interagent/http-api-design](https://github.com/interagent/http-api-design)
