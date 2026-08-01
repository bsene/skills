---
name: clean-code
description: Use when writing new code, naming modules/files/functions/classes/variables, reviewing or refactoring code for readability, or assessing/reducing function complexity. Trigger on requests like "name this function", "is this a good variable name", "review this for clean code", "reduce complexity", "should I add a comment here", or any PR/code review pass. Covers naming conventions, cyclomatic complexity budgets (human vs agent-authored code), and comment discipline. Not a full style guide — pairs with language-specific skills (typescript, go, clojurescript) for syntax/idiom concerns.
---

# Clean Code

Three checks to run on any piece of code: naming, complexity, comments. Each has a concrete bar, not a vibe.

## 1. Naming

Every module, file, function, class, and variable name must reveal intention on its own — no need to read the body to know what it does.

Operational checks, in order:
1. **Intention-revealing**: name says what it does/holds, not how (`elapsedTimeInDays`, not `d`). If you need a comment to explain a name, the name failed.
2. **No confusion**: don't use names that differ in ways that are hard to spot (`userList` vs `usersList`), and don't call something a `list` unless it's actually a `List` type. Don't use two names for the same concept, or one name for two concepts.
3. **Reduce noise**: strip noise words that add no meaning — `data`, `info`, `manager`, `object`, `Impl`. `ProductInfo` vs `Product` — if both exist, the names are indistinguishable in practice. Prefer the shorter one and let context (folder, type) carry the rest.
4. **Avoid acronyms/abbreviations**: `calculateInvoiceTotal`, not `calcInvTot`. Exception: acronyms that are more standard than the spelled-out form in the domain (`id`, `url`, `html`) — but pick one casing convention and stay consistent.
5. **Searchable**: no magic numbers/single-letter names for anything beyond a tight loop index. `MAX_RETRY_COUNT`, not `5` or `n`. A name you can `grep` for beats one you can't.
6. **Part of speech**: classes/types get noun phrases (`Invoice`, `PaymentProcessor`); functions/methods get verb phrases (`calculateTotal`, `isValid`, `hasExpired`). A function named like a noun is a smell — it's probably returning something it should be named after, or doing too much.
7. **One word per concept**: pick one verb for one action across the whole codebase — don't mix `fetch`/`retrieve`/`get` for the same kind of operation, or `add`/`insert`/`append` for the same kind of mutation. Check for existing convention in the codebase before introducing a new synonym.

## 2. Cyclomatic complexity

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

## 3. Comments

No big deal. Don't treat comments as sacred or as a metric to hit — code that needs a comment to be understood should usually be rewritten first (better name, extracted function), but if a comment is the clearest way to convey something, just write it.

- Prefer self-documenting code over comments explaining *what* code does.
- Comments earn their place explaining *why* — a non-obvious tradeoff, a workaround for an external constraint, a deliberate deviation from the "obvious" approach.
- Delete comments that just restate the code (`// increment i` above `i++`).
- Stale comments (describing behavior the code no longer has) are worse than no comment — flag them for removal on sight.
- TODOs are fine when they carry real information (why deferred, ideally by whom/when); a bare `// TODO` isn't worth keeping.

## Gotchas

- Don't apply the agent complexity budget (6) to code a human will primarily maintain by hand — check who owns the file going forward, not who wrote the current diff.
- Naming and complexity interact: half of what looks like "high complexity" is actually "badly named branches hiding what the function does" — try renaming before reaching for extraction.
- Don't chase noise-word removal into ambiguity — `Product` vs `ProductInfo` is a good trim; `Product` vs `ProductOwner` is not, they're different concepts.
- One-word-per-concept is a codebase-wide check, not a per-file one — grep for the existing verb before introducing a synonym.
