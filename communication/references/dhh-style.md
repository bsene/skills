# DHH Communication Style

Voice preset for coaching an artifact **in the style of David Heinemeier Hansson** (Rails creator,
37signals CTO). Source of truth: [world.hey.com/dhh](https://world.hey.com/dhh). Use when the user
asks to "rewrite this in DHH style", "sound like DHH", or wants maximum directness over diplomacy.

**When it applies:** the artifact's audience values candor — OSS maintainers, senior engineers,
founders, internal teams with a writing-first culture. **When it does NOT:** de-escalation,
consensus-building, identity/political topics, or large diverse orgs — blunt style actively
backfires there; fall back to the standard rubric (see [frameworks.md](frameworks.md)).

---

## The 6 moves

| #   | Move                          | Rule                                                                                                                                                                                   | DHH signature example                                                                                                                                   |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **De-jargon**                 | Translate corporate-speak into what's actually happening. One sentence, subject-verb-object.                                                                                           | Snap's "operating environment headwinds, inflation-driven cost pressures" → _"We're selling fewer ads because of inflation and higher interest rates."_ |
| 2   | **Opinion first, no hedge**   | Lead with the stance as fact. No "I think maybe", no "it could be argued". Readers must know exactly where you stand.                                                                  | _"But Y"_ (Tesla post): verdict in the title, evidence after.                                                                                           |
| 3   | **First-person practitioner** | Write from what _you_ ran, shipped, measured. Not "studies show" — "we moved out of the cloud and the bill went from ~$3M to ~$1.3M". Ethos from doing, not titles.                    | _"I've been working on Basecamp for half my life."_                                                                                                     |
| 4   | **Self-contained writing**    | Treat every message as a document that must survive without you in the room: conclusion, reasons, decision ask — no follow-up meeting to clarify. Meetings are uncrystallized writing. | 37signals doctrine: if it needs a meeting, it needs a memo first.                                                                                       |
| 5   | **Substance over polish**     | First-draft energy is a feature. Short paragraphs. Occasional color is allowed ("the most fucking sci-fi thing I've ever seen") — but only where it carries the argument.              | HEY World posts: conversational, unpolished, precise.                                                                                                   |
| 6   | **Reps, not genius**          | Clarity in prose = clarity in code: Clarity, Cohesion, Consistency, Conciseness. Write → revise → tighten. A vague sentence means a vague idea — fix the idea, not the wording.        | _"Write, revise, write, revise. It's like doing reps in a gym."_                                                                                        |

---

## How it maps to the base skill

| Base technique    | DHH mode                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Pyramid Principle | **Kept, amplified** — he _is_ conclusion-first, but drops the "3 proofs" ceremony when one number settles it.                               |
| Cognitive load    | **Kept, amplified** — de-jargoning is his core move.                                                                                        |
| Ethos             | **Kept** — but from practice ("I shipped X") never credentials ("I'm the CTO of Y").                                                        |
| Pathos            | **Reduced** — stakes stated plainly ("Q3 slips") instead of stories/metaphors.                                                              |
| Make it safe      | **Dropped by default** — hedging reads as weakness to this audience. Re-add a reversibility line only if the ask is genuinely irreversible. |
| Pattern interrupt | **Kept** — a blunt one-liner _is_ the interrupt.                                                                                            |
| Reframing         | **Kept** — he answers trap questions with a sharper frame, never a dodge.                                                                   |

---

## Coaching checklist (DHH mode)

1. Kill every hedge: "I think", "maybe", "just wondering", "would it be possible". Stance as fact.
2. Replace every abstraction with the concrete event ("headwinds" → "we sell fewer ads").
3. Conclusion in the first sentence, or in the title.
4. Credibility from a shipped result, stated in one clause — no résumé.
5. Cut until a lazy reader gets it in one pass. If a sentence needs rereading, the _idea_ is unclear.
6. One strong close: the ask, or the stance restated. No "let me know what you think!" unless a decision is genuinely theirs.

**Known failure mode to avoid:** blunt ≠ personal. Attack the idea, never the person — DHH's main
criticism is going after people; keep the fire on the artifact. And skip hedging-addition entirely:
do not soften a DHH rewrite back into consensus-speak.

---

## Worked example (same artifact as SKILL.md)

**Before:** _"Hi — so I've been thinking a lot and I really feel like I personally need more budget.
I've done a ton of work this quarter and I'd love to be able to do more, there are loads of things
I want to try and I think it could be good. Can we talk?"_

**Standard rewrite (base skill):** Pyramid + softening + shared win — see SKILL.md.

**DHH rewrite:** _"We're behind on the roadmap because the team is two people short. I need budget
for two hires this quarter — if we don't get them, Q3 slips. The numbers are in the doc. My
recommendation: approve now, hire in October."_

Verdict first, cause named without hedging, stakes in one line, ask explicit. No "can we talk?" —
the writing IS the meeting.

---

## Sources

- [world.hey.com/dhh](https://world.hey.com/dhh) — primary corpus (2025–2026 posts).
- "Why do they talk like that" (2022) — the de-jargoning reference case.
- _Rework_, _It Doesn't Have to Be Crazy at Work_ — writing-first, opinionated-doctrine backdrop.
- Lex Fridman interviews — outspokenness framed as feature, not bug.
