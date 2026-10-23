# Extreme Programming Practices (c2 wiki)

Distilled from the c2 wiki pages ExtremeProgramming, CollectiveCodeOwnership, PairProgramming, ContinuousIntegration and RefactorMercilessly.

| Practice                  | Core idea                                                                                                                                            | Prerequisites                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Collective code ownership | Code belongs to the project; anyone may change any class and must keep the unit tests green. Individual ownership creates bottlenecks around stories | Shared coding standard, comprehensive unit tests, refactoring tools, near-continuous integration |
| Pair programming          | Two people, one workstation, complementary roles (one types the test, the other thinks about the class that satisfies it)                            | Training in the people skills involved                                                           |
| Continuous integration    | Integrate in small steps so the system is always integrated; long-held modules are what make conflicts and integration hell                          | Fast tests, shared mainline                                                                      |
| Refactor mercilessly      | Merge look-alike methods and objects, change all users of the old capability. No big design up front, so the design is upgraded continuously         | Unit and acceptance tests, CI                                                                    |

## Notes

- The wiki's own debate: collective ownership may not scale to large organisations. Treat it as a team-size trade-off, not a law.
- Reported evidence for pairing (Laurie Williams): about 15% slower than two individuals but about 15% fewer bugs. Cheap if testing and debugging dominate cost.
- Refactoring is safe only behind tests. No tests: write them first (see the testing skill).
- Related: [simplicity principles](simplicity-principles.md).

Sources: https://wiki.c2.com/?ExtremeProgramming, ?CollectiveCodeOwnership, ?PairProgramming, ?ContinuousIntegration, ?RefactorMercilessly, http://www.extremeprogramming.org/
