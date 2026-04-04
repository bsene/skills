# Type System — Full Reference

_Verified against TypeScript 5.x official documentation._

## Contents

- [unknown vs any](#unknown-vs-any)
- [Type Narrowing & Refinement](#type-narrowing--refinement)
- [Discriminated Union Types](#discriminated-union-types)
- [Totality / Exhaustiveness Checking](#totality--exhaustiveness-checking)
- [Mapped Types](#mapped-types)
- [Conditional Types](#conditional-types)
- [User-Defined Type Guards](#user-defined-type-guards)
- [Type Branding (Nominal Types)](#type-branding-nominal-types)
- [Companion Object Pattern](#companion-object-pattern)
- [Type Widening & `as const`](#type-widening--as-const)
- [Escape Hatches](#escape-hatches)

---

## unknown vs any

`any` is the trapdoor out of the type system — it disables all checking on the value and everything derived from it. Avoid it except when migrating JS to TS or as a last-resort escape hatch.

`unknown` is the safe alternative — it represents any value, but TypeScript forces you to narrow it before use. It's the right type for external data sources: API responses, `JSON.parse`, user input, `localStorage`.

```typescript
// Safely parse an untrusted API response — unknown forces validation
async function fetchUser(
  id: string,
): Promise<{ id: string; name: string } | null> {
  const raw: unknown = await fetch(`/api/users/${id}`).then((r) => r.json());

  // ✗ Cannot use raw.id or raw.name without narrowing first:
  // return raw  // Error TS2322: Type 'unknown' is not assignable

  // ✓ Validate shape, then narrow:
  if (typeof raw !== "object" || raw === null) return null;
  if (!("id" in raw) || typeof raw.id !== "string") return null;
  if (!("name" in raw) || typeof raw.name !== "string") return null;
  return { id: raw.id, name: raw.name };
}
```

Rules:

1. TypeScript never infers `unknown` — you must annotate it explicitly.
2. You can compare `unknown` values with `==`, `===`, `!`, `||`, `&&`.
3. All type-specific operations require narrowing first.

---

## Type Narrowing & Refinement

TypeScript performs flow-based type inference — it tracks types through `if`, `switch`, `typeof`, `instanceof`, `in`, equality checks, and truthiness checks. This is called **refinement**.

```typescript
type SearchParam = string | string[] | null | undefined;

function normalizeParam(param: SearchParam): string {
  if (param == null) return ""; // narrows away null | undefined
  if (Array.isArray(param)) return param[0] ?? ""; // narrows to string[]
  return param.trim(); // narrows to string
}

// in — narrows to shapes that have the property
function renderContent(content: unknown): string {
  if (typeof content !== "object" || content === null) return String(content);
  if ("html" in content && typeof (content as any).html === "string")
    return (content as { html: string }).html;
  if ("text" in content && typeof (content as any).text === "string")
    return `<p>${(content as { text: string }).text}</p>`;
  return JSON.stringify(content);
}
```

Narrowing operators:

- `typeof` — `'string' | 'number' | 'boolean' | 'object' | 'function' | 'symbol' | 'bigint'`
- `instanceof` — narrows to class instance type
- `in` — narrows to shapes that have the property
- Equality (`===`, `!==`) — narrows to literal types
- Truthiness — narrows away `null | undefined | false | 0 | ''`
- `Array.isArray` — narrows `unknown` to `any[]`

---

## Discriminated Union Types

When union members have overlapping shapes, a **literal tag field** ensures TypeScript can discriminate between them reliably.

```typescript
// WebSocket / SSE message variants — each has a different payload shape
type AuthMessage = { type: "auth"; token: string };
type DataMessage = { type: "data"; payload: unknown; channel: string };
type ErrorMessage = { type: "error"; code: number; message: string };
type PingMessage = { type: "ping" };
type IncomingMessage = AuthMessage | DataMessage | ErrorMessage | PingMessage;

function handleMessage(msg: IncomingMessage): void {
  switch (msg.type) {
    case "auth":
      authenticate(msg.token);
      break;
    case "data":
      broadcast(msg.channel, msg.payload);
      break;
    case "error":
      console.error(`[${msg.code}] ${msg.message}`);
      break;
    case "ping":
      send({ type: "pong" });
      break;
  }
}

function authenticate(token: string) {
  /* validate JWT */
}
function broadcast(channel: string, payload: unknown) {
  /* fan out */
}
function send(msg: object) {
  /* send to client */
}
```

Tag requirements: same field name across all union members, literal type, not generic, mutually exclusive.

**Invaluable for:** Redux/Flux actions, `useReducer`, WebSocket message routing, API response variants.

---

## Totality / Exhaustiveness Checking

TypeScript warns when a return-typed function doesn't cover all code paths. Enable `noImplicitReturns` in `tsconfig.json` for full enforcement.

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function methodAllowsBody(method: HttpMethod): boolean {
  switch (method) {
    case "POST":
    case "PUT":
    case "PATCH":
      return true;
    case "GET":
    case "DELETE":
      return false;
    // Missing a case → Error TS2366: Function lacks ending return statement
  }
}

// assertNever — causes a compile-time error if a new union member is added but not handled
function assertNever(value: never, context: string): never {
  throw new Error(`Unhandled ${context}: ${JSON.stringify(value)}`);
}

function routeRequest(method: HttpMethod) {
  switch (method) {
    case "GET":
      return handleGet();
    case "POST":
      return handlePost();
    case "PUT":
      return handlePut();
    case "PATCH":
      return handlePatch();
    case "DELETE":
      return handleDelete();
    default:
      return assertNever(method, "HttpMethod");
  }
}
```

---

## Mapped Types

Create new object types by transforming each key of an existing type. TypeScript's built-in `Partial`, `Required`, `Readonly`, `Pick`, and `Record` are all built this way.

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: "admin" | "user" | "guest";
}

// PATCH endpoint body — all fields optional
type PatchUserBody = { [K in keyof UserProfile]?: UserProfile[K] };

// Safe read-only snapshot — no mutations allowed
type FrozenProfile = { readonly [K in keyof UserProfile]: UserProfile[K] };

// Remove readonly / optional with -
type MutableProfile = { -readonly [K in keyof FrozenProfile]: UserProfile[K] };
type RequiredProfile = { [K in keyof PatchUserBody]-?: UserProfile[K] };

// Keying in — extract nested response types without re-declaring them
type ApiListResponse<T> = {
  data: T[];
  meta: { total: number; page: number; perPage: number };
  links: { prev: string | null; next: string | null };
};
type PaginationMeta = ApiListResponse<unknown>["meta"];
// { total: number; page: number; perPage: number }

// keyof — derive a union of valid field names (useful for sort/filter params)
type SortableField = keyof Pick<UserProfile, "email" | "name" | "role">;
// 'email' | 'name' | 'role'
```

---

## Conditional Types

Type-level ternary expressions. Distribute automatically over union types.

```typescript
// Unwrap a Promise (built-in as Awaited<T> in TS 4.5+)
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type UserData = UnwrapPromise<ReturnType<typeof fetchUser>>; // inferred from async fn

// Strip null/undefined from a type (built-in as NonNullable<T>)
type Defined<T> = T extends null | undefined ? never : T;
type RequiredId = Defined<string | null>; // string

// Distributive conditional — applies to each member of a union
type ArrayWrap<T> = T extends unknown ? T[] : never;
type Wrapped = ArrayWrap<string | number>; // string[] | number[]

// infer — extract a type variable inline
type ResponseBody<F> = F extends (...args: any[]) => Promise<infer R>
  ? R
  : never;
type GetUserBody = ResponseBody<typeof fetchUser>; // { id: string; name: string } | null

// Without<T, U> — useful for filtering allowed HTTP methods
type Without<T, U> = T extends U ? never : T;
type ReadMethods = Without<HttpMethod, "POST" | "PUT" | "PATCH" | "DELETE">;
// 'GET'
```

Built-in conditional types: `Exclude<T,U>`, `Extract<T,U>`, `NonNullable<T>`, `ReturnType<F>`, `Awaited<T>`, `Parameters<F>`, `InstanceType<C>`.

---

## User-Defined Type Guards

Refinement doesn't cross scope boundaries — use a type predicate (`value is T`) to carry it.

```typescript
// Narrows unknown API response to a typed shape
function isUserProfile(val: unknown): val is UserProfile {
  return (
    typeof val === "object" &&
    val !== null &&
    "id" in val &&
    typeof (val as any).id === "string" &&
    "email" in val &&
    typeof (val as any).email === "string" &&
    "role" in val &&
    ["admin", "user", "guest"].includes((val as any).role)
  );
}

async function loadProfile(id: string): Promise<UserProfile> {
  const raw = await fetch(`/api/users/${id}`).then((r) => r.json());
  if (!isUserProfile(raw)) throw new Error("Unexpected response shape");
  return raw; // UserProfile ✓ — predicate carries the refinement
}

// Narrow a union of route handlers
type GetHandler = { method: "GET"; handler: (req: Request) => Response };
type PostHandler = {
  method: "POST";
  handler: (req: Request, body: unknown) => Response;
};
type RouteHandler = GetHandler | PostHandler;

function isPostHandler(h: RouteHandler): h is PostHandler {
  return h.method === "POST";
}
```

---

## Type Branding (Nominal Types)

TypeScript is structural — `UserId` and `SessionToken` are both just `string` aliases and are mutually assignable by default. Branding prevents accidental substitution at zero runtime cost.

```typescript
// Three distinct token/ID types that are all strings at runtime
type UserId = string & { readonly _brand: unique symbol };
type SessionToken = string & { readonly _brand: unique symbol };
type CsrfToken = string & { readonly _brand: unique symbol };

// Constructor functions — the only way to create branded values
const UserId = (id: string) => id as UserId;
const SessionToken = (tok: string) => tok as SessionToken;
const CsrfToken = (tok: string) => tok as CsrfToken;

// Functions that require a specific brand
function deleteUser(id: UserId) {
  /* ... */
}
function validateCsrf(token: CsrfToken) {
  /* ... */
}
function readSession(token: SessionToken) {
  /* ... */
}

const uid = UserId("u-abc123");
const csrf = CsrfToken("csrf-xyz");
const sess = SessionToken("sess-789");

deleteUser(uid); // ✓
deleteUser(csrf); // ✗ Error TS2345 — 'CsrfToken' not assignable to 'UserId'
validateCsrf(sess); // ✗ Error TS2345 — 'SessionToken' not assignable to 'CsrfToken'
```

Use when: auth tokens, user/product/order IDs, or any domain where two string-shaped values are easily confused.

---

## Companion Object Pattern

TypeScript's separate type and value namespaces let you declare the same name twice — once as a type, once as a value — and import both with a single statement.

```typescript
// HttpStatus as both a type and a value object — one import, full utility
type HttpStatus = { code: number; text: string }

let HttpStatus = {
  OK:           { code: 200, text: 'OK' }            as HttpStatus,
  CREATED:      { code: 201, text: 'Created' }        as HttpStatus,
  NO_CONTENT:   { code: 204, text: 'No Content' }     as HttpStatus,
  BAD_REQUEST:  { code: 400, text: 'Bad Request' }    as HttpStatus,
  UNAUTHORIZED: { code: 401, text: 'Unauthorized' }   as HttpStatus,
  NOT_FOUND:    { code: 404, text: 'Not Found' }      as HttpStatus,
  SERVER_ERROR: { code: 500, text: 'Internal Server Error' } as HttpStatus,

  isSuccess(s: HttpStatus)    { return s.code >= 200 && s.code < 300 },
  isClientError(s: HttpStatus){ return s.code >= 400 && s.code < 500 },
  fromCode(code: number): HttpStatus {
    return Object.values(HttpStatus)
      .find(v => typeof v === 'object' && (v as HttpStatus).code === code)
      as HttpStatus ?? { code, text: 'Unknown' }
  }
}

// Single import covers type annotation and utility methods:
// import { HttpStatus } from './HttpStatus'
const status: HttpStatus = HttpStatus.NOT_FOUND
console.log(HttpStatus.isClientError(status))  // true
res.status(status.code).json({ error: status.text })
```

---

## Type Widening & `as const`

`let` declarations widen literal types to their base type. `const` preserves literals. Use `as const` to freeze values to their narrowest type.

```typescript
let method = "GET"; // string  (widened — bad for fetch())
const verb = "POST"; // 'POST'  (literal — good)

// as const on objects — all fields become readonly literals
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
} as const;
// type: { readonly 'Content-Type': 'application/json'; readonly 'Accept': 'application/json' }

// as const on arrays — narrows to a readonly tuple with literal element types
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
// 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Useful for route config objects
const ROUTES = {
  users: "/api/users",
  profile: "/api/users/me",
  sessions: "/api/sessions",
} as const;
type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
// '/api/users' | '/api/users/me' | '/api/sessions'
```

---

## Escape Hatches

Use as a last resort — each one weakens the type system.

**Type assertions (`as T`):** Override the inferred type. Only valid when `A <: B` or `B <: A`.

```typescript
// You know the element is an HTMLInputElement
const searchInput = document.querySelector<HTMLInputElement>("#search")!;
// Prefer the generic overload above over: document.querySelector('#search') as HTMLInputElement
```

**Non-null assertions (`!`):** Assert that a value is not `null | undefined`.

```typescript
// You know the ref is mounted when this runs
this.containerRef.current!.scrollIntoView({ behavior: "smooth" });
```

**Definite assignment assertions (`!:`):** Tell TypeScript a variable will be assigned before use even though it can't prove it statically.

```typescript
let db!: DatabaseConnection; // assigned by initDb() during app bootstrap
async function bootstrap() {
  db = await DatabaseConnection.connect(process.env.DATABASE_URL!);
}
// Later, after bootstrap() has run:
db.query("SELECT 1"); // OK — asserted as definitely assigned
```

When you find yourself using these frequently it usually signals the types should be restructured rather than asserted around.
