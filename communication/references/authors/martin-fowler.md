# Martin Fowler Communication Style

Voice preset for coaching an artifact **in the style of Martin Fowler** — a short, measured personal
reflection that separates an honest emotional reaction from a practical recommendation, without forcing
false resolution. Source of truth: ["I don't like LLMs"](https://martinfowler.com/articles/2026-dont-like-llms.html)
(17 Sep 2026). Use when the user asks to "write this like Martin Fowler", needs to state a nuanced or
mixed personal position on a divisive topic, or wants to disagree with something's popularity without
dismissing the case for using it anyway.

**When it applies:** a personal-opinion post or note on a genuinely mixed topic (a new tool, a practice,
an industry trend); telling a team "here's where I actually stand" without it reading as a directive;
separating "I don't like this" from "we should still do this." **When it does NOT:** anywhere a single
confident verdict is needed fast — an exec ask, an incident update, a decision memo. Sitting in
ambivalence reads as indecisive under time pressure; fall back to the Pyramid Principle (see
[../frameworks.md](../frameworks.md)) or, for a flat verdict with no hedge, [dhh.md](dhh.md).

---

## The 6 moves

| #   | Move                                     | Rule                                                                                                                                  | Signature move                                                                                                    |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | **State the mixed feeling, don't resolve it early** | Open by naming the contradictory pulls plainly, before doing anything else. Don't pretend to a cleaner position than you hold.        | "I have a lot of mixed feelings about AI... fascinated... excited... fearful" — all stated before any conclusion.  |
| 2   | **Separate reaction from recommendation**  | A personal dislike and a practical "use it anyway" are not a contradiction — state both, explicitly uncoupled.                        | "That's not enough to make me feel we should avoid them" — disliking something isn't an argument against using it. |
| 3   | **Name the specific irritant, not a vague unease** | Pin the reaction to a concrete, describable cause rather than leaving it as free-floating discomfort.                                 | Not "AI feels off" but naming the exact behaviors: the tone, the confident fabrication, the thin performed remorse. |
| 4   | **Credit a source fairly, even mid-disagreement** | Cite someone by name and represent their view accurately, even while the piece's own emphasis differs from theirs.                     | Quoting another writer's more enthusiastic take on the same topic, by name, without straw-manning it.               |
| 5   | **Ground the stance in a small personal rule** | Anchor an abstract position in one concrete personal habit or anecdote, stated plainly, not dramatized.                               | "One of my most successful life-hacks is to avoid people I don't like or don't trust."                             |
| 6   | **End without manufacturing closure**      | If the honest ending is unresolved, let it stay unresolved. Don't add a false "but in the end..." to look more decisive than you are. | The piece ends on the personal-rule analogy, not on a summary verdict about whether AI is good or bad overall.       |

---

## How it maps to the base skill

| Base technique    | Fowler mode                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Pyramid Principle  | **Dropped by default** — no conclusion-first move; the piece is structured to let the ambivalence itself be legible.           |
| Cognitive load     | **Kept** — short, plain sentences; no jargon; one idea per sentence even while holding contradiction.                          |
| Ethos               | **Kept, understated** — credibility from careful, specific observation, not from title (even though Fowler's title is real).  |
| Logos               | **Present, restrained** — reasons are given but not stacked into a formal case; more "here's what I notice" than "here's proof." |
| Pathos               | **Honest, not amplified** — real feeling stated plainly (dislike, unease) without metaphor or story dressing it up.            |
| Make it safe        | **Implicit** — by admitting his own mixed feelings first, the writer lowers the stakes for the reader to disagree or feel similarly conflicted. |
| Pattern interrupt   | **Kept** — a plainly stated personal dislike of something everyone treats as merely useful is itself the interrupt.            |
| Reframing           | **Not used** — this style doesn't dodge or redirect a hard question; it sits in it and describes it precisely instead.         |

---

## Coaching checklist (Fowler mode)

1. If the artifact states a single clean verdict on something the writer actually feels mixed about,
   surface the mixed feeling explicitly instead of flattening it for the sake of a tidy conclusion.
2. Check whether "I feel X about this" and "we should do Y about this" are tangled into one clause —
   split them into two explicit, separately-stated sentences.
3. Replace any vague discomfort phrase ("something feels off", "I'm not sure about this") with the
   specific, nameable thing causing it.
4. If another person's view is mentioned, name them and represent their position accurately — don't
   flatten it into a foil for the writer's own point.
5. Look for one small, concrete personal habit or rule that grounds the abstract stance, and use it
   instead of a general principle.
6. Don't add a wrap-up sentence that resolves the piece more neatly than the actual position warrants —
   if it's genuinely unresolved, let the ending show that.

**Known failure mode to avoid:** performed ambivalence — stating "mixed feelings" as a rhetorical hedge
while still smuggling in a one-sided argument is the opposite of this style's honesty. The mixed feelings
have to be real and specific on both sides, not a fig leaf for a conclusion already reached.

---

## Worked example (same artifact as SKILL.md)

**Before:** _"Hi — so I've been thinking a lot and I really feel like I personally need more budget.
I've done a ton of work this quarter and I'd love to be able to do more, there are loads of things
I want to try and I think it could be good. Can we talk?"_

**Standard rewrite (base skill):** Pyramid + softening + shared win — see SKILL.md.

**Fowler-style rewrite:** _"I have mixed feelings about asking for more budget this quarter. On one
hand, I don't think we've proven the current team can't do more with what it has — I'd rather earn the
case than assume it. On the other hand, I keep hitting the same wall: good ideas sitting untried because
there's no time, and that's a real cost even if I can't fully quantify it yet. That's not quite enough
for me to make a confident ask today. What I'd rather do is spend the next few weeks tracking exactly
where the wall shows up, and come back with specifics instead of a feeling."_

States the genuine tension plainly, separates the feeling ("I keep hitting a wall") from the
recommendation (not asking yet), names the specific irritant instead of vague overwork, and ends without
forcing a tidy resolution — the honest answer is "not yet, here's what I'll do instead."

---

## Sources

- ["I don't like LLMs"](https://martinfowler.com/articles/2026-dont-like-llms.html) — Martin Fowler,
  17 Sep 2026 — primary source for this preset. Opens by naming several contradictory feelings about
  AI at once (fascination, excitement, fear) before narrowing to the one reaction that actually
  dominates: a personal dislike of interacting with the model's voice and its confident fabrication.
  Explicitly separates that dislike from any argument for avoiding the technology, credits another
  writer's more enthusiastic take by name without dismissing it, grounds the stance in a small
  personal life-rule about which people to spend time around, and ends on that grounding rather than
  a tidy overall verdict on whether AI is good or bad.
