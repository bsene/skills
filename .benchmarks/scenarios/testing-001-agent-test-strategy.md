---
id: testing-001-agent-test-strategy
skill: testing
---

# Prompt

We just started using an AI coding agent for implementation — one Claude instance builds each feature end to end. Three questions from our team lead: (1) Should the same agent instance that writes the code also write its tests? Seems efficient — it knows the code best. (2) Should we make it follow strict red/green/refactor micro-steps like we make human devs do, to keep the feedback tight? (3) We have Gherkin acceptance specs that the agent keeps failing; the agent says some assertions look outdated and too strict — can it tweak them so the suite passes? Advise us on the testing strategy.

# Criteria

- [ ] Recommends separating the test-writer role from the coder role (a different agent instance or human writes the tests), with the reason that a same-instance author writes tests that codify its own bug
- [ ] Rejects strict micro-step red/green/refactor for the agent, and instead proposes tests-first then implementation in larger batches (adapted to the agent's working memory, not the human cadence)
- [ ] Treats the Gherkin/acceptance tests as guardrails the coding agent must NOT be allowed to loosen or edit to make them pass
- [ ] Names a shifted trust signal for agent-written code: coverage, mutation testing, and/or complexity metrics as the primary check instead of reading every diff in review
- [ ] Grounds the advice in the agent's specific failure modes (hallucination, gaming the test rather than satisfying it)
- [ ] Response does NOT conclude the agent can self-test because "it knows the code best," and does NOT prescribe interactive human-paced TDD loops for the agent
