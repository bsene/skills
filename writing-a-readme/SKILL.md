---
name: writing-a-readme
description: Write or overhaul a project's README.md, drawing on patterns from the most-starred GitHub readme-template repos and guides (othneildrew/Best-README-Template, the standard-readme spec, makeareadme.com, awesome-readme). Use this whenever the user asks to write, create, improve, restructure, or "make my README look better/more professional", asks for a README for a library/CLI/API/app, asks about badges/shields, a table of contents, "getting started" or "installation" sections, a Support or Project Status section, or wants their GitHub profile README (the special username/username repo) polished. Covers picking the right template variant (library, CLI tool, application, monorepo, or profile README), section ordering, badge selection, and common mistakes that make READMEs look templated or get skipped by readers.
---

# Writing a README

## First response

When this skill is invoked, first ask: "What is the project about, in one sentence?"

## Why this matters

A README is read by people deciding, in under a minute, whether to keep reading. The
GitHub ecosystem has converged on a fairly consistent structure across thousands of
template repos precisely because it works: it front-loads "what is this and why should
I care" before "how do I configure the advanced options." Departing from that order —
even with great content — makes a README harder to skim and more likely to get closed.

Three lineages dominate the template landscape, and it's worth knowing all three
because they optimize for different things:

- **othneildrew/Best-README-Template** and its many forks — badge-and-logo-heavy,
  built for visual polish and for projects that want contributors and stars. Popular
  for personal projects, portfolios, and open-source libraries aimed at a broad audience.
- **richardlitt/standard-readme** — a strict spec (section names, order, required vs.
  optional) built for consistency across many repos in an org or ecosystem, historically
  common in the Node/npm world. Less flashy, more predictable.
- **makeareadme.com** — a lighter-weight, explanatory guide rather than a rigid
  template: a minimal starting skeleton plus a checklist of optional sections with the
  reasoning for each, aimed at getting *any* programming project (not just npm
  packages) to a reasonable baseline quickly. It's the source for two sections the
  other two lineages tend to skip — **Support** (where to get help: issue tracker,
  chat, email) and **Project status** (a note at the top if the project is
  slowed-down/archived/looking for maintainers) — both worth adding when relevant even
  if using one of the other two as the base template.

Pick the lineage that fits the ask (or blend them — badges from Best-README-Template,
discipline about section order from standard-readme, the Support/Project-status habit
from makeareadme.com) rather than reflexively using one template for everything. See
`references/templates.md` for full worked templates of each variant.

## Step 1: Figure out which kind of README this is

Ask yourself (or the user, briefly) which of these the project actually is — it changes
which sections matter:

- **Library / package** (npm, pip, gem, crate...) — installation via a package manager,
  a runnable code example, and an API reference are the core. Badges for version,
  downloads, and build status carry real information here.
- **CLI tool** — installation, then a *usage* block showing actual commands and flags,
  often with a `--help` dump or a GIF/asciinema recording. Skip "API Reference."
- **Application / service** (web app, self-hosted tool) — screenshots or a demo link
  matter more than code snippets. "Getting Started" usually means "how do I deploy or
  run this," not "how do I import it."
- **GitHub profile README** (the repo named exactly after the username) — a completely
  different genre: short, personal, about the person not a codebase. Don't apply
  library-README structure to it.
- **Monorepo / org-level README** — mostly a map: what packages live here, links to
  each package's own README, and how the whole thing is built/tested together.

If it's ambiguous from context, a quick clarifying question ("is this a library people
will `npm install`, or an app people run/deploy?") is worth asking before drafting —
the sections genuinely differ enough that guessing wrong means a rewrite.

## Step 2: Gather the raw material

Don't invent facts about the project. Before drafting, look for (and ask the user for
whatever isn't discoverable):

- An existing `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` etc. for the
  real project name, description, license, and dependencies.
- The actual install command for the ecosystem (`npm install <name>`, `pip install
  <name>`, `cargo add <name>`...) — never guess a package name.
- One real, runnable usage example — pull it from tests, examples/, or ask the user
  for their canonical "hello world" use case. A README's credibility mostly rides on
  whether the first code block actually works if pasted in.
- License (check for a `LICENSE` file) and contribution norms (existing
  `CONTRIBUTING.md`?) rather than asserting "MIT" or "PRs welcome" by default.
