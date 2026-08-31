# Martin Fowler's Testing Canon

Distilled from the 44 articles tagged [testing](https://martinfowler.com/tags/testing.html) on Martin Fowler's site. Use this reference when you need a Fowler-style answer to test strategy, test layering, non-determinism, test doubles, specification, production observability, or LLM-era testing practice.

## Think in a test portfolio

Fowler's testing articles repeatedly warn against turning the pyramid into a religion. The goal is a **portfolio**: choose the cheapest test layer that gives the confidence a scenario needs.

| Layer       | Best for                                                  | Keep it small because                      |
| ----------- | --------------------------------------------------------- | ------------------------------------------ |
| Unit        | Pure behavior, rules, and edge cases                      | Fast and precise, but isolated from wiring |
| Component   | One deployable service through its public interface       | Collaborators are still replaced           |
| Integration | Real collaborators inside one process or system           | More moving parts than a unit test         |
| Contract    | Consumer/provider expectations at a service boundary      | Cheap confidence without a full E2E run    |
| E2E / UI    | One first-of-its-kind user journey                        | Slow, flaky, and hard to diagnose          |
| Production  | Synthetic monitoring, observability, exploratory feedback | It cannot replace pre-production tests     |

A high-level test that catches a bug is still a signal that a lower-level test is missing. Reproduce the bug at the lowest useful level before fixing it, then keep that focused regression test. This is the "second line of defense" idea in Fowler's writing.

## Make the system self-testing

Self-testing code is the precondition for confident refactoring and continuous delivery. A green build must mean the system is releasable; otherwise the suite is a red-light theater. When useful tests are too slow or unstable to be release-blocking, split them into delivery and discovery pipelines.

Before implementing a feature, write a **test recipe**: the scenario list, each assigned to the cheapest layer that gives the required confidence. Update it as the design changes. That recipe is the feature's definition of done, not an after-the-fact coverage report.

## Eradicate non-determinism

Flaky tests destroy trust in every other result. Fowler's advice is not "retry and move on":

- Isolate shared state and per-test resources.
- Control time, randomness, and asynchronous completion.
- Avoid remote services and sleeps in fast tests.
- Quarantine erratic tests until the root cause is fixed.
- Use production-like feedback for the genuinely slow/external cases.

A test that sometimes passes is worse than no test because it teaches people to ignore red.

## Choose doubles deliberately

Fowler's test-double vocabulary is still the cleanest way to reason about a mock-heavy suite:

| Double | Purpose                                      | Assert on it?                             |
| ------ | -------------------------------------------- | ----------------------------------------- |
| Dummy  | Fill a parameter list                        | No                                        |
| Stub   | Provide fixed input data                     | No                                        |
| Fake   | Provide a working lightweight implementation | Yes, through observable state             |
| Spy    | Record what the system sent                  | Yes, when the interaction is the behavior |
| Mock   | Verify an outgoing interaction               | Yes, but only at a system edge            |

Prefer fakes for owned interfaces and real collaborators within a system. Reserve mocks for interactions that genuinely cross a system boundary and are themselves the behavior under test.

Fowler's bliki patterns turn that rule into code shapes:

| Pattern                 | Use it when                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| Humble Object           | Separate logic from framework glue that is hard to test           |
| Clock Wrapper           | Make time explicit and controllable                               |
| In Memory Test Database | Replace expensive persistence during fast tests                   |
| Self Initializing Fake  | Capture a real service response once, then replay it              |
| Object Mother           | Centralize valid domain fixtures without hiding intent            |
| Page Object             | Hide UI automation mechanics behind domain-facing operations      |
| Static Substitution     | Replace a static dependency only when a seam cannot be introduced |
| Legacy Seam             | Find the first place a legacy dependency can be broken            |

## Speak the specification language

Tests are most useful when they read like a description of behavior, not a list of implementation calls. Fowler's Given/When/Then and Specification By Example articles push the suite toward a shared language with domain experts. The rule is not "write Gherkin everywhere"; it is "make the scenario's context, action, and observable result obvious."

## Keep production in the loop

Automated tests cannot discover every unknown. Fowler's production-oriented articles complement the suite:

- **Exploratory testing** finds unknown unknowns through skilled, deliberate investigation.
- **QA in Production** treats quality as something practiced while software runs.
- **Synthetic Monitoring** gives a fast, repeatable signal in production.
- **Domain-Oriented Observability** exposes domain-level facts, not just CPU counters.
- **Test Coverage** is a tool for finding untested code, not a quality score.

Use test impact analysis when feedback loops become the bottleneck. It selects the tests most likely affected by a change, but does not replace scheduled full runs.

## Test LLM-era systems like software

Fowler's LLM engineering practices do not create a separate testing religion. They add:

- Automated regression tests around prompts, retrieval, and orchestration.
- Evaluation sets that describe intended behavior, not vibes.
- Adversarial cases for hallucination, bias, unsafe output, and failure paths.
- Observability that captures prompts, retrieved context, latency, and outcomes.
- Human review where probabilistic behavior cannot be reduced to a deterministic assertion.

The same portfolio rules apply: lower-level checks for parsing and orchestration, evaluation suites for model behavior, production monitoring for drift.

## Article map

### Strategy and architecture

| Article                                                                                                                | Core takeaway                                                                     |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Testing Strategies in a Microservice Architecture](https://martinfowler.com/articles/2023-microservices-testing.html) | Expand the portfolio with component, integration, contract, and end-to-end layers |
| [The Practical Test Pyramid](https://martinfowler.com/articles/practical-testing-pyramid.html)                         | Put many fast tests at the base; use high-level tests sparingly                   |
| [Is TDD Dead?](https://martinfowler.com/articles/is-tdd-dead/)                                                         | Treat TDD as a design tool, not a dogma war                                       |
| [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)                                                        | Prefer many low-level tests over a top-heavy suite                                |
| [Self Testing Code](https://martinfowler.com/bliki/SelfTestingCode.html)                                               | A green build should mean the system is releasable                                |
| [Self Testing Software](https://martinfowler.com/bliki/SelfTestingSoftware.html)                                       | Extend self-testing beyond the build into deployment confidence                   |
| [Continuous Delivery](https://martinfowler.com/bliki/ContinuousDelivery.html)                                          | Make release a routine, low-risk event                                            |
| [Testing Language](https://martinfowler.com/bliki/TestingLanguage.html)                                                | Use a shared, domain-facing vocabulary for test scenarios                         |
| [Specification By Example](https://martinfowler.com/bliki/SpecificationByExample.html)                                 | Make examples executable specifications                                           |
| [Given When Then](https://martinfowler.com/bliki/GivenWhenThen.html)                                                   | Keep context, action, and result explicit                                         |
| [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)                                   | Let tests drive design decisions                                                  |
| [Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html)                          | Remove shared state, remote calls, timing, and resource leaks                     |
| [Goto Fail, Heartbleed, and Unit Testing Culture](https://martinfowler.com/articles/unit-testing.html)                 | Unit testing culture matters as much as tooling                                   |
| [The Rise of Test Impact Analysis](https://martinfowler.com/articles/2025-test-impact-analysis.html)                   | Speed feedback by running the tests affected by a change                          |

### Test doubles and testability patterns

| Article                                                                                           | Core takeaway                                                         |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)                      | Distinguish verification from state preparation                       |
| [Test Double](https://martinfowler.com/bliki/TestDouble.html)                                     | Use precise vocabulary for replacement objects                        |
| [Modern Mocking Tools and Black Magic](https://martinfowler.com/articles/modernMockingTools.html) | Powerful mocking tools make bad design easy to hide                   |
| [Humble Object](https://martinfowler.com/bliki/HumbleObject.html)                                 | Extract hard-to-test glue from testable logic                         |
| [Clock Wrapper](https://martinfowler.com/bliki/ClockWrapper.html)                                 | Make time a controlled dependency                                     |
| [In Memory Test Database](https://martinfowler.com/bliki/InMemoryTestDatabase.html)               | Trade fidelity for fast, deterministic persistence tests              |
| [Self Initializing Fake](https://martinfowler.com/bliki/SelfInitializingFake.html)                | Capture real service behavior once, replay it cheaply                 |
| [Object Mother](https://martinfowler.com/bliki/ObjectMother.html)                                 | Centralize valid test data construction                               |
| [Page Object](https://martinfowler.com/bliki/PageObject.html)                                     | Hide UI mechanics behind domain operations                            |
| [Static Substitution](https://martinfowler.com/bliki/StaticSubstitution.html)                     | Substitute a static dependency only when no seam exists               |
| [Legacy Seam](https://martinfowler.com/bliki/LegacySeam.html)                                     | Find the first break point for bringing a legacy component under test |
| [Making Stubs](https://martinfowler.com/bliki/MakingStubs.html)                                   | Keep stubs explicit and behavior-oriented                             |
| [Detestable](https://martinfowler.com/bliki/Detestable.html)                                      | Watch for test suites that make change harder, not safer              |
| [Assertion Free Testing](https://martinfowler.com/bliki/AssertionFreeTesting.html)                | Do not confuse a green test with an assertion that detects a bug      |
| [Test Coverage](https://martinfowler.com/bliki/TestCoverage.html)                                 | Use coverage to find untested code, not as a quality score            |
| [Test Invariant](https://martinfowler.com/bliki/TestInvariant.html)                               | Check properties that must remain true across a range of cases        |
| [Testing Resource Pools](https://martinfowler.com/bliki/TestingResourcePools.html)                | Isolate resources that tests can exhaust or corrupt                   |
| [Database And Build Time](https://martinfowler.com/bliki/DatabaseAndBuildTime.html)               | Keep persistence setup out of the fast feedback loop                  |
| [JUnit New Instance](https://martinfowler.com/bliki/JunitNewInstance.html)                        | Understand framework lifecycle rules before assuming isolation        |
| [Erratic Test Failure](https://martinfowler.com/bliki/ErraticTestFailure.html)                    | Treat non-determinism as a defect to root-cause                       |
| [Test Cancer](https://martinfowler.com/bliki/TestCancer.html)                                     | Avoid tests that consume more maintenance than value                  |

### Application and production testing

| Article                                                                                                                   | Core takeaway                                                         |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Domain-Oriented Observability](https://martinfowler.com/articles/domain-oriented-observability.html)                     | Expose domain concepts, not just infrastructure metrics               |
| [QA in Production](https://martinfowler.com/articles/qa-in-production.html)                                               | Practice quality while software runs, not only before release         |
| [Synthetic Monitoring](https://martinfowler.com/bliki/SyntheticMonitoring.html)                                           | Simulate user journeys for repeatable production signals              |
| [Exploratory Testing](https://martinfowler.com/bliki/ExploratoryTesting.html)                                             | Use skilled investigation to find unknown failure modes               |
| [Testing Asynchronous JavaScript](https://martinfowler.com/articles/asyncJS.html)                                         | Wait for the real completion condition, never an arbitrary sleep      |
| [Demo Front-End](https://martinfowler.com/articles/demo-front-end.html)                                                   | Use testable front-end structure to support demos and maintenance     |
| [Engineering Practices for LLM Application Development](https://martinfowler.com/articles/engineering-practices-llm.html) | Apply software engineering discipline to LLM systems                  |
| [xUnit](https://martinfowler.com/bliki/Xunit.html)                                                                        | Understand the framework lineage behind test isolation and assertions |
| [Nashville Project](https://martinfowler.com/bliki/NashvilleProject.html)                                                 | Remember that testing culture grows through practice and mentorship   |
