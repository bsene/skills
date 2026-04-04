# SOLID Principles — Annotated Examples

## Contents

- [SRP — Single Responsibility](#srp)
- [OCP — Open–Closed](#ocp)
- [LSP — Liskov Substitution](#lsp)
- [ISP — Interface Segregation](#isp)
- [DIP — Dependency Inversion](#dip)

---

## SRP — Single Responsibility Principle

One reason to change. Separate concerns into focused classes.

```typescript
// ✗ Violation: UserController handles auth, hashing, and persistence all at once
class UserController {
  register(email: string, password: string) {
    if (!email.includes("@")) throw new Error("Bad email"); // validation — wrong concern
    const hash = this.bcryptHash(password); // hashing — wrong concern
    this.db.insert({ email, hash }); // persistence — wrong concern
  }
  private bcryptHash(pw: string) {
    return pw.split("").reverse().join("");
  }
  private db = { insert: (u: unknown) => {} };
}

// ✓ Three focused classes — each has exactly one reason to change
class UserValidator {
  validate(email: string, password: string) {
    if (!email.includes("@")) throw new Error("Invalid email");
    if (password.length < 8) throw new Error("Password too short");
  }
}

class PasswordHasher {
  hash(plaintext: string): string {
    return `hashed:${plaintext}`; /* bcrypt */
  }
  verify(plaintext: string, hash: string): boolean {
    return hash === this.hash(plaintext);
  }
}

class UserRepository {
  save(user: { email: string; passwordHash: string }) {
    /* persist to DB */
  }
  findByEmail(email: string) {
    /* query DB */
  }
}
```

---

## OCP — Open–Closed Principle

Open for extension, closed for modification. Add behavior via subclass, not edits.

```typescript
// Base formatter — proven, tested, never touched again
class JsonResponseFormatter {
  format(data: unknown): string {
    return JSON.stringify(data);
  }
  contentType() {
    return "application/json";
  }
}

// New requirement: CSV export — extend, don't modify
class CsvResponseFormatter extends JsonResponseFormatter {
  format(data: unknown): string {
    const rows = Array.isArray(data) ? data : [data];
    const keys = Object.keys(rows[0] ?? {});
    return [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => (r as any)[k]).join(",")),
    ].join("\n");
  }
  contentType() {
    return "text/csv";
  }
}

// Another requirement: pretty-printed JSON for debugging
class PrettyJsonFormatter extends JsonResponseFormatter {
  format(data: unknown): string {
    return JSON.stringify(data, null, 2);
  }
}

function sendResponse(formatter: JsonResponseFormatter, data: unknown) {
  console.log(`Content-Type: ${formatter.contentType()}`);
  console.log(formatter.format(data));
}
```

---

## LSP — Liskov Substitution Principle

Subtypes must be substitutable for supertypes without surprising callers.

Violation signals:

- `instanceof` checks in calling code
- Subclass throws "operation not supported" for inherited methods
- Subclass silently ignores or weakens the contract

```typescript
// ✗ Violation: ReadOnlyCache can't honour the full Cache contract
class Cache<T> {
  set(key: string, value: T): void {
    /* ... */
  }
  get(key: string): T | undefined {
    return undefined;
  }
  delete(key: string): void {
    /* ... */
  }
}
class ReadOnlyCache<T> extends Cache<T> {
  set(): never {
    throw new Error("Read-only cache");
  } // breaks LSP
  delete(): never {
    throw new Error("Read-only cache");
  } // breaks LSP
}

// ✓ Fix: segregate read and write contracts — ReadableCache only promises what it delivers
interface ReadableCache<T> {
  get(key: string): T | undefined;
  has(key: string): boolean;
}
interface WritableCache<T> extends ReadableCache<T> {
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
}

class InMemoryCache<T> implements WritableCache<T> {
  private store = new Map<string, T>();
  get(key: string) {
    return this.store.get(key);
  }
  has(key: string) {
    return this.store.has(key);
  }
  set(key: string, value: T) {
    this.store.set(key, value);
  }
  delete(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

class FrozenCache<T> implements ReadableCache<T> {
  constructor(private data: Map<string, T>) {}
  get(key: string) {
    return this.data.get(key);
  }
  has(key: string) {
    return this.data.has(key);
  }
}
```

---

## ISP — Interface Segregation Principle

Many focused interfaces beat one fat one. Clients depend only on what they use.

```typescript
// ✗ Fat interface — a read-only analytics dashboard is forced to implement write ops
interface DataStore {
  read(query: string): Promise<unknown[]>;
  write(table: string, row: unknown): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  stream(query: string): AsyncIterable<unknown>;
  transaction(fn: () => Promise<void>): Promise<void>;
}

// ✓ Focused interfaces — each consumer depends only on its slice
interface Readable {
  read(query: string): Promise<unknown[]>;
}
interface Streamable {
  stream(query: string): AsyncIterable<unknown>;
}
interface Writable {
  write(table: string, row: unknown): Promise<void>;
  delete(table: string, id: string): Promise<void>;
}
interface Transactional {
  transaction(fn: () => Promise<void>): Promise<void>;
}

// Analytics dashboard only needs to read and stream
class AnalyticsDashboard {
  constructor(private db: Readable & Streamable) {}
  async buildReport() {
    return this.db.read("SELECT * FROM events");
  }
}

// Full store implements everything
class PostgresStore implements Readable, Streamable, Writable, Transactional {
  async read(q: string) {
    return [];
  }
  async *stream(q: string) {
    yield {};
  }
  async write(t: string, row: unknown) {
    /* ... */
  }
  async delete(t: string, id: string) {
    /* ... */
  }
  async transaction(fn: () => Promise<void>) {
    await fn();
  }
}
```

---

## DIP — Dependency Inversion Principle

High-level modules depend on abstractions, not concretions.

```typescript
// ✗ EmailService directly coupled to a specific SMTP provider
class EmailService {
  private client = new SendgridClient({ apiKey: process.env.SENDGRID_KEY! });
  async send(to: string, subject: string, body: string) {
    await this.client.sendMail({ to, subject, html: body });
  }
}

// ✓ Both depend on the MailTransport abstraction — swap providers without touching EmailService
interface MailTransport {
  send(to: string, subject: string, htmlBody: string): Promise<void>;
}

class SendgridTransport implements MailTransport {
  async send(to: string, subject: string, htmlBody: string) {
    // Sendgrid-specific implementation
  }
}

class SmtpTransport implements MailTransport {
  async send(to: string, subject: string, htmlBody: string) {
    // nodemailer SMTP implementation
  }
}

class NullTransport implements MailTransport {
  sent: { to: string; subject: string }[] = [];
  async send(to: string, subject: string) {
    this.sent.push({ to, subject });
  }
}

class EmailService {
  constructor(private transport: MailTransport) {} // depends on abstraction
  async sendWelcome(to: string) {
    await this.transport.send(to, "Welcome!", "<h1>Hello!</h1>");
  }
  async sendPasswordReset(to: string, link: string) {
    await this.transport.send(
      to,
      "Reset your password",
      `<a href="${link}">Reset</a>`,
    );
  }
}

// Production
const emailService = new EmailService(new SendgridTransport());
// Tests — no real emails sent
const testService = new EmailService(new NullTransport());
```
