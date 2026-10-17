## Pragmatics — when to skip or downgrade the loop

TDD is a discipline, not dogma. Per Uncle Bob's own pragmatics, skip TCRDD (or downgrade to a
lighter cadence) in these cases — everything else still gets the full loop:

- **Trivial code** — getters/setters, bare member variables, one-line or obviously trivial
  functions. These get exercised indirectly by the tests of whatever calls them; writing a
  RED/GREEN cycle for each one is ceremony without signal.
- **GUI / layout code** — anything that has to be _fiddled_ into place by trial and error
  (font sizes, RGB values, XY positions, spacing). Don't force a failing test first here.
  Instead:
  - Extract any real logic out of the GUI layer into a plain module and TCRDD _that_ module.
    The GUI itself should be thin glue — wiring, not behavior.
  - For the fiddly glue itself, either fiddle first and write tests after the fact, or fiddle,
    then delete and re-write test-first once you know the shape. Both are legitimate; pick
    per judgement call, not per rule.
- **Trusted third-party code** — frameworks, databases, web servers, SDKs you have no reason
  to distrust. Mock the boundary and TCRDD _your_ code against the mock; don't write tests
  that re-verify the third party's behavior. Exception: if you suspect it's actually broken,
  or a real call is cheap/fast/predictable enough that mocking is overkill — then it's fine
  to test through it.
- **Genuine one-shot throwaway work** — a script or program that will be run once and
  discarded (e.g. generating a one-off asset), especially in a REPL-driven / exploratory
  context. Skip the loop entirely.

None of this licenses skipping TCRDD because a task merely _feels_ inconvenient or slow. The
default is still: make every effort to TDD any code with lasting production value. These are
narrow, recognizable exceptions — not a general escape hatch.
