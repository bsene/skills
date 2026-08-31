# Async, Time & Module Faking

Distilled from Osherove & Khorikov, _The Art of Unit Testing_, 3rd ed. (chapter 6, appendix A).
Tactical patterns for the two dependencies that most often make tests slow or flaky: asynchronous
I/O and the clock. Framework examples are Jest-flavored (the book's language) — every framework
has equivalents.

## Async: wait for the act, never sleep

In Arrange-Act-Assert, an async exit point means the test must _wait for the act_ — but deterministically:

- Async/await styles: just `await` the entry point; the framework's async support keeps the test synchronous-looking.
- Callback/event-style exit points: use the runner's completion signal (Jest's `done()` callback) — never `setTimeout(500)` and hope. Arbitrary waits are the classic determinism smell (see [TestDesiderata](testdesiderata.md)); an await/`done()` that never fires fails _fast and clearly_ instead of occasionally.
- An integration-style async test (real network call awaited end-to-end) is fine _once_ as a wiring check — its problem is determinism and cost, which is why the logic gets extracted (below) and unit-tested instead.

## Two escapes from untestable async code (ch. 6)

Given a blob that fetches, computes, and returns async — extract _one_ of the two parts:

| Pattern                 | Extract                                                                                | Fake in tests                                 | Unit-test                                             |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| **Extract entry point** | The _logic_ into a pure function; the async shell keeps orchestration                  | Nothing — logic takes inputs, returns outputs | The pure function directly, no doubles                |
| **Extract Adapter**     | The _async dependency_ (fetch, driver) behind a narrow adapter interface the code owns | The adapter with a canned value               | The logic through its real entry point, adapter faked |

Extract Adapter is the same "wrap third-party libs you own an adapter for" rule from
[mocks-and-fragility](mocks-and-fragility.md) applied to async: the adapter speaks your problem's
language (interface segregation — expose only what your app needs), and network failure modes get
tested by having the fake throw, not by unplugging a real network.

```js
// Before: untestable — logic and I/O interleave
async function isWebsiteAlive() {
  const res = await fetch("http://example.com"); // I/O
  return res.text.includes("ok"); // logic
}

// After: logic extracted and pure; adapter injectable
export const isAliveFromText = (text) => text.includes("ok");
export async function isWebsiteAlive(adapter = defaultNetworkAdapter) {
  return isAliveFromText(await adapter.fetchText("http://example.com"));
}
// expect(isAliveFromText("ok fine")).toBe(true)  — no doubles needed
```

## Time: fake the clock, never sleep to it (ch. 6)

Time is a dependency like any other — a _hidden_ one, which is why it shows up in `SKILL.md`'s
integrated example as the clock buried mid-function. Prefer parameter injection of the time
source; where the production code owns its timers, fake them:

```js
jest.useFakeTimers();
it("runs the callback after the delay", () => {
  calculate1(1, 2, (result) => expect(result).toBe(3));
  jest.advanceTimersToNextTimer(); // steps fake time instead of waiting
});
```

Fake timers make tests synchronous (no `done()` needed) and let you step through _recursive_
scheduling (a callback that schedules the next `setTimeout`) timer by timer. The dependency-
injection alternative — pass `now`/`delayMs` in, no framework magic — is still the preferred
design; faking the timer is the retrofit.

Events are handled the same way as any exit point: for emitter-based code, subscribe in the test
and assert the event fires with its payload; click/DOM events go through the framework's synthetic
event helpers (the book uses testing-library) rather than hand-rolled dispatch.

## Module faking: last resort (appendix A)

The appendix's own warning: monkey-patching (replacing functions/globals/modules at runtime) has
maintenance costs worse than simply parameterizing the code — its legitimate uses are code you
can't change at all. If you must:

- **Ignoring a whole module** (`jest.mock("path")` with no factory) is the safe, blunt case — you want it out of the way, no fake data.
- **Faking per-test module data** requires a clean-replace-re-require dance (module cache resets) or a dedicated stubbing library — genuinely awkward.
- **Avoid Jest manual mocks** (`__mocks__/` folder): hardcoded fake placement by naming convention kills readability (the fake's behavior lives in a different file than the test) and maintenance. Prefer an explicit injected fake.
- Stubs-by-framework comparison (Sinon, testdouble) matter less than the pattern they share: clean up, replace, re-require — the same CFRA cycle regardless of tool.

If reaching for these, that's testability feedback on the design — see
[principles.md](principles.md) Principle 1 and extract a seam instead.
