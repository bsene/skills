# Simplicity Principles (c2 wiki)

Distilled from the c2 wiki pages CodeSmell, OnceAndOnlyOnce, RuleOfThree, YouArentGonnaNeedIt, DoTheSimplestThingThatCouldPossiblyWork and SimpleDesign.

| Principle                 | Rule                                                                                                                                                 | Apply when                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Code smell                | A smell is a hint, not a verdict: use it to track down the real problem (term from Kent Beck, popularised in Beck and Fowler's "Bad Smells in Code") | Something feels wrong but no test fails |
| Once and only once (OAOO) | Each piece of behaviour is declared in exactly one place; duplication is among the strongest smells                                                  | You are about to copy a block           |
| Rule of three             | Tolerate the first copy; extract on the third use. Reuse costs about 3x the effort of use, so pay it only with evidence                              | Deciding whether to extract             |
| YAGNI                     | Build what you need now, never what you foresee. Speculative code costs time, pollutes the design with guesses, and usually turns out wrong          | Tempted to add a hook, option or layer  |
| Simplest thing            | Try the simplest approach, then look at it and evaluate. Originally advice for when you are unsure, not a command                                    | Unsure how to start                     |

## Working rules

- Use OAOO as a refactoring goal, not a license to couple: removing duplication across unrelated modules adds coupling and can cost more than it saves.
- OAOO is hard in practice. Duplicated knowledge (a rule, a format) matters more than duplicated characters.
- YAGNI is not "no flexibility". It means do not over-engineer for a guessed future; keep code easy to change.
- Do not be so greedy about "simplest today" that tomorrow's simplest thing becomes a pile of epicycles (patch on patch). Refactor when the shape stops fitting.
- Speculation also overrides the customer's priorities and forces you to solve several problems at once.

## Quick checks

1. Is this extraction the third occurrence? If not, leave it.
2. Does the abstraction have more than one caller today? If not, inline it.
3. Does a test or story need this option? If not, delete it.

Sources: https://wiki.c2.com/?CodeSmell, ?OnceAndOnlyOnce, ?RuleOfThree, ?YouArentGonnaNeedIt, ?DoTheSimplestThingThatCouldPossiblyWork, ?SimpleDesign
