# Testing Practices from the c2 Wiki

Distilled from the c2 wiki pages ArrangeActAssert, MockObject and TestDrivenDevelopment.

## Arrange-Act-Assert

Structure each unit test as three paragraphs separated by blank lines: arrange preconditions and inputs, act on the code under test, assert the expected result.

```java
String input = "abc";                 // Arrange
String result = Util.reverse(input);  // Act
assertEquals("cba", result);          // Assert
```

It exposes smells: assertions mixed into the act step, and tests that check several behaviours at once.

## Mock objects

Mocks go beyond stubs: they set and verify expectations on interactions with collaborators (Mackinnon, Freeman, Craig, "Endo-Testing", XP2000). A good mock is easy to create and configure, fast, deterministic, can be made to misbehave on demand, has no UI, and can be queried afterwards.

- Side effect: code written against mocks tends to follow the Law of Demeter (see the object-oriented-programming skill).
- Risk: over-specified interactions make tests fragile; see [mocks-and-fragility.md](mocks-and-fragility.md).
- Further reading: Freeman and Pryce, "Growing Object-Oriented Software, Guided by Tests".

## Test-driven development

Write a failing test, make it pass in the simplest way, refactor. See [tdd-and-atdd.md](tdd-and-atdd.md) for the full workflow.

Sources: https://wiki.c2.com/?ArrangeActAssert, ?MockObject, ?TestDrivenDevelopment
