# TestDesiderata — Quality Audit

## TestDesiderata — Quality Audit

TestDesiderata identifies twelve properties that tests _should_ have. These properties don't exist in isolation—some support each other, while others compete. The goal is to consciously choose which matter most for your context.

### The Twelve Properties

| Property | What it means |
|----------|---------------|
| **Isolation** | Tests run independently; one test's failure doesn't affect others |
| **Composability** | Test logic can be reused & combined; patterns extracted into helpers |
| **Determinism** | Tests produce consistent results every time; no flakiness |
| **Speed** | Tests run quickly; feedback is immediate |
| **Readability** | Test intent is obvious; a reader understands it without deep investigation |
| **Behavioral Sensitivity** | Tests fail when actual code behavior changes; they catch real bugs |
| **Structural Insensitivity** | Tests survive refactoring; implementation changes don't break them |
| **Automation** | Tests run automatically in CI/CD without manual steps |
| **Specificity** | Each test validates one focused thing |
| **Predictiveness** | Passing tests give confidence the code works in production |
| **Inspirational Confidence** | Test results make developers want to refactor without fear |
| **Clarity of Purpose** | The "why" of the test is evident |

### How to Review Against TestDesiderata

When a user shares test code and asks for a review, provide:

1. **Quick Assessment** — brief overview of test health against the 12 properties
2. **Property-by-Property Breakdown** — for relevant properties:
   - ✅ **Strength** — what the test does well
   - ⚠️ **Concern** — where it could improve
   - 💡 **Suggestion** — concrete improvement (with code examples)
3. **Trade-offs** — acknowledge when improving one property affects another (e.g., speed vs. behavioral sensitivity), and point out design wins where multiple properties can improve simultaneously
4. **Priority Improvements** — ranked by impact and effort—quick wins first

### Key Principles

#### Properties Support Each Other
- **Isolation** + **Speed** — independent tests run in parallel
- **Composability** + **Behavioral Sensitivity** — reusable helpers catch real behavior changes
- **Readability** + **Specificity** — focused tests are easier to understand

#### Properties Can Conflict
- **Speed** vs. **Behavioral Sensitivity** — fast tests often mock more (reducing sensitivity)
- **Structural Insensitivity** vs. **Specificity** — broad tests might ignore critical details
- **Composability** vs. **Readability** — helper abstractions sometimes hide test intent

#### Design Wins Exist
Smart design can resolve apparent conflicts. For example:
- **Composability + Speed:** Extract setup into reusable, fast helper builders
- **Behavioral Sensitivity + Structural Insensitivity:** Test behavior at the API boundary, not internals
- **Readability + Specificity:** Name tests so they clearly state what one thing they validate

### Common Test Smells

#### Determinism Issues
- Tests that pass/fail randomly
- Async tests with arbitrary waits (`setTimeout(500)`)
- Tests depending on external state (time, filesystem, database)

**TestDesiderata lens:** Determinism problem. Solution: Control time, use fakes, isolate state.

#### Behavioral Sensitivity Issues
- Mocking the entire system under test
- Tests that pass when code is broken
- Changes to code behavior don't trigger test failures

**TestDesiderata lens:** Behavioral sensitivity too low. Solution: Hit real code paths, minimize mocks.

#### Structural Insensitivity Issues
- Tests break when you refactor variable names
- Tests fail when you move code from one file to another
- Tests coupled to class structure or private methods

**TestDesiderata lens:** Structural insensitivity too low. Solution: Test behavior, not implementation.

#### Readability Issues
- 50-line test setup; actual assertion is 1 line
- Test names that don't describe what's being tested
- Unclear what inputs matter vs. boilerplate

**TestDesiderata lens:** Readability problem. Solution: Extract setup, name clearly, show intent.

### Reference: Kent Beck's Vision

Kent Beck emphasizes that great tests:
1. Distinguish signal (important behaviors) from noise (implementation details)
2. Build confidence through quick feedback
3. Enable fearless refactoring
4. Document behavior, not implementation

TestDesiderata operationalizes this by giving you twelve properties to consciously balance.

---

