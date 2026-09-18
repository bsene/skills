---
name: communication
description: >
  Analyze a real communication artifact (Slack/Teams message, email, meeting transcript, pitch or
  presentation draft, CV, or resume) and coach it sharper using seven rhetoric + structure techniques: ethos/logos/pathos,
  reframing tough questions, centering the other person, the Pyramid Principle, pattern interrupt, making
  ideas feel safe, and the cognitive-load through-line. Diagnose what works, what's missing, then rewrite.

  TRIGGER when: user wants to improve communication, "review my email/Slack/CV", "analyze this transcript",
  prep for a meeting/pitch/presentation, "how do I say this", be more persuasive/assertive, handle a tough
  question, talk to execs, "is this too long-winded". Also trigger for author style presets under
  references/authors/: DHH (blunt/direct), Uncle Bob (defend a quality/testing standard), Jessitron
  (reflective systems-thinking essay), Martin Fowler (measured mixed-feelings stance).
  DO NOT USE for raw text generation with no analysis, marketing/copywriting, translation, or code/docs.
---

# Communication: analyze & sharpen how you speak and write

Coach a real artifact the user provides — message, email, transcript, talk draft, CV, or resume — against proven
rhetoric and structure techniques, then propose a concrete rewrite. The through-line everywhere:
**minimize the listener's cognitive load.** The best-communicated idea wins, not the best idea.

---

## Read On Demand

