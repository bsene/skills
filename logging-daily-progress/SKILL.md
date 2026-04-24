---
name: logging-daily-progress
description: Maintains a rolling daily progress log (progress-daily.md) that captures Impact, Learnings, and Commits for each day of engineering work, sourced from git history. Use whenever the user says "log today", "log my day", "any updates?", "what did I ship?", "update my progress log", "add today to the hype doc", or asks to recap recent work from git. Also trigger when the user mentions Impact/Learnings/Commits journaling, the Career Hype Doc practice, or wants daily wins recorded while context is fresh rather than reconstructed later from calendar archaeology. Works for any repo — the author identity and file path are configurable.
---

# Logging Daily Progress

This skill appends structured daily entries to a rolling progress log, sourced from the user's own git commits. It exists because fresh-context journaling beats retrospective calendar archaeology — the Career Hype Doc practice only works if entries get written while the work is still warm.

## What a good entry looks like

Every day is a third-level heading followed by three sections. Nothing else.

```
## YYYY-MM-DD

### Impact

- One bullet per outcome. Lead with the verb. Name the artifact or the number.

### Learnings

- One bullet per insight. The shape is "X, because Y" — the lesson plus why it matters.

### Commits

- `<short-sha>` <branch-or-scope>: <subject line>

---
```

Entries are separated by `---`. Newest is at the bottom so the file reads chronologically.

## Workflow

When invoked, work through these steps in order. Do not skip the confirmation step.

### 1. Locate the log file

Default path: `progress-daily.md` at repo root, or `ai/resources/progress-daily.md` if that exists (some repos keep career/AI artifacts under `ai/resources/`). If neither exists, ask the user where it should live before creating one.

### 2. Identify the author

Run `git config user.name` and `git config user.email` to get the current author. If the repo is shared with teammates, confirm this is the identity to track — some people commit under multiple names/emails across missions.

### 3. Collect commits for the target day(s)

Use the bundled helper:

```bash
bash scripts/collect_commits.sh <YYYY-MM-DD> [author-regex]
```

If no date is given, default to today. If the user asks for a range ("this week", "since Monday"), loop the script over each day — one entry per day, never one mega-entry for the range.

The script prints one line per commit in the form `<short-sha> <branch-or-scope>: <subject>`, ready to drop into the Commits section.

### 4. Check for existing entries before appending

Read the last ~50 lines of the log to see what's already there. If an entry for the target date already exists, do not blindly overwrite — ask whether to replace, merge, or add to the existing entry. Duplicate headings silently are worse than asking.

### 5. Draft Impact and Learnings (this is the hard part)

Commits alone are not impact. The user did things that commits only hint at — shipped a fix, unblocked a teammate, learned a pattern. Derive Impact and Learnings by reading commit subjects *and* looking at the diff when the subject is cryptic.

Guidelines for good bullets:

- **Impact bullets name outcomes, not activities.** "Fixed CI: gitignore pattern for scripts/smoke was incorrect, unblocking smoke test runs" is impact. "Worked on CI" is activity. If you can't say what changed for someone else, it's probably not impact.
- **Learnings are specific and transferable.** "gitignore glob scope: `scripts/smoke/` (directory only) vs `scripts/smoke` (file or dir)" is a learning. "Learned about gitignore" is not.
- **If commits are all chores with no clear outcome, say so.** A day of tooling/refactor is still worth logging — label it honestly ("Largest single-day agentic investment: expanded skill library by 48 files") rather than inventing impact.
- **Draft, then show the user before writing.** The user knows what the day actually produced; you only see what git recorded. Always propose the Impact/Learnings bullets and wait for edits before appending to the file.

### 6. Append, don't prepend

New entries go at the bottom of the file. The separator `---` sits on its own line between entries. Preserve whatever header/preamble the file already has at the top.

## Running cadence variants

The skill supports three cadences. Pick based on how the user phrases the request.

- **"Log today"** → one entry for today, today's commits only.
- **"Catch me up on this week"** / **"any updates?"** → one entry per day for each day that has commits, oldest first. Skip days with zero commits rather than writing empty entries.
- **"Backfill since <date>"** → same as week catch-up but bounded by the given date.

## When to push back

- If the user asks to log a day with zero commits and no clear reason, ask what they actually did that day before fabricating bullets. An honest "light day" entry is better than inventing impact.
- If the Impact bullets you're drafting read like marketing copy ("delivered world-class solution"), stop and rewrite in plain language. The log is for the user's own review, not for performance theater.
- If the user asks to edit old entries to sound better, that's their call, but note that the value of the practice comes from fresh-context honesty — retroactive polishing erodes the signal.

## Bundled resources

- `scripts/collect_commits.sh` — git log wrapper that returns commits for a given day in the exact Commits-section format. Call this instead of hand-rolling `git log` flags every time.
- `templates/day-entry.md` — the canonical empty template for a single day's entry. Copy and fill.

## Files to read when relevant

- `templates/day-entry.md` — read when drafting a fresh entry from scratch.
- The existing `progress-daily.md` — always read the last entry before appending, to match tone and avoid duplicates.
