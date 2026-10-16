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
