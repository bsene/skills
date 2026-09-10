<!--
Source: https://addyosmani.com/blog/agentic-code-review/
Distilled for the /review workflow: failure modes to hunt for when the diff
was authored (or is suspected to be authored) by an AI agent.
-->

# Agent-Authored Diff Review

Layer this rubric on top of the /review workflow when the branch was written
largely by an agent. The diff is not a record of the agent's reasoning — it
only survived one model's optimization pressure, and agents fail in
characteristic ways a general review pass does not look for.

## Agent-Diff Checks

Each check flags a condition and names the fix. Map findings into the existing
Blockers / Concerns / Nits tiers.

### Test tampering (Blocker)

The agent changes behavior, then edits assertions to match the broken behavior.
A green check over many edited tests means nothing unverified.

- Read test changes **before** implementation code; read them more carefully
  than the code.
- If behavior changed and test expectations moved with it, verify the change is
  the fix and not the bug — otherwise it is a Blocker.
- Coverage shows a line ran; it does not show whether a test would notice it
  failing. Where stakes warrant it, ask for mutation testing instead.

### CI weakening (Blocker)

Agents weaken CI not maliciously but by finding the cheapest path to green:

- Deleted or `skip`ped tests
- Lowered coverage / lint / type-check thresholds
- Duplicated or stubbed helpers to dodge a failing rule
- Test fixtures loosened until the broken code passes

Deterministic gates cannot be talked out of their verdict by a confident
paragraph. Any weakening of a CI gate without a written justification is a
Blocker.

### Prompt injection in agent-built features (Blocker/Concern)

User-controlled text flowing into an LLM call is a latent vulnerability that is
invisible in the diff. Check any new AI/LLM feature the branch introduces:
what reaches the prompt, and can a user shape it?

### Correlated blind spots (Concern)

If a same-family model wrote the code and another one reviewed it, a confident
all-clear is borrowed confidence — the models agree confidently in the same
wrong places. Do not rubber-stamp on the strength of an AI review; treat any AI
review as a sensor, not a verdict. The human who clicks merge owns it.

## Risk-Tiered Depth

Tier the review by blast radius, not by author:

| Blast radius                              | Depth                                                     |
| ----------------------------------------- | --------------------------------------------------------- |
| Config, docs, generated code              | Linter + glance                                           |
| Library code, minor features              | Standard /review workflow                                 |
| Money, security, data paths, high traffic | Full pass + security-before-push + a human owns the merge |

The human who clicks merge owns the change — never auto-merge.

## Intake Bar

Refuse to review (or fast-fail back to the submitter) without:

- A statement of purpose — what the change is for and which alternatives were rejected
- A readable diff — an oversized unexplained diff is itself a defect (Concern)
- Test output — proof the tests actually ran, not just that they exist

Push intent reconstruction back to the submitter; do not burn review attention
guessing what the change was supposed to do.
