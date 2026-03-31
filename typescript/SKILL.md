---
name: typescript
description: >
  Apply design patterns, type-system features, and SOLID principles in idiomatic
  TypeScript. Use when the user asks about a named pattern (Strategy, Abstract
  Factory, Builder, Factory, Observer, Singleton, Decorator, Proxy, Mixin,
  Flyweight, Mediator), asks how to structure or decouple classes, wants to apply
  SOLID principles, or describes a problem a pattern solves: "swap algorithms at
  runtime", "create families of related objects", "notify subscribers on state
  change", "construct a complex object step-by-step", "add logging without
  modifying classes", "share behavior across unrelated classes". Also use for
  advanced type-system topics: unknown vs any, type narrowing, discriminated
  unions, mapped/conditional types, type branding, companion object pattern, and
  error-handling strategies. Based on Pro TypeScript 2nd ed. (Fenton 2018) and
  Programming TypeScript (Cherny, O'Reilly 2019), verified against TS 5.x docs.
---

# TypeScript Design Patterns & Type System

## Quick Pattern Selector

| Problem                                          | Pattern                              |
| ------------------------------------------------ | ------------------------------------ |
| One shared instance (DB, config, logger)         | **Singleton**                        |
| Swap algorithms at runtime                       | **Strategy**                         |
| Create families of related objects               | **Abstract Factory**                 |
| Create objects without naming the concrete class | **Factory**                          |
| Construct complex objects step-by-step           | **Builder**                          |
| Pair a type and utility object under one name    | **Companion Object**                 |
| Notify subscribers on state change               | **Observer**                         |
| Add cross-cutting behavior non-invasively        | **Decorator** (TS 5+ standard)       |
| Intercept/validate/log property access           | **Proxy**                            |
| Share behavior across unrelated classes          | **Mixin** (class-expression pattern) |
| Reuse instances to reduce memory                 | **Flyweight**                        |
| Decouple via a central hub                       | **Mediator**                         |

→ Full pattern examples with trade-offs: `references/patterns.md`
→ Builder + Step Builder variant: `references/builder-pattern.md`

---

## Response Format

For every pattern or type topic, provide:

1. **What it is** — one sentence
2. **When to use / NOT to use** — concrete conditions
3. **Minimal TypeScript 5+ example** — runnable
4. **Trade-offs** — gains vs. costs
5. **⚠️ Caveat** — flag any divergence from the books

---

## SOLID Principles

Apply when reviewing class design or explaining why a pattern fits.

**SRP** — One reason to change. A `UserController` that also validates and hashes passwords needs splitting.
**OCP** — Extend via subclass, don't modify proven code. Add a `CsvResponseFormatter` without editing `JsonResponseFormatter`.
**LSP** — Subtypes substitutable without surprising callers. No `instanceof` checks in calling code.
**ISP** — Many focused interfaces over one fat one. Split `AuthProvider` into `Authenticator | TokenIssuer | SessionStore`.
**DIP** — Depend on abstractions. `EmailService(private transport: MailTransport)` not `SendgridClient`.

→ Annotated examples: `references/solid.md`

---

## Pattern Summaries

### Factory

Create objects without exposing the concrete class. Use the companion object pattern to pair the type and factory under one name.

```typescript
type ApiClient = { get(path: string): Promise<unknown> };

class RestClient implements ApiClient {
  async get(path: string) {
    return fetch(path).then((r) => r.json());
  }
}
class GraphQLClient implements ApiClient {
  async get(path: string) {
    return fetch(path, { method: "POST" }).then((r) => r.json());
  }
}
class MockClient implements ApiClient {
  async get(path: string) {
    return { mock: true, path };
  }
}

let ApiClient = {
  create(kind: "rest" | "graphql" | "mock"): ApiClient {
    switch (kind) {
      case "rest":
        return new RestClient();
      case "graphql":
        return new GraphQLClient();
      case "mock":
        return new MockClient();
    }
  },
};
const client = ApiClient.create(
  process.env.NODE_ENV === "test" ? "mock" : "rest",
);
```

### Strategy

Encapsulate interchangeable algorithms; swap at runtime.

```typescript
interface AuthStrategy {
  verify(token: string): Promise<{ userId: string } | null>;
}

class JwtAuth implements AuthStrategy {
  async verify(token: string) {
    // validate JWT signature + expiry
    return token.startsWith("Bearer ") ? { userId: "u-1" } : null;
  }
}
class ApiKeyAuth implements AuthStrategy {
  async verify(token: string) {
    // look up token in DB
    return token === process.env.API_KEY ? { userId: "service" } : null;
  }
}

class AuthMiddleware {
  constructor(private strategy: AuthStrategy) {}
  async handle(req: { headers: Record<string, string> }) {
    const token = req.headers["authorization"] ?? "";
    return this.strategy.verify(token);
  }
}

const mw = new AuthMiddleware(new JwtAuth());
```

### Abstract Factory

Interface for creating compatible product families; client knows nothing of concrete classes.

```typescript
interface Button {
  html(): string;
  onClick(fn: () => void): void;
}
interface Input {
  html(): string;
  value(): string;
}

class WebButton implements Button {
  html() {
    return '<button class="btn">Submit</button>';
  }
  onClick(fn: () => void) {
    /* attach addEventListener */
  }
}
class WebInput implements Input {
  html() {
    return '<input type="text" />';
  }
  value() {
    return "";
  }
}
class NativeButton implements Button {
  html() {
    return "[NativeButton]";
  }
  onClick(fn: () => void) {
    /* native tap handler */
  }
}
class NativeInput implements Input {
  html() {
    return "[NativeTextField]";
  }
  value() {
    return "";
  }
}

interface UIFactory {
  createButton(): Button;
  createInput(): Input;
}
class WebUIFactory implements UIFactory {
  createButton() {
    return new WebButton();
  }
  createInput() {
    return new WebInput();
  }
}
class NativeUIFactory implements UIFactory {
  createButton() {
    return new NativeButton();
  }
  createInput() {
    return new NativeInput();
  }
}

class LoginForm {
  private btn: Button;
  private input: Input;
  constructor(factory: UIFactory) {
    this.btn = factory.createButton();
    this.input = factory.createInput();
  }
  render() {
    return `${this.input.html()} ${this.btn.html()}`;
  }
}
new LoginForm(new WebUIFactory()).render();
```

### Builder

Fluent step-by-step construction; centralises validation; returns an immutable product.

```typescript
class HttpRequestBuilder {
  private _headers: Record<string, string> = {};
  private _body: unknown = undefined;
  private _method: "GET" | "POST" | "PUT" | "DELETE" = "GET";

  constructor(private _url: string) {}

  method(m: "GET" | "POST" | "PUT" | "DELETE"): this {
    this._method = m;
    return this;
  }
  header(key: string, value: string): this {
    this._headers[key] = value;
    return this;
  }
  json(body: unknown): this {
    this._body = body;
    return this.header("Content-Type", "application/json");
  }
  auth(token: string): this {
    return this.header("Authorization", `Bearer ${token}`);
  }

  build() {
    return Object.freeze({
      url: this._url,
      method: this._method,
      headers: { ...this._headers },
      body: this._body,
    });
  }
}

const req = new HttpRequestBuilder("https://api.example.com/users")
  .method("POST")
  .auth("tok-xyz")
  .json({ name: "Alice" })
  .build();
```

→ Full example + Step Builder (compile-time required-field safety): `references/builder-pattern.md`

### Companion Object Pattern

TypeScript's separate type/value namespaces let you bind the same name to both a type and a utility object. Import both with one statement.

```typescript
type HttpStatus = { code: number; text: string };
let HttpStatus = {
  OK: { code: 200, text: "OK" } as HttpStatus,
  CREATED: { code: 201, text: "Created" } as HttpStatus,
  BAD_REQUEST: { code: 400, text: "Bad Request" } as HttpStatus,
  UNAUTHORIZED: { code: 401, text: "Unauthorized" } as HttpStatus,
  NOT_FOUND: { code: 404, text: "Not Found" } as HttpStatus,
  isSuccess(s: HttpStatus) {
    return s.code >= 200 && s.code < 300;
  },
  isClientError(s: HttpStatus) {
    return s.code >= 400 && s.code < 500;
  },
};

const status: HttpStatus = HttpStatus.NOT_FOUND;
console.log(HttpStatus.isClientError(status)); // true
```

### Real Mixins ⚠️

Use the class-expression pattern only. Legacy `applyMixins` has no `super()` and is now marked outdated in the official handbook.

```typescript
type Constructor<T = object> = new (...args: any[]) => T;

function Cacheable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private cache = new Map<string, unknown>();
    getCached<T>(key: string, compute: () => T): T {
      if (!this.cache.has(key)) this.cache.set(key, compute());
      return this.cache.get(key) as T;
    }
  };
}
function RateLimited<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private hits = 0;
    private windowStart = Date.now();
    checkLimit(maxPerSecond: number): boolean {
      if (Date.now() - this.windowStart > 1000) {
        this.hits = 0;
        this.windowStart = Date.now();
      }
      return ++this.hits <= maxPerSecond;
    }
  };
}

class BaseApiHandler {
  constructor(public name: string) {}
}

const ApiHandler = Cacheable(RateLimited(BaseApiHandler));
const handler = new ApiHandler("products");
handler.checkLimit(100);
handler.getCached("list", () => [{ id: 1 }]);
```

"is-a" → inheritance · "has-a" → delegation · "can-do" → mixin.

### Decorator (TS 5.0+ Standard API) ⚠️

Cross-cutting concerns applied declaratively. No flag needed.

```typescript
// Logs method calls with timing — useful for API route handlers
function logRequest(
  originalMethod: Function,
  ctx: ClassMethodDecoratorContext,
) {
  return async function (this: unknown, ...args: unknown[]) {
    const start = Date.now();
    const result = await (originalMethod as Function).call(this, ...args);
    console.log(`[${String(ctx.name)}] ${Date.now() - start}ms`);
    return result;
  };
}

// Validates that the first argument has required fields
function requireBody(fields: string[]) {
  return function (originalMethod: Function, ctx: ClassMethodDecoratorContext) {
    return function (
      this: unknown,
      body: Record<string, unknown>,
      ...rest: unknown[]
    ) {
      const missing = fields.filter((f) => !(f in body));
      if (missing.length)
        throw new Error(`Missing fields: ${missing.join(", ")}`);
      return (originalMethod as Function).call(this, body, ...rest);
    };
  };
}

class UserController {
  @logRequest
  async getUser(id: string) {
    return { id, name: "Alice" };
  }

  @requireBody(["email", "password"])
  async register(body: Record<string, unknown>) {
    return { created: true };
  }
}
```

Frameworks using DI-style `@inject` (Angular, NestJS, typeorm) still require `"experimentalDecorators": true`. The two APIs are not interoperable.

---

## Type System

→ Full examples: `references/type-system.md`

### `unknown` over `any`

`any` opts out of all type checking. `unknown` forces a narrowing check before use — prefer it for API responses and external data.

```typescript
// Safely parse an untrusted API response body
function parseResponseBody(body: unknown): { id: string; name: string } | null {
  if (typeof body !== "object" || body === null) return null;
  if (!("id" in body) || !("name" in body)) return null;
  const { id, name } = body as Record<string, unknown>;
  if (typeof id !== "string" || typeof name !== "string") return null;
  return { id, name };
}
```

### Type Narrowing & Discriminated Unions

Flow-based narrowing via `typeof`, `instanceof`, `in`, equality checks. For union types with overlapping shapes, a **literal tag field** discriminates reliably:

```typescript
type ApiSuccess<T> = { status: "success"; data: T; statusCode: number };
type ApiError = { status: "error"; message: string; statusCode: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

function handleResponse<T>(res: ApiResponse<T>) {
  if (res.status === "success") {
    console.log(res.data); // T ✓ — fully narrowed
  } else {
    console.error(res.message); // string ✓
  }
}
```

### Mapped & Conditional Types

```typescript
// Make all config fields optional for partial updates (PATCH requests)
type PatchBody<T> = { [K in keyof T]?: T[K] };

// Strip functions — useful for serializing state to JSON
type Serializable<T> = { [K in keyof T]: T[K] extends Function ? never : T[K] };

// Unwrap a Promise return type
type Awaited_<T> = T extends Promise<infer U> ? U : T;
type UserData = Awaited_<ReturnType<typeof fetchUser>>; // inferred from async fn
```

### Type Branding

Prevent accidental substitution of structurally identical token/ID types at zero runtime cost:

```typescript
type UserId = string & { readonly _brand: unique symbol };
type SessionToken = string & { readonly _brand: unique symbol };
type CsrfToken = string & { readonly _brand: unique symbol };

const UserId = (id: string) => id as UserId;
const SessionToken = (tok: string) => tok as SessionToken;
const CsrfToken = (tok: string) => tok as CsrfToken;

function getSession(token: SessionToken) {
  /* ... */
}
getSession(CsrfToken("abc")); // ✗ Error — wrong brand, caught at compile time
```

---

## Error Handling

| Strategy                                     | Caller forced to handle?   | Composability        |
| -------------------------------------------- | -------------------------- | -------------------- |
| Return `T \| null`                           | Yes (null check)           | Low                  |
| Throw exception                              | No — easy to miss          | High                 |
| **Return exception** `T \| ErrorA \| ErrorB` | **Yes — union exhaustion** | Medium               |
| Option/Either type                           | Via `.flatMap` chain       | High (needs library) |

**Return exceptions (preferred for expected failures):**

```typescript
class BadRequestError extends Error {
  readonly status = 400 as const;
}
class UnauthorizedError extends Error {
  readonly status = 401 as const;
}
class NotFoundError extends Error {
  readonly status = 404 as const;
}

function resolveUser(
  token: string,
  id: string,
): User | BadRequestError | UnauthorizedError | NotFoundError {
  if (!id.trim()) return new BadRequestError("Missing user ID");
  if (!isValidJwt(token)) return new UnauthorizedError("Invalid token");
  const user = userStore.get(id);
  if (!user) return new NotFoundError(`User ${id} not found`);
  return user;
}

const result = resolveUser(authHeader, userId);
if (result instanceof BadRequestError) res.status(400).send(result.message);
else if (result instanceof UnauthorizedError)
  res.status(401).send(result.message);
else if (result instanceof NotFoundError) res.status(404).send(result.message);
else res.status(200).json(result);
```

---

## Generics

```typescript
// Generic fetch wrapper — infers response shape from the type parameter
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
const user = await apiFetch<{ id: string; name: string }>("/api/users/1");

// Generic repository interface
interface Repository<T, TId> {
  findById(id: TId): Promise<T | null>;
  save(item: T): Promise<T>;
  delete(id: TId): Promise<void>;
}

// Typed route params prevent mixing up path segments
class RouteParam<TKind extends string> {
  constructor(
    readonly kind: TKind,
    readonly value: string,
  ) {}
  toString() {
    return `${this.kind}:${this.value}`;
  }
}
class UserId extends RouteParam<"userId"> {}
class PostSlug extends RouteParam<"postSlug"> {}
```

TS 5.x `const` type parameters — preserves literal route/method types:

```typescript
function buildRoute<const T extends readonly string[]>(...segments: T): T {
  return segments;
}
const route = buildRoute("api", "users", "profile");
// type: readonly ['api', 'users', 'profile'] — not string[]
```

---

## OO Concepts

**Open recursion** — `this.method()` dispatches to the most-derived class.
**Delegation** — pass `this` into a collaborator so it can call back. Prefer when "has-a" applies.
**Structural polymorphism** — explicit `implements` is optional; shape compatibility is enough.

---

## TypeScript at Scale

### Strictness as Policy

Enable `"strict": true` globally. Enforce in CI so regressions are blocked before merge. Prefer `@ts-expect-error` (fails if the error disappears) over `@ts-ignore` (silently stale). Track `any` usage as a metric and reduce it continuously via linting.

### Domain Types vs Transport Types

Keep API/DTO types separate from domain models. Map external responses into domain objects at architectural boundaries — don't let wire-format shapes leak into business logic.

```typescript
// Transport (DTO) — mirrors the API wire format
type UserDTO = { user_id: string; display_name: string; created_at: string };

// Domain — owned by the application
type User = { id: string; name: string; createdAt: Date };

function toDomain(dto: UserDTO): User {
  return {
    id: dto.user_id,
    name: dto.display_name,
    createdAt: new Date(dto.created_at),
  };
}
```

### Runtime Validation at Boundaries

TypeScript is compile-time only. Validate external inputs (API bodies, env vars, message queues) at entry points with a schema library (e.g., Zod). Never trust inbound shapes.

```typescript
import { z } from "zod";

const UserSchema = z.object({ id: z.string(), name: z.string() });

// In an API handler — validated once, typed for the rest of the app
const user = UserSchema.parse(req.body); // throws ZodError on mismatch
```

### Monorepo Contracts

In a monorepo, publish domain contracts as a dedicated package (e.g., `@org/contracts`) shared by frontend, backend, and services. Use TypeScript project references to make boundaries explicit and enforce that packages don't import deeply across each other.

Version shared types semantically: deprecate before removing, and communicate breaking changes before merging.

### Type Debt

Track type debt like failing tests: measure excessive `any` usage, inconsistent `null` handling, and duplicate type definitions. Reduce via linting rules (`@typescript-eslint/no-explicit-any`) and gradual refactoring — don't let it accumulate silently.

> Types are documentation. If they confuse humans, they're failing.

---

## Acknowledgments

> **Pro TypeScript: Application-Scale JavaScript Development** (2nd ed.)
> Steve Fenton — Apress, 2018
> Chapters 1, 2, 4 (Language Features, Code Organization, Object Orientation in TypeScript)

> **Programming TypeScript: Making Your JavaScript Applications Scale**
> Boris Cherny — O'Reilly Media, 2019
> Chapters 3, 4, 5, 6, 7 (All About Types, Functions, Classes & Interfaces, Advanced Types, Handling Errors)

All examples updated and verified against the TypeScript 5.x official documentation at typescriptlang.org.
