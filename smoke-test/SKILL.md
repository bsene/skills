---
name: smoke-test
description: >
  Run, identify, and generate smoke tests for rapid critical-path validation.
  Use when the user asks to run smoke tests, check critical functionality,
  create a smoke test suite, identify which tests are smoke tests, or validate
  core features quickly before full test suite. Also trigger on "smoke test",
  "critical path tests", "regression test", "sanity check", "core functionality test",
  "quick test", "fast validation", "critical test suite", or when setting up Jest/Vitest
  smoke test configuration.
---

# Smoke Test Skill

Smoke tests are minimal, rapid tests that validate critical user-facing functionality
and core workflows. They run quickly and catch major failures before slower integration
or performance tests.

---

## What Are Smoke Tests?

A smoke test verifies that:

1. **Core features work** — the application starts, main entry points execute
2. **Critical paths execute** — key user workflows complete without exceptions
3. **System integration is intact** — major components communicate correctly

**Characteristics:**
- Minimal setup; no deep behavior verification
- Fast execution (seconds, not minutes)
- Broad coverage of happy paths
- High signal-to-noise ratio (if smoke tests fail, the build is broken)

---

## Three Tasks

### Task 1: Identify Smoke Tests

Smoke tests in Jest/Vitest can be marked several ways:

#### Pattern 1: Skip Other Tests (Run Smoke Only)

```javascript
describe('Smoke Tests', () => {
  it.only('should load the application', () => {
    expect(app.isReady()).toBe(true);
  });
});

describe('Full Feature Tests', () => {
  it('should handle edge case X', () => {
    // Skipped if smoke tests use .only above
  });
});
```

**Detection:** Look for `describe.only(...)` or `it.only(...)`

#### Pattern 2: Dedicated `smoke` Group

```javascript
describe.skip('Smoke Tests', () => {
  it('should load app', () => { ... });
  it('should initialize core service', () => { ... });
  it('should connect to database', () => { ... });
});
```

**Detection:** Look for `describe('Smoke Tests')` or comments `// @smoke` or `@critical`

#### Pattern 3: Filename Convention

```
tests/
  smoke/                    # Smoke tests directory
    load.test.js
    core-service.test.js
  unit/                     # All other tests
  integration/
```

**Detection:** Tests in a `smoke/` or `smoke-tests/` directory

#### Pattern 4: Custom Markers (Comments or Tags)

```javascript
// @smoke @critical
describe('Load Test', () => {
  it('should initialize the app', () => { ... });
});
```

**Detection:** Grep for `@smoke`, `@critical`, `@fast`, or tags in test files

---

### Task 2: Run Smoke Tests

#### Command: Run Smoke Tests Only

**Using `--testPathPattern` (directory-based):**
```bash
npm test -- --testPathPattern='smoke'
# or with Vitest
npm test -- --grep '@smoke'
```

**Using `--testNamePattern` (name-based):**
```bash
npm test -- --testNamePattern='Smoke Tests'
# Runs all tests in any describe/it with "Smoke Tests" in the name
```

**Using `.only` in code:**
If tests are marked with `it.only(...)`, run normally:
```bash
npm test
# Only .only tests execute; others skip automatically
```

#### Workflow: Running Smoke Tests

1. **Identify smoke tests** (see Task 1 above)
2. **Choose command** based on your marking strategy:
   - Directory: `npm test -- --testPathPattern='smoke'`
   - Name pattern: `npm test -- --testNamePattern='Smoke'`
   - `.only` marker: `npm test` (no args needed)
3. **Capture output**:
   ```bash
   npm test -- --testPathPattern='smoke' --verbose
   # or
   npm test -- --testPathPattern='smoke' --coverage
   ```
4. **Interpret results**:
   - ✅ All pass → critical paths are healthy
   - ❌ Any fail → the build is blocked; investigate immediately
   - ⚠️ Flaky → smoke test is unreliable; remove or fix

---

### Task 3: Generate Smoke Test Template

Use this template as a starting point. Adapt it to your application's architecture.

