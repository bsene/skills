# Links & Images

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
