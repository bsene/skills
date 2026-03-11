---
name: tdd-three-rules
description: >
  Apply Uncle Bob's Three Rules (Laws) of Test-Driven Development when writing, reviewing,
  or explaining code. Use this skill whenever the user asks about TDD, test-driven
  development, writing tests before code, red-green-refactor cycles, or unit testing
  workflows. Also trigger when the user asks you to implement a feature, fix a bug,
  or write a class/function and they mention tests, TDD, or "test first". If the user
  shares code and asks for a review with any testing angle, consult this skill. Even
  if the user just says "use TDD" or "write this with TDD", this skill should guide
  every step of the implementation.
---

# The Three Rules of TDD (Uncle Bob)

Source: http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd

## The Three Rules

1. **You are not allowed to write any production code unless it is to make a failing unit test pass.**
2. **You are not allowed to write any more of a unit test than is sufficient to fail; and compilation failures are failures.**
3. **You are not allowed to write any more production code than is sufficient to pass the one failing unit test.**

## The Core Discipline

The rules create a tight loop — measured in _seconds_, not minutes. At no point does the system stop compiling or all tests stop passing for more than a minute or two. If you'd walk up to any developer on the team at any random moment, their code worked **a minute ago**.

The cycle is:

```
Write the smallest failing test → Write the minimum production code to pass it → Refactor → Repeat
```

## How to Apply the Rules When Writing Code

### Step 1 — Write a failing test (Rule 1 + Rule 2)

- Pick the **smallest next behaviour** you want to add.
- Write _only enough_ of a test to fail. As soon as it won't compile, or an assertion fails — stop.
- Do not write the full test scenario at once; get it to a red state first.

### Step 2 — Write the minimum production code (Rule 3)

- Write _only_ the code that makes the currently failing test pass. Nothing more.
- Resist the urge to generalise, add helpers, or handle future cases — those are for later tests.
- If the simplest passing implementation feels like a "cheat" (e.g., returning a hardcoded value), that's fine. The next test will force you to generalise.

### Step 3 — Refactor

- With all tests green, clean up both production and test code freely.
- The tests act as a safety net; you can refactor without fear of breaking behaviour.

### Step 4 — Repeat

- Go back to Step 1. Pick the next smallest behaviour.
- Keep cycles short. If you feel stuck for more than a few minutes, the test increment is too big — break it down further.

## Key Principles to Keep in Mind

**Tests are the design.** Following TDD forces decoupling. Code that is testable in isolation is, by definition, decoupled. If a module is hard to test, that is a design signal — not a testing problem.

**Tests are living documentation.** Each test is a precise, executable example of how the system works. They are more useful than prose documentation because they cannot go out of sync with the production code.

**"Untestable code" is not a valid excuse.** If something seems hard to test, the answer is: (a) find a way to test it as-is, or (b) change the design so it becomes testable. Accepting untestable code is a slippery slope toward abandoning the discipline entirely.

**Bug fixing follows the same rules.** Before fixing a bug, write a failing test that reproduces it. The fix is only the code needed to make that test pass.

## Reviewing Code for TDD Compliance

When reviewing code or a PR with TDD in mind, check:

- [ ] Is there a test for every piece of production behaviour?
- [ ] Does each test assert one specific behaviour (not a giant integration scenario)?
- [ ] Could any production code be deleted without a test failing?
- [ ] Is the production code over-engineered relative to what the tests require?
- [ ] Are there any untested paths that suggest production code was written without a test first?
- [ ] Is the code decoupled enough to be tested in isolation (no hidden global state, hard-coded dependencies, etc.)?

## Common Pitfalls

| Pitfall                                       | What the rules say                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| Writing the whole test before running it      | Stop as soon as the test fails to compile or an assertion fails (Rule 2)        |
| Writing more production code "while I'm here" | Only write what makes the current failing test pass (Rule 3)                    |
| Skipping tests for "obvious" code             | No production code without a failing test first (Rule 1)                        |
| Writing tests after the fact                  | Tests written after give you false confidence; the design wasn't shaped by them |
| Large test increments                         | If an increment takes >10 minutes, break it into smaller steps                  |

## Example Skeleton (TypeScript)

```typescript
// 1. Write a failing test — stops here: Stack doesn't exist yet
describe("Stack", () => {
  it("is empty on creation", () => {
    const stack = new Stack<number>();
    expect(stack.isEmpty()).toBe(true); // RED: Stack is undefined
  });
});

// 2. Write minimum production code to pass
class Stack<T> {
  isEmpty(): boolean {
    return true; // trivially passes — that's fine for now
  }
}

// 3. Refactor if needed, then write the next failing test
it("is not empty after push", () => {
  const stack = new Stack<number>();
  stack.push(1);
  expect(stack.isEmpty()).toBe(false); // RED: push doesn't exist, forces real impl
});

// 4. Minimum production code to pass the new test
class Stack<T> {
  private items: T[] = [];

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  push(item: T): void {
    this.items.push(item);
  }
}
```

Each test drives the next tiny increment of real behaviour.
