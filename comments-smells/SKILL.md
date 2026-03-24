---
name: comments-smells
description: >
  Detect, explain, and fix "Comments" code smells — cases where excessive or explanatory
  comments signal that the underlying code needs refactoring instead of annotation.
  Use this skill whenever the user shares code with heavy comments, asks about comment
  best practices, wants a code review focused on readability, asks "are my comments
  too much?", mentions code smells, or wants to improve code clarity. Also trigger
  when the user pastes code and asks how to make it cleaner, more self-documenting,
  or easier to understand — even if they don't explicitly mention "comments smell".
---

# Comments Code Smell — Detection & Refactoring

## What is the "Comments" Smell?

A **Comments smell** occurs when a method, class, or block is filled with explanatory
comments — not because the logic is genuinely complex, but because the code structure
itself is unclear. Comments in this context act like a deodorant: they mask fishy code
rather than fixing it.

> "A comment is a sign that the code is not finished." — XP community principle

> "The best comment is a good name for a method or class."

Comments are **not inherently bad** — but when they're needed to explain _what_ the code
does (rather than _why_ a design decision was made), that's a signal to refactor.

---

## How to Detect It

Look for these patterns:

- A comment above a block of code that says what the block does → candidate for **Extract Method**
- A comment explaining a complex expression → candidate for **Extract Variable**
- A method whose purpose isn't clear from its name → candidate for **Rename Method**
- Comments describing required preconditions or invariants → candidate for **Introduce Assertion**
- Comments that are out of date, misleading, or redundant with the code
- Large parts of commented code -> ask user if it could be deleted

---

## Refactoring Treatments

### 1. Extract Variable

**When:** A comment explains a complex expression.

```python
# Before
if (user.age >= 18 and user.country == "FR" and not user.is_banned):
    # check if user can access adult content in France
    allow_access()

# After
is_adult = user.age >= 18
is_in_france = user.country == "FR"
is_active = not user.is_banned
can_access_adult_content_in_france = is_adult and is_in_france and is_active

if can_access_adult_content_in_france:
    allow_access()
```

### 2. Extract Method

**When:** A comment describes what a section of code does — turn that section into a
named method, using the comment text as the method name.

```python
# Before
def process_order(order):
    # validate order items
    for item in order.items:
        if item.quantity <= 0:
            raise ValueError("Invalid quantity")
        if item.price < 0:
            raise ValueError("Invalid price")

    # calculate total
    total = sum(item.quantity * item.price for item in order.items)
    ...

# After
def process_order(order):
    validate_order_items(order.items)
    total = calculate_order_total(order.items)
    ...

def validate_order_items(items):
    for item in items:
        if item.quantity <= 0:
            raise ValueError("Invalid quantity")
        if item.price < 0:
            raise ValueError("Invalid price")

def calculate_order_total(items):
    return sum(item.quantity * item.price for item in items)
```

### 3. Rename Method

**When:** A method exists but its name doesn't explain what it does, so comments
compensate.

```python
# Before
def process(x):
    # converts celsius to fahrenheit
    return x * 9/5 + 32

# After
def celsius_to_fahrenheit(celsius):
    return celsius * 9/5 + 32
```

### 4. Introduce Assertion

**When:** A comment describes a required state or precondition for the system to work.

```python
# Before
def set_discount(rate):
    # rate must be between 0 and 1
    self.discount = rate

# After
def set_discount(rate):
    assert 0 <= rate <= 1, "Discount rate must be between 0 and 1"
    self.discount = rate
```

### 5. Write Tests as Executable Comments

**When:** A comment documents expected behavior, edge cases, or intent that would otherwise need explanation.

Unit tests and assertions serve as "executable documentation" — they clarify intent and validate assumptions
in code that cannot lie or become outdated the way comments can.

```python
# Before
def calculate_discount(price, percentage):
    # percentage must be 0-100, not 0-1
    return price * (1 - percentage / 100)

# After (with clear test)
def test_calculate_discount_expects_percentage_not_decimal():
    """Document the API contract: percentage is 0-100, not 0-1"""
    assert calculate_discount(100, 10) == 90  # 10% off
    assert calculate_discount(100, 0) == 100  # 0% off
    assert calculate_discount(100, 100) == 0  # 100% off
```

Tests eliminate the need for comments that describe "what should happen" because the test _is_ the specification.

---

## When Comments Are Legitimate

Do **NOT** remove comments that:

- Explain **why** a decision was made (business rule, workaround, regulatory requirement)
  ```python
  # Using SHA-1 here for legacy API compatibility — their endpoint doesn't support SHA-256
  ```
- Explain a **genuinely complex algorithm** where simpler alternatives were exhausted
- Document **public API surface** (docstrings for libraries, SDKs)
- Reference **external context** (ticket numbers, spec references, legal requirements)
- Communicate information that could not inferred from the code: specify order of execution
- **TODO comments** — These must NEVER be automatically removed and require manual management

### TODO Comments: Special Rule

**TODO comments CANNOT be automatically removed.** They represent intentional, deferred work that requires explicit human review and decision-making. Always treat TODO comments as read-only during refactoring — only the user can decide whether to address or remove them.

### A Guiding Principle

> "The whole point is not to delete comments, but to obviate them and then delete them." — Tim Ottinger

**Misunderstanding to avoid:** Absence of comments does _not_ imply well-factored code. The goal is code
that is clear and well-structured enough that comments become unnecessary — not code that simply lacks them.
Comments should become redundant through refactoring, not through deletion alone.

---

## Step-by-Step Review Workflow

When the user shares code to review for comment smells:

1. **Scan all comments** — list each one with its type (what/why/how/outdated)
2. **Classify each comment** as:
   - ✅ Legitimate (explain _why_, complex algorithm, API doc)
   - ⚠️ Smell — explains _what_ code does (refactor candidate)
   - ❌ Outdated / misleading (delete)
3. **For each smell**, suggest the appropriate refactoring technique with a concrete example
4. **Show before/after** for the refactored snippet
5. **Summarize payoff** — how the code becomes more intuitive without the comments

---

## Quick Reference

| Comment explains...         | Refactoring to apply |
| --------------------------- | -------------------- |
| A complex expression        | Extract Variable     |
| What a code block does      | Extract Method       |
| What a method does          | Rename Method        |
| A required precondition     | Introduce Assertion  |
| Why a design was chosen     | ✅ Keep it           |
| A complex, irreducible algo | ✅ Keep it           |
| Something outdated/wrong    | ❌ Delete it         |
