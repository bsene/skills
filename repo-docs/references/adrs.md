# Architecture Decision Records and Decision Docs

Adapted from Addy Osmani's [`documentation-and-adrs`](https://github.com/addyosmani/agent-skills/blob/main/skills/documentation-and-adrs/SKILL.md) skill (MIT). Document decisions, not just code: code shows _what_ was built, an ADR records _why_ and what was rejected. Agents benefit most, because a written decision stops them from re-deciding it.

In Diátaxis terms an ADR is **explanation**: link to it from reference and how-to pages instead of repeating the reasoning ([diataxis.md](diataxis.md)).

## When to Write One

Write an ADR for any decision that would be expensive to reverse:

- a framework, major library or dependency
- a data model or schema
- an auth strategy
- an API style (REST vs GraphQL vs RPC)
- a build tool, hosting or infrastructure choice
- an architecture boundary (see `the-architect`)

Skip it for obvious code, throwaway prototypes and decisions that are cheap to undo.

## Match the Existing Convention First

Before writing, look for existing ADRs, project instructions and ADR tooling (an `.adr-dir` file, `adr-tools`, a MADR layout). **An established convention overrides the defaults below:**

- **Location and format:** `docs/adr/*.md`, `Documentation/Decisions/*.rst` and so on. Keep the directory, extension and markup.
- **Numbering:** continue the existing sequence and filename pattern (`0004-title.md`, `ADR-004-Title.rst`). Never restart at 001 or add a second scheme.
- **Headings:** reuse the project's section set.

If the evidence conflicts (two schemes, two directories), point out the conflict instead of quietly adding a third.

## Default Template

Use this only when no convention exists. Store ADRs as `docs/decisions/NNNN-kebab-title.md`.

```markdown
# ADR-0001: Use PostgreSQL for the primary database

## Status

Proposed | Accepted | Superseded by ADR-XXXX | Deprecated

## Date

YYYY-MM-DD

## Context

Forces and constraints: requirements, team capacity, deadlines, existing systems.

## Decision

The choice, stated in one or two sentences.

## Alternatives Considered

### <Option>

- Pros / Cons
- Rejected because …

## Consequences

What becomes easier, what becomes harder, new risks, and follow-up work.
```

## Lifecycle

`Proposed → Accepted → Superseded | Deprecated`

- **Never delete or rewrite an accepted ADR.** It is history.
- When a decision changes, write a new ADR that supersedes the old one, and update the old one's status line to point to it.

## Related Decision Docs

- **Inline gotchas:** when code must be used in a non-obvious way (call order, SSR timing, a known race), put a short doc comment at the definition and link the ADR (`See ADR-0003`). The general comment rules are in `clean-code` §4.
- **Public API docs:** typed doc comments (`@param`, `@returns`, `@throws`, `@example`) for library interfaces; an OpenAPI spec for HTTP APIs (see `rest-api-design` → API Documentation).
- **README:** quick start, commands table, a short architecture overview that links to the ADRs, and how to contribute ([readme.md](readme.md)).
- **Changelog:** one `## [x.y.z] - date` section per release, with `Added` / `Changed` / `Fixed` entries and issue or PR references ([Keep a Changelog](https://keepachangelog.com/)).
- **Agent rules:** keep AGENTS.md / CLAUDE.md current ([agents-md.md](agents-md.md)). ADRs answer the agent's "why is it like this?".

## Prose Review (Without Losing Facts)

When editing docs for clarity:

1. List what must survive the edit: names, numbers and units, commands, paths, links, conditions, trade-offs and stated uncertainty. Check each against the code. Flag anything you can't verify.
2. Cut stock intros, marketing adjectives and repeated summaries. Never replace a weak claim with an invented example or a stronger guarantee.
3. Diff against the original. Restore any lost caveat, re-run the commands shown, and name open questions instead of polishing them away.

## Rationalisations to Reject

| Excuse                                | Reality                                                        |
| ------------------------------------- | -------------------------------------------------------------- |
| "The code is self-documenting"        | Code shows what, not why, nor which alternatives were rejected |
| "We'll document when the API settles" | Writing the doc is the first test of the design                |
| "ADRs are overhead"                   | A 10-minute ADR saves re-arguing the decision six months later |
| "Comments go stale"                   | _What_ comments do; _why_ comments stay true                   |

## Checklist

- [ ] Every expensive-to-reverse decision has an ADR, in the project's existing format.
- [ ] Superseded ADRs point to their replacement; none were deleted.
- [ ] Non-obvious gotchas are documented at the definition, linking the ADR.
- [ ] The README covers quick start, commands and architecture, and links the ADRs.
- [ ] Prose edits kept every fact, qualifier and trade-off.
