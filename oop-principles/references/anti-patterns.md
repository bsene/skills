# Anti-Patterns & Fixes

Common code smells from class-oriented thinking in TypeScript/JavaScript and their fixes.

## 1. The Checksum Calculator (Class with no state)

### Anti-Pattern
```typescript
class ChecksumCalculator {
  static calculate(data: string): string {
    // implementation
  }

  static validate(data: string, checksum: string): boolean {
    // implementation
  }

  private static helperMethod(): void {
    // private static method is unusual
  }
}
```

**Problem:**
- Unnecessarily wraps utility functions in a class
- No state to manage, just utility functions
- Constructor is never called, object never instantiated

### Fix (Utility object)
```typescript
const ChecksumCalculator = {
  calculate(data: string): string {
    // implementation
  },

  validate(data: string, checksum: string): boolean {
    // implementation
  },

  // Private helper (truly hidden from consumers)
  _helperMethod(): void {
    // now not exposed
  }
} as const;
```

Or as standalone functions:
```typescript
export function calculateChecksum(data: string): string {
  // implementation
}

export function validateChecksum(data: string, checksum: string): boolean {
  // implementation
}

function helperMethod(): void {
  // truly private in module scope
}
```

---

## 2. The Service Class (Single method class)

### Anti-Pattern
```typescript
class UserRegistrationService {
  constructor(private userParams: UserInput) {}

  async call(): Promise<User> {
    this.validateParams();
    const user = await this.createUser();
    await this.sendConfirmationEmail(user);
    return user;
  }

  private validateParams(): void {
    // ...
  }

  private async createUser(): Promise<User> {
    return await User.create(this.userParams);
  }

  private async sendConfirmationEmail(user: User): Promise<void> {
    // ...
  }
}

// Usage
const user = await new UserRegistrationService(params).call();
```

**Problem:**
- Temporary object created and discarded immediately
- No persistent state (only temporary variables)
- Single entry point (`call`)
- Unnecessary object allocation

### Fix (Function)
```typescript
async function registerUser(userParams: UserInput): Promise<User> {
  validateParams(userParams);
  const user = await createUser(userParams);
  await sendConfirmationEmail(user);
  return user;
}

function validateParams(userParams: UserInput): void {
  // ...
}

async function createUser(userParams: UserInput): Promise<User> {
  return await User.create(userParams);
}

async function sendConfirmationEmail(user: User): Promise<void> {
  // ...
}

// Usage
const user = await registerUser(params);
```

---

## 3. The Decorator Pattern (Over-engineered)

### Anti-Pattern
```typescript
class DiscountDecorator {
  constructor(private item: Item) {}

  getPrice(): number {
    return this.item.price * 0.9;
  }

  getDescription(): string {
    return `${this.item.description} (10% off)`;
  }
}

class TaxDecorator {
  constructor(private item: Item) {}

  getPrice(): number {
    return this.item.price * 1.08;
  }

  getDescription(): string {
    return this.item.description;
  }
}

// Usage
let item: Item = new Product();
item = new DiscountDecorator(item);
item = new TaxDecorator(item);
```

**Problem:**
- Lots of boilerplate wrapper classes
- Hard to compose and test
- Overkill for simple transformations

### Fix (composition + functions)
```typescript
const applyDiscount = (price: number, percent: number): number =>
  price * (1 - percent / 100);

const applyTax = (price: number, rate: number): number =>
  price * (1 + rate / 100);

let price = 100;
price = applyDiscount(price, 10);
price = applyTax(price, 8);
```

Advanced: configure via higher-order functions, e.g. `const withDiscount = (pct: number) => (price: number) => price * (1 - pct / 100);`

---

## 4. The Builder Pattern (Invalid after construction)

### Anti-Pattern
```typescript
class ReportBuilder {
  data: unknown | null = null;
  format: string | null = null;

  setData(data: unknown): this {
    this.data = data;
    return this;
  }

  setFormat(format: string): this {
    this.format = format;
    return this;
  }

  build(): Report {
    if (!this.data) throw new Error("Data not set!");
    if (!this.format) throw new Error("Format not set!");
    // generate report
  }
}

// Usage
const report = new ReportBuilder()
  .setData(data)
  .setFormat("pdf")
  .build();
```

**Problem:**
- Object is invalid immediately after construction
- Requires multiple chained setters before use
- Encourages invalid intermediate states
- Error checking at build time instead of construction time

### Fix (use a function)
```typescript
function buildReport(data: unknown, format: string): Report {
  if (!data) throw new Error("Data is required");
  if (!format) throw new Error("Format is required");
  // generate report
}

// Usage
const report = buildReport(data, "pdf");
```

Or use a configuration object:
```typescript
interface ReportConfig {
  data: unknown;
  format: string;
}

function buildReport(config: ReportConfig): Report {
  if (!config.data) throw new Error("Data is required");
  if (!config.format) throw new Error("Format is required");
  // generate report
}

// Usage
const report = buildReport({ data, format: "pdf" });
```

---

## 5. Over-inheritance (Tight coupling to framework)

### Anti-Pattern
```typescript
// If using an ORM like TypeORM or Sequelize
@Entity()
class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  // You wanted database persistence, but got:
  // - heavy framework coupling
  // - lots of decorators
  // - side effects on instantiation
  // - hard to test in isolation
}
```

**Problem:**
- Tight coupling to the framework
- Entity class has decorator side effects
- Hard to test without database
- Entity logic mixed with persistence logic

