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

- [ ] Uses `strpos`/`stripos` with `($haystack, $needle)` argument order (haystack first) in every call
- [ ] Checks match results with strict comparisons (`!== false`, `=== 0`) — never loose truthiness on any function that can return `0` or `false` (`strpos`/`stripos`, `preg_match`, `array_search`)
- [ ] Distinguishes `array_search`/`in_array` returning key `0`/`true` on a legitimate first-element match from a miss (strict comparison, and passes `true` for the `$strict` parameter where types matter)
- [ ] Handles `json_decode`'s null ambiguity via `json_last_error()`/`json_last_error_msg()` or `JSON_THROW_ON_ERROR` — not a bare `$data === null` check alone
- [ ] Distinguishes `preg_match` returning `false` (PCRE error) from `0` (no match) via a strict check or any approach that cannot conflate the two
- [ ] Names php.net (URL or explicit reference tied to the specific functions in question) as the verification source for signature/return-behavior claims — not Stack Overflow/w3schools; a generic "see php.net" line disconnected from the claims does not count
