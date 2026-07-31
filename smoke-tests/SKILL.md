---
name: smoke-tests
description: >
  Smoke test identification, authoring, and CI integration for HTTP APIs — using Hurl or curl only.
  TRIGGER when: smoke test, smoke testing, critical path test, CI gate, gate before full suite,
  write smoke tests, add smoke test, smoke test template, which tests are smoke tests,
  hurl, .hurl file, curl smoke test.
  DO NOT USE when: user needs full testing strategy or philosophy — use `testing` instead.
---

# Smoke Tests

Minimal, rapid tests that validate critical user-facing functionality before slower suites run.
If smoke tests fail, the build is broken. Full suite doesn't run.
**Characteristics:** minimal setup · fast (seconds) · happy paths only · high signal-to-noise · HTTP only — no JS runtime, no test framework

**Scope:** this skill covers HTTP API smoke tests only, authored with **Hurl** or **curl**. No Jest, Vitest, or other in-process JS test runners — smoke tests here are black-box HTTP checks against a running app (local, staging, or preview).

---

## Identify Existing Smoke Tests

| Pattern | Detection |
|---------|-----------|
| `smoke-tests/` directory | Convention-based directory |
| `*.hurl` files | Hurl scenario files |
| `smoke.sh` / `smoke-test.sh` | curl-based shell script |
| `# @smoke` / `# @critical` comment | Grep for tag |

---

## Tool Selection

| Use Hurl | Use curl |
|----------|----------|
| Multi-step flows (capture token, chain requests) | Single request / quick one-off check |
| Need structured JSONPath assertions | Simplest possible CI dependency (curl is preinstalled almost everywhere) |
| Want a readable, declarative file per scenario | No appetite to install the `hurl` binary |
| Want built-in HTML/JUnit reports | Assertions are trivial (status code, one field) via `jq` |

Default to **Hurl** for anything beyond a single request — it's purpose-built for exactly this and stays declarative. Reach for **curl** (+ `jq` for JSON, plain shell for status checks) only when Hurl isn't installable in the target environment or the check is a one-liner.

---

## Run Commands

```bash
# Hurl — run all .hurl files as tests
hurl --test --max-time 10 smoke-tests/*.hurl

# Hurl — single file with variables
hurl --test --max-time 10 --variable base_url=http://localhost:3000 smoke-tests/health.hurl

# Hurl — variables file + HTML report
hurl --test --max-time 10 --variables-file smoke-tests/vars.env --report-html report/ smoke-tests/*.hurl

# curl — quick health check, fail on non-2xx
curl --fail --silent --show-error "$BASE_URL/health" | jq -e '.status == "ok"'

# curl — run a smoke script (see references/curl.md)
BASE_URL=https://staging.example.com bash smoke-tests/smoke.sh
```

---

## Quality Table

| Aspect | Do | Don't |
|--------|-----|-------|
| Scope | Test critical workflows | Test every edge case |
| Setup | Minimal, reusable fixtures | Complex multi-step setup |
| Assertions | 1–3 per request, focused | Many assertions per request |
| Time | <100ms per request | Slow, resource-heavy tests |
| Maintenance | Stable, rarely change | Break on implementation changes |
| Coverage | Broad paths, not deep | Deep internal behavior |

---

## CI Integration

```yaml
# GitHub Actions — Hurl smoke as gate
- name: Install Hurl
  # Pin an exact version + verify checksum — don't pipe install.sh straight from
  # the web with no version pin or verification (see references/hurl.md for the
  # full snippet with the sha256sum check).
  run: |
    HURL_VERSION=4.3.0
    curl -LO https://github.com/Orange-OpenSource/hurl/releases/download/${HURL_VERSION}/hurl_${HURL_VERSION}_amd64.deb
    echo "<pin-expected-sha256-here>  hurl_${HURL_VERSION}_amd64.deb" | sha256sum -c -
    sudo dpkg -i hurl_${HURL_VERSION}_amd64.deb

- name: Run Smoke Tests
  id: smoke
  run: hurl --test --max-time 10 --variable base_url=${{ env.APP_URL }} smoke-tests/*.hurl

- name: Run Full Test Suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

```yaml
# GitHub Actions — curl smoke as gate (no Hurl install needed)
- name: Run Smoke Tests
  id: smoke
  env:
    BASE_URL: ${{ env.APP_URL }}
  run: bash smoke-tests/smoke.sh

- name: Run Full Test Suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

---

## Quick Checklist

- [ ] Identify smoke test location (`smoke-tests/` directory, `.hurl` files, or `smoke.sh`)
- [ ] List critical workflows: auth, create, read, list, health check
- [ ] Write 5–10 focused checks — happy paths only
- [ ] Set up environment before suite (auth token, base URL); tear down after if needed
- [ ] Run in isolation; all must pass before full suite
- [ ] Wire as first gate in CI pipeline

---

## Integrated Example

**Identify:** A storefront API's most critical path is "can a user log in and load their cart?".
If that breaks, nothing else matters — a perfect smoke-test candidate. It's a multi-step HTTP
flow (login, capture token, use token), so reach for Hurl.

**Write** `smoke-tests/login-cart.hurl`:

```hurl
POST {{base_url}}/login
{ "email": "smoke@example.com", "password": "{{smoke_pw}}" }
HTTP 200
[Captures]
token: jsonpath "$.token"

GET {{base_url}}/cart
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.items" exists
```

```bash
hurl --test --variable base_url=https://staging.example.com \
            --variable smoke_pw=$SMOKE_PW smoke-tests/login-cart.hurl
```

**Wire CI** — gate the full suite behind it:

```yaml
- name: Smoke
  id: smoke
  run: hurl --test --variable base_url=${{ env.APP_URL }} smoke-tests/*.hurl
- name: Full suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

Happy path only, two requests, runs in under a second. If login or cart breaks, the full
suite never starts.

---

## Read On Demand

| Read When | File |
|-----------|------|
| Need Hurl template, variables, CI snippet, patterns | [`references/hurl.md`](references/hurl.md) |
| No Hurl available / need a curl+jq shell script template | [`references/curl.md`](references/curl.md) |
