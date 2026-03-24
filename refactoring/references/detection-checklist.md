# Code Bloater Detection Checklist

Use this checklist when reviewing code for bloaters.

## Long Method Checklist

- [ ] Method exceeds 10-15 lines of code
- [ ] Method has 3+ levels of nesting/indentation
- [ ] Method name is vague or overly long (>25 chars)
- [ ] Method could be described as "does X and Y and Z"
- [ ] Multiple local variables within the method
- [ ] Method has multiple `if/else` or `switch` branches (>3 paths)
- [ ] Hard to write unit tests without mocking dependencies
- [ ] Some lines of logic could be reused elsewhere

**Action:** Extract methods. Each extracted method should have a clear, single responsibility.

---

## Large Class Checklist

- [ ] Class has >10 methods
- [ ] Class has >7 instance fields
- [ ] Class name includes "Service," "Manager," "Handler," "Processor," or similar
- [ ] Multiple reasons to change this class (multiple responsibilities)
- [ ] Constructor requires many parameters or dependencies
- [ ] Class mixes domain logic, persistence logic, and infrastructure concerns
- [ ] Hard to create instances for testing (complex setup)
- [ ] Some fields are only used by certain methods, not all
- [ ] Methods could be grouped into logical "cohorts" (some methods use certain fields, others use different ones)

**Action:** Extract class. Group cohesive responsibilities into focused classes.

---

## Primitive Obsession Checklist

- [ ] Using string constants where an enum would be clearer:
  - `status = "pending"` instead of `Status.PENDING`
  - `type = "admin"` instead of `Role.ADMIN`
- [ ] Using primitive arrays as pseudo-objects: `person[0]` for name
- [ ] Validation logic scattered across multiple methods/files
- [ ] Type information lost through generic types: `Map<string, any>`
- [ ] Comments clarifying what a string/int represents
- [ ] Magic numbers used without context: `if (code == 42)`
- [ ] String constants for field names in data structures

**Action:** Create small types, enums, or objects. Encapsulate validation once.

---

## Long Parameter List Checklist

- [ ] Method/function has >4 parameters
- [ ] Multiple parameters are related to a single concept
  - Address: street, city, zipcode, country
  - Contact: email, phone, mobilePhone
  - Credentials: username, password, apiKey
- [ ] Call sites require comments to clarify parameter order
- [ ] Callers pass boolean flags: `createUser(name, email, true, false, true)`
- [ ] Same set of parameters repeated across multiple methods
- [ ] Hard to test (combinatorial explosion of test cases)

**Action:** Extract parameter objects. Group related parameters into classes/types. Replace boolean flags with enums.

---

## Data Clumps Checklist

- [ ] Same 3+ variables appear together in multiple methods:
  ```
  Method A: (x, y, width, height)
  Method B: (x, y, width, height)
  Method C: (x, y, width, height)
  ```
- [ ] Same 3+ fields appear in multiple classes
- [ ] Same local variables used together in multiple functions
- [ ] Database connection params (host, port, username, password) passed separately
- [ ] Coordinates (x, y) or dimensions (width, height) passed as separate ints
- [ ] Validation logic duplicated for the same set of values

**Action:** Extract class. Group the clump into a single object/type.

---

## Severity Guidelines

### Critical (refactor soon)
- Long methods >30 lines
- Large classes >20 methods
- Parameter lists >6 parameters
- Data clumps appearing in 3+ places

### High (refactor before next release)
- Long methods 15-30 lines
- Large classes 15-20 methods
- Parameter lists 5-6 parameters
- Data clumps appearing in 2 places

### Medium (consider refactoring)
- Long methods 10-15 lines
- Large classes 10-15 methods
- Parameter lists 4-5 parameters
- Data clumps appearing in specific, limited scope

### Low (monitor, refactor if convenient)
- Long methods 8-10 lines with clear purpose
- Classes at boundary of large (8-10 methods) but cohesive
- Parameter lists at boundary (3-4 parameters) but named clearly
- Minor primitive obsession that's scoped locally

---

## Context Matters

**Before suggesting refactoring, ask:**

1. **Is this code performance-critical?** (Extracting methods adds overhead)
2. **Will this code be modified frequently?** (Bloaters in stable code matter less)
3. **How much complexity does each part add?** (One 20-line method doing one complex thing is OK; 20 lines doing 5 different things is not)
4. **Is the code clear to the team?** (A long method with obvious logic may be OK; a short but dense method is worse)
5. **How well-tested is this code?** (Bloaters in untested code are more problematic)

**Guiding principle:** Refactor when clarity or testability suffers, not just when code size exceeds arbitrary limits.
