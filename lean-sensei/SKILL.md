---
name: lean-sensei
description: Apply Lean Tech to delivery bottlenecks, team dependencies, and continuous improvement. Use for Lean Tech or Lean-Sensei requests, Andon signals, requests for help or escalation with blocked work, excess work in progress, or scaling agile teams; use dantotsu for standalone defect analysis.
---

# Lean Tech

Adapted from [Theodo's Lean Tech overview](https://www.theodo.com/lean-tech).

## Manifesto

> We are uncovering better ways to scale tech organizations by doing it and helping others do it. Through this work we have come to value:

| Lean Tech value                   | Over the Agile formulation                              |
| --------------------------------- | ------------------------------------------------------- |
| Value for the Customer            | “customer collaboration over contract negotiation”      |
| A Tech-Enabled Network of Teams   | “individuals and interactions over processes and tools” |
| Right-First-Time and Just-in-Time | “working software over comprehensive documentation”     |
| Building a Learning Organization  | “responding to change over following a plan”            |

Use these priorities to guide scaling decisions; do not treat them as permission to discard collaboration, working software, or adaptability.

## Apply the five pillars

Start with the problem and evidence. Mark unknowns; preserve scope. Apply relevant pillars together:

| Pillar                           | Action                                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Value for the Customer           | Identify the user, problem, and measurable outcome before proposing features.                             |
| Tech-Enabled Network of Teams    | Trace handoffs; enable end-to-end ownership. Introduce modular boundaries only for observed dependencies. |
| Right First Time                 | Detect errors early; prevent recurrence. For defect investigation, read [online dantotsu](https://github.com/bsene/skills/tree/main/dantotsu). |
| Just-in-Time                     | Pull from real demand; limit work in progress and deliver small increments.                               |
| Building a Learning Organization | Involve practitioners; test improvements, share learning, and update standards from results.              |

Recommend one experiment with an owner, measure, and review point. Distinguish proposals from verified improvements.

Example: releases wait for shared QA → trial one ready item at a time with early checks; compare waiting time and escaped defects after two releases.

## Observe work at its source

For an unclear bottleneck, adapt Genchi Genbutsu to software work:

- Trace an actual user journey or delivery handoff with the people doing the work; inspect the relevant code, logs, and queues.
- Ask what happens during delays or workarounds. Record observations separately from hypotheses instead of relying only on summary dashboards.
- Assign one improvement and follow up where the problem occurred. Share verified learning with affected teams and update their working standard.

Adapted from [Fabriq's Genchi Genbutsu guide](https://fabriq.tech/2026/04/24/genchi-genbutsu-usine/). Consult [Fabriq's Lean Management collection](https://fabriq.tech/category/lean-management/) for further material relevant to the observed problem.

## Andon: surface blockers early

Adapt Andon to make deviations from the team's expected delivery flow visible and invite timely help:

- Agree on observable signals, such as a red CI build, a production incident, or work blocked past its agreed wait time.
- Route each signal to someone able to respond promptly. An alert without a clear response path becomes noise.
- Have the responder help restore flow and check the working standard with the people doing the work. Feed recurring defect causes into [Dantotsu](https://github.com/bsene/skills/tree/main/dantotsu).
- Agree which delivery step to pause when continuing could spread a defect, and what evidence is needed to resume; record signals and outcomes to spot recurring problems.

Treat the signal as a request for support and process improvement, not as a measure of individual performance. This adapts [Fabriq's overview of Andon](https://fabriq.tech/2023/08/11/systeme-andon-lean-management/) and [the Andon overview](https://en.wikipedia.org/wiki/Andon_(manufacturing)), which describe prompt support, pausing production when needed, and learning from recorded alerts.
