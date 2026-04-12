---
name: kano-triage
description: >
  Kano Model feature triage: classify features as Must-be, One-dimensional, Attractive,
  Indifferent, or Reverse before building them. Empowers developers to refuse unnecessary
  work with a principled, evidence-based framework.

  TRIGGER when: user says Kano, "should we build this?", "is this feature worth it?",
  "feature prioritization", "feature triage", "what should we build?", "must-have vs
  nice-to-have", "feature classification", "refuse this feature", "say no to features",
  "build the right thing", "alienation vs autonomisation", "feature factory"; user wants
  to decide whether a feature is worth implementing; user questions the value of a story
  or ticket before starting work.

  DO NOT use when: the feature decision is already made and the question is purely about
  implementation technique (use `tcrdd` or `testing` instead); performing market research
  or competitive analysis (this is developer-level triage, not product management); the
  user needs help writing tests or code.

  Prefer this over `tcrdd` when the question is "should we build this?" rather than
  "how should we build this?"
---

# Kano Triage

Classify features before building them. A principled framework for deciding what is worth your time.

## Kano Classification

| Category | When present | When absent | Developer action |
|---|---|---|---|
| **Must-be** | Expected, no satisfaction boost | Strong dissatisfaction | Build it. No discussion. |
| **One-dimensional** | Satisfaction proportional to execution | Dissatisfaction proportional to absence | Build if resources allow. Negotiate scope. |
| **Attractive** | Delightful surprise | No dissatisfaction | Build only if cheap or strategically differentiating. |
| **Indifferent** | No effect | No effect | **Refuse it.** This is waste. |
| **Reverse** | Active dissatisfaction | Relief | **Refuse it and explain why.** Building this harms users. |

---

## Workflow

```
CLASSIFY → functional/dysfunctional questions → evaluate → categorize
           Indifferent or Reverse? → REFUSE (document why) → DONE
           Must-be / One-dimensional / Attractive? → SCOPE → ROUTE

SCOPE    → size the deliverable per category
           Must-be?           → minimum viable, no gold-plating
           One-dimensional?   → negotiate quality level with stakeholder
           Attractive?        → time-box strictly

ROUTE    → hand off to implementation skill
           Need TDD discipline?     → tcrdd
           Need safe refactoring?   → mikado-method
           Need to write tests?     → testing
```

### CLASSIFY — Ask the question pair

For each feature, ask two questions:

1. **Functional**: "How would you feel if this feature _were present_?"
2. **Dysfunctional**: "How would you feel if this feature _were absent_?"

Each question accepts five answers: **Like it**, **Expect it**, **Neutral**, **Can tolerate**, **Dislike it**.

Cross-reference the answers in the evaluation matrix:

| | **Like** | **Expect** | **Neutral** | **Tolerate** | **Dislike** |
|---|---|---|---|---|---|
| **Like** | Q | A | A | A | O |
| **Expect** | R | I | I | I | M |
| **Neutral** | R | I | I | I | M |
| **Tolerate** | R | I | I | I | M |
| **Dislike** | R | R | R | R | Q |

> Rows = functional answer, Columns = dysfunctional answer.
> **M** = Must-be, **O** = One-dimensional, **A** = Attractive, **I** = Indifferent, **R** = Reverse, **Q** = Questionable (re-ask — answers are contradictory).

For multi-feature or multi-respondent analysis, see `references/kano-questionnaire.md`.

### SCOPE — Size the deliverable

Once classified:

- **Must-be**: define the minimum that removes dissatisfaction. No more.
- **One-dimensional**: agree with the stakeholder on the target quality level. Document the trade-off.
- **Attractive**: set a strict time-box. If it can't be built within the box, defer it.

### ROUTE — Hand off to implementation

The Kano skill's output is a _decision_: build, refuse, or scope-down. Implementation method is a separate concern.

| Situation | Route to | Why |
|---|---|---|
| Feature validated, build with discipline | `tcrdd` | Red/green/refactor ensures craft quality on what Kano validated |
| Feature requires large-scale restructuring | `mikado-method` | Safe incremental refactoring via dependency graphs |
| Need to audit or add test coverage | `testing` | Testing strategy and philosophy |

---

## Refusal Protocol

When a feature classifies as **Indifferent** or **Reverse**, refuse it with evidence:

1. **State the classification** — name the Kano category and what it means.
2. **Present the evidence** — which users were asked, what questions, what answers produced this result.
3. **Propose alternatives** — what to build instead, or where to redirect effort for higher impact.
4. **Document the decision** — record the classification and refusal in the issue tracker, not just verbally.

> The refusal protocol is what makes Kano politically actionable. Without it, classification is just an exercise.

---

## Error handling

| Situation | Action |
|---|---|
| Stakeholder disagrees with classification | Re-run with more respondents; present data, not opinion |
| No access to users for the questionnaire | Use proxy signals: support tickets, analytics, competitor analysis |
| Feature is politically mandated despite Indifferent/Reverse | Document the override. Build with minimal investment. Flag for removal review. |
| Classification is ambiguous (borderline) | Default to the more conservative category (e.g. borderline Attractive → treat as Indifferent) |

---

## Resources

| Read when | Link |
|---|---|
| Want the original Kano model theory | [Kano model — Wikipedia](https://en.wikipedia.org/wiki/Kano_model) |
| Understanding alienation in AI-driven development | [Aliénation ou autonomisation — Benoit Gantaume](https://artisandeveloppeur.fr/alienation-ou-autonomisation/) |
| Need multi-feature questionnaire and scoring | `references/kano-questionnaire.md` |
