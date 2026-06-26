---
id: mikado-method-001-revert-discipline
skill: mikado-method
---

# Prompt

We need to swap our `PaymentGateway` from Stripe to a new internal service. It's referenced in ~40 files
and the naive change breaks compilation everywhere — circular imports between `billing`, `orders`, and
`notifications`. Walk me through how to do this safely on `main` without a long-lived branch.

# Criteria

- [ ] Applies the Mikado loop explicitly: goal → naive attempt → map prerequisites from the errors → revert → implement leaves → commit → repeat
- [ ] Produces a Mikado Map (tree / Mermaid graph) with the goal as root and prerequisites as children
- [ ] Enforces REVERT after the naive attempt — the map survives, the broken code does not (does NOT push through the broken state)
- [ ] Implements leaf nodes first (no remaining prerequisites), one at a time
- [ ] One commit per completed leaf, keeping the codebase green/working at every step
- [ ] Explicitly enables working on `main` without a long-lived feature branch
- [ ] Does NOT attempt the whole 40-file change in one pass
