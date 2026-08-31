---
id: dantotsu-001-escape-stage
skill: dantotsu
---

# Prompt

Help me write a root cause analysis for this defect.

Our SaaS billing product overcharged a client $1,204 on their March invoice: we billed a full quarter for a subscription the client had canceled mid-quarter. A client reported it to support by email on Monday.

What we know from investigating:

- The cancellation flow sets `subscription.status = "canceled"`.
- The quarterly invoice job only checked `subscription.auto_renew == false` before billing, and never checked `status`.
- The dev who wrote the invoice job left the company last month. There is no ADR, ticket comment, or design doc explaining why `auto_renew` was chosen as the only gate — nobody on the team remembers.
- This is the third time this year that a billing bug was first reported by a client rather than caught internally.
- We have no integration test that bills a canceled subscription.

Write up the analysis.

# Criteria

- [ ] Identifies the detection stage explicitly as the client-reported stage (Stage F / Client), using escape-stage classification
- [ ] Keeps "why did it happen" (occurrence whys) and "why wasn't it caught earlier" (detection/outflow) as two separate analyses rather than one merged chain
- [ ] Treats the departed author's choice of `auto_renew` as the only gate as an unconfirmed hypothesis (cannot be verified without the author or a decision record), not as established fact
- [ ] Proposes an eradication measure that prevents the class of defect (e.g. an automated check or test that catches billing-after-cancellation and similar state-machine gaps), separate from the immediate fix
- [ ] Uses the recurrence signal (third client-reported billing bug this year) as evidence of a systemic process gap, not just a one-off
- [ ] Does NOT primarily organize the analysis around a Low/Medium/High severity rating (stage classification, not severity, is the primary axis)