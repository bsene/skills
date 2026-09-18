---
name: clean-code
description: Use when writing new code, naming modules/files/functions/classes/variables, reviewing or refactoring code for readability, assessing/reducing complexity, deciding whether an abstraction belongs, or reviewing with CUPID. Trigger on requests like "name this function", "is this a good variable name", "review this for clean code", "reduce complexity", "should I add a comment here", "should I abstract this", "review with CUPID", or any PR/code review pass. Covers human-scale design, naming, complexity budgets, comments, and CUPID's composable, Unixy, predictable, idiomatic, domain-based lens. Pairs with language-specific skills (typescript, go, clojurescript) for syntax/idiom concerns.
---

# Clean Code

Code is for people to read, modify, and delete. Run four checks: design, naming, complexity, comments. Each has a concrete bar, not a vibe.

## 1. Design for a human-sized mental model

Prefer the concrete solution until the same need has appeared independently at least three times. An abstraction is cheap to write and expensive for every later reader to learn and trace. A hypothetical future need is not a reason to add one.

Fix defects at their cause, not with another special-case branch around the symptom. A good fix should reduce paths through the code or repair the shared rule that created the problem.

**Chunks** are containment boundaries — repository → service → module → function — that let a reader ignore what is outside the task. Keep each chunk coherent enough to understand locally. **Slices** cross those boundaries: observability, recoverability, accessibility, security, and similar concerns. Make their path through the affected chunks easy to find and follow; do not hide a cross-cutting concern just to make one chunk look tidy.

Some complexity belongs to the domain. Do not flatten tax, compliance, or other real rules into a simple-looking but incorrect model. Prefer the design a new reader can understand correctly without extra context, not merely the shortest expression.

## 2. Naming

Every module, file, function, class, and variable name must reveal intention on its own — no need to read the body to know what it does.

Operational checks, in order:

1. **Intention-revealing**: name says what it does/holds, not how (`elapsedTimeInDays`, not `d`). If you need a comment to explain a name, the name failed.
2. **No confusion**: don't use names that differ in ways that are hard to spot (`userList` vs `usersList`), and don't call something a `list` unless it's actually a `List` type. Don't use two names for the same concept, or one name for two concepts.
3. **Reduce noise**: strip noise words that add no meaning — `data`, `info`, `manager`, `object`, `Impl`. `ProductInfo` vs `Product` — if both exist, the names are indistinguishable in practice. Prefer the shorter one and let context (folder, type) carry the rest.
4. **Avoid acronyms/abbreviations**: `calculateInvoiceTotal`, not `calcInvTot`. Exception: acronyms that are more standard than the spelled-out form in the domain (`id`, `url`, `html`) — but pick one casing convention and stay consistent.
5. **Searchable**: no magic numbers/single-letter names for anything beyond a tight loop index. `MAX_RETRY_COUNT`, not `5` or `n`. A name you can `grep` for beats one you can't.
6. **Part of speech**: classes/types get noun phrases (`Invoice`, `PaymentProcessor`); functions/methods get verb phrases (`calculateTotal`, `isValid`, `hasExpired`). A function named like a noun is a smell — it's probably returning something it should be named after, or doing too much.
7. **One word per concept**: pick one verb for one action across the whole codebase — don't mix `fetch`/`retrieve`/`get` for the same kind of operation, or `add`/`insert`/`append` for the same kind of mutation. Check for existing convention in the codebase before introducing a new synonym.

## 3. Cyclomatic complexity

Budget, per function:

- **Human-authored code: ≤ 4**
- **Agent-authored code (Claude/AI-generated): ≤ 6**

Count: start at 1, +1 per `if`, `else if`, `case`, `for`, `while`, `catch`, `&&`/`||` in a condition, ternary. If a function crosses the budget, refactor before considering it done — don't leave it and move on.

Refactor moves, roughly in order of preference:

