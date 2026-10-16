# Skill Benchmarks

Bench harness for the skills in this repo. Goal: measure with-skill vs without-skill deltas per model, per scenario, per criterion — the loop defined in `.agents/skills/skill-optimizer/SKILL.md`.

## Loop

1. **Baseline** — run scenario prompt with skill OFF, record response to `runs/<date>/baseline.jsonl`.
2. **Skill-on** — require the model to read the specified skill and relevant routed references, record to `runs/<date>/skill-on.jsonl`. Inspect tool traces to confirm loading; a loading failure invalidates the cell.
3. **Score** — grade each response against the scenario's `criteria` list (pass/fail per criterion).
4. **Compare deltas** — by model, by criterion. Watch for: universal failure (0% even with skill), model-specific weakness, regression (worse with skill on).
5. **Edit for salience** — sharpen triggers, add integrated examples, tighten checklists. Re-run.
6. **Gate** — once stable, document the run in the skill's `## Benchmark` footer.

The three recipes exclude empty responses, reported skill-loading failures, failed grading
calls, and malformed grades. Grades must contain `validResponse` and exactly one boolean
per criterion. Invalid cells appear in `invalidCells` with their scenario, model, condition,
and reason; they have no score and cannot produce a delta. An incorrect substantive answer
remains valid, including a genuine 0% score.

The grader's `validResponse` flag detects reported failures; it does not prove that a skill
was loaded. Tool-trace review in step 2 remains required before publishing scores or deltas.
Run the offline validity checks with `node --test .benchmarks/benchmark-validity.test.js`.

These recipes measure instruction uptake after explicit loading. They do not measure automatic
skill selection. Evaluate selection separately with the skill catalog and a task prompt that
does not name a skill path, recording which skills the model reads.

Score observable behavior and accept equivalent correct implementations. For PHP prefix checks,
`str_starts_with()` is as valid as a correctly checked `strpos()` result; non-regex parsing need
not discuss PCRE errors. Keep runner criteria aligned with the scenario files. Changed criteria
require a new run; historical scores remain tied to their original criteria.

## Layout

```
.benchmarks/
├── README.md                 # this file
├── scenarios/                # one .md per scenario, frontmatter + prompt + criteria
│   ├── kano-001-feature-triage.md
│   ├── refactoring-001-long-method.md
│   ├── rest-api-001-status-code.md
│   ├── tcrdd-001-red-green.md
│   └── typescript-001-illegal-states.md
└── runs/                     # gitignored; one folder per run date
    └── YYYY-MM-DD/
        ├── baseline.jsonl
        └── skill-on.jsonl
```

## Scenario file shape

```markdown
---
id: <skill>-<NNN>-<slug>
skill: <skill-name>
---

# Prompt

<the user-facing prompt to run>

# Criteria

- [ ] <machine-gradable bullet 1>
- [ ] <machine-gradable bullet 2>
- [ ] <machine-gradable bullet 3>
```

**Default models** (run unless a scenario overrides with its own `models:` line):
`[claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5-20251001]`

## Status

- Scenario specifications cover every top-level skill. Historical results may exist locally under `runs/`, but raw logs are gitignored; newly added scenarios still need baseline/skill-on runs.
- Run the checked-in recipes from the repository root so their relative skill paths resolve. They target selected scenarios and run in Pi's `pi-subagents` workflow extension, not directly in Node.js. For example: `pi --approve --subagents-workflow-file=.benchmarks/php-benchmark-trio.js`.
- CI gating remains out of scope until the Pi workflow runner is made data-driven and suitable for unattended use.