```javascript
/**
 * Smoke Tests — Critical Path Validation
 *
 * These tests verify that core features and system integration are intact.
 * Run before slower integration/performance tests.
 *
 * Run with: npm test -- --testPathPattern='smoke'
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/db';

describe('Smoke Tests', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Minimal setup for smoke tests
    db = await connectDatabase();
    app = createApp({ db });
  });

  afterAll(async () => {
    await app.close();
    await db.close();
  });

  // ===== Core System =====

  it('should initialize the application', () => {
    expect(app).toBeDefined();
    expect(app.isRunning()).toBe(true);
  });

  it('should establish database connection', () => {
    expect(db.isConnected()).toBe(true);
  });

  it('should load configuration', () => {
    const config = app.getConfig();
    expect(config).toBeDefined();
    expect(config.port).toBeDefined();
  });

  // ===== Critical User Workflows =====

  it('should authenticate a valid user', async () => {
    const result = await app.auth.login('user@example.com', 'password');
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });

  it('should create a resource (happy path)', async () => {
    const resource = await app.api.post('/resources', {
      name: 'Test Resource'
    });
    expect(resource.id).toBeDefined();
    expect(resource.name).toBe('Test Resource');
  });

  it('should retrieve created resource', async () => {
    const resource = await app.api.get('/resources/1');
    expect(resource).toBeDefined();
    expect(resource.name).toBe('Test Resource');
  });

  it('should list resources', async () => {
    const list = await app.api.get('/resources');
    expect(Array.isArray(list)).toBe(true);
  });

  // ===== System Integration =====

  it('should serve the health check endpoint', async () => {
    const health = await app.api.get('/health');
    expect(health.status).toBe('ok');
  });

  it('should return valid error responses', async () => {
    const result = await app.api.get('/resources/999');
    expect(result.statusCode).toBe(404);
    expect(result.error).toBeDefined();
  });
});
```

#### Smoke Test Guidelines

| Aspect | ✅ Do | ❌ Don't |
|--------|-------|---------|
| **Scope** | Test critical workflows | Test every edge case |
| **Setup** | Minimal, reusable fixtures | Complex multi-step setup |
| **Assertions** | 1–3 per test, focused | Many assertions per test |
| **Time** | <100ms per test | Slow, resource-heavy tests |
| **Maintenance** | Stable, rarely change | Break on implementation changes |
| **Coverage** | Broad paths, not deep | Deep internal behavior |

---

## Quick Reference: Smoke Test Checklist

- [ ] Identify where smoke tests live (directory, `.only`, or naming convention)
- [ ] List all critical user workflows (auth, create, read, update, list, etc.)
- [ ] Write 5–10 focused smoke tests covering happy paths
- [ ] Add a `beforeAll` setup and `afterAll` teardown
- [ ] Run smoke tests in isolation: `npm test -- --testPathPattern='smoke'`
- [ ] Ensure all smoke tests pass before running full suite
- [ ] Integrate smoke tests into CI pipeline as a first-pass gate

---

## Integration: Smoke Tests in CI/CD

Add this to your GitHub Actions / GitLab CI:

```yaml
# GitHub Actions example
- name: Run Smoke Tests
  run: npm test -- --testPathPattern='smoke'
  if: always()

- name: Run Full Test Suite
  run: npm test
  if: steps.smoke.outcome == 'success'
```

Smoke tests act as a **gate**: if they fail, skip the slower suite.

---

## Common Patterns & Pitfalls

### ✅ Good: Broad Coverage, Minimal Depth

```javascript
it('should process payment', async () => {
  const result = await app.payments.charge({ amount: 100 });
  expect(result.success).toBe(true);
  // That's it. Don't verify internal state, audit logs, etc.
});
```

### ❌ Bad: Too Deep, Slow, Maintenance Burden

```javascript
it('should process payment and verify all downstream effects', async () => {
  const order = await app.orders.create({ ... });
  const invoice = await app.invoices.generate(order.id);
  const notification = await app.notifications.send(order.customerId);
  const balance = await app.accounting.updateBalance(order.customerId);
  // 4 unrelated assertions in one test. Harder to debug.
});
```

### ⚠️ Flaky Smoke Tests

If a smoke test fails inconsistently:

1. **Isolate the failure** — does it fail in isolation? (`npm test -- --testPathPattern='specific-test'`)
2. **Add a timeout** — is async/timing the issue?
3. **Remove from smoke suite** — move to integration tests
4. **Fix the root cause** — often test isolation or shared state

---

## Resources

- [Smoke Testing - Wikipedia](https://en.wikipedia.org/wiki/Smoke_testing)
- [Vitest CLI Options](https://vitest.dev/config/) — `--grep`, `--reporter`
- [Jest CLI Options](https://jestjs.io/docs/cli) — `--testNamePattern`, `--testPathPattern`
- [Martin Fowler: Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html) — context for smoke tests in the broader testing strategy
