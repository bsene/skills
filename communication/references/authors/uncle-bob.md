# Software Craftsman Communication Style

Voice preset for coaching an artifact **in the style of the software craftsmanship movement**
(Robert C. Martin / "Uncle Bob" and the wider Manifesto for Software Craftsmanship). Source of truth:
["What Software Craftsmanship is about"](https://blog.cleancoder.com/uncle-bob/2011/01/17/software-craftsmanship-is-about.html).
Use when the user asks to "write this like a craftsman", "push back on cutting corners", or needs to
defend a quality/testing/discipline standard against schedule pressure.

**When it applies:** pushing back on "just ship it" pressure, justifying time spent on tests/design/
practice to a manager or team, code-review feedback, articulating why "clean up later" doesn't work.
**When it does NOT:** external customer-facing copy, sales/marketing writing, or any audience where
"craft" framing reads as gatekeeping or gives off superiority rather than professionalism — fall back
to the standard rubric (see [frameworks.md](../frameworks.md)).

---

## The 8 moves

| #   | Move                                   | Rule                                                                                                                                          | Craftsman signature move                                                                                    |
| --- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | **Collapse the speed/quality trade-off** | Refuse "fast vs. good" as a real choice. Reframe: skipping discipline produces a slower result, just with the pain deferred.                    | Going fast **means** going well — the shortcut is the slow path with a delay on it.                          |
| 2   | **Own it as a personal standard**       | State the practice as a commitment you hold yourself to, not a process imposed by a manifesto or a manager. First person, no external authority. | A stated personal promise ("I will not rush, I will write tests") — not a policy citation.                   |
| 3   | **No blame, no excuse**                 | Deadline pressure, a demanding PM, "legacy code" — none of these excuse the drop in standard. State the standard as held regardless of pressure. | Reject the old excuse that dirty code was ever required to hit a schedule.                                    |
| 4   | **Must, not should**                    | Core discipline (tests, review, design time) is framed as non-negotiable practice, not a nice-to-have preference open to debate.                 | Testing what can be tested, and writing the test first, stated as settled — not proposed for discussion.      |
| 5   | **Practice is the argument**            | Justify time spent on deliberate practice (katas, pairing, review) the way any profession justifies rehearsal — not as indulgence.               | Musicians rehearse off-stage; the analogy licenses spending time on practice before it's "needed."            |
| 6   | **Humility, not superiority**           | The standard is a private promise to yourself, not a badge that ranks you above people who cut corners. No tribalism, no in-group signaling.     | The standard is worn quietly — a personal commitment, not a claim of belonging to a superior group.           |
| 7   | **Criticize the code, respect the person** | When reviewing someone's work, ruthlessness targets the artifact; courtesy targets the human who shared it — sharing code at all took courage.    | Own that you've written equally bad code yourself before calling anything "stupid."                           |
| 8   | **Partner, don't dominate**             | Technical concerns and business/customer concerns are both legitimate; neither side gets to tell the other to go quiet to avoid "widening a gap." | Craftsmanship is framed as a partnership with the customer, not a retreat into pure technical focus.          |

---

## How it maps to the base skill

| Base technique    | Craftsman mode                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Pyramid Principle  | **Kept** — state the standard/ask first, then the reasoning; no build-up.                                                                    |
| Cognitive load     | **Kept** — plain declarative sentences ("we will…", "we will not…"), no jargon.                                                               |
| Ethos               | **Kept, reframed** — credibility comes from holding the standard yourself, not from title or tenure.                                          |
| Logos               | **Kept, amplified** — the core argument (deferred pain > upfront discipline) is a logical claim, not a values statement; make it explicit.    |
| Pathos              | **Reduced, redirected** — stakes are framed as customer/employer impact ("we honor the team, we delight the customer"), not personal feeling. |
| Make it safe        | **Dropped by default** — the standard isn't offered as negotiable or reversible; softening it undercuts the whole move.                       |
| Pattern interrupt   | **Kept** — a flat refusal of the "quick and dirty" framing is itself the interrupt.                                                            |
| Reframing           | **Kept** — answers "we don't have time to do it right" with "we don't have time not to."                                                      |

---

## Coaching checklist (craftsman mode)

1. Remove any line that treats quality and speed as opposing forces — collapse the trade-off explicitly.
2. Strip appeals to authority ("best practice says", "the manifesto says") — replace with a first-person
   standard the writer is stating for themself.
3. Cut any excuse-shaped clause ("given the deadline...", "since this is legacy..."). State the standard
   as holding regardless.
4. Convert hedged asks ("it'd be great if we could maybe...") into a stated practice ("we test everything
   that can be tested").
5. If time/practice is being justified, use the professional-rehearsal argument rather than "we'll get to
   it eventually."
6. Check for superiority tone — a green-wristband line reads as a private promise, not a claim of being
   better than the reader. Rewrite any line that could land as gatekeeping.
7. If the artifact is code-review or critique feedback, separate the two targets explicitly: the code
   gets the ruthless line, the person who shared it gets the courteous one. Add a line acknowledging
   the difficulty of sharing work, if the tone risks reading as harsh.
8. If the artifact pits "technical concerns" against "the business/customer," reframe it as partnership —
   both sides' concerns are legitimate and neither should be asked to go quiet.

**Known failure mode to avoid:** moralizing. The standard is a commitment to a way of working, not a
verdict on someone's character or worth as an engineer — attack the practice being proposed (or skipped),
never the person. Also avoid unearned nostalgia ("we used to build things properly") — the argument is
the trade-off, not a lament. And when critiquing someone else's work specifically: the critique is only
credible paired with an acknowledgment that the critic has made the same mistakes before.

---

## Worked example (same artifact as SKILL.md)

**Before:** _"Hi — so I've been thinking a lot and I really feel like I personally need more budget.
I've done a ton of work this quarter and I'd love to be able to do more, there are loads of things
I want to try and I think it could be good. Can we talk?"_

**Standard rewrite (base skill):** Pyramid + softening + shared win — see SKILL.md.

**Craftsman rewrite:** _"I want to change how we build this quarter: tests written first, on
everything we can test, no exceptions for deadline pressure. Skipping that doesn't save time — it
moves the cost to next quarter's bug list, at a markup. This isn't a process I'm asking permission
for; it's the standard I hold my own work to, and I'm asking the team to hold the same one. Happy to
pair with anyone on the first few tickets."_

Standard stated first, trade-off collapsed explicitly, no external excuse accepted, ask is concrete —
and it targets the practice, not anyone's competence.

---

## Sources

- [blog.cleancoder.com — "What Software Craftsmanship is about"](https://blog.cleancoder.com/uncle-bob/2011/01/17/software-craftsmanship-is-about.html)
  (Robert C. Martin, 2011) — primary source for this preset. Core argument: the craftsmanship
  movement exists because practitioners are tired of shipping bad software, and it rejects the old
  trade-off between "quick" and "dirty" — arguing that going well is how you actually go fast. It
  also draws the analogy to other professions (musicians, athletes, lawyers) that rehearse
  deliberately outside of performance, and frames the craft standard as a private promise to oneself
  rather than a badge of superiority over others.
- [blog.cleancoder.com — "The Humble Craftsman"](https://blog.cleancoder.com/uncle-bob/2013/02/01/The-Humble-Craftsman.html)
  (2013) — source for move 7. Argues that sharing one's code for critique takes real courage and
  deserves respect, that no code is above criticism, but that the criticism should be aimed at the
  code and not the person — and that a reviewer only earns the right to call something "stupid" by
  having written equally bad code themselves in the past.
- [blog.cleancoder.com — "Bringing Balance to the Force"](https://blog.cleancoder.com/uncle-bob/2011/01/19/individuals-and-interactions.html)
  (2011) — source for move 8. A reply to critics who worried the craftsmanship movement talks too
  much about technical practice at the customer's expense; argues that both the technical and the
  business/customer conversation are equally hard and equally necessary, that neither side should be
  told to go quiet to avoid "widening the gap" between them, and that the goal is partnership, not
  one side dominating the other.
- [blog.cleancoder.com — "Pairing Guidelines"](https://blog.cleancoder.com/uncle-bob/2021/01/17/Pairing.html)
  (2021) — supporting context for move 5. Frames pairing/mobbing as most valuable for the large
  middle ground of non-trivial-but-not-deep work, and stresses that it should stay voluntary and
  informal rather than mandated or tracked by a manager — useful when the coached artifact is
  proposing a collaboration practice rather than a solo standard.
