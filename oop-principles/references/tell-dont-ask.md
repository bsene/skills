# Tell Don't Ask (Encapsulation)

When you *do* use a class, follow **Tell Don't Ask**: instead of *asking* an object for its data and acting on it externally, *tell* the object what to do and let it use its own data internally. This co-locates data with the behavior that operates on it.

## Identifying "Ask" Style (the problem)

External code that **queries** an object's state and **decides** based on it:

```typescript
// ❌ Ask style
if (order.status === "pending" && order.total > 1000) {
  order.approvalQueue.push(order.id);
  order.status = "awaiting_approval";
}
```

Red flags:
- Chains of getters used to make a decision
- `if (obj.getX() > obj.getLimit())` outside the class
- External code setting state after reading state (`get` then `set`)
- Logic that "belongs" to an object scattered across callers

## Applying the Refactor

```typescript
// ✅ Tell style
order.submitForApproval();

class Order {
  submitForApproval(): void {
    if (this.status === "pending" && this.total > 1000) {
      this.approvalQueue.push(this.id);
      this.status = "awaiting_approval";
    }
  }
}
```

The caller **tells** the object what to do; the object **decides** how.

## Step-by-Step

1. **Find the ask chain** — external code reads object data to decide.
2. **Identify the owning object** — class whose fields are being read.
3. **Name the intent** — what is the caller trying to accomplish? (`submitForApproval`, `checkAlarm`, `applyDiscount`)
4. **Move the logic in** — cut the conditional/action and paste into a new method on the owner.
5. **Replace the call site** — swap the ask chain for one tell call.
6. **Remove now-dead getters** if nothing else uses them (cautiously — see nuance).

## Nuance: When Getters Are Fine

Martin Fowler doesn't strictly follow TDA. Query methods are legitimate when:
- The object **transforms** data for callers (formatting, aggregation)
- It's a **value object** or DTO whose purpose is to carry data
- You're crossing **architectural layers** (persistence, serialization)
- Removing the getter creates **convolutions** worse than the query

The goal is **co-locating behavior with data**, not eliminating accessors. Don't be a "getter eradicator."

## Quick Reference

| Ask (avoid) | Tell (prefer) |
|---|---|
| `if (a.value > a.limit) a.alarm.warn(...)` | `a.setValue(newVal)` — alarm logic inside `setValue` |
| `if (cart.items.length === 0) showEmpty()` | `if (cart.isEmpty()) showEmpty()` |
| `order.status = order.computeNextStatus()` | `order.advance()` |

## Review Checklist

For each class under review:
1. List all getters — are any used only for external decisions?
2. Find conditionals reading from a single object's fields — can they move in?
3. Look for setter chains (`setA`, `setB`, `setC`) — could that be one `configure(...)` call?

Flag violations and suggest the encapsulated alternative, but note when the refactor would be overkill (trivial DTOs, framework-required accessors).
