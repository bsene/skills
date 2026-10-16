# Benchmarks

Detail for [type-system](../SKILL.md).

Scenario: `.benchmarks/scenarios/typescript-001-illegal-states.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/typescript-001-illegal-states.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 67%     | 100% | +33%  |
| claude-sonnet-4-6 | 67%     | 83%  | +16%  |
| claude-haiku-4-5  | 67%     | 83%  | +16%  |

> **PASS (run 2026-08-31)**. Gains on all models — the 2026-06-14 SOFT PASS ceiling effect is partly overcome. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/typescript-002-state-transitions.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/typescript-002-state-transitions.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 83%  | +0%   |
| claude-sonnet-4-6 | 83%     | 83%  | +0%   |
| claude-haiku-4-5  | 67%     | 83%  | +16%  |

> **SOFT PASS (run 2026-08-31)**. Haiku +16 (67→83); opus at ceiling. Sonnet's 2026-06-25 N=3 −5% did not reproduce (0 here). Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
