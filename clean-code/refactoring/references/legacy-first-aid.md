# Legacy Code First Aid

Practical rescue techniques for code with few or no tests. Source: _Legacy Code - First Aid Kit_ (paraphrased). For dependency-driven large changes, use the `mikado-method` skill; this file only covers how the techniques fit together.

## Where to Start

| Question                         | Technique                                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Which files deserve attention?   | Hotspots: rank files by churn (commits in last 12 months), then cross with complexity. Frequently changed and complex files pay back first    |
| Why does a task never finish?    | Mikado plus a Parking list: timebox an attempt, revert on failure, record blockers as sub-goals, park unrelated ideas instead of chasing them |
| Where is the risk of the change? | Sketch the dependency graph on paper before touching code                                                                                     |

```bash
git log --format=format: --name-only --since=12.month | egrep -v '^$' | sort | uniq -c | sort -nr | head -50
```

## Working Habits

| Habit                     | Rule                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Micro-commits             | Commit every 2-5 minutes with a timer; stage with `git add -p`; take a break after about an hour                        |
| Exploratory refactoring   | 30-minute timebox: refactor freely to learn the code, take notes, then `git reset --hard`. Keep knowledge, discard code |
| Automated refactorings    | Rename, Extract, Inline via IDE shortcuts only. Machine-driven edits are safe without tests; hand edits are not         |
| Refactor or fix, not both | Never mix behavior change and restructuring in one step. Keep the code working after each step                          |
| Daily refactoring hour    | Block one hour a day, keep a list of small refactorings, open a PR at the end                                           |
| Progressive naming        | Improve names in steps: nonsense, honest, completely honest, does-the-right-thing, intention-revealing                  |

## Making Code Testable Without Tests

| Technique                 | Use when                                              | Steps                                                                                                           |
| ------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Proximity refactoring     | Related statements are scattered, blocking extraction | Slide related statements together (small moves, run tests if any), then Extract. Be extra careful without tests |
| Decouple core from infra  | Logic is mixed with DB, HTTP, FS, clock, random, log  | Extract each infrastructure call into its own method/function, leaving the pure core separable                  |
| Subclass and override     | A method has side effects you cannot run in tests     | Extract the side effect into an overridable method, subclass in the test, override it with a no-op or recorder  |
| Approval testing          | Output is large or complex and no assertions exist    | Stringify the output, review and approve it as the snapshot, refactor, diff against the snapshot                |
| Move function to delegate | A class does too much to test in place                | Move the function into a collaborator, forward from the old location, then migrate callers                      |

## Changing Code Safely

| Technique               | Use when                                                  | Steps                                                                                                                                                                                 |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incremental refactoring | Changing a signature or behavior used across the codebase | 1. Extract the body into a new function named with a `__NEW` suffix; the old one becomes a proxy. 2. Adapt the new one. 3. Migrate callers one by one. 4. Delete the proxy and rename |
| Wrap and sprout         | New behavior must go into untested code                   | Write the new logic in a new, tested unit; hook it into the old code with a minimal one-line change                                                                                   |
| Make the change easy    | A feature is hard to add                                  | First refactor so the change is trivial (Beck), ship that PR, then make the easy change. Aim for several refactoring PRs and one small risky PR                                       |

## Pitfalls

| Pitfall                               | Instead                                                       |
| ------------------------------------- | ------------------------------------------------------------- |
| Long "almost done" tunnel             | Revert and switch to Mikado with a timebox                    |
| Fixing bugs spotted while refactoring | Park them on a list; fix in a separate commit                 |
| Keeping exploratory code              | Reset; reimplement cleanly with the notes                     |
| Hand-editing without tests            | Use only IDE-automated refactorings until a safety net exists |