- Whether there's a logo, screenshot, or demo GIF already in the repo to reuse — don't
  fabricate an `images/logo.png` reference to a file that doesn't exist.

If any of this is missing and un-discoverable, leave a clearly marked placeholder
(`<!-- TODO: add install instructions once published to npm -->`) rather than inventing
plausible-sounding specifics — a confidently wrong install command is worse than an
honest gap.

## Step 3: Structure

Regardless of variant, README sections have a strong conventional order because each
one answers the reader's next question. Use this as the default skeleton, dropping
sections that don't apply rather than leaving them as empty stubs:

```markdown
# Project Name

[badges: build status, version, license, ...]

One or two sentences: what this is and who it's for.

[optional: screenshot, GIF, or logo]

## Table of Contents
[only for READMEs long enough to need one — roughly 200+ lines / 5+ sections]

## About / Features
What it does and why it exists. What makes it different from the obvious alternative.

## Getting Started
### Prerequisites
### Installation

## Usage
The real, runnable example. This is the section people actually read.

## Configuration / API Reference
[if applicable — options, environment variables, exported functions]

## Support
[optional — where to get help: issue tracker, chat/Discord, email]

## Roadmap
[optional — link to Issues instead if the roadmap lives there]

## Contributing
[can be one paragraph + a link to CONTRIBUTING.md instead of inlining the whole process]

## Authors and Acknowledgment / Contact
[optional — trim if it's just a list of unrelated link dumps]

## License

## Project Status
[optional — only if development has slowed or stopped; say so explicitly and
mention if you're open to someone forking or stepping in as maintainer]
```

Notes on ordering, from both lineages:

- **Installation always precedes Usage**, and **Usage always precedes API/Config
  reference** — readers evaluate "can I use this" before "how do I customize it."
- **License goes near the end**, not the top — it matters, but it's not what decides
  whether someone keeps reading.
- **Project Status goes at the very end (or, if the project is stalled, as a callout
  near the top)** — makeareadme.com's convention. If a project is unmaintained, say so
  explicitly rather than letting people discover it after filing an issue that never
  gets a response.
- The Table of Contents is a `standard-readme` convention worth borrowing for anything
  long; skip it for short READMEs, where it's just clutter above the fold.
- makeareadme.com's rule of thumb is worth keeping in mind while trimming (Step 5
  below): a README that's too long is still better than one that's too short — if it
  feels bloated, the fix is usually to split content into a wiki/docs site, not to
  delete it outright.
- Don't include a section just because a template has it. A one-person weekend project
  doesn't need a Roadmap or a Code of Conduct link; an internal tool doesn't need
  contributor badges. An empty or boilerplate section reads as more templated, not
  more professional.

## Step 4: Badges (if using the badge-heavy style)

Badges (shields.io) work best when they carry real, current information — build status,
published version, license, downloads — not as decoration. Guidelines:

- Use https://shields.io/ or the ecosystem's native badge (npm, PyPI, crates.io all
  generate their own). Don't hand-roll SVGs.
- 3-5 badges is normal; a wall of a dozen badges reads as noise and often as templated
  filler copied verbatim from Best-README-Template without customizing.
- Never leave placeholder badges (`build-shield`, `contributors-shield` pointing
  nowhere) in a delivered README — either wire them to the real CI/package or cut them.
- Order: build/CI status, then package version, then license, then social (rarely more
  than one social badge, e.g. a Discord/LinkedIn link, if relevant at all).

## Step 5: Write, then trim

Draft the full README, then reread it as a skeptical stranger and cut:

- Marketing adjectives with no content behind them ("blazing fast", "production-ready")
  unless there's a benchmark or track record to back it up.
- Sections that just restate the section title in prose ("## Contributing \n We welcome
  contributions!" and nothing else — either write real guidance or link to
  CONTRIBUTING.md and move on).
- Comments copied from the template itself (Best-README-Template's HTML comments
  explaining how to use the template are meant to be deleted, not left in).
- Any reference-style link definitions, image paths, or badge URLs that don't actually
  resolve — a broken link in the first screen of a README undermines trust in the rest
  of it.

## Reference

`references/templates.md` has full worked-out templates for: a library README, a CLI
tool README, and a GitHub profile README, plus the standard-readme required-section
list and makeareadme.com's minimal starting template and full section checklist. Read
it before drafting when the user wants something copy-pasteable rather than guidance,
or when working in one of those variants.