1. **Guard clauses / early return** — flatten nested conditionals instead of `if/else` pyramids.
2. **Extract method** — pull a branch or loop body into a named function; the extraction itself often clarifies intent (see Naming above).
3. **Replace conditional with lookup/map** — `switch`/`if` chains selecting a value or behavior become an object/map lookup.
4. **Replace conditional with polymorphism** — only when the branches represent genuinely different types/behaviors, not for a one-off.
5. **Split the function** — if it's doing more than one thing, it should be more than one function; complexity is often a symptom of mixed responsibilities, not just nesting depth.

Don't refactor purely to hit the number — a clean 5 beats a contorted 4. The budget is a trigger to look closer, not a hard gate to game.

## 4. Comments

No big deal. Don't treat comments as sacred or as a metric to hit — code that needs a comment to be understood should usually be rewritten first (better name, extracted function), but if a comment is the clearest way to convey something, just write it.

- Prefer self-documenting code over comments explaining _what_ code does.
- Comments earn their place explaining _why_ — a non-obvious tradeoff, a workaround for an external constraint, a deliberate deviation from the "obvious" approach.
- Delete comments that just restate the code (`// increment i` above `i++`).
- Stale comments (describing behavior the code no longer has) are worse than no comment — flag them for removal on sight.
- TODOs are fine when they carry real information (why deferred, ideally by whom/when); a bare `// TODO` isn't worth keeping.

## 5. CUPID review

Use CUPID when the user asks for that framework or a broad design-quality review. First establish the language, purpose, local conventions, and scope. For each property, cite concrete code and use this shape:

```
### C — Composable
**Rating:** 🟢 Strong / 🟡 Moderate / 🔴 Weak
**Observations:** specific code evidence
**Suggestions:** a direction-of-travel improvement
```

| Property        | Look for                                                         |
| --------------- | ---------------------------------------------------------------- |
| Composable      | Narrow, intention-revealing API; minimal dependencies            |
| Unix philosophy | One externally coherent purpose; unsurprising side effects       |
| Predictable     | Visible behavior, bounded failures, deterministic state          |
| Idiomatic       | Language and local conventions; no reinvention                   |
| Domain-based    | Domain vocabulary and boundaries rather than framework structure |

End with what is already working and the one to three highest-leverage improvements. CUPID is a direction, not compliance: acknowledge trade-offs and avoid “violates” or “must.” Read [the full CUPID reference](references/cupid-properties.md) when a property needs deeper analysis.

## Gotchas

- Don't apply the agent complexity budget (6) to code a human will primarily maintain by hand — check who owns the file going forward, not who wrote the current diff.
- Naming and complexity interact: half of what looks like "high complexity" is actually "badly named branches hiding what the function does" — try renaming before reaching for extraction.
- Don't chase noise-word removal into ambiguity — `Product` vs `ProductInfo` is a good trim; `Product` vs `ProductOwner` is not, they're different concepts.
- One-word-per-concept is a codebase-wide check, not a per-file one — grep for the existing verb before introducing a synonym.
- Don't force away complexity that comes from the domain; make it explicit and verifiable instead.
- A CUPID score is a review lens, not a reason to extract or split code without a concrete design benefit.

---

## Benchmark

Scenario: `.benchmarks/scenarios/clean-code-001-agent-code-review.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/clean-code-001-agent-code-review.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 67%     | 100% | +33%  |
| claude-sonnet-4-6 | 83%     | 100% | +17%  |
| claude-haiku-4-5  | 67%     | 67%  | +0%   |

> **PASS (run 2026-08-31)**. Opus +33 (67→100); sonnet +17 (83→100); haiku at ceiling. No regressions. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/simple-001-root-cause-fix.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/simple-001-root-cause-fix.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 100% | +17%  |
| claude-sonnet-4-6 | 83%     | 100% | +17%  |
| claude-haiku-4-5  | 83%     | 100% | +17%  |

> **SOFT PASS (run 2026-08-31)**. Small uniform gains; no regressions. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/clean-code-002-cupid-review.md` — pending a baseline/skill-on rerun after this merge.
