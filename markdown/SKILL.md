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

## Syntax At A Glance

| Feature | Syntax |
|---|---|
| Heading | `# H1` … `###### H6` |
| Bold | `**text**` |
| Italic | `_text_` |
| Strikethrough | `~~text~~` |
| Link | `[text](url)` |
| Image | `![alt](url)` |
| Code inline | `` `code` `` |
| Code block | ` ``` lang ` … ` ``` ` |
| Blockquote | `> text` |
| Unordered list | `- item` |
| Ordered list | `1. item` |
| Task list | `- [ ] task` / `- [x] done` |
| Alert | `> [!NOTE]` / `[!TIP]` / `[!WARNING]` / `[!IMPORTANT]` / `[!CAUTION]` |
| Footnote | `text[^1]` … `[^1]: note` |
| Mention | `@user` / `@org/team` |
| Issue ref | `#42` |
| Emoji | `:tada:` |
| Escape | `\*literal\*` |
| Comment | `<!-- hidden -->` |

---

## Read On Demand

| Read When | File |
|---|---|
| One-line syntax lookup for any GFM feature | [Quick Reference](references/quick-ref.md) |
| Headings, text styling, code blocks, line breaks, escaping | [Text & Headings](references/text-and-headings.md) |
| Links (inline, section, relative, custom anchors), images | [Links & Images](references/links-and-images.md) |
| Ordered/unordered lists, nesting, task lists | [Lists & Tasks](references/lists-and-tasks.md) |
| Alerts, footnotes, mentions, emojis | [Alerts, Footnotes & Mentions](references/alerts-footnotes-mentions.md) |

---

## Common Pitfalls

- **Line breaks in `.md` files** require two trailing spaces, a `\`, or `<br/>` — a plain newline won't break the line.
- **Nested list indentation** must visually align the child marker under the first text character of the parent item.
- **Section anchor generation**: lowercase, spaces become `-`, all other punctuation stripped. Duplicate headings get `-1`, `-2` suffixes — update any links if you reorder headings.
- **Alerts cannot be nested** inside other elements and should be used sparingly.
- **Footnotes are not supported in GitHub wikis.**
- **Color swatches** (`` `#hex` ``, `` `rgb()` ``, `` `hsl()` ``) only render in issues, PRs, and discussions — not in plain `.md` file views.
- **Custom anchors** (`<a name="">`) are not included in the auto-generated table of contents.
