# curl Smoke Test Reference

Use when Hurl isn't installable in the target environment, or the check is simple enough that
a declarative `.hurl` file would be overkill. Requires only `curl` and `jq` (both preinstalled
on virtually every CI image).

---

## Template — `smoke-tests/smoke.sh`

```bash
#!/usr/bin/env bash
#
# Smoke Tests — Critical Path Validation (curl + jq)
#
# Run with: BASE_URL=https://staging.example.com bash smoke-tests/smoke.sh
set -euo pipefail

BASE_URL="${BASE_URL:?BASE_URL env var required}"
TEST_EMAIL="${TEST_EMAIL:-smoke@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:?TEST_PASSWORD env var required}"

pass=0
fail=0

check() {
  local name="$1"
  if "${@:2}"; then
    echo "PASS: $name"
    pass=$((pass + 1))
  else
    echo "FAIL: $name"
    fail=$((fail + 1))
  fi
}

# ===== Health check =====

health_ok() {
  curl --fail --silent --show-error --max-time 10 "$BASE_URL/health" \
    | jq -e '.status == "ok"' > /dev/null
}
check "health check returns ok" health_ok

# ===== Auth =====

TOKEN=""
login_ok() {
  local payload response
  # Build JSON with jq -n rather than string interpolation — a raw "${VAR}" inside a
  # hand-built JSON string lets a password/email containing a quote or backslash break
  # out of the string and inject arbitrary fields into the request body.
  payload=$(jq -n --arg email "$TEST_EMAIL" --arg pw "$TEST_PASSWORD" \
    '{email: $email, password: $pw}')
  response=$(curl --fail --silent --show-error --max-time 10 -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$payload") || return 1
  TOKEN=$(echo "$response" | jq -r '.token // empty')
  if [[ -z "$TOKEN" ]]; then
    echo "  (login response did not contain a token — endpoint may have returned an error page)" >&2
    return 1
  fi
}
check "login returns a token" login_ok

me_ok() {
  curl --fail --silent --show-error --max-time 10 "$BASE_URL/me" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -e --arg email "$TEST_EMAIL" '.email == $email' > /dev/null
}
check "authenticated /me returns expected email" me_ok

# ===== Critical resource CRUD =====

RESOURCE_ID=""
create_ok() {
  local response
  response=$(curl --fail --silent --show-error --max-time 10 -X POST "$BASE_URL/resources" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Smoke Resource"}')
  RESOURCE_ID=$(echo "$response" | jq -r '.id // empty')
  [[ -n "$RESOURCE_ID" ]]
}
check "create resource returns an id" create_ok

read_ok() {
  curl --fail --silent --show-error --max-time 10 "$BASE_URL/resources/$RESOURCE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -e '.name == "Smoke Resource"' > /dev/null
}
check "read created resource" read_ok

list_ok() {
  curl --fail --silent --show-error --max-time 10 "$BASE_URL/resources" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -e 'type == "array"' > /dev/null
}
check "list resources returns an array" list_ok

# ===== Error path =====

not_found_ok() {
  local status
  status=$(curl --silent --max-time 10 --output /dev/null --write-out "%{http_code}" \
    "$BASE_URL/resources/does-not-exist")
  [[ "$status" == "404" ]]
}
check "unknown resource returns 404" not_found_ok

# ===== Summary =====

echo "----"
echo "$pass passed, $fail failed"
[[ "$fail" -eq 0 ]]
```

Make it executable and run:

```bash
chmod +x smoke-tests/smoke.sh
BASE_URL=https://staging.example.com TEST_PASSWORD=$SMOKE_PW bash smoke-tests/smoke.sh
```

---

## One-liners for trivial checks

```bash
# Status code only
[[ "$(curl -s -o /dev/null -w '%{http_code}' $BASE_URL/health)" == "200" ]]

# Fail the shell (and CI step) on non-2xx automatically
curl --fail --silent --show-error "$BASE_URL/health" > /dev/null

# Single JSON field check
curl -s "$BASE_URL/health" | jq -e '.status == "ok"' > /dev/null
```