| Read when                                                          | File                                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Applying any technique in depth, or the user asks how/why it works | [Frameworks](references/frameworks.md)                                               |
| User cites the 7-38-55 / Mehrabian "body language" rule            | [Frameworks → Mehrabian myth](references/frameworks.md#7-the-7-38-55-mehrabian-myth) |
| Coaching for an exec / C-level audience                            | [Frameworks → Pyramid Principle](references/frameworks.md#4-pyramid-principle)       |

### Style presets, by author (`references/authors/`)

| Author                             | Read when                                                                         | File                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **David Heinemeier Hansson (DHH)** | Maximum directness over diplomacy; "rewrite this like DHH"                          | [references/authors/dhh.md](references/authors/dhh.md) |
| **Robert C. Martin ("Uncle Bob")** | Defending a quality/testing standard against schedule pressure; code-review tone     | [references/authors/uncle-bob.md](references/authors/uncle-bob.md) |
| **Jessica Kerr ("Jessitron")**     | A reflective, systems-thinking essay/keynote on engineering practice or AI's effect on it | [references/authors/jessitron.md](references/authors/jessitron.md) |
| **Martin Fowler**                  | A measured, honestly mixed personal stance on a divisive topic                       | [references/authors/martin-fowler.md](references/authors/martin-fowler.md) |

---

## Workflow

```
1. CONTEXT  → audience (peer / client / exec / group), channel (chat / email / talk),
              goal (inform / persuade / decide). Ask only if not inferable from the artifact.
2. DIAGNOSE → score the artifact against the rubric below. Note what works AND what's missing.
3. REPORT   → findings, severity-tagged (Blocker / Warning / Suggestion). Be specific, quote lines.
4. REWRITE  → produce a concrete rewrite applying the relevant techniques. Not abstract advice.
              If the user asked for an author style preset (DHH / Uncle Bob / Jessitron / Martin
              Fowler), load the matching file under references/authors/ and apply its moves on
              top of the rewrite.
```

### Resume / CV field

Use this path for a CV or resume. Make it easy for a recruiter and ATS to answer: **is this person a
credible fit for this role?** Ask for the target role and job description only when they are not inferable.

1. **Position** — replace a generic title with the role sought; open with a short executive summary that
   states relevant scope, domain, and strongest proof.
2. **Prove impact** — rewrite duties as outcomes: strong verb + what changed + measurable result. Keep
   numbers honest; never invent metrics.
3. **Select signals** — retain only skills, keywords, certifications, and experience relevant to the role;
   remove weak or repetitive entries.
4. **Make it scannable** — use clear headings, standard role names, concise bullets, and an ATS-readable
   layout. A polished design cannot compensate for unclear positioning.

### Diagnostic rubric

- **Ethos/Logos/Pathos** — is credibility established? is the logic clear and low-load? is there an
  emotional anchor (story, image, stakes)? Default delivery order: ethos → logos → pathos.
- **Structure** — for senior/structured audiences, is the conclusion **first** (Pyramid)? or buried?
- **Focus** — does it talk about _them and their problem_, or about the speaker/the idea/the solution?
- **Safety** — does adopting the idea feel risky/irreversible? is the risk normalized and reduced?
- **Attention** — is there a hook, or is it monotone/predictable?
- **Resume positioning** — for CVs/resumes: does the title and executive summary make the target role and
  fit immediately clear? Do bullets prove impact instead of merely listing responsibilities?

---

## The 7+1 Quick Reference

| Technique                  | Use it when                                        | One-line move                                                       |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| **Ethos / Logos / Pathos** | Any persuasion; the base layer                     | Earn the right to be heard, prove it's true, make it felt.          |
| **Reframing**              | Hit with a trap / destabilizing question           | Receive → bridge → pose a better frame. Or answer with a question.  |
| **Focus on the other**     | You catch yourself talking about you/your solution | Verbalize _their_ problem first — sometimes better than they can.   |
| **Pyramid Principle**      | Talking to execs / structured, time-poor people    | Conclusion first, then 3 proofs, detail only if asked.              |
| **Pattern interrupt**      | Attention is gone (long meeting, video call)       | Break the pattern: unexpected line, silence, blunt question, image. |
| **Make it safe**           | A correct idea is being resisted                   | Normalize hesitation → reversible pilot → protect the person.       |
| **Cognitive load**         | Always                                             | Short sentences, known concepts, clear transitions.                 |
| _(Conclusion)_             | Closing the coaching                               | Pick **one** technique and apply it to the next real exchange.      |

Full treatment with worked examples: [references/frameworks.md](references/frameworks.md).

---

## Always-On Guardrails

- **Cold, analytical tone by default.** DIAGNOSE and REPORT in plain factual terms — no optimistic
  framing, no cheerleading, no softening a weak artifact to make it feel better.
- **Name risks and gaps explicitly.** The REPORT step must state what's missing or fragile, not just
  what works — a diagnosis that only lists strengths is incomplete.
- **Rewrites are drafts, not final copy.** The user reviews and refines every REWRITE himself — deliver
  a clear, workable draft rather than over-polished prose he'd have to strip back down.
- **Never fabricate ethos.** Credibility claims must be true — don't invent credentials, numbers, or
  experience to make an argument land. That's a lie, not a technique.
- **Center the other person.** The most common fix is moving the spotlight off the speaker.
- **Lead with the conclusion for senior audiences.** Buried recommendations get cut off with "where
  is this going?".
- **Stories over bare numbers.** A figure embedded in a story/comparison is remembered far better than
  the figure alone.
- **Don't trust the 7-38-55 rule.** It describes a narrow lab case, not normal speech (see references).
- **Blunt ≠ personal (DHH mode).** Directness targets the idea, never the person. And never soften
  a requested DHH rewrite back into consensus-speak (see references/authors/dhh.md).
- **Critique the work, not the person (Uncle Bob mode).** Ruthless on the artifact, courteous to
  whoever shared it (see references/authors/uncle-bob.md).

---

## Anti-patterns

| Anti-pattern                               | Why it fails                                             | Fix                                                 |
| ------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------- |
| Logic-only "expert discourse"              | True and deep, but neither agreeable nor memorable       | Add ethos up front + a pathos anchor.               |
| Talking about yourself / your idea         | Listener silently waits their turn, asks "why me?"       | Open on their problem.                              |
| Conclusion buried at the end               | Decision-makers disengage before you arrive              | Pyramid: conclusion first.                          |
| Monotone, predictable delivery             | Attention drifts to multitasking                         | One pattern interrupt, then resume substance.       |
| Pushing an idea that feels risky           | Resistance is perceived political/personal risk          | De-risk: pilot, reversible, person protected.       |
| Leaning on 7-38-55 ("words barely matter") | Misapplied lab result; in most cases words are essential | Treat verbal/paraverbal/nonverbal as all mattering. |
| CV lists duties instead of results         | Recruiter cannot see the candidate's value or scope      | Use outcome bullets with truthful evidence.         |
| Generic CV title and skills                | Candidate looks interchangeable and misses ATS signals   | Target the role; keep relevant keywords and skills. |

---

## Integrated Example

**Before** (Slack to leadership): _"Hi — so I've been thinking a lot and I really feel like I personally
need more budget. I've done a ton of work this quarter and I'd love to be able to do more, there are
loads of things I want to try and I think it could be good. Can we talk?"_

**Diagnosis:** conclusion buried (no ask), self-focused ("I/me" throughout), zero ethos, zero logos
(no reason), no pathos/stakes, feels open-ended and risky.

**After:** _"We should double the team's budget this quarter. (1) We're behind on the roadmap and need
to catch up; (2) we're resource-constrained on the highest-impact work; (3) the upside is real. To
de-risk: start with a one-month pilot — fully reversible if the numbers don't move. That's how we get
on the podium by quarter-end and actually celebrate hitting the targets together. Details on each point
whenever useful."_

Conclusion first (Pyramid) → 3 proofs (logos) → reversible pilot (safety) → shared win (pathos).

---

## External References

- **Aristotle**, _Rhetoric_ — ethos, logos, pathos.
- **Barbara Minto**, _The Pyramid Principle_ (McKinsey) — conclusion-first communication.
- **Mehrabian 7-38-55** — widely misquoted; valid only for single-word emotional/contradiction cues.
- **Stanford** — narratives are recalled markedly better than isolated figures.
- **Source video:** Quentin Despas / Katana, _"Comment réfléchir vite et parler intelligemment"_.

---

## Benchmark

Scenario: `.benchmarks/scenarios/communication-001-message-coaching.md`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 86%     | 100% | +14%  |
| claude-sonnet-4-6 | 71%     | 100% | +29%  |
| claude-haiku-4-5  | 71%     | 86%  | +15%  |

> **PASS** (run 2026-06-25). Gains on all three models (sonnet +29). Skill reliably adds conclusion-first Pyramid structure, the de-risk/pilot move, and a concrete rewrite that baselines partly miss. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/communication-002-reframe-tough-question.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/communication-002-reframe-tough-question.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 100% | +0%   |
| claude-sonnet-4-6 | 100%    | 100% | +0%   |
| claude-haiku-4-5  | 100%    | 100% | +0%   |

> **NEUTRAL (run 2026-08-31)**. All models 100% with and without — reframing a tough question is already default behavior on this task; communication-001 above carries the skill's evidence. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
