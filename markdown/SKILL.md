---
name: markdown
description: GitHub Flavored Markdown (GFM) reference — syntax, tables, alerts, footnotes, task lists, links, images, mentions, and common pitfalls.
triggers:
  - github flavored markdown
  - GFM
  - markdown table
  - markdown syntax
  - markdown heading
  - markdown link
  - markdown image
  - task list
  - markdown alert
  - callout markdown
  - footnote markdown
  - markdown line break
  - markdown emoji
  - escape markdown
  - markdown section anchor
---

# SKILL: GitHub Flavored Markdown (GFM)
> Based on the official [GitHub Basic Writing and Formatting Syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) reference.

GFM is a superset of standard Markdown with GitHub-specific extensions for issues, PRs, discussions, comments, and `.md` files.

---

## Headings

Use `#` symbols (1–6) to define heading levels. GitHub auto-generates a linked table of contents for files with 2+ headings.

```markdown
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

---

## Styling Text

| Style | Syntax | Example |
|---|---|---|
| Bold | `**text**` | `**bold**` |
| Italic | `_text_` | `_italic_` |
| Strikethrough | `~~text~~` | `~~struck~~` |
| Bold + italic | `***text***` | `***important***` |
| Subscript | `<sub></sub>` | `H<sub>2</sub>O` |
| Superscript | `<sup></sup>` | `x<sup>2</sup>` |

---

## Quoting Text

Use `>` to create a blockquote:

```markdown
> This is quoted text.
```

---

## Code

**Inline code** — wrap in single backticks:
```markdown
Use `git status` to check your working tree.
```

**Code blocks** — wrap in triple backticks, optionally with a language identifier for syntax highlighting:
````markdown
```python
def hello():
    print("Hello, world!")
```
````

**Supported color models** (issues/PRs/discussions only): Inline backtick values like `` `#0969DA` ``, `` `rgb(9, 105, 218)` ``, or `` `hsl(212, 92%, 45%)` `` render with a visual color swatch.

---

## Links

**Inline link:**
```markdown
[GitHub Pages](https://pages.github.com/)
```

**Link with title tooltip:**
```markdown
[GitHub Pages](https://pages.github.com/ "Build sites from repos")
```

**Section links** — link to any heading using its auto-generated anchor:
```markdown
[Jump to Lists](#lists)
```
Anchor rules: lowercase everything, replace spaces with hyphens, strip other punctuation, duplicate headings get `-1`/`-2` suffixes.

**Relative links** — preferred for files within a repo:
```markdown
[Contributing guide](docs/CONTRIBUTING.md)
[Image from same branch](/assets/logo.png)
```

**Custom anchors** — use HTML `<a>` tags to create link targets at non-heading locations:
```markdown
<a name="my-anchor"></a>

[Link to anchor](#my-anchor)
```

---

## Images

```markdown
![Alt text](https://example.com/image.png)
![Alt text](https://example.com/image.png "Optional title")
```

Use relative links for images stored in your repo:
```markdown
![Logo](/assets/images/logo.png)
```

The `<picture>` HTML element is also supported for responsive or theme-aware images.

---

## Lists

**Unordered** — use `-`, `*`, or `+`:
```markdown
- Item one
- Item two
- Item three
```

**Ordered:**
```markdown
1. First
2. Second
3. Third
```

**Nested lists** — indent child items so the marker aligns under the first character of the parent item's text:
```markdown
1. First item
   - Nested item
     - Deeply nested item
```

---

## Task Lists

Use `- [ ]` for incomplete and `- [x]` for complete tasks. Renders as interactive checkboxes in issues and PRs.

```markdown
- [x] Write tests
- [ ] Update documentation
- [ ] Deploy to production
```

Escape an opening parenthesis when an item starts with one:
```markdown
- [ ] \(Optional) Open a follow-up issue
```

---

## Alerts (Callouts)

A GFM extension for highlighting critical information with colored icons. Five types:

```markdown
> [!NOTE]
> Useful information that users should know, even when skimming.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

**Best practice:** use sparingly — one or two per document max. Never nest alerts inside other elements.

---

## Footnotes

```markdown
Here is a claim that needs a citation.[^1]

Multi-line footnote example.[^2]

[^1]: Source: Some Reference, 2024.
[^2]: First line of the footnote.  
      Second line (two trailing spaces create the break).
```

Footnotes always render at the bottom of the document regardless of where you place the definition. Not supported in wikis.

---

## Mentions & References

**Mention a person or team:**
```markdown
@username
@org/team-name
```

**Reference an issue or PR** by number:
```markdown
#42
```

Raw valid URLs auto-link. Repositories can also configure custom autolinks for external trackers (Jira, Zendesk, etc.).

---

## Paragraphs & Line Breaks

Leave a blank line between text blocks to start a new paragraph.

For a line break within a paragraph in `.md` files, use one of:
```markdown
Line one  
Line two          ← two trailing spaces

Line one\
Line two          ← backslash

Line one<br/>
Line two          ← HTML tag
```

In issues, PRs, and discussions, a plain newline renders as a line break automatically.

---

## Emojis

Type `:EMOJICODE:` — GitHub shows an autocomplete picker as you type `:`.

```markdown
:tada:  :rocket:  :+1:  :shipit:
```

Full list: [emoji-cheat-sheet](https://github.com/ikatyang/emoji-cheat-sheet)

---

## Hiding Content

Use HTML comments to include content that won't appear in the rendered output:

```markdown
<!-- This will not appear in the rendered Markdown -->
```

---

## Escaping Markdown

Prefix any Markdown character with `\` to render it literally:

```markdown
\*Not italic\*
\# Not a heading
\[Not a link\]
```

---

## Reference

**Quick syntax lookup:** See [GFM Quick Reference](references/quick-ref.md)

---

## Common Pitfalls

- **Line breaks in `.md` files** require two trailing spaces, a `\`, or `<br/>` — a plain newline won't break the line.
- **Nested list indentation** must visually align the child marker under the first text character of the parent item.
- **Section anchor generation**: lowercase, spaces become `-`, all other punctuation stripped. Duplicate headings get `-1`, `-2` suffixes — update any links if you reorder headings.
- **Alerts cannot be nested** inside other elements and should be used sparingly.
- **Footnotes are not supported in GitHub wikis.**
- **Color swatches** (`` `#hex` ``, `` `rgb()` ``, `` `hsl()` ``) only render in issues, PRs, and discussions — not in plain `.md` file views.
- **Custom anchors** (`<a name="">`) are not included in the auto-generated table of contents.

