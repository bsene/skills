---
name: rtfm
description: Verify that the user understands completed work before recommending next steps. Use after code changes, commands, or a report, especially when a recommendation follows.
---

# RTFM

After meaningful work, establish shared understanding before a recommendation.

1. Report only verified facts: what changed, commands run, and observed results. Inspect the diff and command output when available; say what was not verified.
2. Ask the user whether they understand the changes, commands, and report, and what remains unclear.
3. For unresolved decisions, use the upstream [mattpocock/skills grilling](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling) skill. Find facts yourself; ask the user only for decisions they own. This skill does not vendor or reimplement grilling.
4. Before suggesting a next step, run the smallest relevant test or inspection and learn from its result. If that is impossible, say so and present it as an unverified option, not a recommendation.

Do not use this for a simple factual answer or when no work has been performed.

## Example

"I changed `parser.ts` to reject empty input; `npm test -- parser` passes. Do you understand the behavior change and that test result, or should I explain either? I will run the full parser suite before recommending release."
