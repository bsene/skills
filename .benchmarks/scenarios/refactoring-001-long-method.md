---
id: refactoring-001-long-method
skill: refactoring
---

# Prompt

Here is `processOrder()` — 120 lines, mixes validation, pricing, tax calc, inventory check, payment, and email send. Tests pass. Refactor it.

```python
def processOrder(order):
    # ... 120 lines of mixed concerns ...
    # validation block
    # pricing block
    # tax block
    # inventory block
    # payment block
    # email block
    return result
```

# Criteria

- [ ] Response identifies "Long Method" smell explicitly
- [ ] Response applies Extract Method (or equivalent), not Extract Class jumped to first
- [ ] Response keeps refactoring in-place (no new files / new modules introduced)
- [ ] Response checks for test coverage before changing structure
- [ ] Response does NOT add new abstractions (Strategy, Factory) unless rule of three applies
- [ ] Response gives a step-by-step refactor order, not a single big-bang rewrite
