# Builder Pattern — TypeScript Reference

> Separate the construction of a complex object from its representation, allowing
> the same process to produce different configurations via a fluent, step-by-step API.

---

## Example — `HttpRequestBuilder`

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

console.log(request);
// {
//   url: 'https://api.example.com/posts',
//   method: 'POST',
//   headers: { Authorization: 'Bearer tok-abc123', 'Content-Type': 'application/json', Accept: 'application/json' },
//   body: { title: 'Hello', body: 'World' },
//   timeout: 5000
// }
```

---

## TypeScript-Specific Notes

- **Return `this`, not the concrete class** — subclasses preserve their own type through the chain.
- **`Object.freeze` the product** — enforces immutability at runtime after `build()`.
- **Required fields in the constructor** — optional fields get defaults; this is the idiomatic TS alternative to overloaded constructors.
- **Step Builder variant** — for compile-time enforcement of required fields, each setter returns a distinct interface that exposes only the next legal method, culminating in a `build()` only available once all required fields are set.

---

## Step Builder Variant (compile-time required-field safety)

```typescript
// Each interface exposes only what is legal at that step
interface NeedsUrl {
  url(url: string): NeedsMethod;
}
interface NeedsMethod {
  method(m: HttpRequest["method"]): OptionalSteps;
}
interface OptionalSteps {
  auth(token: string): OptionalSteps;
  json(body: unknown): OptionalSteps;
  header(key: string, value: string): OptionalSteps;
  timeout(ms: number): OptionalSteps;
  build(): HttpRequest;
}

class StepHttpBuilder implements NeedsUrl, NeedsMethod, OptionalSteps {
  private _url = "";
  private _method: HttpRequest["method"] = "GET";
  private _headers: Record<string, string> = {};
  private _body: unknown = undefined;
  private _timeout = 30_000;

  // Private constructor — force use of the static entry point
  private constructor() {}

  static create(): NeedsUrl {
    return new StepHttpBuilder();
  }

  url(url: string): NeedsMethod {
    this._url = url;
    return this;
  }

  method(m: HttpRequest["method"]): OptionalSteps {
    this._method = m;
    return this;
  }

  auth(token: string): OptionalSteps {
    return this.header("Authorization", `Bearer ${token}`);
  }

  json(body: unknown): OptionalSteps {
    this._body = body;
    return this.header("Content-Type", "application/json");
  }

  header(key: string, value: string): OptionalSteps {
    this._headers[key] = value;
    return this;
  }

  timeout(ms: number): OptionalSteps {
    this._timeout = ms;
    return this;
  }

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

// Compiler enforces url → method first — build() not visible until both are set
const req = StepHttpBuilder.create()
  .url("https://api.example.com/users")
  .method("GET")
  .auth("tok-xyz")
  .timeout(10_000)
  .build();
```

---

## Trade-offs

| Gain                                                  | Give up                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| Readable, self-documenting construction               | Extra class boilerplate vs. a plain object literal              |
| Validation centralised in one place                   | Mutable builder state before `build()` is called                |
| Fluent API is easy to chain and diff in code review   | Method-chain order can be surprising if steps have side effects |
| Product is immutable once built                       | `build()` must be called explicitly — easy to forget            |
| Step Builder gives compile-time required-field safety | Step Builder adds significant interface boilerplate             |
