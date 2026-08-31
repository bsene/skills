# Test Strategy & Legacy Code

Distilled from Osherove & Khorikov, _The Art of Unit Testing_, 3rd ed. (chapters 10, 12).
Strategy-level material: how _not_ to distribute tests across levels, "test recipes" as a
planning artifact, and pipeline organization — plus how to choose where to start in a
legacy codebase. Complements `SKILL.md`'s testing-hierarchy table, which covers only the happy shape.

## Test-level antipatterns (ch. 10)

| Antipattern                                | What it looks like                                                                                      | Why it hurts                                                                                                                                                                                                                                                                                                                                                                                                                               | Way out                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **E2E-only**                               | Suite is mostly end-to-end tests                                                                        | E2E has steeply _diminishing returns_: the first test covers all the glue and costs its full price; the second is a variation that adds a fraction of the confidence at the same cost. Slow, flaky, hard to debug. Extreme form: the build is usually red and a "build whisperer" — someone who must manually eyeball every red build and pronounce "it looks red, but it's actually green" — becomes the release gatekeeper and burns out | Prove the first scenario E2E; verify every variation at a lower level (unit/component) where the same confidence costs far less |
| **Low-level-only**                         | All unit tests, no integration/E2E                                                                      | Glue between modules and third-party systems never gets exercised — code works in isolation, breaks wiring in production                                                                                                                                                                                                                                                                                                                   | One high-level test per critical scenario proves the wiring; variations drop back to low levels                                 |
| **Disconnected low- and high-level tests** | Unit tests and E2E tests pass, but nothing in between; or the two levels assert contradictory behaviors | Middle layers (integration/API) are where most production bugs in collaborating systems land; a gap means silent untested territory                                                                                                                                                                                                                                                                                                        | Map scenarios to levels deliberately — see test recipes below                                                                   |

## Test recipes (ch. 10)

A **test recipe** is the plan for a feature's tests: the list of scenarios, each assigned to the
level where it will be verified. Written **just before coding starts**, ideally with two people
(a code-side and a test-side perspective) so level assignments aren't one person's blind spots.
The recipe is the feature's definition of done — the feature isn't finished until the recipe
passes. Store it in the story/ticket; it's a living list, not a formal document.

Rules:

| Rule                         | Meaning                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Faster by default            | Choose the lowest level that yields the needed confidence; go high-level only when it's the _only_ way                        |
| Confidence threshold         | Done when you can honestly say: "if all these pass, I feel good about this feature" — otherwise add scenarios                 |
| Don't repeat across features | Already covered by an existing test (e.g. a previous feature's E2E)? Don't re-test at that level — test only the _variations_ |
| Don't repeat across levels   | Successful-login is proven at E2E once; lower levels then cover its variations (other providers, failure cases)               |
| Just in time                 | Write it when you know who codes it; revise as you go                                                                         |
| Ratio rule of thumb          | ~1 high-level test per 5–10 lower-level tests                                                                                 |

This also gives agents a tractable artifact: a recipe is the list the specifier produces and the
test-writer implements (see [ai-agent-testing](ai-agent-testing.md)'s pipeline).

## Delivery vs discovery pipelines (ch. 10)

Two pipelines instead of one slow gate:

|            | Delivery pipeline                             | Discovery pipeline                                                                             |
| ---------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Purpose    | Release-blocking go/no-go; deploys when green | Good-to-know quality signal; never blocks, never deploys                                       |
| Tests      | Fast, deterministic, high-trust               | Anything useful but slow or flaky: long integration runs, soak, deep E2E suites                |
| On failure | Fix now                                       | Becomes a work item — often a refactoring objective (the code was too tangled to test cheaply) |

If a red build doesn't reliably mean "don't ship," the suite is telling you to re-tier it.

## Legacy code: where to start (ch. 12)

Triage existing components on a 2×2 of **cyclomatic complexity** (logic that can break) and
**dependency count** (seams you'd have to break to get it under test). Every component falls in
one of four quadrants: complex + easy to test, complex + hard to test, simple + easy (irrelevant —
skip or cover incidentally), simple + hard (irrelevant).

| Strategy                                                         | Shape of the curve                                                                        | Use when                                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Easy-first** (complex but easy to test first, hard ones later) | Effort rises over time — the toughest components land at the end, under deadline pressure | The team is new to unit testing — build skill on reachable wins first           |
| **Hard-first** (dependency-heavy components first)               | Effort starts high, pays off early                                                        | The team is experienced; the hard components are the ones most worth protecting |

Either way: **write integration tests before refactoring** — a safety net that documents current
behavior (warts included) so the refactor can be verified as behavior-preserving. For breaking
dependencies once tests exist, that's Michael Feathers' _Working Effectively with Legacy Code_;
a complexity/dependency heat map from a static-analysis tool (the book uses CodeScene) turns the
2×2 triage into an automated backlog. `SKILL.md`'s "skip legacy testing" anti-pattern row starts
here: its "start with integration tests" advice is this chapter's pre-refactoring net.