### Fix (Composition + separate repository)
```typescript
// Pure domain object
interface User {
  id: number;
  name: string;
  email: string;
}

// Separate validation logic
const validateUser = (user: User): boolean => {
  if (!user.email) throw new Error("Email is required");
  if (!user.name) throw new Error("Name is required");
  return true;
};

// Separate persistence logic
class UserRepository {
  async save(user: User): Promise<void> {
    // use ORM internally if needed
    validateUser(user);
    await database.query("INSERT INTO users ...", user);
  }

  async findById(id: number): Promise<User | null> {
    return await database.query("SELECT * FROM users WHERE id = ?", id);
  }
}
```

---

## 6. The Data Class with Boilerplate

### Anti-Pattern
```typescript
class Person {
  name: string;
  age: number;
  email: string;

  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
}
```

**Problem:**
- Repeats property names 2+ times (error-prone)
- Lots of boilerplate for no behavior
- Tempts you to add logic that doesn't belong

### Fix 1 (Type alias — simplest)
```typescript
type Person = {
  name: string;
  age: number;
  email: string;
};

const person: Person = { name: "Alice", age: 30, email: "alice@example.com" };
```

### Fix 2 (Interface)
```typescript
interface Person {
  name: string;
  age: number;
  email: string;
}

const person: Person = { name: "Alice", age: 30, email: "alice@example.com" };
```

### Fix 3 (Object literal)
```typescript
const person = { name: "Alice", age: 30, email: "alice@example.com" };
// Type is inferred: { name: string; age: number; email: string }
```

### Fix 4 (Class with shorthand constructor, if you need methods later)
```typescript
class Person {
  constructor(
    public name: string,
    public age: number,
    public email: string
  ) {}
}

const person = new Person("Alice", 30, "alice@example.com");
```

---

## 7. Logic mixed with data (Fat domain object)

### Anti-Pattern
```typescript
class User {
  birthYear: number;

  constructor(birthYear: number) {
    this.birthYear = birthYear;
  }

  getAge(): number {
    return new Date().getFullYear() - this.birthYear;
  }

  isAdult(): boolean {
    return this.getAge() >= 18;
  }

  getTaxBracket(): string {
    const age = this.getAge();
    if (age < 18) return "minor";
    if (age < 65) return "standard";
    return "senior";
  }
}
```

**Problem:**
- Logic is tightly coupled to data
- Hard to test (need User objects)
- Hard to reuse (must instantiate)
- Business logic buried in domain model

### Fix (separate concerns)
```typescript
// Pure data
type User = {
  birthYear: number;
};

// Separate logic
const calculateAge = (birthYear: number): number =>
  new Date().getFullYear() - birthYear;

const isAdult = (age: number): boolean =>
  age >= 18;

const getTaxBracket = (age: number): string => {
  if (age < 18) return "minor";
  if (age < 65) return "standard";
  return "senior";
};

// Usage
const user: User = { birthYear: 1990 };
const age = calculateAge(user.birthYear);
const bracket = getTaxBracket(age);
const adult = isAdult(age);
```

Benefits:
- Logic is testable without instantiation
- Easy to reuse functions in different contexts
- Clear separation of concerns
- Simpler to understand

---

## 8. Unclear public/private boundaries

### Anti-Pattern
```typescript
class Config {
  static getApiKey(): string {
    return process.env.API_KEY || "";
  }

  // "Private" but still callable
  static decryptKey(): string {
    // implementation
  }
}

Config.decryptKey();  // ❌ Still accessible despite intent to hide
```

**Problem:**
- No true privacy in static methods
- Confusing API surface
- Doesn't prevent misuse

### Fix (use functions with module scope)
```typescript
// Private to module
function decryptKey(): string {
  // implementation
}

// Public API
export function getApiKey(): string {
  return process.env.API_KEY || "";
}

// decryptKey is truly inaccessible from outside the module
```

Or use closures:
```typescript
export const createConfig = () => {
  const decryptKey = (): string => {
    // implementation
  };

  return {
    getApiKey(): string {
      return process.env.API_KEY || "";
    }
  };
};

// Usage
const config = createConfig();
config.getApiKey();      // ✅ Works
config.decryptKey();     // ❌ Property does not exist
```

---

## 9. Optional parameters creating invalid states

### Anti-Pattern
```typescript
interface OrderParams {
  user?: User;
  items?: Item[];
  total?: number;
}

class Order {
  user?: User;
  items?: Item[];
  total?: number;

  constructor(params: OrderParams = {}) {
    this.user = params.user;
    this.items = params.items;
    this.total = params.total;
  }

  process(): void {
    if (!this.user) throw new Error("User required");
    if (!this.items?.length) throw new Error("Items required");
    // ...
  }
}

const order = new Order();  // ❌ Valid object, but invalid state
order.process();            // ❌ Exception at runtime
```

**Problem:**
- Object can exist in invalid states
- Errors caught at process time, not construction time
- TypeScript doesn't warn about missing required data

### Fix (require all args in constructor)
```typescript
interface OrderParams {
  user: User;
  items: Item[];
  total: number;
}

class Order {
  readonly user: User;
  readonly items: Item[];
  readonly total: number;

  constructor(params: OrderParams) {
    // Type system enforces all required fields at construction time
    this.user = params.user;
    this.items = params.items;
    this.total = params.total;
  }

  process(): void {
    // no need to check — we know user/items exist
  }
}

// ✅ TypeScript error: missing required properties
const order = new Order({});

// ✅ Valid from construction
const validOrder = new Order({ user, items, total });
```

Or use a function:
```typescript
function processOrder(user: User, items: Item[], total: number): void {
  if (!user) throw new Error("User required");
  if (!items.length) throw new Error("Items required");
  // process directly
}

// ✅ Type system enforces all required arguments
processOrder(user, items, total);
```
