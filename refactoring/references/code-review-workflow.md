---
name: code-review-workflow
description: Step-by-step workflow for reviewing code and applying refactoring techniques
---

# Code Review Workflow

When reviewing code for smells and refactoring opportunities:

## Phase 1 — Detect Smells

1. **Scan for Long Methods**
   - Check method length (aim for <10-15 lines)
   - Look for multiple indentation levels
   - Identify sections that could be extracted

2. **Check for Large Classes**
   - Count methods and fields
   - Identify multiple responsibilities (reasons to change)
   - Look for cohesion issues

3. **Watch for Primitive Obsession**
   - String/int constants representing domain concepts
   - Magic array indices
   - Scattered validation logic
   - Suggest enums, types, or small objects

4. **Examine Parameter Lists**
   - Count parameters (>3-4 is suspicious)
   - Identify related parameters that should be grouped
   - Suggest parameter objects

5. **Spot Data Clumps**
   - Look for identical variable sets across methods/classes
   - Identify missing abstractions
   - Suggest extracting into a class

6. **Review Comments**
   - Scan all comments; list each one with type (what/why/how/outdated)
   - Classify each: ✅ Legitimate (explains _why_, complex algorithm, API doc) / ⚠️ Smell (explains _what_) / ❌ Outdated
   - For each smell, suggest the refactoring technique with a concrete before/after

## Phase 2 — Apply Techniques

For each opportunity found:

1. **Extract Method** — Look for inline comments describing logic sections or repeated logic
2. **Extract Class** — Spot multiple reasons to change the class or scattered concerns
3. **Replace Conditional** — Find type/status checks repeated across methods
4. **Introduce Variable** — Find complex expressions or repeated conditions
5. **Simplify Conditional** — Count nesting levels (>2 is suspicious) and guard clauses
6. **Move Method** — Check what data/methods the method actually uses
7. **Rename** — Ask "Is this name self-documenting?" for every significant identifier

For each opportunity found:
- Identify the pattern
- Explain the current problem (readability, coupling, testability)
- Show the refactoring with a concrete before/after
- Explain the payoff
