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
test_password=password123
```

---

## Run Commands

```bash
# Run all .hurl files as test suite
hurl --test smoke-tests/*.hurl

# With variables file
hurl --test --variables-file smoke-tests/vars.env smoke-tests/*.hurl

# HTML report
hurl --test --variables-file smoke-tests/vars.env --report-html report/ smoke-tests/*.hurl

# Verbose — shows request/response for debugging
hurl --test --verbose smoke-tests/health.hurl

# Very verbose — includes full headers + body
hurl --test --very-verbose smoke-tests/auth.hurl
```

---

## CI Integration (GitHub Actions)

```yaml
- name: Install Hurl
  run: curl -LsSf https://hurl.dev/install.sh | bash

- name: Run Smoke Tests
  id: smoke
  env:
    APP_URL: ${{ env.DEPLOY_URL }}
  run: |
    hurl --test \
      --variable base_url=$APP_URL \
      --variable test_email=${{ secrets.SMOKE_EMAIL }} \
      --variable test_password=${{ secrets.SMOKE_PASSWORD }} \
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
