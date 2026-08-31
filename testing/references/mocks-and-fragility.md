# Mocks, Stubs & Test Fragility

Distilled from Vladimir Khorikov, *Unit Testing: Principles, Practices, and Patterns*
(chapters 4, 5, 9, 11). Complements `SKILL.md`'s "mocks are a smell" rule: when a mock *is*
justified, these rules decide what to mock, where, and what to assert.

## The four pillars of a good test

Every test trades off four attributes; a test with one taken to the extreme sacrifices the rest:

| Pillar | Question it answers |
|---|---|
| Protection against regressions | Would this test catch a real bug? |
| Resistance to refactoring | Does it still pass after behavior-preserving changes? |
| Fast feedback | Does it run in milliseconds? |
| Maintainability | Is it trivial to read and set up? |

**Resistance to refactoring is the most important pillar** — it's the only one that can't be
bought with code quality. Protection comes from coverage, speed and maintainability from
keeping units small; but a test coupled to implementation details fails on almost any refactor
and teaches you to ignore red tests. (See [TestDesiderata](testdesiderata.md): behavioral
sensitivity and structural insensitivity are the two halves of this pillar.)

## Mock vs stub: never assert on stubs

A **stub** feeds *inputs* into the SUT (it stands in for queries — calls the SUT makes to *get*
data). A **mock** verifies *outputs* the SUT sends out (it stands in for commands — calls the
SUT makes to *do* something).

| Double | Direction | Assert? |
|---|---|---|
| Dummy | filler param, never used | No |
| Stub | SUT pulls data from it | **No** — asserting on a query couples the test to implementation |
| Fake | working in-memory implementation | Assert on its *state* after the call |
| Spy | records calls for later inspection | Yes, on what the SUT *sent* |
| Mock | verifies expected interactions | Yes — the only double whose point is assertion |

```typescript
// Anti-pattern: mocking a stub-side call (a query) — fails when the
// implementation reads the discount differently from a different source
const pricing = { getDiscountRate: vi.fn().mockReturnValue(0.2) }; // stub
checkout.cartTotal(cart);
expect(pricing.getDiscountRate).toHaveBeenCalledWith(cart.userId); // asserts HOW

// Preferred: stub it and assert on the observable OUTPUT
vi.spyOn(pricing, "getDiscountRate").mockReturnValue(0.2);
expect(checkout.cartTotal(cart)).toBe(cart.total * 0.8);
```

Rule of thumb: **assert on commands, never on queries.** If you find yourself asserting that
the SUT read something, you've moved the test inside the implementation.

## Mocks only at system edges

Mock one system's outgoing interactions **only when they cross a system boundary**
(inter-system): database, message queue, email, third-party API. These are contracts with the
outside world that must be verified as interactions.

Communication *within* your own system (intra-system) is an implementation detail. Mocking
internal collaborators — `OrderRepository`, `PricingService`, anything behind your own
interface — couples tests to class structure and makes every refactor a test rewrite. Push the
side effect to the edge instead (see `SKILL.md`'s integrated example) or use an in-memory fake
and assert on its state.

This refines `SKILL.md`'s "mocks are a smell" rule: mocks are not forbidden — they are confined
to the hexagonal edge. ([Vitest](https://vitest.dev/api/) / [Jest](https://jestjs.io/docs/api)
mock APIs make it equally easy to do the wrong thing.)

## Only mock types you own

Always wrap third-party libraries in your own thin adapter and mock the adapter — never the
library.

```typescript
// Anti-pattern: mocking the library everywhere — every test breaks on upgrade,
// and the mock may lie about the library's real behavior
vi.mock("resend", () => ({ Resend: vi.fn() }));

// Preferred: one adapter, mocked where needed
class Mailer {
  // ponytail: one thin adapter; mock THIS, not `resend`
  constructor(private readonly client: Resend) {}
  send(to: string, subject: string): void {
    this.client.emails.create({ from: "noreply@example.com", to, subject });
  }
}
```

Benefits: tests describe the *capability* your app needs, not the library's API; library
upgrades touch one file; the mock can never claim the third party behaves differently than it
really does.

## Anti-patterns (chapter 11)

| Anti-pattern | Why it hurts | Better |
|---|---|---|
| Testing private methods | Fragile (blocks refactoring) and insufficient coverage (bypasses the public API where bugs live) | Test through the public API. If a private member carries real behavior worth testing, it wants to be its own public unit |
| Exposing private state just for tests | The test loses resistance to refactoring; encapsulation erodes | Assert on observable behavior; verify effects on collaborators' state via a fake |
| Leaking domain knowledge into tests | Reimplementing the algorithm in the assertion means the test can only pass by being the same code | Hard-code the expected *result* (`expect(total).toBe(115)`) rather than recomputing it |
| Mocking concrete classes | Cements internal structure into tests | Mock interfaces at system edges only; fakes for owned interface types |

The "leaking domain knowledge" example:

```typescript
// Bad: the test IS a second implementation of the rule
expect(order.discountedPrice(order.price, order.discountPct)).toBe(
  order.price * (1 - order.discountPct / 100),
);

// Good: the expected value is data, not logic
expect(order.discountedPrice(100, 15)).toBe(85);
```

---