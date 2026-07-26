---
name: simple
description: Use this skill whenever writing new code, proposing a bugfix, reviewing a PR/diff, or discussing whether to add an abstraction, config layer, plugin system, or generic mechanism. Also trigger for architecture/design discussions, is this too complex" questions, or any point where Claude is about to suggest introducing a new abstraction layer. The core stance — code is written for humans to read, not as an artwork to admire — optimize for affordance (like a road sign, instantly readable) rather than elegance or cleverness. Trigger even if the user doesn't name "simplicity" explicitly — e.g. "should I make this configurable", "quick fix for this bug", "review this PR", "should I abstract this into a helper", "this codebase feels messy".
---

# Simple — Code for Humans, Not for Art

**Code is not for machines. Code is for humans to read, modify, and delete.** (That's also why we write it in English, not machine code.) Its primary quality is therefore **affordance**: how clearly its form (what you see) suggests its usage (how it works) — the way a road sign is instantly readable at 130 km/h by anyone, with no context required.

Don't design an artwork. Design a road sign.

Complexity is a multiplier on bugs and cost, not an additive line item: it makes reading, modifying, and removing code disproportionately more expensive, and the brain spends far more energy parsing a tangled path than a simple, explicit one. It's also insidious — it's introduced gradually, one small addition at a time, so it's easy to become numb to it (the boiling-frog effect) rather than noticing it as it accumulates.

> "given choice between complexity or one on one against t-rex, grug take t-rex: at least grug see t-rex" — grugbrain.dev

## Core checks

Apply these whenever the situation below comes up — they're independent, use whichever fits.

### 1. Bugfix quality test

A bugfix that **adds** a branch (another `if`, another special case) to patch a symptom is a bad bugfix, even if it "works." A good bugfix **simplifies** the code or repairs the underlying system so the class of bug can't recur. When proposing or reviewing a fix, actively check: does this fix reduce or increase the number of paths through the code? If it only adds a guard clause around the symptom, say so, and look one level deeper for what's actually broken. (This is the same failure mode Dantotsu's eradication step warns against — a countermeasure dressed up as a permanent fix.)

### 2. Abstraction cost is exponential, not linear

Before introducing a new abstraction layer (a generic helper, a config-driven mechanism, a plugin system, "let's make this configurable" — classically: generating forms from a config schema), treat the _perceived_ cost as exponential in the number of future readers and call sites, not linear in the time it takes to write. An abstraction is cheap to write and expensive to carry forever: every future reader now has to learn the abstraction _and_ trace back through it to the concrete case they actually care about. Default to **rule of three**: don't abstract until the same concrete need has appeared independently at least three times. A hypothetical future need is not a real need.

### 3. Complexity ceiling is set by the domain — but check both directions

Code complexity is bounded below by business/domain complexity, so when code feels overly complex, challenge the domain model or requirements first, not just the implementation ("garbage in, garbage out" — a confused domain model produces confused code no matter how it's implemented). But this cuts both ways: some domains (tax rules, insurance regulation, compliance logic — the kind of domain this user works in) have genuinely irreducible complexity, and forcing artificial simplicity there doesn't remove the complexity, it just moves it somewhere less visible (usually into an implicit assumption or an untested edge case). Don't simplify code faster than you've actually understood the domain rule it encodes.

### 4. Metrics are a signal, not the verdict

Cyclomatic complexity and cognitive complexity give an objective, non-"vibes" reading of structural complexity, and are worth citing when reviewing code or arguing for a rewrite. But they measure mechanical branching difficulty, not human readability — a function can score low on both and still be unreadable because of bad naming, misleading structure, or missing context. Use metrics as one input alongside the affordance test ("would a new teammate read this correctly, fast, with no extra context?"), never as the sole justification.

## Gotchas

- Don't over-apply this as a blanket "always simplify" rule — some complexity is inherent to the domain and forcing it away produces code that's simple but wrong. Check §3 before recommending a simplification.
- The rule-of-three threshold is a default, not dogma — if the user already has clear evidence of three-plus real occurrences, don't insist on waiting for a fourth.
- "Simplification" is not the same as "shortest code" — a one-line clever expression can have worse affordance than a slightly longer, explicit one. Optimize for how fast a reader forms a correct mental model, not for character count.
- When reviewing someone else's code or PR, lead with the affordance question ("how would a new reader parse this?"), not with abstract complexity-theory language — keep feedback concrete and tied to the actual diff.
- Don't retroactively justify a design decision that's already been made with these principles unless asked — this skill is for evaluating new code/fixes/abstractions, not for relitigating shipped decisions the user isn't questioning.

## Guiding quotes

Useful to cite when explaining _why_ a simpler version is better, not just asserting it:

- "La perfection est atteinte, non pas lorsqu'il n'y a plus rien à ajouter, mais lorsqu'il n'y a plus rien à retirer." — Antoine de Saint-Exupéry
- "La simplicité est la sophistication suprême." — Leonardo da Vinci
- "given choice between complexity or one on one against t-rex, grug take t-rex: at least grug see t-rex." — grugbrain.dev
