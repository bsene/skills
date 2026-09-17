---
id: typescript-003-router
skill: typescript
---

# Prompt

I need to parse untrusted HTTP JSON into a `CreateUser` object in a TypeScript service. Tell me which TypeScript skill path to use and show the safe boundary pattern. Do not assume static types validate runtime input.

# Criteria

- [ ] Routes runtime untrusted-data validation to the Zod sub-skill
- [ ] States that TypeScript types alone do not validate runtime input
- [ ] Validates at the HTTP boundary before business logic uses the data
- [ ] Avoids `as CreateUser` as validation
- [ ] Does not route the task to an unrelated design-pattern or testing skill
