---
id: typescript-001-illegal-states
skill: typescript-type-system
models: [claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5-20251001]
---

# Prompt

Model an order with statuses PENDING, PAID, SHIPPED, CANCELLED. PAID needs a `paidAt` timestamp. SHIPPED needs `paidAt` + `shippedAt` + `trackingNumber`. CANCELLED needs `cancelledBy` + `cancelledAt`. Make illegal states unrepresentable.

# Criteria

- [ ] Response uses a discriminated union, one type per status — NOT a single type with optional fields
- [ ] Response uses a shared base (intersection or extends) for common fields (id, total)
- [ ] Response includes a discriminant field (e.g. `status: "PENDING"`) literal-typed
- [ ] Response shows an `assertNever` / exhaustiveness check on a handler switch
- [ ] Response does NOT mark all the conditional fields `?` optional on a single shape
- [ ] Response avoids `as` type assertions for the narrowing
