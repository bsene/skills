# Kano Questionnaire — Full Reference

## Questionnaire Template

For each feature under evaluation, present the two questions to each respondent:

### Question Pair

| # | Feature | Functional: "How would you feel if…?" | Dysfunctional: "How would you feel if…?" |
|---|---------|---------------------------------------|------------------------------------------|
| 1 | _[feature name]_ | _[was present]_ → Like / Expect / Neutral / Tolerate / Dislike | _[was absent]_ → Like / Expect / Neutral / Tolerate / Dislike |
| 2 | _[feature name]_ | … | … |

### Answer Scale

| Answer | Meaning |
|---|---|
| **Like it** | I would enjoy having this |
| **Expect it** | I consider this a basic requirement |
| **Neutral** | I have no strong feeling either way |
| **Can tolerate** | I can live with it, but I don't like it |
| **Dislike it** | I would actively dislike this |

---

## Evaluation Matrix

Cross-reference the functional answer (row) with the dysfunctional answer (column):

|  | **Like** | **Expect** | **Neutral** | **Tolerate** | **Dislike** |
|---|---|---|---|---|---|
| **Like** | Q | A | A | A | O |
| **Expect** | R | I | I | I | M |
| **Neutral** | R | I | I | I | M |
| **Tolerate** | R | I | I | I | M |
| **Dislike** | R | R | R | R | Q |

- **M** = Must-be — basic expectation, causes dissatisfaction when missing
- **O** = One-dimensional — satisfaction scales linearly with execution quality
- **A** = Attractive — unexpected delight, no penalty when absent
- **I** = Indifferent — no impact on satisfaction either way
- **R** = Reverse — presence actively reduces satisfaction
- **Q** = Questionable — contradictory answers, re-ask the question

---

## Multi-Respondent Scoring

When surveying multiple users, classify each response individually, then compute the percentage distribution across categories for each feature.

### Scoring Table

| Feature | M% | O% | A% | I% | R% | Q% | **Winner** |
|---|---|---|---|---|---|---|---|
| _Feature A_ | 45% | 20% | 10% | 15% | 5% | 5% | **Must-be** |
| _Feature B_ | 5% | 10% | 15% | 60% | 5% | 5% | **Indifferent** |
| _Feature C_ | 10% | 50% | 20% | 10% | 5% | 5% | **One-dimensional** |

**Classification rule**: the category with the highest percentage wins. In case of a tie, apply the priority order **M > O > A > I > R > Q** (err on the side of caution).

### Minimum Sample Size

- **5-8 respondents**: sufficient for internal tools or small user bases
- **15-20 respondents**: recommended for customer-facing features
- **30+ respondents**: needed when results are close or politically contested

---

## Worked Example

**Feature**: "Dark mode for the admin dashboard"

### Raw Responses (8 respondents)

| Respondent | Functional | Dysfunctional | Classification |
|---|---|---|---|
| R1 | Like | Neutral | A |
| R2 | Neutral | Neutral | I |
| R3 | Like | Dislike | O |
| R4 | Neutral | Neutral | I |
| R5 | Like | Neutral | A |
| R6 | Expect | Neutral | I |
| R7 | Like | Tolerate | A |
| R8 | Neutral | Neutral | I |

### Score Summary

| M | O | A | I | R | Q |
|---|---|---|---|---|---|
| 0% | 12.5% | 37.5% | 50% | 0% | 0% |

**Winner**: Indifferent (50%)

**Interpretation**: despite vocal advocates for dark mode, half the user base is indifferent. This feature should be **refused** or deferred unless it can be built at near-zero cost. The 37.5% Attractive score means it could become worth building if priorities shift, but it is not worth displacing Must-be or One-dimensional work.
