# Design Patterns — Full Examples & Trade-offs

_Verified against TypeScript 5.x official documentation._

## Contents

- [Factory](#factory)
- [Strategy](#strategy)
- [Abstract Factory](#abstract-factory)
- [Builder](#builder)
- [Real Mixins](#real-mixins)
- [Decorator (TS 5.0+ Standard API)](#decorator-ts-50-standard-api)
- [Generics](#generics)
- [OO Concepts](#oo-concepts)
- [Simulating final Classes](#simulating-final-classes)

---

## Factory

Create objects of a known type without exposing the concrete class to the consumer. Pair the type and factory under one name using the companion object pattern.

**When to use:** Clean creation API over a fixed union of subtypes; consumer only needs the abstract type.
**When NOT to use:** Only one concrete type exists; or callers need the exact subtype at compile time (use overloaded signatures instead).

```typescript
type StorageAdapter = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
};

class LocalStorageAdapter implements StorageAdapter {
  async get(key: string) {
    return localStorage.getItem(key);
  }
  async set(key: string, v: string) {
    localStorage.setItem(key, v);
  }
  async delete(key: string) {
    localStorage.removeItem(key);
  }
}
class RedisAdapter implements StorageAdapter {
  async get(key: string) {
    return null; /* redis.get(key) */
  }
  async set(key: string, v: string) {
    /* redis.set(key, v) */
  }
  async delete(key: string) {
    /* redis.del(key) */
  }
}
class InMemoryAdapter implements StorageAdapter {
  private store = new Map<string, string>();
  async get(key: string) {
    return this.store.get(key) ?? null;
  }
  async set(key: string, v: string) {
    this.store.set(key, v);
  }
  async delete(key: string) {
    this.store.delete(key);
  }
}

// Companion object pattern: type and value share the same name
let StorageAdapter = {
  create(kind: "local" | "redis" | "memory"): StorageAdapter {
    switch (kind) {
      case "local":
        return new LocalStorageAdapter();
      case "redis":
        return new RedisAdapter();
      case "memory":
        return new InMemoryAdapter();
    }
  },
};

const storage = StorageAdapter.create(
  typeof window !== "undefined" ? "local" : "redis",
);
```

**Precise return types with overloads** — when callers need the concrete subtype:

```typescript
function createStorage(kind: "local"): LocalStorageAdapter;
function createStorage(kind: "redis"): RedisAdapter;
function createStorage(kind: "memory"): InMemoryAdapter;
function createStorage(kind: string): StorageAdapter {
  switch (kind) {
    case "local":
      return new LocalStorageAdapter();
    case "redis":
      return new RedisAdapter();
    default:
      return new InMemoryAdapter();
  }
}
const redis = createStorage("redis"); // RedisAdapter — concrete type known
```

**Trade-offs:** Consumer decoupled from concrete adapters; union return type in `.create` hides the subtype (use overloads to restore it).

---

## Strategy

Encapsulate interchangeable algorithms behind a shared interface so any can be substituted at runtime.

**When to use:** Multiple variants of a behavior that change independently of the context — eliminates branching chains.
**When NOT to use:** Only one variant exists and extension is unlikely.

```typescript
interface RateLimiter {
  isAllowed(clientId: string): boolean;
}

class TokenBucketLimiter implements RateLimiter {
  private tokens = new Map<string, number>();
  constructor(
    private capacity: number,
    private refillPerSecond: number,
  ) {}
  isAllowed(clientId: string) {
    const current = this.tokens.get(clientId) ?? this.capacity;
    if (current < 1) return false;
    this.tokens.set(clientId, current - 1);
    return true;
  }
}

class SlidingWindowLimiter implements RateLimiter {
  private log = new Map<string, number[]>();
  constructor(
    private limit: number,
    private windowMs: number,
  ) {}
  isAllowed(clientId: string) {
    const now = Date.now();
    const hits = (this.log.get(clientId) ?? []).filter(
      (t) => now - t < this.windowMs,
    );
    if (hits.length >= this.limit) return false;
    this.log.set(clientId, [...hits, now]);
    return true;
  }
}

class NoLimiter implements RateLimiter {
  isAllowed() {
    return true;
  }
}

class ApiGateway {
  constructor(private limiter: RateLimiter) {}
  handle(req: { clientId: string; path: string }) {
    if (!this.limiter.isAllowed(req.clientId))
      throw new Error("429 Too Many Requests");
    console.log(`Handling ${req.path}`);
  }
}

const gateway = new ApiGateway(
  process.env.NODE_ENV === "test"
    ? new NoLimiter()
    : new TokenBucketLimiter(100, 10),
);
```

**Trade-offs:** Eliminates conditionals; each variant is one class; slight proliferation of small classes.

---

## Abstract Factory

Interface for creating families of related objects without specifying concrete classes.

**When to use:** The system must produce only compatible product families; client must be isolated from concrete types.
**When NOT to use:** Only one product family exists.

```typescript
// Products
interface Button {
  html(): string;
  onClick(fn: () => void): void;
}
interface Modal {
  html(): string;
  show(): void;
  hide(): void;
}

// Web (DOM) family
class WebButton implements Button {
  html() {
    return '<button class="btn">Submit</button>';
  }
  onClick(fn: () => void) {
    /* addEventListener */
  }
}
class WebModal implements Modal {
  html() {
    return "<dialog>...</dialog>";
  }
  show() {
    /* dialog.showModal() */
  }
  hide() {
    /* dialog.close() */
  }
}

// React Native family
class NativeButton implements Button {
  html() {
    return "<TouchableOpacity />";
  }
  onClick(fn: () => void) {
    /* onPress */
  }
}
class NativeModal implements Modal {
  html() {
    return "<Modal />";
  }
  show() {
    /* setVisible(true) */
  }
  hide() {
    /* setVisible(false) */
  }
}

// Abstract factory interface
interface UIFactory {
  createButton(): Button;
  createModal(): Modal;
}

class WebUIFactory implements UIFactory {
  createButton() {
    return new WebButton();
  }
  createModal() {
    return new WebModal();
  }
}
class NativeUIFactory implements UIFactory {
  createButton() {
    return new NativeButton();
  }
  createModal() {
    return new NativeModal();
  }
}

// Client — completely platform-agnostic
class CheckoutFlow {
  private confirmButton: Button;
  private errorModal: Modal;
  constructor(factory: UIFactory) {
    this.confirmButton = factory.createButton();
    this.errorModal = factory.createModal();
  }
  render() {
    return `${this.confirmButton.html()} ${this.errorModal.html()}`;
  }
  showError() {
    this.errorModal.show();
  }
}

const isNative = typeof window === "undefined";
const checkout = new CheckoutFlow(
  isNative ? new NativeUIFactory() : new WebUIFactory(),
);
```

**Trade-offs:** Full client/product decoupling; adding a new product type (e.g., `Toast`) requires updating every factory interface and all implementations.

---

## Builder

Separate the construction of a complex object from its representation, allowing the same process to produce different configurations via a fluent, step-by-step API.

**When to use:** Objects with many optional fields (avoid telescoping constructors); multi-step construction where order matters; you want compile-time safety on required vs. optional parts.
**When NOT to use:** Simple objects with ≤ 3 fields — a plain object literal or single constructor is clearer.

### Product

```typescript
interface HttpRequest {
  readonly url: string;
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
  readonly timeout: number;
}
```

### Builder

```typescript
class HttpRequestBuilder {
  private _method: HttpRequest["method"] = "GET";
  private _headers: Record<string, string> = {};
  private _body: unknown = undefined;
  private _timeout = 30_000;

  constructor(private readonly _url: string) {
    if (!_url.startsWith("http"))
      throw new Error("URL must start with http/https");
  }

  method(m: HttpRequest["method"]): this {
    this._method = m;
    return this;
  }

  header(key: string, value: string): this {
    this._headers[key] = value;
    return this; // fluent — enables method chaining
  }

  auth(token: string): this {
    return this.header("Authorization", `Bearer ${token}`);
  }

  json(body: unknown): this {
    this._body = body;
    return this.header("Content-Type", "application/json");
  }

  accept(mimeType: string): this {
    return this.header("Accept", mimeType);
  }

  timeout(ms: number): this {
    if (ms <= 0) throw new RangeError("timeout must be > 0");
    this._timeout = ms;
    return this;
  }

  /** Terminal method — produces the immutable product. */
  build(): HttpRequest {
    return Object.freeze({
      url: this._url,
      method: this._method,
      headers: Object.freeze({ ...this._headers }),
      body: this._body,
      timeout: this._timeout,
    });
  }
}
```

### Usage

```typescript
const request = new HttpRequestBuilder("https://api.example.com/posts")
  .method("POST")
  .auth("tok-abc123")
  .json({ title: "Hello", body: "World" })
  .accept("application/json")
  .timeout(5_000)
  .build();
```

### TypeScript-Specific Notes

- **Return `this`, not the concrete class** — subclasses preserve their own type through the chain.
- **`Object.freeze` the product** — enforces immutability at runtime after `build()`.
- **Required fields in the constructor** — optional fields get defaults; this is the idiomatic TS alternative to overloaded constructors.

### Step Builder Variant (compile-time required-field safety)

```typescript
// Each interface exposes only what's legal at that step
interface NeedsTable {
  from(table: string): NeedsColumns;
}
interface NeedsColumns {
  select(...cols: string[]): OptionalSteps;
}
interface OptionalSteps {
  where(condition: string): OptionalSteps;
  limit(n: number): OptionalSteps;
  offset(n: number): OptionalSteps;
  orderBy(col: string): OptionalSteps;
  build(): QueryConfig;
}

class StepQueryBuilder implements NeedsTable, NeedsColumns, OptionalSteps {
  private _table = "";
  private _columns: string[] = [];
  private _conditions: string[] = [];
  private _limit: number | null = null;
  private _offset = 0;
  private _orderBy: string | null = null;

  // Private constructor — force use of the static entry point
  private constructor() {}

  static create(): NeedsTable {
    return new StepQueryBuilder();
  }

  from(table: string): NeedsColumns {
    this._table = table;
    return this;
  }

  select(...cols: string[]): OptionalSteps {
    this._columns = cols;
    return this;
  }

  where(condition: string): OptionalSteps {
    this._conditions.push(condition);
    return this;
  }

  limit(n: number): OptionalSteps {
    this._limit = n;
    return this;
  }
  offset(n: number): OptionalSteps {
    this._offset = n;
    return this;
  }
  orderBy(col: string): OptionalSteps {
    this._orderBy = col;
    return this;
  }

  build(): QueryConfig {
    return Object.freeze({
      table: this._table,
      columns: [...this._columns],
      conditions: [...this._conditions],
      limit: this._limit,
      offset: this._offset,
      orderBy: this._orderBy,
    });
  }
}

// Compiler enforces the correct order — build() is not visible until select() is called
const q = StepQueryBuilder.create()
  .from("orders")
  .select("id", "total")
  .where("status = 'shipped'")
  .build();
```

### Trade-offs

| Gain | Give up |
|---|---|
| Readable, self-documenting construction | Extra class boilerplate vs. a plain object literal |
| Validation centralised in one place | Mutable builder state before `build()` is called |
| Fluent API is easy to chain and diff in code review | Method-chain order can be surprising if steps have side effects |
| Product is immutable once built | `build()` must be called explicitly — easy to forget |
| Step Builder gives compile-time required-field safety | Step Builder adds significant interface boilerplate |

---

## Real Mixins

Compose classes from small, reusable behavior units without deep inheritance.

**⚠️ Two styles exist — use only the class-expression pattern:**

- **`applyMixins` + `implements`** (legacy) — prototype copying, no `super()`, no compiler code-flow support. Official handbook marks this as outdated.
- **Class-expression mixins** — ✅ current recommended pattern.

**When to use:** "can-do" relationships; sharing cross-cutting behavior (caching, auth, logging) across unrelated request handlers or services.
**When NOT to use:** "is-a" hierarchies; when private members need to interact across the mixin boundary.

```typescript
type Constructor<T = object> = new (...args: any[]) => T;

// Adds in-memory response caching — constrained: base must expose a cacheKey()
function Cacheable<TBase extends Constructor<{ cacheKey(): string }>>(
  Base: TBase,
) {
  return class extends Base {
    private static cache = new Map<
      string,
      { value: unknown; expiresAt: number }
    >();
    cached<T>(ttlMs: number, compute: () => T): T {
      const key = this.cacheKey();
      const hit =
        (this.constructor as any).__proto__.constructor.cache.get(key) ??
        Cacheable.prototype; // fallback — simplified
      // Real impl: check Map, return stale or recompute
      return compute();
    }
  };
}

// Adds structured request logging
function Loggable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    log(level: "info" | "warn" | "error", message: string, meta?: object) {
      console[level](`[${new Date().toISOString()}] ${message}`, meta ?? "");
    }
  };
}

// Adds JWT-based authentication check
function Authenticated<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    assertAuth(authHeader: string | undefined): string {
      if (!authHeader?.startsWith("Bearer "))
        throw new Error("401 Unauthorized");
      return authHeader.slice(7); // return the JWT token
    }
  };
}

class BaseHandler {
  constructor(public route: string) {}
}

// Compose: pick only what each handler needs
const PublicHandler = Loggable(BaseHandler);
const ProtectedHandler = Authenticated(Loggable(BaseHandler));

class ProductsHandler extends ProtectedHandler {
  async handle(req: { headers: Record<string, string> }) {
    const token = this.assertAuth(req.headers["authorization"]);
    this.log("info", `GET ${this.route}`, { token: token.slice(0, 8) + "..." });
    return [{ id: 1, name: "Widget" }];
  }
}
```

**Relationship semantics:**

- "is-a" → inheritance
- "has-a" → delegation
- "can-do" → mixin

**Trade-offs:** True `super()` chaining; compiler code-flow support; mixin composition creates singletons (can't map the same mixin to different variable types at the type level).

---

## Decorator (TS 5.0+ Standard API)

Add reusable cross-cutting behavior to route handlers, services, and methods declaratively.

**⚠️ Two APIs exist — use standard TS 5.0+ for new code:**

|               | Legacy (`--experimentalDecorators`)             | Standard (TS 5.0+)                     |
| ------------- | ----------------------------------------------- | -------------------------------------- |
| Flag needed   | `"experimentalDecorators": true`                | None                                   |
| Signature     | `(target, key, descriptor)`                     | `(originalMethod, context)`            |
| Type safety   | Weak (`any` everywhere)                         | Strong (`ClassMethodDecoratorContext`) |
| Frameworks    | Angular, NestJS, typeorm (still require legacy) | New projects                           |
| Interoperable | ✗                                               | ✗                                      |

**Standard TS 5.0+ decorators — web-focused examples:**

```typescript
// Timing decorator — wraps async route handlers
function timed(originalMethod: Function, ctx: ClassMethodDecoratorContext) {
  const name = String(ctx.name);
  return async function (this: unknown, ...args: unknown[]) {
    const start = performance.now();
    const result = await (originalMethod as Function).call(this, ...args);
    console.log(`[${name}] ${(performance.now() - start).toFixed(1)}ms`);
    return result;
  };
}

// Retry decorator — retries failed fetch operations
function retry(maxAttempts: number, delayMs = 200) {
  return function (originalMethod: Function, ctx: ClassMethodDecoratorContext) {
    return async function (this: unknown, ...args: unknown[]) {
      let lastError: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await (originalMethod as Function).call(this, ...args);
        } catch (err) {
          lastError = err;
          if (attempt < maxAttempts)
            await new Promise((r) => setTimeout(r, delayMs * attempt));
        }
      }
      throw lastError;
    };
  };
}

// Validate body — checks required fields before the handler runs
function requireFields(fields: string[]) {
  return function (originalMethod: Function, ctx: ClassMethodDecoratorContext) {
    return function (
      this: unknown,
      body: Record<string, unknown>,
      ...rest: unknown[]
    ) {
      const missing = fields.filter((f) => body[f] == null);
      if (missing.length)
        throw Object.assign(new Error(`Missing: ${missing.join(", ")}`), {
          status: 400,
        });
      return (originalMethod as Function).call(this, body, ...rest);
    };
  };
}

class UserService {
  @timed
  async fetchProfile(userId: string) {
    return fetch(`/api/users/${userId}`).then((r) => r.json());
  }

  @retry(3, 500)
  async syncToExternalCrm(userId: string) {
    return fetch("https://crm.example.com/sync", { method: "POST" });
  }

  @requireFields(["email", "password"])
  async register(body: Record<string, unknown>) {
    return { created: true, email: body["email"] };
  }
}
```

**Legacy `--experimentalDecorators` API (for migrating existing code only):**

```typescript
// Requires "experimentalDecorators": true in tsconfig.json
function timed(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const result = await original.apply(this, args);
    console.log(`[${key}] ${(performance.now() - start).toFixed(1)}ms`);
    return result;
  };
  return descriptor;
}
```

**Trade-offs:** Standard API is type-safe, flag-free, spec-compliant; DI-style parameter decorators (`@inject`) are not supported — Angular, NestJS, and typeorm still require `--experimentalDecorators`.

---

## Generics

```typescript
// Typed fetch wrapper — response shape inferred from the type parameter
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}
const user = await apiFetch<User>("/api/users/me");
user.role; // 'admin' | 'user' — typed ✓

// Generic repository interface
interface Repository<T, TId> {
  findById(id: TId): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  save(item: T): Promise<T>;
  delete(id: TId): Promise<void>;
}

// Branded route/path parameters prevent mix-ups
class RouteParam<TKind extends string> {
  constructor(
    readonly kind: TKind,
    readonly value: string,
  ) {}
  toString() {
    return `/:${this.kind}`;
  }
}
class UserId extends RouteParam<"userId"> {}
class ArticleSlug extends RouteParam<"articleSlug"> {}

function getArticle(userId: UserId, slug: ArticleSlug) {
  /* ... */
}
// getArticle(new ArticleSlug('slug'), new UserId('id'))  // ✗ — wrong order caught

// Class-scoped generics — static methods do NOT inherit class-level type params
class ApiCache<K extends string, V> {
  private store = new Map<K, { value: V; ttl: number }>();
  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.ttl) return undefined;
    return entry.value;
  }
  set(key: K, value: V, ttlMs: number): void {
    this.store.set(key, { value, ttl: Date.now() + ttlMs });
  }
  static empty<K extends string, V>(): ApiCache<K, V> {
    return new ApiCache();
  }
}
```

**TS 5.x `const` type parameters** — preserve literal types for route segments:

```typescript
function defineRoutes<const T extends Record<string, string>>(routes: T): T {
  return routes;
}
const ROUTES = defineRoutes({ users: "/api/users", posts: "/api/posts" });
type UserRoute = (typeof ROUTES)["users"]; // '/api/users' — not string
```

---

## OO Concepts

### Open Recursion

`this.method()` dispatches to the most-derived class at runtime. Useful for middleware pipelines and recursive DOM/tree traversal.

```typescript
class DomSerializer {
  serialize(node: Element): string {
    const children = Array.from(node.children)
      .map((child) => this.serialize(child)) // this.serialize — open recursion
      .join("");
    return `<${node.tagName.toLowerCase()}>${children}</${node.tagName.toLowerCase()}>`;
  }
}

class SanitizingSerializer extends DomSerializer {
  private blocked = new Set(["script", "iframe", "object"]);
  serialize(node: Element): string {
    if (this.blocked.has(node.tagName.toLowerCase())) return "";
    return super.serialize(node); // base calls this.serialize — dispatches back here
  }
}
```

### Delegation

Pass `this` into a collaborator so it can call back. Prefer over inheritance when "has-a" applies.

```typescript
interface EventEmitter {
  emit(event: string, payload: unknown): void;
}

class WebSocketServer implements EventEmitter {
  private connections: Connection[] = [];
  onConnect(socket: WebSocket) {
    const conn = new Connection(socket, this); // passes 'this' — true delegation
    this.connections.push(conn);
  }
  emit(event: string, payload: unknown) {
    const message = JSON.stringify({ event, payload });
    this.connections.forEach((c) => c.send(message));
  }
}

class Connection {
  constructor(
    private socket: WebSocket,
    private server: EventEmitter,
  ) {}
  send(message: string) {
    this.socket.send(message);
  }
  onMessage(raw: string) {
    const { event, payload } = JSON.parse(raw);
    this.server.emit(event, payload); // calls back into the server
  }
}
```

### Structural Polymorphism

Explicit `implements` is optional — shape compatibility is enough.

```typescript
interface Renderable {
  render(): string;
}

// No `implements Renderable` declared — shape is compatible
class JsonWidget {
  constructor(private data: object) {}
  render() {
    return `<pre>${JSON.stringify(this.data, null, 2)}</pre>`;
  }
}

class ChartWidget {
  constructor(
    private labels: string[],
    private values: number[],
  ) {}
  render() {
    return `<canvas data-labels="${this.labels}"></canvas>`;
  }
}

function buildDashboard(widgets: Renderable[]): string {
  return `<div class="dashboard">${widgets.map((w) => w.render()).join("\n")}</div>`;
}

buildDashboard([
  new JsonWidget({ status: "ok" }),
  new ChartWidget(["Jan", "Feb"], [42, 87]),
]);
```

---

## Simulating final Classes

TypeScript has no `final` keyword. A `private` constructor + static factory prevents subclassing while still allowing instantiation.

```typescript
// Singleton + final: one EventBus instance, cannot be extended
class EventBus {
  private static instance: EventBus | null = null;
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  private constructor() {} // prevents both `new EventBus()` and `extends EventBus`

  static getInstance(): EventBus {
    return (EventBus.instance ??= new EventBus());
  }

  on<T>(event: string, handler: (payload: T) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const fn = handler as (payload: unknown) => void;
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn); // returns unsubscribe fn
  }

  emit<T>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  }
}

// class CustomBus extends EventBus {}   // ✗ Error TS2675 — constructor is private
const bus = EventBus.getInstance();
const off = bus.on<{ userId: string }>("user:login", (e) =>
  console.log(e.userId),
);
bus.emit("user:login", { userId: "u-42" });
off(); // unsubscribe
```