---

## Patterns & Pitfalls

### Good: One assertion per check function, broad path

```bash
payment_ok() {
  curl --fail --silent --show-error -X POST "$BASE_URL/payments" \
    -H "Content-Type: application/json" \
    -d '{"amount":100}' \
    | jq -e '.success == true' > /dev/null
}
check "payment succeeds" payment_ok
# Don't assert audit logs, internal state, or DB rows
```

### Bad: One check function doing unrelated assertions

```bash
payment_ok() {
  local response
  response=$(curl -s -X POST "$BASE_URL/payments" -d '{"amount":100}')
  echo "$response" | jq -e '.success == true' > /dev/null &&
  echo "$response" | jq -e '.invoiceId == 42' > /dev/null &&        # hardcoded ID breaks on clean DB
  echo "$response" | jq -e '.auditLog[0].action == "charge"' > /dev/null &&  # testing internals
  echo "$response" | jq -e '.notification.sentAt' > /dev/null       # unrelated concern
}
```

---

## CI Integration (GitHub Actions)

```yaml
- name: Run Smoke Tests
  id: smoke
  env:
    BASE_URL: ${{ env.DEPLOY_URL }}
    TEST_EMAIL: ${{ secrets.SMOKE_EMAIL }}
    TEST_PASSWORD: ${{ secrets.SMOKE_PASSWORD }}
  run: bash smoke-tests/smoke.sh

- name: Run Full Test Suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

No install step needed — `curl` and `jq` ship on `ubuntu-latest` runners by default.

---

## Flaky Test Debugging

1. Isolate a single check by commenting out the others temporarily
2. Check timing — add `sleep 1` between requests if a race condition is suspected
3. If inherently flaky (external service), move to integration suite, not smoke
4. Only if the target is a sandboxed/non-production environment: run with
   `bash -x smoke-tests/smoke.sh` for a full trace, or temporarily add
   `echo "$response" | jq .` to inspect a raw body. **Never do this against an
   environment with real credentials or real tokens in scope** — `-x` and raw-body
   dumps will print `TEST_PASSWORD` and captured bearer tokens straight into the
   terminal or CI log.

---

## Security Notes

- **Never build JSON with string interpolation** (e.g. `"{\"password\":\"$VAR\"}"`).
  A value containing `"`, `\`, or a newline can break out of the string and inject
  extra fields into the request. Always build payloads with `jq -n --arg ... '{...}'`
  as in `login_ok` above.
- **Avoid putting secrets on the command line.** Anything passed as a `curl`/`hurl`
  argument (e.g. `--variable smoke_pw=$SMOKE_PW`) is visible to other processes on
  the same host via `ps`/`/proc` and often ends up echoed in CI logs. Prefer
  environment variables read inside the script (as this template does) or a
  `--variables-file` written from a secret, over `--variable key=$SECRET` on the CLI.
- **Never use `--insecure` / `-k`.** Disabling TLS verification to work around a
  self-signed staging cert defeats the point of testing over HTTPS. Fix the cert
  (proper CA, mkcert, etc.) or point `curl`/`hurl` at a CA bundle with `--cacert`.
- **Set a timeout on every request** (`--max-time`, as used throughout this file).
  Without one, a hung backend can make the smoke suite — and the CI gate behind
  it — hang indefinitely instead of failing fast.
- **Treat `TEST_PASSWORD` and any captured tokens as secrets end-to-end.** Don't log
  full response bodies unconditionally, and scope smoke-test credentials to a
  dedicated low-privilege test account, never a real user or admin account.

---

## When to reach for Hurl instead

If the flow grows past 2–3 chained requests, or assertions get numerous, the shell script
gets noisy fast — `references/hurl.md` gives the same coverage declaratively with captures,
JSONPath asserts, and built-in HTML/JUnit reports.
