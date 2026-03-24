# Refactoring Checklist: Class → Function → Object

Use this checklist when deciding how to refactor TypeScript/JavaScript code.

## Step 1: Does it hold instance state?

Ask: "Does this object need to remember things between method calls?"

- **Yes** → Might be a class (go to Step 2)
- **No** → Skip to Step 3 (it's a function or utility)

## Step 2: Does it create multiple instances with different state?

Ask: "Will I ever instantiate this more than once in my codebase, with different values?"

```typescript
// Example: Multiple instances
const user1 = new User({ name: "Alice", age: 30 });
const user2 = new User({ name: "Bob", age: 25 });
// ✅ Multiple instances with different state → Class is appropriate

// Example: Single instance or no instance
const config = new Config({ apiKey: "secret" });
// ❌ Single instance → Likely an anti-pattern, use a function or object
```

- **Yes, multiple instances** → Keep as a class
- **No, only one instance or zero** → Go to Step 3

## Step 3: Is it a collection of static methods?

Ask: "Are all methods static or are they just utility functions?"

```typescript
// Example: All static methods
class Validator {
  static isEmail(str: string): boolean {
    // implementation
  }

  static isPhone(str: string): boolean {
    // implementation
  }
}

// ✅ All static methods → Should be a utility object or functions
const Validator = {
  isEmail: (str: string): boolean => { /* ... */ },
  isPhone: (str: string): boolean => { /* ... */ }
};
```

- **Yes, all static methods** → Convert to utility object or standalone functions
- **No, has instance methods** → Go to Step 4

## Step 4: Does it have exactly one public method?

Ask: "Does this class have only one public method (like `perform`, `call`, `execute`)?"

```typescript
// Example: One public method
class SendEmailJob {
  constructor(userId: string, template: string) {
    this.userId = userId;
    this.template = template;
  }

  perform(): void {
    // send email
  }
}

// ✅ Single public method + temporary state → Should be a function
async function sendEmailJob(userId: string, template: string): Promise<void> {
  // send email
}
```

- **Yes, one public method** → Convert to a function
- **No, multiple public methods** → Go to Step 5

## Step 5: Is it invalid after construction?

Ask: "Does the constructor require `null` values or setters before the object is usable?"

```typescript
// Example: Invalid after construction
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
    if (!this.data) throw new Error("Data required");
    if (!this.format) throw new Error("Format required");
    // generate
  }
}

// ✅ Requires setters to be valid → Should be a function
function buildReport(data: unknown, format: string): Report {
  if (!data) throw new Error("Data required");
  if (!format) throw new Error("Format required");
  // generate
}
```

- **Yes, requires setters** → Convert to a function with all required args
- **No, valid after construction** → Keep as class (but reconsider if needed)

## Step 6: Is it named after a design pattern?

Ask: "Is the class name a pattern (Decorator, Factory, Strategy, Builder, Command, Observer)?"

```typescript
// Example: Pattern-named class
class DiscountDecorator {
  constructor(private item: Item) {}

  getPrice(): number {
    return this.item.price * 0.9;
  }
}

// ✅ Decorator pattern → Use composition + functions instead
const applyDiscount = (item: Item) => item.price * 0.9;
```

- **Yes, pattern-named** → Consider if TypeScript features (composition, functions, HOF) are simpler
- **No** → Go to Step 7

## Step 7: Is it a pure data class?

Ask: "Does it have only a constructor and properties with no business logic?"

```typescript
// Example: Pure data class
class Person {
  constructor(
    public name: string,
    public age: number,
    public email: string
  ) {}
}

// ✅ Pure data → Use a type/interface + object literal instead
type Person = {
  name: string;
  age: number;
  email: string;
};

const person: Person = { name: "Alice", age: 30, email: "alice@example.com" };
```

- **Yes, pure data class** → Use type aliases or interfaces
- **No, has logic** → Move logic to a utility function, keep data as a plain object

---

## Decision Tree (Quick Reference)

```
Does it hold instance state?
├─ No → Go to "All static methods?"
│
└─ Yes, does it create MULTIPLE instances with DIFFERENT state?
   ├─ No → Don't use a class (continue)
   │
   └─ Yes → ✅ Keep as class (you're done)

Is it all static methods?
├─ Yes → 🟡 Convert to utility object or functions
└─ No → Next question

Does it have exactly ONE public method?
├─ Yes → 🟡 Convert to a function
└─ No → Next question

Is it INVALID immediately after construction?
├─ Yes → 🟡 Convert to a function with all required args
└─ No → Next question

Is it named after a design pattern?
├─ Yes → 🟠 Consider TypeScript's built-in features (composition, functions, HOF)
└─ No → Next question

Is it a pure data class?
├─ Yes → 🟡 Use type alias + object literal
└─ No → ✅ Probably okay as a class (but double-check the above)
```

---

## Refactoring Examples

### Class with only static methods → Utility object

```typescript
// Before
class Validator {
  static isEmail(str: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  static isPhone(str: string): boolean {
    return /^\d{10}$/.test(str);
  }

  static isValidPhoneFormat(phone: string): boolean {
    // helper method
    return this.isPhone(phone);
  }
}

// After
const Validator = {
  isEmail: (str: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str),

  isPhone: (str: string): boolean =>
    /^\d{10}$/.test(str),

  // private helper (not exposed)
  _isValidPhoneFormat: (phone: string): boolean =>
    Validator.isPhone(phone)
};

// Or as standalone functions
export const isEmail = (str: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

export const isPhone = (str: string): boolean =>
  /^\d{10}$/.test(str);

function helperMethod(): void {
  // truly private in module scope
}
```

### Single-method class → Function

```typescript
// Before
class SendEmailJob {
  constructor(userId: string, template: string) {
    this.userId = userId;
    this.template = template;
  }

  async perform(): Promise<void> {
    const user = await User.findById(this.userId);
    // send email
  }
}

new SendEmailJob(user.id, "welcome").perform();

// After
async function sendEmailJob(userId: string, template: string): Promise<void> {
  const user = await User.findById(userId);
  // send email
}

await sendEmailJob(user.id, "welcome");
```

### Data class → Type alias

```typescript
// Before
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

// After (simpler)
type Person = {
  name: string;
  age: number;
  email: string;
};

const person: Person = { name: "Alice", age: 30, email: "alice@example.com" };

// Or as interface
interface Person {
  name: string;
  age: number;
  email: string;
}

const person: Person = { name: "Alice", age: 30, email: "alice@example.com" };
```

### Logic separated from data

```typescript
// Before
class User {
  birthYear: number;

  constructor(birthYear: number) {
    this.birthYear = birthYear;
  }

  getAge(): number {
    return new Date().getFullYear() - this.birthYear;
  }
}

const age = new User(1990).getAge();

// After
type User = {
  birthYear: number;
};

const calculateAge = (birthYear: number): number =>
  new Date().getFullYear() - birthYear;

const user: User = { birthYear: 1990 };
const age = calculateAge(user.birthYear);
```
