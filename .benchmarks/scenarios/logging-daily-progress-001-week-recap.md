---
id: logging-daily-progress-001-week-recap
skill: logging-daily-progress
---

# Prompt

Recap this week from git and format it as entries for my progress log (progress-daily.md). Here's the raw history:

```
$ git log --date=short --pretty=format:'%h|%ad|%an|%s' --since=2026-08-24 --author=birra
a1b2c3d|2026-08-24|birra|fix(auth): correct token expiry check in session middleware
e4f5a6b|2026-08-25|birra|feat(api): add cursor pagination to /orders endpoint
c7d8e9f|2026-08-25|birra|chore: update golangci config, add new lint rules
b0a1c2d|2026-08-26|birra|chore(ci): gitignore pattern for scripts/smoke was incorrect
d3e4f5a|2026-08-26|birra|refactor(db): extract connection pool setup into helper
f6a7b8c|2026-08-28|birra|feat(notify): ship order-confirmation email via SendGrid adapter
```

(2026-08-27 was a holiday — no commits.) Give me the entries ready to append to the log.

# Criteria

- [ ] Produces one `## YYYY-MM-DD` entry per day that has commits (2026-08-24, 08-25, 08-26, 08-28) with no entry for the zero-commit holiday (2026-08-27), ordered oldest to newest
- [ ] Every entry has exactly the three sections `### Impact`, `### Learnings`, `### Commits` in that order, with `---` separating entries
- [ ] Impact bullets lead with a verb and name a concrete artifact/outcome (e.g. "Fixed token expiry check in session middleware"), not an activity ("worked on auth")
- [ ] Learnings bullets follow the "X, because Y" shape — the specific lesson plus why it matters
- [ ] Commits bullets use the `<short-sha> <branch-or-scope>: <subject>` form with the actual shas and subjects from the log
- [ ] Does NOT invent user-facing impact for the chore/refactor-only day (2026-08-26) — labels it honestly as tooling/CI investment rather than dressing it up
