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
