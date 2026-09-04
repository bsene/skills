---
id: smoke-tests-001-ci-gate
skill: smoke-tests
---

# Prompt

Our REST API has these endpoints: POST /auth/login (email + password, returns a JSON token), GET /orders (requires Bearer token, returns the order list), POST /orders (creates an order, requires token), and GET /healthz. Our full test suite (25 minutes of Jest tests) runs on every push and devs keep shipping broken deploys anyway. Write us smoke tests that run FIRST in CI as a gate before the full suite. Context: CI is GitHub Actions; installing extra binaries is possible but we'd rather avoid exotic dependencies. Write the tests and show how to wire them into the pipeline.

# Criteria

- [ ] The smoke tests are black-box HTTP checks using Hurl (.hurl files) and/or curl (+ jq for JSON) — no in-process JS test runner (no Jest/Vitest/supertest) inside the smoke gate
- [ ] The multi-step login flow is chained: login captures the token (Hurl `[Captures]`/jsonpath, or curl + jq extraction) and the token is reused on the authenticated GET/POST /orders requests
- [ ] Scope is happy paths only, with a small focused set (~4-10 requests, 1-3 assertions each) — health check, login, create, list
- [ ] The smoke step is fast by design (seconds: minimal setup, short/max timeouts) as stated in the response or visible in the code
- [ ] CI wiring gates the full suite: it runs only when the smoke step succeeds (`if: steps.smoke.outcome == 'success'` or equivalent conditional)
- [ ] The smoke suite does NOT include negative/error-path cases (failed logins, invalid payloads, exhaustive status-code checks) — those are explicitly left out or deferred to the full suite
