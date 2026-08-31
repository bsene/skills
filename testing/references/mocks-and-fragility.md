# Mocks, Stubs & Test Fragility

Distilled from Vladimir Khorikov, _Unit Testing: Principles, Practices, and Patterns_
(chapters 4, 5, 9, 11), plus Osherove & Khorikov, _The Art of Unit Testing_, 3rd ed.
(chapters 1, 5). Complements `SKILL.md`'s "mocks are a smell" rule: when a mock _is_
justified, these rules decide what to mock, where, and what to assert.

## Exit points: what a unit of work can emit

Every unit of work (function, module — however big) has one entry point and observable end
results on one or more **exit points** (_The Art of Unit Testing_, ch. 1). Only three exist:

| Exit point           | Example                                            | How to test it                                     | Mock needed?      |
| -------------------- | -------------------------------------------------- | -------------------------------------------------- | ----------------- |
| **Return value**     | `cartTotal(cart)` → `80`                           | Call, assert the value. Easiest                    | No                |
| **State change**     | `user.save()` → observable behavior after the call | Call again / check observable state                | No                |
| **Third-party call** | sends email, writes to a system you don't control  | Must replace the external system to interrogate it | **The only case** |

Two structural rules fall out: test **each exit point separately** (a test with two mocks is two
requirements, and failure won't say which broke), and reach for mocks only on the third kind —
Osherove's target is under ~5% of tests using mock objects. This taxonomy is what the
stub/mock split below operationalizes.

## The four pillars of a good test

Every test trades off four attributes; a test with one taken to the extreme sacrifices the rest:

| Pillar                         | Question it answers                                   |
| ------------------------------ | ----------------------------------------------------- |
| Protection against regressions | Would this test catch a real bug?                     |
| Resistance to refactoring      | Does it still pass after behavior-preserving changes? |
| Fast feedback                  | Does it run in milliseconds?                          |
| Maintainability                | Is it trivial to read and set up?                     |

**Resistance to refactoring is the most important pillar** — it's the only one that can't be
bought with code quality. Protection comes from coverage, speed and maintainability from
keeping units small; but a test coupled to implementation details fails on almost any refactor
and teaches you to ignore red tests. (See [TestDesiderata](testdesiderata.md): behavioral
sensitivity and structural insensitivity are the two halves of this pillar.)

## Mock vs stub: never assert on stubs

A **stub** feeds _inputs_ into the SUT (it stands in for queries — calls the SUT makes to _get_
data). A **mock** verifies _outputs_ the SUT sends out (it stands in for commands — calls the
SUT makes to _do_ something).

| Double | Direction                          | Assert?                                                          |
| ------ | ---------------------------------- | ---------------------------------------------------------------- |
| Dummy  | filler param, never used           | No                                                               |
| Stub   | SUT pulls data from it             | **No** — asserting on a query couples the test to implementation |
| Fake   | working in-memory implementation   | Assert on its _state_ after the call                             |
| Spy    | records calls for later inspection | Yes, on what the SUT _sent_                                      |
| Mock   | verifies expected interactions     | Yes — the only double whose point is assertion                   |

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

Communication _within_ your own system (intra-system) is an implementation detail. Mocking
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

Benefits: tests describe the _capability_ your app needs, not the library's API; library
upgrades touch one file; the mock can never claim the third party behaves differently than it
really does.

## Anti-patterns (chapter 11)

| Anti-pattern                          | Why it hurts                                                                                      | Better                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Testing private methods               | Fragile (blocks refactoring) and insufficient coverage (bypasses the public API where bugs live)  | Test through the public API. If a private member carries real behavior worth testing, it wants to be its own public unit |
| Exposing private state just for tests | The test loses resistance to refactoring; encapsulation erodes                                    | Assert on observable behavior; verify effects on collaborators' state via a fake                                         |
| Leaking domain knowledge into tests   | Reimplementing the algorithm in the assertion means the test can only pass by being the same code | Hard-code the expected _result_ (`expect(total).toBe(115)`) rather than recomputing it                                   |
| Mocking concrete classes              | Cements internal structure into tests                                                             | Mock interfaces at system edges only; fakes for owned interface types                                                    |

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

## Isolation-framework traps (_The Art of Unit Testing_ 3e, ch. 5)

An isolation framework (Jest's mocking API, Sinon, testdouble) makes faking _anything_ easy —
that ease is the trap. The framework should not define whether you mock:

| Trap                        | Signal                                                                                                           | Fix                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Mocking by default          | >~5% of tests verify interactions                                                                                | Prove the behavior via return value, state change, or thrown exception instead; stubs can appear anywhere, mocks should barely exist |
| Verifying the wrong things  | Asserting internal function calls internal function; asserting a stub was called; testing "because it was there" | Verify only exit points that matter to the scenario (see table above)                                                                |
| More than one mock per test | Two interaction verifications in one test = two requirements                                                     | One concern per test; a second exit point gets its own test                                                                          |
| Overspecification           | A pile of `expect(x).toHaveBeenCalled()` expectations; exact call orderings                                      | The test breaks on harmless reordering while functionality still works — keep stubs, verify the one command the scenario is about    |

The overspecification check doubles as a smell detector: if you can't name the test because it
verifies too much, the test is doing more than one thing.
