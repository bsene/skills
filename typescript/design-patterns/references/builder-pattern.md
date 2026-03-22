# Builder Pattern — TypeScript Reference

> Separate the construction of a complex object from its representation, allowing
> the same process to produce different configurations via a fluent, step-by-step API.

---

## Minimal Example — `QueryBuilder`

### Product

```typescript
interface QueryConfig {
  readonly table: string; // required
  readonly conditions: string[];
  readonly columns: string[];
  readonly limit: number | null;
  readonly offset: number;
  readonly orderBy: string | null;
}
```

### Builder

```typescript
class QueryBuilder {
  // Required fields set in constructor; optional fields have safe defaults
  private readonly _table: string;
  private _conditions: string[] = [];
  private _columns: string[] = ["*"];
  private _limit: number | null = null;
  private _offset: number = 0;
  private _orderBy: string | null = null;

  constructor(table: string) {
    if (!table.trim()) throw new Error("table name is required");
    this._table = table;
  }

  where(condition: string): this {
    this._conditions.push(condition);
    return this; // fluent — enables method chaining
  }

  select(...columns: string[]): this {
    this._columns = columns;
    return this;
  }

  limit(n: number): this {
    if (n < 0) throw new RangeError("limit must be ≥ 0");
    this._limit = n;
    return this;
  }

  offset(n: number): this {
    if (n < 0) throw new RangeError("offset must be ≥ 0");
    this._offset = n;
    return this;
  }

  orderBy(column: string): this {
    this._orderBy = column;
    return this;
  }

  /** Terminal method — produces the immutable product. */
  build(): QueryConfig {
    return Object.freeze({
      table: this._table,
      conditions: [...this._conditions],
      columns: [...this._columns],
      limit: this._limit,
      offset: this._offset,
      orderBy: this._orderBy,
    });
  }
}
```

### Usage

```typescript
const query = new QueryBuilder("users")
  .select("id", "email", "created_at")
  .where("active = true")
  .where("role = 'admin'")
  .orderBy("created_at")
  .limit(25)
  .offset(50)
  .build();

console.log(query);
// {
//   table: 'users',
//   columns: ['id', 'email', 'created_at'],
//   conditions: ['active = true', "role = 'admin'"],
//   orderBy: 'created_at',
//   limit: 25,
//   offset: 50
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

---

## Trade-offs

| Gain                                                  | Give up                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| Readable, self-documenting construction               | Extra class boilerplate vs. a plain object literal              |
| Validation centralised in one place                   | Mutable builder state before `build()` is called                |
| Fluent API is easy to chain and diff in code review   | Method-chain order can be surprising if steps have side effects |
| Product is immutable once built                       | `build()` must be called explicitly — easy to forget            |
| Step Builder gives compile-time required-field safety | Step Builder adds significant interface boilerplate             |
