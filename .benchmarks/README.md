# Skill Benchmarks

Bench harness for the skills in this repo. Goal: measure with-skill vs without-skill deltas per model, per scenario, per criterion — the loop defined in `.agents/skills/skill-optimizer/SKILL.md`.

## Loop

1. **Baseline** — run scenario prompt with skill OFF, record response to `runs/<date>/baseline.jsonl`.
2. **Skill-on** — run same prompt with skill ON, record to `runs/<date>/skill-on.jsonl`.
3. **Score** — grade each response against the scenario's `criteria` list (pass/fail per criterion).
4. **Compare deltas** — by model, by criterion. Watch for: universal failure (0% even with skill), model-specific weakness, regression (worse with skill on).
5. **Edit for salience** — sharpen triggers, add integrated examples, tighten checklists. Re-run.
6. **Gate** — once stable, document the run in the skill's `## Benchmark` footer.

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

- Scenarios: 5 stubs (no runs yet) — `kano`, `refactoring`, `rest-api-design`, `tcrdd`, `typescript-type-system`
- Priority instrumentation targets: `tcrdd`, `rest-api-design`, `typescript-type-system` (the other stubs run ahead of priority)
- Out of scope today: full 36-skill coverage, CI gating
