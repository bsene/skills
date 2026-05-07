# Smoke Test Template & Patterns

## Jest / Vitest Template

```javascript
/**
 * Smoke Tests — Critical Path Validation
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
    const resource = await app.api.post('/resources', { name: 'Test Resource' });
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

---

## Patterns & Pitfalls

### Good: Broad Coverage, Minimal Depth

```javascript
it('should process payment', async () => {
  const result = await app.payments.charge({ amount: 100 });
  expect(result.success).toBe(true);
  // Don't verify internal state, audit logs, etc.
});
```

### Bad: Too Deep, Slow, Maintenance Burden

```javascript
it('should process payment and verify all downstream effects', async () => {
  const order = await app.orders.create({ ... });
  const invoice = await app.invoices.generate(order.id);
  const notification = await app.notifications.send(order.customerId);
  const balance = await app.accounting.updateBalance(order.customerId);
  // 4 unrelated assertions — harder to debug
});
```

---

## Flaky Smoke Test Debugging

1. Isolate — does it fail alone? `npm test -- --testPathPattern='specific-test'`
2. Add timeout — async/timing issue?
3. Move to integration suite if inherently flaky
4. Fix root cause — usually test isolation or shared state
