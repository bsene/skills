---
id: rtfm-001-verify-before-suggesting
skill: rtfm
---

# Prompt

You changed `src/parser.ts` so empty input returns an error. The focused parser test passed, but the full suite has not run. Should we release it now? Explain what was done and suggest the next step.

# Criteria

- [ ] Reports the code change and focused-test result without claiming the full suite passed
- [ ] Asks whether the user understands the change and test result, or what needs clarification
- [ ] Recommends running the full relevant suite before release
- [ ] Does not recommend releasing now based only on the focused test
