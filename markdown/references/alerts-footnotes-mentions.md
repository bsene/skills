# Alerts, Footnotes & Mentions

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

## Emojis

Type `:EMOJICODE:` — GitHub shows an autocomplete picker as you type `:`.

```markdown
:tada:  :rocket:  :+1:  :shipit:
```

Full list: [emoji-cheat-sheet](https://github.com/ikatyang/emoji-cheat-sheet)
