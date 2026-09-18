# Jessitron (Jessica Kerr) Communication Style

Voice preset for coaching an artifact **in the style of Jessica Kerr ("Jessitron")** — reflective,
systems-thinking essays/keynotes on software, teams, and AI, borrowing frameworks from philosophy and
sociology. Source of truth: ["Who are we Now?"](https://jessitron.com/2026/08/30/who-are-we-now/)
(RubyConf 2026 keynote). Use when the user asks to "write this like Jessitron", wants a reflective
piece on how AI changes engineering identity/practice, or is explaining a values-based case for a team
change (testing, observability, learning systems) rather than a transactional ask.

**When it applies:** thought-leadership blog posts, conference-keynote-style writing, articulating why
a practice (tests, observability, pairing) matters in human terms rather than pure efficiency terms,
explaining a shift in how a team works with AI agents. **When it does NOT:** anything that needs a fast,
single verdict — an exec update, a Slack ask, an incident report. This style is exploratory and takes
its time to land; used where a quick decision is needed, it reads as unfocused. Fall back to the
standard rubric (see [../frameworks.md](../frameworks.md)) or, for a blunt ask, [dhh.md](dhh.md).

---

## The 6 moves

| #   | Move                              | Rule                                                                                                                                    | Signature move                                                                                                  |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | **Name a lens, then use it**       | Borrow or coin a named concept and turn it into reusable vocabulary for the rest of the piece, instead of describing the idea freshly each time. | Terms like "Verum Factum," "symmathesy," and "Vexationes Artium" — each introduced once, then reused as shorthand. |
| 2   | **Ground it in first person first** | Open the abstract idea with a concrete "when I..." before generalizing to "we" or "teams."                                              | "When I write a program... I understand it in a way that's deeper than other tools."                              |
| 3   | **Hold the tension, don't resolve it fast** | State two true, pulling-in-different-directions feelings side by side before landing anywhere. Don't force premature resolution.        | Naming that AI can be both useful and unsettling, and sitting with both rather than picking one right away.        |
| 4   | **Reframe the question**           | When stuck between two bad framings of a debate, replace the question itself rather than picking a side.                                | Trading "is AI bad for us?" for "how do we respond?" — the second is actionable, the first isn't.                  |
| 5   | **Concretize immediately after naming** | The moment an abstract concept is introduced, follow with a short concrete list of what it looks like in practice.                       | Naming "Vexationes" (objective verification), then listing it out: unit tests, property tests, observability, style checks. |
| 6   | **Close on agency, not verdict**    | End on what "we" get to do next — participation and responsibility — rather than a fixed prediction or a closed conclusion.               | Ending on "we are not helpless" / choosing how to respond, instead of declaring how things will turn out.          |

---

## How it maps to the base skill

| Base technique    | Jessitron mode                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Pyramid Principle  | **Dropped by default** — conclusion is earned at the end, not stated first; this style is built to be read start to finish, not skimmed.     |
| Cognitive load     | **Different, not lower** — sentences stay short, but new vocabulary is introduced deliberately; each term is worth the load because it's reused. |
| Ethos               | **Kept, personal** — credibility from direct first-person experience ("when I write a program"), not title or results.                        |
| Logos               | **Present but soft-pedaled** — arguments are offered as a way of seeing, not a proof; the reader is persuaded by recognition, not syllogism.   |
| Pathos               | **Central** — the whole piece runs on emotional honesty about ambivalence, curiosity, and identity, not a single anecdote used as a device.     |
| Make it safe        | **Kept, reframed** — the tension-holding move (3) is itself a safety move: no one has to fully agree before engaging with the idea.            |
| Pattern interrupt   | **Kept** — reframing the question (move 4) is the interrupt; it resets what the reader thought they were debating.                             |
| Reframing           | **Kept, central** — this is close to the whole method: don't answer the trap question, replace it.                                             |

---

## Coaching checklist (Jessitron mode)

1. Find the abstract claim the artifact is making and check whether it opens with a concrete first-person
   moment before generalizing. If it opens with the generalization, move the concrete moment first.
2. If the piece is naming a new practice or shift, coin or borrow one memorable term for it and reuse
   that exact term throughout, instead of re-describing the idea each time in different words.
3. Look for a forced, too-early resolution of a genuine tension (e.g., "AI is simply good" / "simply
   bad"). If the artifact's own evidence pulls both ways, let it say so before landing anywhere.
4. If the piece is stuck answering a binary question ("should we or shouldn't we"), try replacing the
   question itself with a more actionable one, and answer that instead.
5. After any abstract or newly-named concept, add a short concrete list of what it looks like in
   practice — don't leave a named idea unillustrated.
6. Check the ending: does it close on what the reader/team gets to do or choose, or does it close on a
   flat prediction? Favor agency over forecast.

**Known failure mode to avoid:** borrowing a framework as decoration rather than a working lens — if the
named concept (a "Verum Factum," a "symmathesy") isn't actually reused to do argumentative work later in
the piece, cut it; a name introduced and then abandoned reads as name-dropping. Also avoid manufacturing
tension that isn't real — move 3 only works when the two pulls are both genuinely felt, not staged for effect.

---

## Worked example (same artifact as SKILL.md)

**Before:** _"Hi — so I've been thinking a lot and I really feel like I personally need more budget.
I've done a ton of work this quarter and I'd love to be able to do more, there are loads of things
I want to try and I think it could be good. Can we talk?"_

**Standard rewrite (base skill):** Pyramid + softening + shared win — see SKILL.md.

**Jessitron-style rewrite:** _"When I ship something I built myself, I know exactly how it'll behave —
I can feel where it's solid and where it's held together with tape. That confidence doesn't scale past
what I personally touch. Our team is bigger than what any one of us can hold that way now, and that's
not a problem to solve, it's just where we are — the question isn't 'how do we get that feeling back,'
it's 'how do we build the kind of shared understanding that doesn't depend on one person's memory.' I
want to put budget toward that: better tests, better observability, more time pairing so the knowledge
lives in more than one head. Not because we're behind — because the system got bigger than any one of
us, and that's worth investing in on purpose."_

Concrete first-person moment first, a named lens (individual understanding vs. shared understanding)
used to reframe the ask, concretized into specific practices, closed on what the team gets to build —
not a flat "give me budget" verdict.

---

## Sources

- ["Who are we Now?"](https://jessitron.com/2026/08/30/who-are-we-now/) — Jessica Kerr, RubyConf 2026
  keynote (Aug 2026) — primary source for this preset. Builds the essay around borrowed philosophical
  terms (Vico's "Verum Factum," the idea of software-plus-team as a "symmathesy," Bacon's
  "Vexationes Artium" for experimental verification, and the sociological Gemeinschaft/Gesellschaft
  distinction), using each as a reusable lens rather than a one-off reference. Explicitly holds
  contradictory reactions to AI side by side rather than resolving them, and repeatedly trades a
  yes/no framing ("is AI bad for us?") for an action-oriented one ("how do we respond?"), closing on
  the idea that people remain the accountable, participating part of the system even as agents take on
  more of the coding itself.
