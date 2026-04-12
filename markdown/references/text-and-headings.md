# Text & Headings

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
