# Mikado for Organizational Change

Same loop as code, applied to teams and processes. Large org changes fail like large refactors:
too much unfinished work in progress, nothing visible delivered, trust erodes, the initiative is
cancelled ("Agile doesn't work for us").

## Term mapping

| Code                 | Organization                                   |
| -------------------- | ---------------------------------------------- |
| Goal                 | Target condition (the change you want)         |
| Naive attempt        | Experiment: try working under the condition    |
| Error / failing test | Impediment                                     |
| Prerequisite node    | Impediment node, with its own target condition |
| Revert               | Return to the old way of working               |

## Loop (Improvement Kata, applied recursively)

1. Define a target condition.
2. Try it, small first (one team, not the company).
3. Works → done, then widen the scope.
4. Fails → name the main impediment, **revert to the old way of working**.
5. Treat the impediment as a new goal and recurse from step 1.

The Kata alone doesn't say how to remove impediments; recursing on each one is what makes it Mikado.

Why it works: the Kata is a four-step model of scientific thinking. Compare what you think (theory) with what actually happens (evidence) and adjust on the difference. Each experiment is a test, not a rollout. Rother's site adds practice routines ("Starter Kata") and a five-question card to run in meetings.

## Example: continuous integration

- Goal: every developer integrates within 10 minutes. Try with a few teams.
- Retrospective: teams must master CI on their own first. Revert, have one team try alone, then the next.
- Still failing: post-mortem finds a coupled architecture. That impediment is itself a code Mikado goal.

## Rules

- Revert failed experiments; never leave a half-adopted process in place.
- Keep the graph alive: expand on each failed experiment, collapse as impediments resolve.
- Share the graph so the whole organization sees the state of the change.
- Don't switch frameworks (SAFe, LeSS...) to dodge a root problem; it resurfaces. Put it on the graph.

## Sources

- <https://philippe.bourgau.net/reducing-the-risks-of-large-organization-changes-with-the-mikado-method-part-1/>
- <https://philippe.bourgau.net/reducing-the-risks-of-large-organization-changes-with-the-mikado-method-part-2/>
- <http://www-personal.umich.edu/~mrother/The_Improvement_Kata.html> (Mike Rother, Improvement Kata, the source of the target-condition loop)
