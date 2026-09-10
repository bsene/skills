<!--
Source: https://github.com/addyosmani/agent-skills/tree/main/skills/code-review-and-quality
Distilled from upstream. Dropped process/team framing (review speed, change-description
standards), the severity-prefix table (superseded by /review Severity Tiers), and the
multi-model pattern (covered by agentic-code-review.md). Carries forward the
atomic-updates rule from the retired thermo-nuclear-code-quality-review rubric.
-->

# Code Review and Quality (Deep-Rigor Rubric)

**Approval standard:** approve when the change definitely improves overall code
health, even if it isn't perfect. Don't block because it isn't exactly how you
would have written it — but working code that is unreadable, insecure, or
structurally wrong is debt that compounds, and "we'll clean it up later" never
comes. The review is the quality gate.

## The Five-Axis Review

Walk each changed file through these axes:

### Correctness

Does the code do what it claims to do?

- Does it match the spec or task requirements?
- Are edge cases handled (null, empty, boundary values)?
- Are error paths handled (not just the happy path)?
- Off-by-one errors, race conditions, state inconsistencies?

### Readability & Simplicity

Can another engineer understand this without the author explaining it?

- Names descriptive and consistent with project conventions (no `temp`, `data`,
  `result` without context)?
- Control flow straightforward — no nested ternaries, deep callbacks, clever
  tricks that should be simplified?
- **Could this be done in fewer lines?** 1000 lines where 100 suffice is a failure.
- **Are abstractions earning their complexity?** Don't generalize until the third
  use case.
- Dead code artifacts: no-op variables, backwards-compat shims, `// removed` comments?
- **Is a new conditional bolted onto an unrelated flow?** Design smell, not a nit —
  push the logic into its own helper, state, or policy instead of tangling an
  existing path.
- **Do repeated conditionals on the same shape appear?** They signal a missing
  model or dispatcher. A "temporary" branch is usually permanent debt.

### Architecture

Does the change fit the system's design?

- Follows existing patterns or introduces a justified new one?
- Clean module boundaries; no circular dependencies?
- **Does this refactor reduce complexity or just relocate it?** Count the concepts
  a reader must hold. If a "cleaner" version leaves that count unchanged, it isn't
  cleaner — prefer the restructuring that makes whole branches, modes, or layers
  disappear. Prefer deleting an abstraction to polishing it.
- **Is feature-specific logic leaking into a shared module?** Keep logic in its
  owning layer; reuse the canonical helper instead of a near-duplicate.
- **Are type boundaries explicit?** Question gratuitous `any`/`unknown`/casts and
  silent fallbacks that paper over an unclear invariant — an explicit boundary
  often simplifies the surrounding control flow.
- **Sequential orchestration and non-atomic updates:** flag independent work
  serialized for no reason, and related updates that can leave state half-applied.

### Security

- User input validated and sanitized at system boundaries?
- Secrets kept out of code, logs, and version control?
- Auth/authz checked where needed; SQL parameterized; outputs encoded?
- Data from external sources (APIs, logs, user content, config) treated as
  untrusted before use in logic or rendering?

### Performance

- N+1 query patterns? Unbounded loops or unconstrained data fetching?
- Missing pagination on list endpoints?
- Large objects created in hot paths; sync operations that should be async?

## Structural Remedies

When you flag a structural problem, propose the move — not just the problem:

- **Replace a chain of conditionals** with a typed model or explicit dispatcher.
- **Collapse duplicate branches** into a single clearer flow.
- **Separate orchestration from business logic** so each reads on its own.
- **Move feature-specific logic** out of a shared module into the package that
  owns the concept.
- **Reuse the canonical helper** instead of a bespoke near-duplicate.
- **Make a type boundary explicit** so downstream branching disappears.
- **Delete a pass-through wrapper** that adds indirection without clarifying.
- **Extract a helper, or split a large file** into focused modules.

Prefer the remedy that removes moving pieces over one that spreads the same
complexity around.

## Change Sizing

```
~100 lines changed   → Good. Reviewable in one sitting.
~300 lines changed   → Acceptable if it's a single logical change.
~1000 lines changed  → Too large. Split it.
```

- **Watch file size, not just diff size.** A small diff can still push a file past
  ~1000 _total_ lines (not a hard cap — an inspection signal). When a change
  materially grows an already-large file, ask whether to decompose _first_.
- **"One change"** = one self-contained modification with its related tests,
  keeping the system functional. One part of a feature, not the whole feature.
- **Separate refactoring from feature work** — a change that refactors and adds
  behavior is two changes.
- **When large changes are acceptable:** complete file deletions and automated
  refactoring where the reviewer verifies intent, not every line.

## Verify the Verification

Check the author's verification story before trusting a green check:

- What tests were run? Did the build pass?
- Was the change tested manually (screenshots, before/after) where applicable?
- Do the tests test behavior, not implementation details — and would they catch
  a regression if the code changed?

## Dependency Discipline

Every dependency is a liability. Before adding one:

1. Does the existing stack solve this? (Often it does.)
2. How large is it (bundle impact)? Actively maintained? Known vulnerabilities
   (`npm audit`)? Compatible license?

Reviewing an upgrade is reviewing a code change:

1. **Read the changelog, not just the version number** — a "patch" can carry a
   behavioral change; for a major bump, find what breaks.
2. **One dependency per change** — a bulk "bump deps" that breaks the build
   hides which package did it; single-package changes keep reverts clean.
3. **Let the tests decide** — green suite before and after, not "it installed."
   Thin coverage around the dependency is the real finding; add a test first.
4. **Mind the transitive graph** — review the lockfile diff, not just
   `package.json`; never hand-edit the lockfile.

## Honesty in Review

- **Don't rubber-stamp.** "LGTM" without evidence of review helps no one.
- **Don't soften real issues.** "Minor concern" for a bug that hits production
  is dishonest.
- **Quantify when possible** — "this N+1 adds ~50ms per item" beats "could be slow".
- **Push back on approaches with clear problems** — sycophancy is a failure mode.
- **Accept override gracefully** — if the author has full context and disagrees,
  defer; comment on code, not people.

## Common Rationalizations

| Rationalization                          | Reality                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| "It works, that's good enough"           | Working code that is unreadable, insecure, or structurally wrong compounds debt.                    |
| "I wrote it, so I know it's correct"     | Authors are blind to their own assumptions.                                                         |
| "We'll clean it up later"                | Later never comes. Require cleanup before merge.                                                    |
| "AI-generated code is probably fine"     | AI code needs more scrutiny, not less — it is confident and plausible even when wrong.              |
| "The tests pass, so it's good"           | Tests are necessary but not sufficient; they don't catch architecture or security problems.         |
| "The refactor makes it cleaner"          | Relocating complexity isn't reducing it — look for the version where branches disappear.            |
| "It's only a small addition to the file" | Small diffs still push files past a healthy size; judge the resulting structure, not the diff size. |
| "It's just a version bump"               | A bump is a behavior change you didn't write. Read the changelog.                                   |

## Presumptive Blockers

Surface these and propose the simpler design; escalate to Blocker when the
change actively makes structure worse:

- A refactor that relocates complexity instead of reducing it
- A change that pushes a file past the size boundary with no decomposition
- Feature logic added to a shared module
- A near-duplicate of an existing canonical helper
- A silent fallback that hides an unclear invariant

## Dead Code Hygiene

After refactoring, check for orphaned code: list unreachable/unused elements
explicitly and **ask before deleting** — don't leave dead code behind, but don't
silently remove anything you're not sure about.
