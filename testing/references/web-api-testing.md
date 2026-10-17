# Web API Testing Strategy

Strategy-level guidance for HTTP APIs; complements `test-strategy.md` and the `rest-api-design` skill. Source: _Testing Web APIs_ (Winteringham), paraphrased.

## Model: imagination vs implementation

Testing finds the gap between what the team intends (explicit and implied expectations) and what the system does (including side effects). Ask questions on both sides; stop treating tests as mere confirmation.

## Pick activities by risk

| Activity              | Mitigates                          | Notes                                                       |
| --------------------- | ---------------------------------- | ----------------------------------------------------------- |
| Design questioning    | Wrong or ambiguous contracts       | Ask "what if the type or value is different?" before coding |
| Exploratory sessions  | Unknown unknowns                   | Time-boxed charters, notes, tools (proxy, HTTP client)      |
| Automated API checks  | Regression in known risks          | Treat as change detectors, not full verification            |
| Contract tests        | Consumer/provider drift            | Consumer publishes, provider verifies                       |
| Mocked dependencies   | Flaky or unavailable collaborators | Stub the downstream API locally                             |
| Performance tests     | Capacity, latency, leaks           | Plan goals before scripting                                 |
| Threat modeling       | Security flaws                     | Fold into design and exploration                            |
| Production monitoring | Real-user and live behavior        | SLIs, SLOs, alerts                                          |

## Automating checks well

- Choose what to automate from a prioritized risk list ("unable to create a booking"), not from code coverage or old manual cases.
- Test the API (status codes, validation, headers) at API level; push logic that merely travels through the API (a tax calculation) down to unit tests.
- Structure the framework like production code: checks (readable intent and assertions), requests (one place per URL/call), payloads (typed request/response models).
- An automated check only sees what it asserts: a page or response can be broken in ways it never notices.

## Acceptance and mocking

- ATDD for APIs: derive the failing test from a business scenario, not from the team's technical expectation.
- Mock a downstream API (for example, an auth service) to remove false positives; keep its stubs aligned through contract tests so mocks cannot silently drift.
- Property-based generation finds inputs nobody listed.

## Contract testing

| Role     | Verifies                                                  |
| -------- | --------------------------------------------------------- |
| Consumer | Its requests match the contract; mock built from contract |
| Provider | Real responses satisfy the contract                       |

Store the contract outside both services (a broker). A failing test is a prompt to update the code or talk to the other team; it is communication, not just a check.

## Performance testing

| Type     | Question answered                                 |
| -------- | ------------------------------------------------- |
| Baseline | What is normal now?                               |
| Load     | Behavior at expected traffic (include think time) |
| Stress   | Where does it degrade or fail?                    |
| Soak     | Do leaks or accumulation appear over time?        |

Define metrics, goals, and realistic user flows first; analyze percentiles and error rates, not averages alone.

## Security in everyday testing

Model data flow, enumerate threats with STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege), expand to threat trees, then mitigate. Ask security questions in design sessions, probe auth and input handling during exploration, and add automated checks for confirmed threats.

## Production

Track SLIs against SLOs (which support SLAs) to learn how users and the system behave live; the objective chosen drives what is measured.
