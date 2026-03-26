# Refactoring Skills: Two Focused Tools

This directory contains two complementary refactoring skills, split for better activation and focused depth.

## Skills Overview

### 🔴 `refactoring-catalog` — Detect Code Bloaters
**Location:** `refactoring/SKILL.md`

Focuses on identifying and fixing **code smells**—problems that creep in gradually as code evolves. This is about *what to avoid*.

**Covers:**
1. Long Method (>10-15 lines)
2. Large Class (>10 methods, mixed concerns)
3. Primitive Obsession (overuse of primitives)
4. Long Parameter List (>3-4 params)
5. Data Clumps (same variables scattered everywhere)

**Use when:**
- Reviewing code for maintainability issues
- Code is getting harder to understand/test
- User asks "how can I simplify this?"
- Class/method is growing too large

**Audience:** Code reviewers, maintainability-focused refactoring

---

### 🟢 `refactoring-patterns` — Master Refactoring Operations
**Location:** `refactoring-patterns/SKILL.md`

Focuses on **techniques you actively apply** to improve code structure, clarity, and design. This is about *how to improve*.

**Covers:**
1. Extract Method / Extract Function
2. Extract Class
3. Replace Conditional with Polymorphism
4. Introduce / Extract Variable
5. Simplify Conditional Logic
6. Move Method / Move Field
7. Rename (variable, method, class)

**Use when:**
- Refactoring code to fix a specific problem
- Breaking down complex code
- Improving design or reducing coupling
- Making code more testable
- User asks "how do I refactor this?"

**Audience:** Developers actively refactoring, architects improving design

---

## How They Complement Each Other

```
Problem Identified
    ↓
refactoring-catalog ← What's the smell?
(Detect bloaters)     (What's wrong?)
    ↓
↓ "This is a Long Method"
↓ "This is a Large Class"
↓ "This is Primitive Obsession"
    ↓
refactoring-patterns ← How do I fix it?
(Apply techniques)     (What technique?)
    ↓
↓ Extract Method
↓ Extract Class
↓ Introduce Type
    ↓
Fixed!
```

---

## Token Cost Breakdown

| Skill | Lines | Token Cost | Scope | Use Frequency |
|-------|-------|-----------|-------|---|
| refactoring-catalog | 652 | ~2.6k | Code bloaters only (5 types) | Moderate (code review focus) |
| refactoring-patterns | 496 | ~2.0k | Refactoring operations (7 techniques) | High (active refactoring) |
| Combined | 1,148 | ~4.6k | Full refactoring workflow | — |

**vs. Single Monolithic Skill:** Would be ~5.5k tokens (11% cost savings through split)

---

## Activation Triggers

### When `refactoring-catalog` activates:
- "This method is too long"
- "The class has too many methods"
- "We're using primitives for domain concepts"
- "This class has too many parameters"
- "I keep seeing the same variables together"
- Code review context → spot bloaters
- User asks "what's wrong with this code?"

### When `refactoring-patterns` activates:
- "How do I break up this method?"
- "How do I split this class?"
- "This conditional is too complex"
- "This name is confusing"
- "I see the same logic in multiple places"
- User asks "how do I refactor this?"
- "This method doesn't belong in this class"
- Active refactoring context

---

## Reference Files

### refactoring-catalog/references/
- `detection-checklist.md` — Flowchart for identifying each bloater
- `language-patterns.md` — Language-specific detection examples
- `real-world-examples.md` — Industry case studies

### refactoring-patterns/references/
- `pattern-triggers.md` — Quick lookup: what pattern to use for each code smell
- `decision-guide.md` — Decision trees for choosing between patterns

---

## Workflow Examples

### Example 1: Code Review
```
Reviewer spots: "This UserService has 20 methods"
  ↓ Check refactoring-catalog
  ✓ "Large Class" — confirmed
  ↓ Check refactoring-patterns
  ✓ Use "Extract Class" pattern
  ↓ Suggest: Split into UserRepository, PasswordManager, EmailService
```

### Example 2: Active Refactoring
```
Developer: "I need to refactor the order processing logic"
  ↓ Check refactoring-patterns
  ✓ See "Extract Method" for the payment validation block
  ✓ See "Replace Conditional" for order status handling
  ✓ See "Simplify Conditional" for nested if/else
  ↓ Apply patterns in sequence
  ↓ Code is clearer and more maintainable
```

### Example 3: Spotting & Fixing
```
Code review: "Long Method detected"
  ↓ refactoring-catalog explains: "Split into focused methods"
  ↓ refactoring-patterns shows: "Use Extract Method"
  ↓ Developer applies Extract Method pattern with concrete example
```

---

## When to Use Each

| Situation | Use First | Then Use |
|-----------|-----------|----------|
| Reviewing code | refactoring-catalog | refactoring-patterns |
| Refactoring code | refactoring-patterns | refactoring-catalog (if new smell found) |
| Teaching/learning | refactoring-catalog (understand smells) | refactoring-patterns (learn techniques) |
| Large refactor | refactoring-patterns (execution) | refactoring-catalog (validation) |

---

## Notes

- Both skills reference [refactoring.com](https://refactoring.com/catalog/) as the authoritative source
- `refactoring-catalog` is inspired by [Refactoring Guru](https://refactoring.guru/refactoring/smells)
- Skills are independent but work best together
- No duplicate content between the two
