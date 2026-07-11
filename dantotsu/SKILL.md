---
name: dantotsu
description: Use this skill when the user wants to investigate a bug, defect, incident, or quality issue and find its root cause — including requests to run a "5 whys" analysis, write a postmortem, do a root-cause analysis (RCA), figure out why a bug reached production or slipped past code review/QA, set up a recurring defect-analysis routine, or run a daily/weekly quality-improvement (Kaizen) triage. Also known as the Dantotsu method (Sadao Nomura's Toyota-derived defect-analysis approach, adapted for software by Theodo). Trigger even if the user doesn't name the method explicitly — e.g. "why did this bug get through code review", "a client reported a bug, help me analyze it", "I want to understand why this keeps happening", "write up a root cause report for this defect", or "help me prioritize which fixes to actually ship this week".
---

# Dantotsu — Defect Analysis

A structured method for turning a single defect into a permanent quality improvement. Originated by Sadao Nomura, a former Toyota engineer, who used it to cut manufacturing defects by up to 98%. Adapted for software by Theodo (presented by co-founder/Group CTO Fabrice Bernhard), where a small project run fully under this method reached ~0.3 defects per 1,000 lines of code — one to two orders of magnitude below the industry average — without the huge upfront-spec overhead of aerospace-grade processes.

**Defect** = any unexpected behavior for the user; the gap between the behavior that occurred and the behavior that was expected.

Two principles carry over directly from the manufacturing original and matter more than any specific template:
- **Classify by where a defect escaped, not by severity.** Severity triage optimizes for "what do we fix first"; stage classification optimizes for "what part of our process is leaking" — which is what actually drives systemic improvement.
- **Analyze both occurrence and outflow.** Why did the defect happen (prevention), and separately, why wasn't it caught sooner (detection). Conflating the two loses the detection-gap signal, which is usually a process/tooling fix rather than a code fix.

## Detection stages

Ask the user which stage caught the defect if it isn't already clear — never guess.

| Stage | Where it was caught |
|---|---|
| A | Local environment (dev's own machine) |
| B | Team level (CI or code review) |
| C | Validation environment (Product Owner spotted the gap) |
| D | Qualif/staging environment (QA spotted it) |
| E | Production (a team member spotted it) |
| F | Client (client reported it) |

Later stages (E, F) are more costly and signal a bigger process gap than earlier ones (A, B).

## Workflow

Work through these steps in order. Don't skip ahead to root cause before the defect and stage are pinned down — the whole analysis is only as good as that starting point.

1. **Describe the defect.** State it as expected behavior vs. actual behavior. If the user hasn't given enough detail to do this precisely, ask — don't assume or invent specifics.
2. **Identify the detection stage** (A–F above). Ask the user if it isn't stated.
3. **Check for recurrence.** Ask the user (or check available issue trackers/history if you have access) whether this same defect, or one with the same underlying pattern, has occurred before. Recurring defects point to a deeper systemic root cause and make eradication more important than a one-off fix.
4. **Find the root cause with the 5 Whys (occurrence).** Start from the defect description in step 1 — not from a symptom or a guess — and ask "why" repeatedly, each time treating the previous answer as the new thing to explain. Stop once the answer describes something concretely actionable (a process gap, a missing check, a wrong assumption), not just another restatement of the symptom. Five is a typical depth, not a hard rule.
5. **Inspect why it wasn't caught earlier (outflow).** Compare the actual detection stage to the earliest stage where it plausibly could have been caught. Run this as its *own* short whys-style drilldown, separate from step 4 — the missed-detection root cause is often a process/tooling gap (missing test, no lint rule, no reviewer checklist item), not the same cause as the defect itself.
6. **Distill a learning-sharing item.** Before proposing fixes, write a short, shareable summary of the misconception or gap uncovered in steps 4–5 (a PR/Jira comment, a Slack message, a one-slide recap) that lets a teammate who wasn't involved understand it in under a minute. A root cause that only lives in one person's head doesn't prevent the next occurrence — this is what actually spreads the learning.
7. **Propose countermeasures.** Short-term, containment-level fixes: patch the immediate occurrence, stop the bleeding (hotfix, rollback, manual workaround). These don't need to be elegant or prevent recurrence — they need to be fast.
8. **Design eradication measures.** Go deeper than the countermeasure: what permanent change (process, tooling, automated check, documentation, training) makes this entire class of defect structurally unable to recur — including recurring undetected until a late stage? Prefer **micro-guardrails**: small, automated, reversible checks (a one-line lint rule, a single added test, a doc snippet linked from the PR template) over large refactors. A tiny guardrail that ships beats a sweeping fix that never lands or introduces its own defects. Don't label something eradication if it only addresses this one instance.

## Prioritizing eradication measures (optional, for recurring/team use)

When there are several candidate eradication measures and they need to be triaged — e.g. in a recurring team slot rather than fixed on the spot — score each candidate and favor the ones that are automated, low-risk, and scoped to this defect's area rather than one that touches unrelated services:

| Criterion | What to check |
|---|---|
| Impact | Would it have prevented this defect, and similar ones, from recurring? |
| Complexity / risk | Could it introduce new bugs or destabilize unrelated code? |
| Effort | How much work to implement per developer? |
| Time to verify | Can it be verified automatically (fast) or does it need manual checking (slow)? |

Pick a small number of top-scoring, low-risk items per cycle rather than attempting all candidates at once — batching too much at once causes the fire-fighting/large-refactor instability this method is meant to avoid.

## Team cadence (optional, reference practice from Theodo)

For teams running this continuously rather than as a one-off, Theodo's adaptation uses:
- **One bug-fix analysis per day**, owned by the tech lead: review the diff, log the root cause, check the codebase for similar latent defects.
- **A short daily sync** (10–15 min, "Bug Fix Analysis Coffee") where the team proposes countermeasures together — new lint rule, an edge-case fixture, a small fix-driven refactor.
- React within 24 hours of the defect surfacing, so the analysis happens while context is still fresh.

Suggest this cadence only if the user is setting up an ongoing team practice, not for a single defect write-up.

## Reducing A-defects: "Right the First Time" (optional technique)

To specifically drive down Stage-A defects (caught while coding), Theodo uses a constraint: a developer gets **one manual test/refresh attempt** per feature; if it fails on that first try, it counts as an A-defect. This pushes developers toward upfront design and TDD (so correctness is checked via fast terminal test runs instead of repeated manual clicking), and teams that nail a feature on the first attempt can be recognized publicly (e.g. a Slack bot shout-out). Offer this only as a targeted technique for A-defects, not as a general eradication measure for other stages.

## Gotchas

- Countermeasure and eradication are not interchangeable: a countermeasure fixes this occurrence; eradication prevents the class of defect from happening again. Keep them in separate sections and don't let a countermeasure masquerade as eradication.
- The 5 Whys chain must start from the defect description written in step 1, not from a vaguer symptom the user mentioned in passing.
- "Why did it happen" (step 4) and "why wasn't it caught" (step 5) are separate drilldowns — don't merge them into one chain.
- If the user is unsure of the detection stage or the defect description, ask a direct question rather than picking the most likely option yourself.
- Eradication doesn't mean "big refactor." Prefer the smallest automated check that closes the gap; oversized fixes are more likely to get deprioritized or introduce their own defects.
- Classify by stage, not severity — resist the urge to reintroduce a Low/Medium/High axis; it optimizes for the wrong question here.
- Write the final report in the same language the user used to describe the defect.

## Output template

For a single defect analysis, use exactly this structure — it's the default and should stay this size unless the user asks for the extras below:

```markdown
# [TITLE]

date: [DATE]
detection stage: [STAGE LETTER]

## Root cause analysis

## Countermeasures

## Eradication

```

Fill "Root cause analysis" with the defect description, the recurrence check, the full 5-whys chain, and the "why not caught earlier" analysis. Keep "Countermeasures" and "Eradication" strictly separate.

If the user also wants the learning-sharing item or the prioritization scoring captured in the document, add optional `## Learning to share` and `## Prioritization` sections — don't add them by default, only when asked or when clearly working at team/recurring level.

If the user wants this saved as a file rather than shown inline, write it as a Markdown (.md) file.
