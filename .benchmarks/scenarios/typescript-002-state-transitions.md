---
id: typescript-002-state-transitions
skill: typescript-type-system
---

# Prompt

Model a document review workflow in TypeScript so that illegal states are unrepresentable. Rules:

- A document is `Draft`, `InReview`, `Approved`, or `Rejected`.
- Only `InReview` has a `reviewerId`. Only `Rejected` has a `reason`. Only `Approved` has an `approvedAt`.
- A `DocumentId` must never be interchangeable with a `UserId` even though both are strings.
- Provide a `transition(doc, event)` whose return type makes illegal transitions (e.g. `Draft` → `Approved`
  directly, or approving an already-`Rejected` doc) a compile error, not a runtime check.

# Criteria

- [ ] Uses a discriminated union keyed on a `status` literal — per-state fields live only on their state
- [ ] Brands `DocumentId` and `UserId` as nominal types so they are not mutually assignable
- [ ] Models transitions so illegal source→target pairs fail at compile time (typed events / per-state transition map), not via runtime `if`
- [ ] Uses an exhaustive `switch` with an `assertNever` default over the union
- [ ] Does NOT use `as`/type assertions or `any` to force transitions
- [ ] Does NOT add an optional field that is valid in only one state (no `reviewerId?` on the base type)
