# Testing Principles

## The Four Cross-Cutting Principles

### Principle 1: Testability is a Design Signal

If code is hard to test, the test is telling you something real about the design. The correct response is not to add more mocks—it is to change the design.

```typescript
// Anti-pattern: hard to test because of hidden dependency
class OrderProcessor {
  process(order: Order): void {
    const db = new Database();          // hard dependency — requires mocking Database
    const emailer = new Emailer();      // same
    db.save(order);
    emailer.send(order.customer, "Confirmed");
  }
}

// Preferred: inject dependencies — testable without any mocks
class OrderProcessor {
  constructor(
    private readonly db: OrderRepository,
    private readonly emailer: Notifier,
  ) {}

  process(order: Order): void {
    this.db.save(order);
    this.emailer.send(order.customer, "Confirmed");
  }
}

// In tests: pass in a fake (not a mock)
const db = new InMemoryOrderRepository();
const emailer = new SpyNotifier();
const processor = new OrderProcessor(db, emailer);
processor.process(order);
expect(db.find(order.id)).toBeDefined();
```

### Principle 2: Mocks are a Smell — Prefer Fakes

Mocks assert on implementation details (which methods were called, in what order). Fakes implement the real interface with in-memory behavior. Mock-heavy tests survive bugs because they only check that methods were invoked, not what actually happened.

```typescript
// Anti-pattern: mock asserts HOW (implementation), breaks on refactor
const mockRepo = { save: jest.fn() };
processor.process(order);
expect(mockRepo.save).toHaveBeenCalledWith(order); // fails if method renames

// Preferred: fake asserts WHAT (behavior), survives refactors
class InMemoryOrderRepository implements OrderRepository {
  private store: Order[] = [];
  save(order: Order): void { this.store.push(order); }
  find(id: string): Order | undefined { return this.store.find(o => o.id === id); }
}

processor.process(order);
expect(db.find(order.id)).toBeDefined(); // tests actual behavior
```

### Principle 3: Pure Functions are the Testability Ideal

The more a function depends only on its arguments and produces only a return value, the easier it is to test and reason about. Push side effects (I/O, network, DB, time) to the edges. Keep business logic pure.

```typescript
// Anti-pattern: mixed logic and I/O, hard to test in isolation
async function calculateAndSaveDiscount(userId: string): Promise<void> {
  const user = await db.getUser(userId);              // I/O
  const discount = user.isPremium ? 0.2 : 0.05;      // logic
  await db.saveDiscount(userId, discount);            // I/O
}

// Preferred: pure core isolated from I/O
function calculateDiscount(isPremium: boolean): number {
  return isPremium ? 0.2 : 0.05;
}
// Trivially tested: expect(calculateDiscount(true)).toBe(0.2)

// I/O wired at the edges (integration-tested separately)
async function applyDiscount(userId: string): Promise<void> {
  const user = await db.getUser(userId);
  await db.saveDiscount(userId, calculateDiscount(user.isPremium));
}
```

### Principle 4: Tests are Specification — Name Them Accordingly

Test names are the living documentation of behavior. Read the test names in a file: do they tell the story of what the module does? If test names use implementation terminology ("handleClick", "test_error"), the behavior is not yet understood.

```typescript
// Anti-pattern: names describe implementation or are vague
test("processOrder", ...);
test("test1", ...);
test("handles errors", ...);

// Preferred: names describe behavior from the user's perspective
it("should confirm the order when payment succeeds", ...);
it("should reject the order when the cart is empty", ...);
it("should notify the customer by email after confirmation", ...);
```

---

