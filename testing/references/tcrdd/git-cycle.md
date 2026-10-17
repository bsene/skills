# Git stage/test/commit/revert cycle

Git-native, no external tool required. Every phase runs the same two-command primitive:

```
git add -A && <test_command>
```

then, depending on what the phase expects:

- **Expected outcome met** (RED: exit != 0 — the new test genuinely fails · GREEN/REFACTOR:
  exit == 0 — the suite is green) → `git commit -m "[RED|GREEN|REFACTOR] <what changed>"`
- **Expected outcome not met** → capture the failure, `git reset --hard HEAD`, then append it
  to the failure log (see below)

`git add -A` before the test run matters: it stages new files (like the test file just
written in RED) as well as edits, so `git reset --hard HEAD` on failure discards _everything_
from that step — new files included — not just modifications to files that already existed.
Skipping the `add -A` step is the most common way this loop silently leaks untracked files
across a "reverted" step.

### Failure log

`git reset --hard` is silent — the discarded attempt leaves no trace in git history. Keep one
by hand: on every revert, append an entry to `tcr-failure-log.md` at the repo root, _after_
the reset (so the append lands on the clean tree, not the discarded one), then commit just
the log:

```
git reset --hard HEAD
cat >> tcr-failure-log.md << 'EOF'
## <ISO 8601 timestamp> — [PHASE] reverted
- Attempted: <one-line description of the candidate step>
- Expected: <RED: test should fail | GREEN/REFACTOR: tests should pass>
- Actual: <exit code + one-line summary — failing assertion, or "passed unexpectedly">
EOF
git add tcr-failure-log.md && git commit -m "[LOG] revert: <phase> <one-line reason>"
```

This keeps the log itself out of the `git add -A` staged in the main primitive, so a revert
never wipes its own record — the log commit happens as a separate, deliberate step after the
reset, not folded into it. Over a run this becomes the audit trail Verify-never-self-report
depends on: when the stuck-loop limit fires (see [Autonomous execution](autonomous-execution.md)), the last few
entries are the "what was tried" for the `blocked-stuck` handoff, without having to
reconstruct it from memory.

### Detecting the test command

Resolve `<test_command>` from the repo, in this order, and reuse the same one for every phase:

1. `package.json` → `scripts.test` (`npm test` / `pnpm test` / `yarn test`)
2. `Makefile` → `make test` (or the documented target)
3. Language convention: `pytest`, `cargo test`, `go test ./...`, Maven/Gradle `test` goal, etc.
4. If still unclear: check `README` or CI config (e.g. `.github/workflows`), or ask once.

**Always run the full suite** for that command — the same one CI runs. Do not narrow to a
single file, class, or `-k`/`-run` filter unless the user explicitly asks for a scoped run.
A GREEN reached by testing a subset of the suite is not GREEN.
