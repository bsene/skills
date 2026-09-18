# README templates

Copy the variant that matches the project, then fill in real details from Step 2 of
SKILL.md. Delete any bracketed placeholder and any section that doesn't apply — don't
ship brackets or unfilled TODOs in a final README.

## Table of contents

- [Library / package README](#library--package-readme)
- [CLI tool README](#cli-tool-readme)
- [GitHub profile README](#github-profile-readme)
- [standard-readme required sections](#standard-readme-required-sections)
- [makeareadme.com minimal template](#makereadmecom-minimal-template)
- [makeareadme.com section checklist](#makereadmecom-section-checklist)

---

## Library / package README

Modeled on othneildrew/Best-README-Template, trimmed to what most libraries actually need.

```markdown
# [Project Name]

[![Build Status](https://img.shields.io/...)](...)
[![npm version](https://img.shields.io/npm/v/[package].svg)](https://www.npmjs.com/package/[package])
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[One-sentence description of what this library does and for whom.]

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Installation

\`\`\`bash
npm install [package-name]
\`\`\`

## Usage

\`\`\`js
import { thing } from "[package-name]";

// the smallest real example that actually runs
\`\`\`

## API

### `functionName(args)`

[What it does, parameters, return value.]

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.
[Or, if there's no separate file: a short paragraph on branch naming / PR process / how
to run tests locally.]

## License

Distributed under the [MIT License](LICENSE).
```

---

## CLI tool README

```markdown
# [tool-name]

[![Build Status](...)] [![Version](...)] [![License](...)]

[One sentence: what the tool does, run from the command line.]

## Installation

\`\`\`bash
brew install [tool-name]
# or
npm install -g [tool-name]
\`\`\`

## Usage

\`\`\`bash
[tool-name] [command] [--flag value]
\`\`\`

[A short table or list of the most-used commands/flags — not an exhaustive dump; link
to `--help` output or a docs site for the full reference.]

Example:

\`\`\`bash
$ [tool-name] init my-project
✓ Created my-project/
\`\`\`

## Configuration

[Env vars / config file format, if any.]

## License

[MIT](LICENSE)
```

---

## GitHub profile README

The special repo named exactly after the username (`github.com/username/username`).
This is a different genre — short, personal, no install/usage sections at all.

```markdown
### Hi, I'm [Name] 👋

[One or two lines: what you work on / are interested in. Optional and only if true —
don't invent stats or interests.]

- 🔭 Currently working on [project]
- 🌱 Learning [thing]
- 📫 Reach me at [contact]

[Optional: a GitHub-stats badge, e.g. from github-readme-stats — only include if it
renders correctly and the username is real; a broken stats image looks worse than none.]
```

Keep it short. The most common mistake here is importing the full library-README
skeleton (badges, TOC, "Installation") onto a profile page where none of it applies.

---

## standard-readme required sections

From richardlitt/standard-readme — useful when the user wants strict, org-wide
consistency rather than visual polish. Required sections, in this order, with these
exact titles:

1. **Title** — matches the repo/package name (optionally with a tagline in italics).
2. **Banner** — optional.
3. **Badges** — optional.
4. **Short Description** — one or two sentences.
5. **Long Description** — optional, more context/motivation.
6. **Table of Contents** — required once the README is long enough to need one.
7. **Security** — optional, for anything with meaningful security implications.
8. **Background** — optional, motivation/history/design decisions.
9. **Install** — required. Full instructions, including prerequisites.
10. **Usage** — required. Real examples; note "Examples" as a subsection if there are many.
11. **API** — optional, if the project exposes one.
12. **Maintainers** — optional, list of current maintainers.
13. **Contributing** — required. Notes on how to contribute + link to a `CODE_OF_CONDUCT.md` if one exists.
14. **License** — required. Say which license, and link to the `LICENSE` file. Copyright notice format: `[year] [fullname]`.

standard-readme's own rule of thumb: sections must appear in this order, but optional
sections may be omitted entirely — never left as empty headers.

---

## makeareadme.com minimal template

The simplest reasonable starting point — good for a small or early-stage project
where Best-README-Template would be overkill. This is makeareadme.com's own example,
kept intact as a reference for tone and minimum viable content (a real one-line
description, a real install command, runnable usage examples with expected output
shown as a comment, one paragraph on contributing, and a license link):

```markdown
# Foobar

Foobar is a Python library for dealing with word pluralization.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

\`\`\`bash
pip install foobar
\`\`\`

## Usage

\`\`\`python
import foobar

# returns 'words'
foobar.pluralize('word')

# returns 'geese'
foobar.pluralize('goose')

# returns 'phenomenon'
foobar.singularize('phenomena')
\`\`\`

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
```

---

## makeareadme.com section checklist

Not every project needs every section — pick what applies rather than including all of
these as boilerplate. Two sections here (**Support**, **Project status**) are worth
borrowing even when the base template is Best-README-Template or standard-readme,
since they're commonly missing from both:

- **Name** — a self-explaining project name.
- **Description** — what the project does, for whom, with context/links for anything
  a newcomer wouldn't recognize. Features, Background, or a comparison to alternatives
  can live here.
- **Badges** — small status images (shields.io); only if they carry real metadata.
- **Visuals** — screenshots, a GIF, or an asciinema recording, when the project has a
  visual or interactive surface worth showing rather than just describing.
- **Installation** — the ecosystem's normal method, but written for a reader who might
  be a novice: explicit steps, not just "use the package manager." Add a
  **Requirements** subsection if there are OS/language-version/dependency constraints.
- **Usage** — examples liberally, with expected output shown where practical. Keep the
  simplest example inline; link out to more elaborate ones instead of inlining them.
- **Support** — where to go for help: issue tracker, chat room, email. Easy to forget,
  genuinely useful when it's missing.
- **Roadmap** — planned future direction, if there is one worth stating.
- **Contributing** — state whether you're open to contributions and what's required.
  Concrete steps for a would-be contributor (setup script, env vars, how to run
  lint/tests) are more useful than "PRs welcome" alone, and also help future-you.
- **Authors and acknowledgment** — credit contributors.
- **License** — state the license; link to the `LICENSE` file. [choosealicense.com](https://choosealicense.com/)
  helps pick one if none exists yet.
- **Project status** — if development has slowed or stopped, say so explicitly at the
  top of the README, and mention if you'd welcome someone forking or stepping in as
  maintainer. This is the section most templates omit and most abandoned repos need.

makeareadme.com's own framing on length: a README that runs long is still better than
one that's too short — if it feels bloated, move detail into a wiki or docs site
(MkDocs, Docusaurus, Read the Docs, etc.) rather than cutting it outright.
