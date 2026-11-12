# Diátaxis

Framework for organising documentation by user need. Official source: [diataxis.fr](https://diataxis.fr/).

Use it when a doc set (not a single README) feels muddled, when deciding where new content belongs, or when a page tries to do two jobs.

## The four forms

| Form         | Oriented to   | Serves the user's | Answers                | Analogy      |
| ------------ | ------------- | ----------------- | ---------------------- | ------------ |
| Tutorial     | Learning      | Study (acquire)   | "Teach me"             | A lesson     |
| How-to guide | Goals         | Work (apply)      | "How do I do X?"       | A recipe     |
| Reference    | Information   | Work (apply)      | "What exactly is X?"   | A map        |
| Explanation  | Understanding | Study (acquire)   | "Why is it like this?" | A discussion |

## The compass

Two questions place any content: **action or cognition?** and **acquisition or application?**

| Content…          | …serves the user's…  | …so it is a  |
| ----------------- | -------------------- | ------------ |
| informs action    | acquisition of skill | tutorial     |
| informs action    | application of skill | how-to guide |
| informs cognition | application of skill | reference    |
| informs cognition | acquisition of skill | explanation  |

Use it on a page that feels wrong: ask which cell the content is in, then move or split the parts that disagree.

## Writing rules per form

**Tutorial**

- Learner does something meaningful toward an achievable goal; the author owns their success.
- Show the destination up front ("we will build…", not "you will learn…").
- Small steps, visible results early and often, one reliable path.
- Do not explain, offer choices, or generalise. Link out instead.

**How-to guide**

- Titled by the user's goal ("How to configure reconnection back-off"), not by a tool feature.
- Action only: no teaching, no digression. Assumes a competent reader.
- Practical over complete; adapt to real-world variation, allow branches.

**Reference**

- Describe and only describe: austere, neutral, accurate, consistent patterns.
- Mirror the structure of the product (modules, endpoints, flags).
- Generated reference is fine but is not the whole docs. Link to guides instead of instructing.

**Explanation**

- Context, history, design decisions, trade-offs, alternatives, connections to other topics.
- Anchor each page on a real or imagined "why" question to bound its scope.
- May be titled Background, Concepts, Discussion, or Topics.

## Validate before delivering

From the installed `documentation` skill ([mcollina/skills](https://github.com/mcollina/skills/blob/main/skills/documentation/SKILL.md)):

| Form         | Title pattern                       | Passes when                                                 |
| ------------ | ----------------------------------- | ----------------------------------------------------------- |
| Tutorial     | Verb + outcome: "Build your first…" | A beginner finishes it end to end without outside help      |
| How-to guide | "How to configure X"                | An experienced user completes the task without backtracking |
| Reference    | Name the thing: "CLI flags"         | A specific fact can be found in under 30 seconds            |
| Explanation  | "How X works", "Why Y"              | The reader can explain the _why_ in their own words         |

Ask about the audience and their goal before writing a new page; the answer decides the form.

## Common failures

| Smell                                      | Fix                                               |
| ------------------------------------------ | ------------------------------------------------- |
| Tutorial full of background and options    | Move explanation out, pick one path               |
| How-to that teaches the concept first      | Split: guide for the task, explanation for why    |
| Reference with step-by-step instructions   | Move steps to a how-to, link back                 |
| Explanation scattered as asides everywhere | Gather into one page per topic                    |
| Tutorial and how-to treated as the same    | Learning-by-doing lesson vs. task for the skilled |

## Applying to an existing doc set

Diátaxis is applied iteratively, not as a big-bang rewrite.

1. Pick any page, starting with whatever is in front of you. Run the compass.
2. Make one improvement (split, move, trim to its form).
3. Publish or commit it at once; don't batch.
4. Repeat. The structure emerges from the content; do not design the tree first.

**Never create empty `tutorials/`, `how-to/`, `reference/`, `explanation/` sections** to "fill later". Diátaxis is a guide, not a plan. Improve what exists rather than tearing it down. Docs are never _finished_, but each step should leave them _complete_ for their current purpose.

## Quality

- **Functional quality** (accuracy, completeness, consistency, precision) is objective and must be maintained as the code changes. Diátaxis can't supply it, but it exposes the gaps. For example, reference that mirrors the code shows what's missing, and pulling explanation out of a tutorial reveals steps the reader was left to work out alone.
- **Deep quality** (flow, anticipating the user, feeling good to use) depends on functional quality. Diátaxis creates the conditions for it, for instance by keeping digressions out of how-tos, but it does not guarantee it.

Typical top level: `tutorials/`, `how-to/`, `reference/`, `explanation/`. A README stays a front door and links into these (see [readme.md](readme.md)).

## See also

- [diataxis.fr](https://diataxis.fr/): full theory, workflow, and per-form guidance.
- The installed `documentation` skill under `.agents/skills/documentation/` for hands-on authoring.
