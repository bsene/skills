# Hurl Smoke Test Reference

Hurl runs HTTP requests defined in plain `.hurl` files. One file = one scenario. No runtime needed beyond the `hurl` binary.

---

## File Anatomy

```hurl
# Comment
METHOD url
[Headers]
header-name: value

[Body]
```json
{ "key": "value" }
```

HTTP expected-status
[Asserts]
jsonpath "$.field" == "value"
```

---

## Template — Critical Path Smoke Suite

### `health.hurl`

```hurl
GET {{base_url}}/health
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
```

### `auth.hurl`

```hurl
# Login — capture token for downstream requests
POST {{base_url}}/auth/login
Content-Type: application/json
```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```
HTTP 200
[Captures]
token: jsonpath "$.token"
[Asserts]
jsonpath "$.token" isString

# Authenticated request using captured token
GET {{base_url}}/me
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.email" == "{{test_email}}"
```

### `crud.hurl`

```hurl
# Create
POST {{base_url}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json
```json
{ "name": "Smoke Resource" }
```
HTTP 201
[Captures]
resource_id: jsonpath "$.id"
[Asserts]
jsonpath "$.name" == "Smoke Resource"

# Read
GET {{base_url}}/resources/{{resource_id}}
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.id" == {{resource_id}}

# List
GET {{base_url}}/resources
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$" isCollection
```

### `errors.hurl`

```hurl
# Unknown resource → 404
GET {{base_url}}/resources/does-not-exist
HTTP 404
[Asserts]
jsonpath "$.error" isString

# Bad auth → 401
GET {{base_url}}/me
HTTP 401
```

---

## Variables

```bash
# Inline
hurl --variable base_url=http://localhost:3000 --variable token=abc123 smoke.hurl

# File (one KEY=VALUE per line)
hurl --variables-file smoke-tests/vars.env smoke-tests/*.hurl
```

`vars.env`:
```
base_url=http://localhost:3000
test_email=smoke@example.com
# placeholder — inject the real value via a CI secret at runtime, never commit an
# actual password. Use a dedicated low-privilege smoke-test account, not a real user.
test_password=password123
```

---

## Run Commands

```bash
# Run all .hurl files as test suite
hurl --test --max-time 10 smoke-tests/*.hurl

# With variables file — prefer this over --variable key=$SECRET for anything
# sensitive; CLI args are visible to other processes via ps/proc and often get
# echoed into CI logs, whereas a variables file written from a secret is not.
hurl --test --max-time 10 --variables-file smoke-tests/vars.env smoke-tests/*.hurl

# HTML report
hurl --test --max-time 10 --variables-file smoke-tests/vars.env --report-html report/ smoke-tests/*.hurl

# Verbose — shows request/response for debugging. Only run against a sandboxed/
# non-production target: verbose output includes captured tokens and secrets.
hurl --test --verbose smoke-tests/health.hurl

# Very verbose — includes full headers + body. Same caution as above, doubly so.
hurl --test --very-verbose smoke-tests/auth.hurl
```

---

## CI Integration (GitHub Actions)

```yaml
- name: Install Hurl
  # Pin an exact version and verify its checksum — piping install.sh straight from
  # the web (curl | bash with no pin/verification) means a compromised or hijacked
  # hurl.dev serves arbitrary code with your CI job's permissions and secrets.
  run: |
    HURL_VERSION=4.3.0
    curl -LO https://github.com/Orange-OpenSource/hurl/releases/download/${HURL_VERSION}/hurl_${HURL_VERSION}_amd64.deb
    echo "<pin-expected-sha256-here>  hurl_${HURL_VERSION}_amd64.deb" | sha256sum -c -
    sudo dpkg -i hurl_${HURL_VERSION}_amd64.deb

- name: Run Smoke Tests
  id: smoke
  env:
    # Pass secrets as env vars, not interpolated into the command string — CLI args
    # are visible to other processes on the runner via ps/proc and are more likely
    # to leak into logs than an env var referenced inside the run script.
    APP_URL: ${{ env.DEPLOY_URL }}
    SMOKE_EMAIL: ${{ secrets.SMOKE_EMAIL }}
    SMOKE_PASSWORD: ${{ secrets.SMOKE_PASSWORD }}
  run: |
    hurl --test --max-time 10 \
      --variable base_url="$APP_URL" \
      --variable test_email="$SMOKE_EMAIL" \
      --variable test_password="$SMOKE_PASSWORD" \
      smoke-tests/*.hurl

- name: Run Full Test Suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

---

## Patterns & Pitfalls

### Good: Single assertion, broad path

```hurl
POST {{base_url}}/payments
Content-Type: application/json
```json
{ "amount": 100 }
```
HTTP 200
[Asserts]
jsonpath "$.success" == true
# Don't assert audit logs, internal state, or DB rows
```

### Bad: Multiple unrelated assertions, brittle IDs

```hurl
POST {{base_url}}/payments
HTTP 200
[Asserts]
jsonpath "$.success" == true
jsonpath "$.invoiceId" == 42          # hardcoded ID breaks on clean DB
jsonpath "$.auditLog[0].action" == "charge"  # testing internals
jsonpath "$.notification.sentAt" isString    # unrelated concern
```

---

## Flaky Test Debugging

1. Run single file: `hurl --test --verbose smoke-tests/auth.hurl`
2. Dump full traffic: `hurl --test --very-verbose smoke-tests/auth.hurl`
3. Check timing — use `[Options] delay: 500` between entries if race condition suspected
4. If inherently flaky (external service), move to integration suite, not smoke
