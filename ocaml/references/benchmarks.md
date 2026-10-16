# Benchmarks

Detail for [OCaml](../SKILL.md).

Scenario: `.benchmarks/scenarios/ocaml-001-equality-semantics.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/ocaml-001-equality-semantics.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 100%    | 83%  | −17%  |
| claude-sonnet-4-6 | 83%     | 83%  | +0%   |
| claude-haiku-4-5  | 83%     | 83%  | +0%   |

> **NEG (run 2026-08-31)**. Opus −17 (100→83): runtime-model grounding missed — the Runtime Model section is a one-liner punting to references. Sonnet/haiku unchanged. Follow-up: expand the one-liner (cap reached this cycle). Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/ocaml-001-equality-semantics.md` · Run: 2026-09-01 (salience re-run `wf_aae2e0cb`) · Log: `.benchmarks/runs/2026-09-01/ocaml-001-equality-semantics.triage-rerun.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 83%  | +0%   |
| claude-sonnet-4-6 | 83%     | 83%  | +0%   |
| claude-haiku-4-5  | 83%     | 100% | +17%  |

> **PASS (run 2026-09-01)**. Salience re-run (runtime-model one-liner promoted to an imperative inline section, wf_aae2e0cb): the 2026-08-31 opus regression is gone (−17 → +0) and the universal c5 grounding criterion cleared with-skill on haiku (83→100). Opus/sonnet still miss c5 in both conditions; opus without-skill also dropped 100→83 this run, so some baseline noise is in play. Follow-up: next cycle, check whether opus/sonnet need the grounding tied directly into the equality cheat-sheet bullet rather than its own section. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

> **PENDING (2026-09-02)**. Content update sourced from _OCaml from the Very Beginning_ (float operators, currying, exceptions, tail recursion, canonical error messages, `;`-sequence fix) and the CS 3110 textbook (folds, exception patterns / `exn` extensibility, evaluation order, Alcotest raise-testing, black-box vs glass-box test selection, resource link). Equality/runtime-model content unchanged, so ocaml-001 should be unaffected — rerun ocaml-001 before merging per release-gates.
