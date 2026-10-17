# Benchmarks

Detail for [TCRDD](../tcrdd.md).

Scenario: `.benchmarks/scenarios/testing-tcrdd-001-red-green.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/tcrdd-001-red-green.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 50%     | 100% | +50%  |
| claude-sonnet-4-6 | 83%     | 67%  | −16%  |
| claude-haiku-4-5  | 50%     | 67%  | +17%  |

> **NEG (run 2026-08-31)**. Opus +50 / haiku +17, but sonnet −16: GREEN-phase minimal-implementation discipline is crowded out by the agentic-guardrail machinery. Post-native-git rewrite holds (no universal regression; the 2026-06-14 FAIL is cleared). GREEN workflow line on the follow-up list. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

2026-10-14: GREEN's minimum-code rule now precedes the core loop, and detailed execution guidance lives in linked references. The historical regression still needs a rerun against this layout.
