---
id: markdown-001-wiki-limits
skill: markdown
---

# Prompt

I maintain a page on my team's GitHub wiki and three things don't work. What's wrong and how do I fix each?

1. The footnote at the bottom renders as literal `[^1]` text instead of a footnote.
2. I want our brand color to show as a little color swatch. Someone showed me it works in a GitHub issue with just `` `#4A90D9` `` in backticks, but on my wiki page it shows as plain text.
3. My table-of-contents link `[Setup](#setup-&-configuration)` doesn't jump anywhere. The heading it should target is `## Setup & Configuration`.

The page:

```markdown
# Billing Integration Guide

## Overview
FastCart sends invoice events to your webhook endpoint.

## Setup & Configuration
1. Create an API key
2. Configure your webhook endpoint[^1]

## Branding
Our brand blue is `#4A90D9`.

[^1]: Webhooks must respond within 5 seconds or the event is retried.
```

# Criteria

- [ ] Explains that footnotes are not supported in GitHub wikis and gives a workable alternative (inline note, or moving the content to a repo .md file)
- [ ] Explains that color swatches (backtick-wrapped `#hex` / `rgb()` / `hsl()`) render only in issues, PRs, and discussions — not in wiki pages or plain .md file views
- [ ] Provides the correct auto-generated anchor for the heading "Setup & Configuration" (i.e. `#setup--configuration` — lowercase, `&` stripped, spaces become hyphens)
- [ ] Explains the general anchor-generation rule (lowercase, spaces to hyphens, punctuation removed) rather than only handing over the one corrected link
- [ ] Does NOT propose a footnote syntax variant as the fix (recognizes it as a wiki platform limitation, not a syntax error, and does not claim footnotes are unsupported across all of GitHub)