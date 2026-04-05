---
name: reviewing-code
description: Analyzes code quality, identifies bugs, suggests improvements, and checks adherence to best practices. Use when the user asks for code review, code analysis, quality check, or mentions reviewing code.
---

# Code Reviewer

This skill performs comprehensive code reviews to improve quality, identify issues, and suggest best practices.

## When to Use This Skill

Invoke this skill when the user:
- Asks for a code review
- Wants to check code quality
- Needs help identifying bugs or issues
- Requests best practice recommendations
- Mentions code analysis or improvement

## Review Process

### Step 1: Initial Analysis

Read the code and understand:
1. Purpose and functionality
2. Language and framework used
3. Code structure and organization
4. Dependencies and imports

### Step 2: Quality Assessment

Evaluate code across multiple dimensions:

**Correctness:**
- [ ] Logic errors or bugs
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Return values appropriate

**Readability:**
- [ ] Clear variable/function names
- [ ] Consistent formatting
- [ ] Appropriate comments
- [ ] Logical code organization

**Performance:**
- [ ] Efficient algorithms
- [ ] No redundant operations
- [ ] Appropriate data structures
- [ ] Resource management

**Security:**
- [ ] Input validation
- [ ] No hardcoded credentials
- [ ] SQL injection prevention
- [ ] XSS protection (if applicable)

**Maintainability:**
- [ ] DRY principle followed
- [ ] Single responsibility
- [ ] Low coupling, high cohesion
- [ ] Easy to extend

### Step 3: Generate Feedback

Provide structured feedback:

**Critical Issues** (must fix):
- Bugs that cause failures
- Security vulnerabilities
- Data loss risks

**Warnings** (should fix):
- Performance problems
- Maintainability issues
- Best practice violations

**Suggestions** (nice to have):
- Code style improvements
- Optimization opportunities
- Alternative approaches

### Step 4: Code Examples

For each issue, provide:
1. Location (file:line)
2. Description of problem
3. Why it matters
4. Suggested fix with code example

## Review Template

Use this structure for reviews:

```markdown
## Code Review Summary

**Overall Quality:** [Excellent/Good/Fair/Needs Improvement]
**Lines Reviewed:** [Number]
**Critical Issues:** [Number]
**Warnings:** [Number]
**Suggestions:** [Number]

## Critical Issues

### 1. [Issue Title]
**Location:** file.py:42
**Problem:** [Description]
**Impact:** [Why this matters]
**Fix:**
```language
[Code example of suggested fix]
```

## Warnings

[Same structure as Critical Issues]

## Suggestions

[Same structure as Critical Issues]

## Positive Observations

- [Good pattern 1]
- [Good pattern 2]

## Overall Recommendations

[High-level guidance for improvement]
```

## Common Review Patterns

**Pattern 1: Bug Identification**
- Trace execution flow
- Check boundary conditions
- Verify error handling
- Test edge cases mentally

**Pattern 2: Security Review**
- Audit all user inputs
- Check authentication/authorization
- Review data handling
- Examine external calls

**Pattern 3: Performance Analysis**
- Identify bottlenecks
- Check algorithmic complexity
- Review database queries
- Examine loop efficiency

**Pattern 4: Maintainability Check**
- Assess code clarity
- Check for duplication
- Evaluate modularity
- Review documentation

## Language-Specific Checks

**Python:**
- PEP 8 compliance
- Pythonic idioms
- Type hints usage
- Exception handling

**JavaScript/TypeScript:**
- ESLint compatibility
- Async/await usage
- Type safety (TS)
- Modern syntax

**Go:**
- Error handling patterns
- Goroutine safety
- Interface usage
- Idiomatic Go

**Other Languages:**
- Follow language conventions
- Use standard library features
- Apply community best practices

## Example Review

**Input Code:**
```python
def get_user(id):
    user = db.query("SELECT * FROM users WHERE id = " + id)
    return user
```

**Review Output:**

### Critical Issues

**1. SQL Injection Vulnerability**
**Location:** example.py:2
**Problem:** String concatenation in SQL query allows injection attacks
**Impact:** Attacker could execute arbitrary SQL, accessing or deleting data
**Fix:**
```python
def get_user(id):
    user = db.query("SELECT * FROM users WHERE id = ?", (id,))
    return user
```

### Warnings

**2. Missing Error Handling**
**Location:** example.py:1-3
**Problem:** No handling for invalid ID or database errors
**Impact:** Function crashes on errors instead of graceful handling
**Fix:**
```python
def get_user(user_id):
    try:
        user = db.query("SELECT * FROM users WHERE id = ?", (user_id,))
        return user if user else None
    except DatabaseError as e:
        logger.error(f"Database error retrieving user {user_id}: {e}")
        return None
```

### Suggestions

**3. Parameter Naming**
**Location:** example.py:1
**Problem:** Parameter named `id` shadows Python built-in
**Impact:** Minor - can cause confusion, not a functional issue
**Fix:**
```python
def get_user(user_id):
    # ... rest of function
```

## Validation Checklist

Before completing review:

- [ ] All code sections examined
- [ ] Security vulnerabilities identified
- [ ] Performance issues noted
- [ ] Best practices applied
- [ ] Examples provided for fixes
- [ ] Positive patterns acknowledged
- [ ] Overall recommendations given

## Review Scope Options

**Quick Review:**
- Focus on critical issues only
- Security and correctness
- 5-10 minutes

**Standard Review:**
- All quality dimensions
- Critical + warnings
- 15-30 minutes

**Comprehensive Review:**
- All dimensions + suggestions
- Alternative approaches
- Refactoring ideas
- 30+ minutes

Ask the user which scope they prefer if unclear.
