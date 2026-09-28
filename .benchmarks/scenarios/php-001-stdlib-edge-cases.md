---
id: php-001-stdlib-edge-cases
skill: php
---

# Prompt

Write a PHP 8 utility `parse_webhook(array $headers, string $body): array` for a webhook endpoint. It must:

1. Find the value of the `X-Request-Id` header in `$headers` (an assoc array like `['Content-Type' => 'application/json', 'x-request-id' => 'abc123']`) case-insensitively — the key casing varies between clients.
2. Validate `$body` as JSON and decode it; on invalid JSON return `['error' => 'invalid_json']`.
3. Take the decoded `event` field (a string like `invoice.paid.v2`) and check whether it starts with `invoice.`; if so, extract the route pattern — everything up to and including the first dot-separated segment after `invoice` (e.g. `invoice.paid`).
4. Look up the extracted pattern in `KNOWN_ROUTES` (a defined constant: `['invoice.paid', 'invoice.void']`); return `['route' => <pattern>, 'request_id' => <id>]` when found, `['error' => 'unknown_route']` when not.

Explain briefly, in comments or prose, which return values you relied on for each check.

# Criteria

- [ ] Correctly detects the `invoice.` prefix at position zero; accepts `str_starts_with()` or equivalent. If `strpos`/`stripos` is used, every call has `($haystack, $needle)` argument order
- [ ] Does not confuse a valid zero position/key with a miss: uses strict comparisons for position/key results, or equivalent boolean-returning APIs that avoid this ambiguity
- [ ] Correctly accepts `invoice.paid` at `KNOWN_ROUTES` index `0` and rejects unknown routes without type coercion; accepts strict `array_search`/`in_array` or an equivalent exact-membership check
- [ ] Handles `json_decode`'s null ambiguity via `json_last_error()`/`json_last_error_msg()` or `JSON_THROW_ON_ERROR` — not a bare `$data === null` check alone
- [ ] Correctly extracts `invoice.paid` from `invoice.paid.v2`; accepts non-regex parsing. If `preg_match` is used, distinguishes `false` (PCRE error) from `0` (no match)
- [ ] Names php.net (URL or explicit reference tied to the specific functions in question) as the verification source for signature/return-behavior claims — not Stack Overflow/w3schools; a generic "see php.net" line disconnected from the claims does not count
