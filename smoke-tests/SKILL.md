---
name: smoke-tests
description: >
  Smoke test identification, authoring, and CI integration.
  TRIGGER when: smoke test, smoke testing, sanity check, critical path test, fast CI gate,
  CI first-pass gate, quick validation before full suite, run only critical tests,
  identify smoke tests, write smoke tests, add smoke test, smoke test template,
  generate smoke tests, which tests are smoke tests, mark tests as smoke,
  gate before full suite, build health check tests, validate critical paths,
  hurl, hurl smoke test, hurl test, .hurl file, hurl CI, write hurl tests.
  DO NOT USE when: user needs full testing strategy or philosophy — use `testing` instead.
---

# Smoke Tests

Minimal, rapid tests that validate critical user-facing functionality before slower suites run.
If smoke tests fail, the build is broken. Full suite doesn't run.

---

## What Smoke Tests Verify

| Goal | Definition | Signal |
|------|-----------|--------|
| Core features work | App starts, main entry points execute | Startup crash caught immediately |
| Critical paths execute | Key user workflows complete without exceptions | Regressions in auth/CRUD caught early |
| System integration intact | Major components communicate correctly | DB, config, external services up |

**Characteristics:** minimal setup · fast (seconds) · happy paths only · high signal-to-noise

---

## Identify Existing Smoke Tests

| Pattern | Detection |
|---------|-----------|
| `it.only()` / `describe.only()` | `.only` marker — others skip automatically |
| `describe('Smoke Tests', ...)` | Group by name |
| `tests/smoke/` directory | Convention-based directory |
| `// @smoke` / `// @critical` comment | Grep for tag |

---

## Tool Selection

| Use Hurl | Use Jest / Vitest |
|----------|-------------------|
| HTTP API / black-box smoke tests | Unit-level smoke tests |
| App already running (staging, preview) | No running server — app tested in-process |
| Zero JS runtime in CI | JS monorepo — test infra already set up |
| Readable by non-JS engineers | Need fixtures, mocks, or DB state |

---

## Run Commands

```bash
# Hurl — run all .hurl files as tests
hurl --test smoke-tests/*.hurl

# Hurl — single file with variables
hurl --test --variable base_url=http://localhost:3000 smoke-tests/health.hurl

# Hurl — variables file + HTML report
hurl --test --variables-file smoke-tests/vars.env --report-html report/ smoke-tests/*.hurl

# Jest / Vitest fallback — directory-based
npm test -- --testPathPattern='smoke'

# Jest / Vitest fallback — .only marker
npm test
```

---

## Quality Table

| Aspect | Do | Don't |
|--------|-----|-------|
| Scope | Test critical workflows | Test every edge case |
| Setup | Minimal, reusable fixtures | Complex multi-step setup |
| Assertions | 1–3 per test, focused | Many assertions per test |
| Time | <100ms per test | Slow, resource-heavy tests |
| Maintenance | Stable, rarely change | Break on implementation changes |
| Coverage | Broad paths, not deep | Deep internal behavior |

---

## CI Integration

```yaml
# GitHub Actions — Hurl smoke as gate
- name: Install Hurl
  run: curl -LsSf https://hurl.dev/install.sh | bash

- name: Run Smoke Tests
  id: smoke
  run: hurl --test --variable base_url=${{ env.APP_URL }} smoke-tests/*.hurl

- name: Run Full Test Suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

---

## Quick Checklist

- [ ] Identify smoke test location (directory / `.only` / naming convention)
- [ ] List critical workflows: auth, create, read, list, health check
- [ ] Write 5–10 focused tests — happy paths only
- [ ] Add `beforeAll` setup + `afterAll` teardown
- [ ] Run in isolation; all must pass before full suite
- [ ] Wire as first gate in CI pipeline

---

## Reference Files

| Read When | File |
|-----------|------|
| Need Hurl template, variables, CI snippet, patterns | [`references/hurl.md`](references/hurl.md) |
| Need Jest/Vitest template + patterns/pitfalls | [`references/template.md`](references/template.md) |
