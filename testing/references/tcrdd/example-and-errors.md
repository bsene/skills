# Example and Error Handling

Detail for [TCRDD](../tcrdd.md).

## Example: baby step vs one-shot

Feature: a `Cart.total()` that sums line items and applies a discount code.

✅ **Correct (one baby step):**

```
RED:   write a test asserting total() of an empty cart is 0 → fails (no method) → commit
GREEN: add total() returning 0 → passes → commit
RED:   write a test for one item → fails → commit
GREEN: sum the items → passes → commit
... (discount handled by a later RED/GREEN, not now)
```

❌ **Wrong (one-shot — what breaks weaker models):**

```
Write all five tests at once, then a complete Cart with summing + discount logic,
then a single squashed commit. No red/green cadence, no revert safety.
```

The skill is the loop. If you produce a finished feature in one turn, you did not run TCRDD.

---

## Error handling

| Situation                                        | Action                                                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reset --hard` fires on your change              | The step was too large — split it into smaller increments and try again                                                                                             |
| Same-size step reverts >2x in a row (autonomous) | Stop retrying at that size. Split smaller once; if that also stalls, halt and report a `blocked-stuck` status instead of looping or forcing a bigger transformation |
| Tests are flaky (pass/fail randomly)             | Fix or isolate the flaky test before continuing the cycle                                                                                                           |
| Working tree was dirty before entering the loop  | Don't let a phase's commit sweep up unrelated pre-existing changes — `git stash` them first, or ask the user how to handle them                                     |
