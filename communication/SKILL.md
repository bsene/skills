---
name: communication
description: >
  Analyze a real communication artifact (Slack/Teams message, email, meeting transcript, pitch or
  presentation draft) and coach it sharper using seven rhetoric + structure techniques: ethos/logos/pathos,
  reframing tough questions, centering the other person, the Pyramid Principle, pattern interrupt, making
  ideas feel safe, and the cognitive-load through-line. Diagnose what works, what's missing, then rewrite.

  TRIGGER when: user wants to improve communication, "make this message clearer", "review my email/Slack",
  "analyze this transcript", "why did this message land badly", prep for a meeting/pitch/presentation/talk,
  "how do I say this", be more convincing / persuasive / assertive, handle a tough or trap question, talk to
  executives / C-level / leadership, structure my idea, get taken seriously, "is this too long-winded".

  DO NOT USE when: the user wants raw text generated with no analysis or coaching intent (just write it);
  pure marketing/copywriting asset production; translation; or writing code/docs/specs. For deciding whether
  a feature is worth building use `kano`; for editing code prose use the relevant language skill.
---

# Communication: analyze & sharpen how you speak and write

Coach a real artifact the user provides — message, email, transcript, or talk draft — against proven
rhetoric and structure techniques, then propose a concrete rewrite. The through-line everywhere:
**minimize the listener's cognitive load.** The best-communicated idea wins, not the best idea.

---

## Read On Demand

| Read when                                                           | File                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| Applying any technique in depth, or the user asks how/why it works  | [Frameworks](references/frameworks.md)                |
| User cites the 7-38-55 / Mehrabian "body language" rule             | [Frameworks → Mehrabian myth](references/frameworks.md#7-the-7-38-55-mehrabian-myth) |
| Coaching for an exec / C-level audience                             | [Frameworks → Pyramid Principle](references/frameworks.md#4-pyramid-principle) |

---

## Workflow

```
1. CONTEXT  → audience (peer / client / exec / group), channel (chat / email / talk),
              goal (inform / persuade / decide). Ask only if not inferable from the artifact.
2. DIAGNOSE → score the artifact against the rubric below. Note what works AND what's missing.
3. REPORT   → findings, severity-tagged (Blocker / Warning / Suggestion). Be specific, quote lines.
4. REWRITE  → produce a concrete rewrite applying the relevant techniques. Not abstract advice.
```

### Diagnostic rubric

- **Ethos/Logos/Pathos** — is credibility established? is the logic clear and low-load? is there an
  emotional anchor (story, image, stakes)? Default delivery order: ethos → logos → pathos.
- **Structure** — for senior/structured audiences, is the conclusion **first** (Pyramid)? or buried?
- **Focus** — does it talk about *them and their problem*, or about the speaker/the idea/the solution?
- **Safety** — does adopting the idea feel risky/irreversible? is the risk normalized and reduced?
- **Attention** — is there a hook, or is it monotone/predictable?

---

## The 7+1 Quick Reference

| Technique                  | Use it when                                          | One-line move                                                        |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| **Ethos / Logos / Pathos** | Any persuasion; the base layer                      | Earn the right to be heard, prove it's true, make it felt.          |
| **Reframing**              | Hit with a trap / destabilizing question            | Receive → bridge → pose a better frame. Or answer with a question.  |
| **Focus on the other**     | You catch yourself talking about you/your solution  | Verbalize *their* problem first — sometimes better than they can.   |
| **Pyramid Principle**      | Talking to execs / structured, time-poor people     | Conclusion first, then 3 proofs, detail only if asked.              |
| **Pattern interrupt**      | Attention is gone (long meeting, video call)        | Break the pattern: unexpected line, silence, blunt question, image. |
| **Make it safe**           | A correct idea is being resisted                    | Normalize hesitation → reversible pilot → protect the person.       |
| **Cognitive load**         | Always                                              | Short sentences, known concepts, clear transitions.                 |
| *(Conclusion)*             | Closing the coaching                                | Pick **one** technique and apply it to the next real exchange.      |

Full treatment with worked examples: [references/frameworks.md](references/frameworks.md).

---

## Always-On Guardrails

- **Never fabricate ethos.** Credibility claims must be true — don't invent credentials, numbers, or
  experience to make an argument land. That's a lie, not a technique.
- **Center the other person.** The most common fix is moving the spotlight off the speaker.
- **Lead with the conclusion for senior audiences.** Buried recommendations get cut off with "where
  is this going?".
- **Stories over bare numbers.** A figure embedded in a story/comparison is remembered far better than
  the figure alone.
- **Don't trust the 7-38-55 rule.** It describes a narrow lab case, not normal speech (see references).

---

## Anti-patterns

| Anti-pattern                          | Why it fails                                              | Fix                                            |
| ------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| Logic-only "expert discourse"        | True and deep, but neither agreeable nor memorable       | Add ethos up front + a pathos anchor.          |
| Talking about yourself / your idea   | Listener silently waits their turn, asks "why me?"       | Open on their problem.                         |
| Conclusion buried at the end         | Decision-makers disengage before you arrive              | Pyramid: conclusion first.                     |
| Monotone, predictable delivery       | Attention drifts to multitasking                         | One pattern interrupt, then resume substance.  |
| Pushing an idea that feels risky     | Resistance is perceived political/personal risk          | De-risk: pilot, reversible, person protected.  |
| Leaning on 7-38-55 ("words barely matter") | Misapplied lab result; in most cases words are essential | Treat verbal/paraverbal/nonverbal as all mattering. |

---

## Integrated Example

**Before** (Slack to leadership): *"Hi — so I've been thinking a lot and I really feel like I personally
need more budget. I've done a ton of work this quarter and I'd love to be able to do more, there are
loads of things I want to try and I think it could be good. Can we talk?"*

**Diagnosis:** conclusion buried (no ask), self-focused ("I/me" throughout), zero ethos, zero logos
(no reason), no pathos/stakes, feels open-ended and risky.

**After:** *"We should double the team's budget this quarter. (1) We're behind on the roadmap and need
to catch up; (2) we're resource-constrained on the highest-impact work; (3) the upside is real. To
de-risk: start with a one-month pilot — fully reversible if the numbers don't move. That's how we get
on the podium by quarter-end and actually celebrate hitting the targets together. Details on each point
whenever useful."*

Conclusion first (Pyramid) → 3 proofs (logos) → reversible pilot (safety) → shared win (pathos).

---

## External References

- **Aristotle**, *Rhetoric* — ethos, logos, pathos.
- **Barbara Minto**, *The Pyramid Principle* (McKinsey) — conclusion-first communication.
- **Mehrabian 7-38-55** — widely misquoted; valid only for single-word emotional/contradiction cues.
- **Stanford** — narratives are recalled markedly better than isolated figures.
- **Source video:** Quentin Despas / Katana, *"Comment réfléchir vite et parler intelligemment"*.

---

## Benchmark

Scenario: `.benchmarks/scenarios/communication-001-message-coaching.md`

| Model            | Without | With | Delta |
| ---------------- | ------- | ---- | ----- |
| claude-opus-4-8  | —       | —    | —     |
| claude-sonnet-4-6 | —      | —    | —     |
| claude-haiku-4-5 | —       | —    | —     |

> Not yet run. Populate via the repo `benchmark-loop`; gate per `skill-optimizer/release-gates.md`.
