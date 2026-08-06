# Refactoring Checklist: Class → Function → Object

Walk a class through these questions in order. Code examples for each anti-pattern live in `anti-patterns.md`.

## Step 1: Does it hold instance state?
"Does this object remember things between method calls?"
- **No** → skip to Step 3.
- **Yes** → Step 2.

## Step 2: Does it create multiple instances with different state?
"Will I instantiate this more than once with different values?"
- **Yes** → ✅ Keep as a class.
- **No** → continue.

## Step 3: Is it a collection of static methods?
- **Yes** → 🟡 Convert to utility object or standalone functions. (anti-patterns.md §1)
- **No** → Step 4.

## Step 4: Does it have exactly one public method?
(`perform`, `call`, `execute`, `run`)
- **Yes** → 🟡 Convert to a function. (anti-patterns.md §2)
- **No** → Step 5.

## Step 5: Is it invalid after construction?
"Does the constructor leave fields `null` until setters are called?"
- **Yes** → 🟡 Take all required args at once (function or constructor). (anti-patterns.md §4, §9)
- **No** → Step 6.

## Step 6: Is it named after a design pattern?
(Decorator, Factory, Strategy, Builder, Command, Observer)
- **Yes** → 🟠 Consider composition / functions / HOFs instead. (anti-patterns.md §3)
- **No** → Step 7.

## Step 7: Is it a pure data class?
Constructor + properties + no behavior.
- **Yes** → 🟡 Use `type`/`interface` + object literal. (anti-patterns.md §6)
- **No** → ✅ Probably fine. Also check Tell Don't Ask (`tell-dont-ask.md`).

---

## Decision Tree

```
Holds instance state?
├─ No → all-static? → 🟡 utility object/functions
└─ Yes → multiple instances with different state?
   ├─ Yes → ✅ class
   └─ No → continue checks below

One public method?           → 🟡 function
Invalid after construction?  → 🟡 function with all required args
Pattern-named?               → 🟠 composition / HOF
Pure data?                   → 🟡 type alias + object literal
None of the above?           → ✅ class (also review Tell Don't Ask)
```
