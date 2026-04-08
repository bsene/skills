# Refactoring Pattern Activation Triggers

Quick reference for identifying when each pattern applies, organized by code smell you observe.

## By Code Smell

### "This method is doing too much"
→ Extract Method, Extract Variable, Simplify Conditional, Replace Conditional with Polymorphism

### "This class has too many responsibilities"
→ Extract Class, Move Method, Move Field

### "I'm seeing the same if/switch repeated everywhere"
→ Replace Conditional with Polymorphism, Introduce Variable

### "This conditional is hard to follow"
→ Simplify Conditional, Introduce Variable, Extract Method

### "This name doesn't tell me what it does"
→ Rename (variable, method, class)

### "This method uses mostly another class's data"
→ Move Method to that class

### "We're passing the same parameters everywhere"
→ Extract Class (to group related params), Move Method (away from current class)

### "This expression appears in multiple places"
→ Extract Variable, Extract Method, Introduce Type

## By Goal

### Goal: Make code testable
1. Extract Method — isolate testable units
2. Extract Class — reduce dependencies
3. Replace Conditional — test each type separately

### Goal: Reduce duplication
1. Extract Method — pull out common logic
2. Replace Conditional — consolidate type checks
3. Introduce Variable — name and reuse expressions

### Goal: Improve readability
1. Rename — self-documenting code
2. Introduce Variable — express intent
3. Simplify Conditional — reduce nesting
4. Extract Method — short, focused methods

### Goal: Better design/coupling
1. Extract Class — separate concerns
2. Move Method/Field — co-locate related data
3. Replace Conditional — polymorphism instead of type checks

## By Language Context

### In loops
- Extract Method (pull out loop body)
- Introduce Variable (name loop result)
- Simplify Conditional (nested loop conditions)

### In conditionals
- Introduce Variable (complex conditions)
- Simplify Conditional (nested if/else)
- Replace Conditional (type/status checks)
- Extract Method (condition-dependent logic)

### In class definitions
- Extract Class (too many fields/methods)
- Move Method/Field (misplaced responsibility)
- Extract Variable (complex initialization)

### In function/method signatures
- Extract Variable (complex defaults)
- Extract Class/Introduce Variable (complex parameter logic)
- Move Method (method belongs in parameter's class)

## Red Flags → Patterns

| Red Flag | Try This Pattern |
|----------|------------------|
| Multiple nested if/else | Simplify Conditional → Extract Method → Replace Conditional |
| Method >20 lines | Extract Method (repeatedly) |
| Class >500 lines | Extract Class (repeatedly) |
| Complex boolean expression | Introduce Variable → Extract Method |
| Same parameters everywhere | Extract Class |
| Method checks type/status | Replace Conditional with Polymorphism |
| Name needs explanation | Rename |
| Hard to instantiate class | Extract Class |
