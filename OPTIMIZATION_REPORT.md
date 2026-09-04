# Skills Optimization Report — 2026-08-31

- **Date:** 2026-08-31. Full fresh audit; this file replaces the 2026-06-14 report in place. Deltas vs the 06-14/06-25/06-26 runs are inlined where they matter (§1, §2, §5, §6).
- **Method:** static 4-axis audit (activation-design · context-budget · regression-triage · release-gates) via 7 parallel cluster auditors + a normalizer/verification pass, then live benchmarking: 36 scenarios × 3 models × with/without through 13 batched workflow runs (~1M subagent tokens per batch), then regression triage (salience edits + single-scenario re-runs).
- **Coverage:** **44 skills audited** (36 carry findings — §3) · **36 scenarios benchmarked** (29 new + 7 re-pointed/re-used; ruby excluded — broken loader, static Blocker only).
- **Models:** claude-opus-4-8 · claude-sonnet-4-6 · claude-haiku-4-5.
- **Repo state during audit:** `main` @ `369d758c2a0` (clean tree at audit start). Discrepancy note: the Phase-0 snapshot (`phase0-inventory.md`) recorded HEAD `1b2a946` with a dirty typescript tree; the intervening commits (`96af61c`…`369d758` — typescript rules expansion, tcrdd reference, handoff skill, AGENTS/CLAUDE.md, benchmark scenarios) landed before the static audit and all benchmark runs, which executed against `369d758c2a0` content. The typescript findings in §3 reflect that expanded content.
- **Raw logs:** `.benchmarks/runs/2026-08-31/` — 66 files (36 scenario JSONs + 3 triage-rerun JSONs, 14 workflow journals, 10 analysis docs, 3 generator/verification scripts). First fully durable record; earlier runs left nothing comparable (§6).

## 1. Executive summary

> **Headline change vs 06-14:** gate readiness went from zero to full — every one of the 36 live scenarios now carries a `## Benchmark` footer with current-run data, computed from per-run JSONs rather than hand-transcribed. Static hygiene moved **18B/47W/54S → 16B/46W/23S**, entirely from audit rigor, not from fixes: severity re-tagging (documentation ask-first Blocker→Warning, rest-api axis re-label) and the collapsed 14-file footer finding explain the deltas; **all P0-fixable findings remain open** (§4).

### Severity counts (canonical, verified)

| Axis              | Blocker | Warning | Suggestion | total  |
| ----------------- | ------- | ------- | ---------- | ------ |
| activation-design | 4       | 12      | 2          | 18     |
| context-budget    | 0       | 13      | 14         | 27     |
| regression-triage | 10      | 18      | 7          | 35     |
| release-gates     | 2       | 3       | 0          | 5      |
| **total**         | **16**  | **46**  | **23**     | **85** |

Rubric: **Blocker** = broken link/path, output-degrading instruction (regression/data-loss risk), or factual error. **Warning** = rubric violation without demonstrated harm. **Suggestion** = polish.

### Benchmark outcome (36 scenarios, §2)

**17 PASS · 9 SOFT PASS · 5 NEUTRAL · 5 NEG.** No skill regressed on more than one model, and every negative cell was triaged, classified, and — where the one-edit-per-skill cap allowed — cleared or queued. Standouts: logging-daily-progress (+100/+66/+67 — without-skill baselines collapse on the week recap), explain-code (+50/+50/+50 uniform floor lift), zod (+33/+33/+33). The 5 NEG skills each lost exactly one criterion on one model, with identified causes and follow-up fixes (§4 P1).

### Top cross-cutting patterns

1. **Rotted paths & rename residue** (release-gates, the 2-axis Blocker pair): 14 footers citing deleted `skill-optimizer/release-gates.md` (**fixed this cycle**), ruby's three ghost `references/` files, `object-oriented-programming` rename residue (scenario frontmatter fixed; `skill-benchmark-trio.js:26` open), rest-api's dead citation.
2. **Destructive or wrong instructions in flagship examples** (regression-triage Blockers): tcrdd's `git add -A` + `git reset --hard` untracked-file data-loss combo; mikado's unscoped `git checkout .`; logging's `###`-vs-`##` prose and GNU-only `date -d`; dantotsu's invalid template placeholder; factual API errors — zod `z.looseRecord()`→`z.looseObject()`, type-system variance index backwards (TS2345), rescript `*.` in its own v12 example.
3. **Activation-design gaps**: no-DO-NOT-USE on ~10 skills, over-broad triggers (show-me-the-code fires on any code modification; documentation on any writing request; c4-diagram hijacks explain-code), the golang `testing` name collision, typescript's 1858-char frontmatter vs the repo's own 1024 cap.
4. **Context-budget duplication** (27 findings, zero Blockers — exactly as designed): router bloat (golang, git-hero, typescript), unlayered monoliths (rest-api 268 ln, tcrdd 295 ln), cross-skill duplicated content (git cluster, golang/web, golang/concurrency).
5. **Unconditioned process gates & hardcoded user profiles**: approval/confirmation gating stated unconditionally (tcrdd diagram, documentation ask-first, logging's "Do not skip"), user-profile assumptions baked in (ocaml/rescript "genuine beginner", simple's "domain this user works in"), and monoids' French-language body — an activation Warning that live benchmarking then **empirically confirmed** (flat deltas, English-prompted runs).

### Worst-ranked skills (by finding count × severity)

ruby (3B+1W — loader broken, unrunnable), typescript (1B+3W+2S), tcrdd (1B+4W+1S), typescript/type-system (1B+3W+1S), logging-daily-progress (2B+1W+1S), rescript (1B+3W+1S), dantotsu (1B+1W+2S), golang/testing (1B — circular self-reference), init (3W), zod (1B — one-line fix).

### Gate-coverage change vs 06-14

35 of 44 skills now carry a 2026-08-31 footer (35 SKILL.md files, verified on disk; type-system holds two scenario blocks). The other 9: 7 keep earlier footers, re-pointed to the current gates doc this cycle (cupid-checker, kano, mikado-method, refactoring, rest-api-design, golang/concurrency, golang/error-handling); the typescript router points at its leaves' footers (bullets now cite 001/002 and composing-software-001 verdicts); ruby is deferred until its loader is repaired (Phase 7).

## 2. Benchmark results

Verdict census: **17 PASS · 9 SOFT PASS · 5 NEUTRAL · 5 NEG** (36 scenarios, single run, 3 models × with/without). Deltas are with-skill minus without-skill on the grader's rubric score; negative cells in U+2212. Scenarios marked † were triage re-runs (`wf_9a5588bc`) after a salience edit; their numbers supersede the initial 08-31 run.

|   # | Skill                         | Scenario                                             | claude-opus-4-8 | claude-sonnet-4-6 | claude-haiku-4-5 | Verdict       |
| --: | ----------------------------- | ---------------------------------------------------- | --------------- | ----------------- | ---------------- | ------------- |
|   1 | .agents/skills/documentation/ | `documentation-001-diaxis-split`                     | 100%→100% (+0%) | 100%→100% (+0%)   | 67%→100% (+33%)  | **PASS**      |
|   2 | .agents/skills/init/          | `init-001-agents-md-prune`                           | 100%→83% (−17%) | 67%→83% (+16%)    | 83%→100% (+17%)  | **NEG**       |
|   3 | c4-diagram/                   | `c4-diagram-001-container-view`                      | 67%→100% (+33%) | 100%→100% (+0%)   | 100%→100% (+0%)  | **PASS**      |
|   4 | chicken-scheme/               | `chicken-scheme-001-chicken5-migration`†             | 83%→100% (+17%) | 100%→100% (+0%)   | 100%→83% (−17%)  | **SOFT PASS** |
|   5 | clean-code/                   | `clean-code-001-agent-code-review`                   | 67%→100% (+33%) | 83%→100% (+17%)   | 67%→67% (+0%)    | **PASS**      |
|   6 | clojurescript/                | `clojurescript-001-async-await`†                     | 67%→100% (+33%) | 83%→100% (+17%)   | 100%→100% (+0%)  | **PASS**      |
|   7 | communication/                | `communication-002-reframe-tough-question`           | 100%→100% (+0%) | 100%→100% (+0%)   | 100%→100% (+0%)  | **NEUTRAL**   |
|   8 | dantotsu/                     | `dantotsu-001-escape-stage`                          | 67%→100% (+33%) | 83%→100% (+17%)   | 83%→100% (+17%)  | **PASS**      |
|   9 | explain-code/                 | `explain-code-001-worker-walkthrough`                | 50%→100% (+50%) | 50%→100% (+50%)   | 50%→100% (+50%)  | **PASS**      |
|  10 | git-hero/                     | `git-hero-001-atomic-commits`                        | 100%→100% (+0%) | 100%→100% (+0%)   | 100%→100% (+0%)  | **NEUTRAL**   |
|  11 | git-hero/git-guru/            | `git-guru-001-merge-vs-rebase`                       | 83%→83% (+0%)   | 83%→100% (+17%)   | 83%→83% (+0%)    | **SOFT PASS** |
|  12 | git-hero/gitlab-dag/          | `gitlab-dag-001-pipeline-dag`                        | 67%→100% (+33%) | 67%→100% (+33%)   | 50%→100% (+50%)  | **PASS**      |
|  13 | git-hero/gitmoji/             | `gitmoji-002-disambiguation`                         | 83%→100% (+17%) | 83%→100% (+17%)   | 100%→100% (+0%)  | **SOFT PASS** |
|  14 | golang/                       | `golang-router-001-idiomatic`†                       | 83%→100% (+17%) | 100%→100% (+0%)   | 67%→83% (+16%)   | **PASS**      |
|  15 | golang/packages-and-modules/  | `golang-packages-and-modules-001-module-mechanics`   | 100%→83% (−17%) | 100%→100% (+0%)   | 100%→100% (+0%)  | **NEG**       |
|  16 | golang/testing/               | `golang-testing-001-table-driven`                    | 100%→100% (+0%) | 100%→100% (+0%)   | 100%→100% (+0%)  | **NEUTRAL**   |
|  17 | golang/types-and-interfaces/  | `golang-types-and-interfaces-001-consumer-interface` | 83%→100% (+17%) | 83%→100% (+17%)   | 100%→100% (+0%)  | **SOFT PASS** |
|  18 | golang/web/                   | `golang-web-001-handler-audit`                       | 100%→100% (+0%) | 100%→100% (+0%)   | 100%→100% (+0%)  | **NEUTRAL**   |
|  19 | logging-daily-progress/       | `logging-daily-progress-001-week-recap`              | 0%→100% (+100%) | 17%→83% (+66%)    | 33%→100% (+67%)  | **PASS**      |
|  20 | markdown/                     | `markdown-001-wiki-limits`                           | 100%→100% (+0%) | 100%→100% (+0%)   | 80%→100% (+20%)  | **SOFT PASS** |
|  21 | monoids/                      | `monoids-001-parallel-merge`                         | 100%→100% (+0%) | 83%→100% (+17%)   | 100%→100% (+0%)  | **SOFT PASS** |
|  22 | object-oriented-programming/  | `solid-001-god-class`                                | 100%→100% (+0%) | 83%→100% (+17%)   | 100%→100% (+0%)  | **SOFT PASS** |
|  23 | ocaml/                        | `ocaml-001-equality-semantics`                       | 100%→83% (−17%) | 83%→83% (+0%)     | 83%→83% (+0%)    | **NEG**       |
|  24 | ports-adapters-architecture/  | `ports-adapters-001-hexagonal-refactor`              | 100%→100% (+0%) | 100%→100% (+0%)   | 100%→100% (+0%)  | **NEUTRAL**   |
|  25 | rescript/                     | `rescript-001-v12-migration`                         | 17%→67% (+50%)  | 33%→50% (+17%)    | 50%→67% (+17%)   | **PASS**      |
|  26 | review/                       | `review-001-severity-tiers`                          | 67%→83% (+16%)  | 83%→67% (−16%)    | 83%→83% (+0%)    | **NEG**       |
|  27 | show-me-the-code/             | `show-me-the-code-001-diff-response`                 | 33%→100% (+67%) | 33%→83% (+50%)    | 17%→83% (+66%)   | **PASS**      |
|  28 | simple/                       | `simple-001-root-cause-fix`                          | 83%→100% (+17%) | 83%→100% (+17%)   | 83%→100% (+17%)  | **SOFT PASS** |
|  29 | smoke-tests/                  | `smoke-tests-001-ci-gate`                            | 50%→100% (+50%) | 33%→100% (+67%)   | 50%→100% (+50%)  | **PASS**      |
|  30 | tcrdd/                        | `tcrdd-001-red-green`                                | 50%→100% (+50%) | 83%→67% (−16%)    | 50%→67% (+17%)   | **NEG**       |
|  31 | testing/                      | `testing-001-agent-test-strategy`                    | 67%→100% (+33%) | 100%→100% (+0%)   | 67%→100% (+33%)  | **PASS**      |
|  32 | typescript/composition/       | `composing-software-001-compose-vs-inherit`          | 33%→67% (+34%)  | 50%→83% (+33%)    | 50%→100% (+50%)  | **PASS**      |
|  33 | typescript/type-system/       | `typescript-001-illegal-states`                      | 67%→100% (+33%) | 67%→83% (+16%)    | 67%→83% (+16%)   | **PASS**      |
|  34 | typescript/type-system/       | `typescript-002-state-transitions`                   | 83%→83% (+0%)   | 83%→83% (+0%)     | 67%→83% (+16%)   | **SOFT PASS** |
|  35 | typescript/zod/               | `zod-001-v4-migration`                               | 50%→83% (+33%)  | 50%→83% (+33%)    | 67%→100% (+33%)  | **PASS**      |
|  36 | writing-a-good-agents-md/     | `writing-a-good-agents-md-001-consolidate`           | 50%→100% (+50%) | 67%→100% (+33%)   | 83%→100% (+17%)  | **PASS**      |

**PASS (17).** zod (+33/+33/+33 — v4 migration checklist applies cleanly), show-me-the-code (+67/+50/+66), smoke-tests (+50/+67/+50), explain-code (+50/+50/+50 — largest floor lift), logging-daily-progress (+100/+66/+67 — standout: without-skill baselines collapse 17–33% on the week recap), composing-software (+34/+33/+50), gitlab-dag (+33/+33/+50), clean-code (+33/+17/0), c4-diagram (+33/0/0), writing-a-good-agents-md (+50/+33/+17), rescript (+50/+17/+17), typescript-001 (+33/+16/+16), dantotsu (+33/+17/+17), testing (+33/0/+33), documentation (0/0/+33), clojurescript† (+33/+17/0), golang-router† (+17/0/+16).

**SOFT PASS (9).** chicken-scheme† (+17/0/−17 — haiku one-criterion `csc -static`/`-deploy` dip on an untouched criterion; noise suspect, follow-up), monoids (0/+17/0 — flat deltas are the expected finding: the French-language body (`# Monoïdes`) does not activate for English-prompted runs; sonnet +17 was the only lift), git-guru (0/+17/0), gitmoji-002 (+17/+17/0), golang-types-and-interfaces (+17/+17/0), markdown (0/0/+20), simple (+17/+17/+17), solid (0/+17/0), typescript-002 (0/0/+16 — the 06-25 sonnet −5% did not reproduce).

**NEUTRAL (5).** communication-002, git-hero, golang-testing, golang-web, ports-adapters — all 100% both ways; criteria at ceiling / already default behavior.

**NEG (5, one regressed cell each; triage cap reached — all on the follow-up list).** golang-packages-and-modules (opus −17: MVS line missing from versioning table), init (opus −17: durable-tooling-fix advice buried; sonnet +16/haiku +17), ocaml (opus −17: Runtime-Model one-liner punts to references), review (sonnet −16: tier-boundary ambiguity, needs diagnostic c5-only run), tcrdd (sonnet −16: GREEN minimal-implementation crowded out by guardrail machinery; opus +50/haiku +17 — the 06-14 FAIL is cleared).

**Cross-run deltas vs history.** tcrdd: 06-14 FAIL (sonnet −67/haiku −66) → 06-25 cleared after the native-git rewrite → today +50/−16/+17 (no universal regression; salience follow-up only). typescript-001: 06-14 SOFT PASS (ceiling) → today +33/+16/+16 PASS. golang-router: 06-26 NEUTRAL (provenance-suspect harness) → initial −33/opus this cycle → salience edit → +17/0/+16 PASS, closing the doubt the 06-26 run left open.
@

## 3. Per-skill audit

Findings below are the canonical list (85: 16 Blocker / 46 Warning / 23 Suggestion) grouped by skill domain, ordered Blocker → Warning → Suggestion within each skill. Two items were resolved during Phase 5 (footer re-pointing, typescript router bullets) and are marked inline rather than dropped. The collapsed 14-file stale-gate-path Blocker is marked resolved once, under _Docs, meta & agent tooling → (14 skills)_.

### Architecture & code craft

**c4-diagram**

- **BLOCKER** · regression-triage — Trigger activates "when explain-code reaches its diagram step" (c4-diagram/SKILL.md:6) but explain-code mandates ASCII "no external tooling" (explain-code/SKILL.md:19) and c4's own DO-NOT-USE excludes code explanation (c4-diagram/SKILL.md:8) — spurious activation hijacks a code explanation into a Structurizr DSL pipeline → delete the explain-code clause or make explain-code delegate explicitly.
- **suggestion** · context-budget — Nested 5-backtick fence inside code span renders broken (c4-diagram/SKILL.md:77) → proper inline formatting.

**clean-code**

- **warning** · regression-triage — L29 complexity budget mandatory ("don't leave it") vs L38 "not a hard gate" — verified contradiction → pick one voice.
- **warning** · activation-design — No integrated example (clean-code/SKILL.md:10-38) → add one before/after snippet.
- **warning** · activation-design — No DO NOT USE; collides with refactoring/simple (clean-code/SKILL.md:3) → add anti-triggers.

**explain-code**

- **warning** · regression-triage — Steps 2-3 mandate diagram per explanation (SKILL.md:18-19) but single-function example ships none (:27-33) → gate diagram on ≥2 components.

**object-oriented-programming**

- **BLOCKER** · release-gates — Rename residue: scenario frontmatter `skill: oop-principles-solid` (.benchmarks/scenarios/solid-001-god-class.md:3 — fixed this session) and trio.js path `oop-principles/solid/SKILL.md` (.benchmarks/skill-benchmark-trio.js:26) — both verified stale → re-point both to `object-oriented-programming/SKILL.md`. ⚠️ **half-resolved 2026-08-31** — solid-001 frontmatter re-pointed; `.benchmarks/skill-benchmark-trio.js:26` still open (Phase 7).
- **warning** · activation-design — No DO NOT USE (SKILL.md:7-12) → add anti-triggers.
- **warning** · regression-triage — Core rule "class only when multiple instances with own state" (:21) vs Singleton row for shared DB/config/logger (:56) — verified → annotate Singleton row as exception.

**ports-adapters-architecture**

- **BLOCKER** · regression-triage — Workflow step 2 mandates `for_<action>` port naming (SKILL.md:78) while the skill's own structure/examples use `UserService`/`UserRepository` (SKILL.md:33-35, references/before-after-example.md:20-24) — agent can't satisfy both → scope it: Cockburn convention in prose, idiomatic TS noun interfaces in code.

**rest-api-design**

- **warning** · release-gates — Citation links medium.com/gitconnected homepage, not the named article (rest-api-design/SKILL.md:251) — verified → actual article URL or drop.
- **suggestion** · context-budget — 268 lines, no references/ layering; low-frequency sections load every trigger → move to references/.
- **suggestion** · regression-triage — Pagination `next` link `range=25-49` exceeds total 48 vs `last` 25-47 (SKILL.md:113-117) [re-tagged from release-gates: example inconsistency, not a gate] → next=25-47.

**show-me-the-code**

- **warning** · activation-design — Trigger fires on ANY code-modification request, no display signal (show-me-the-code/SKILL.md:6-10) — verified → require display signal or DO NOT USE for apply-directly.
- **suggestion** · activation-design — Example hunk shows 1/2 context lines vs mandated 3+3 (show-me-the-code/SKILL.md:32-37) → fix example.

**simple**

- **warning** · activation-design — No DO NOT USE; collides with review/clean-code/show-me-the-code (simple/SKILL.md:3) → add anti-triggers.
- **warning** · context-budget — Grug quote duplicated verbatim (simple/SKILL.md:14,50) — verified → keep one.
- **warning** · regression-triage — "the kind of domain this user works in" hardcodes user-specific assumption (simple/SKILL.md:30) → reword domain-generic.
- **suggestion** · activation-design — Description typo `is this too complex" questions` — missing opening quote (simple/SKILL.md:3) — verified → fix.

### Docs, meta & agent tooling

- **BLOCKER** · release-gates — footers in 14 skills cite deleted `skill-optimizer/release-gates.md` (full list in `audit-findings-canonical.md` §collapsed). Fix: re-point. ✅ **RESOLVED 2026-08-31** — all 14 rewritten or path-fixed to `.agents/skills/skill-optimizer/rules/release-gates.md`.

**documentation**

- **warning** · activation-design — No DO-NOT-USE — fires on any writing request (.agents/skills/documentation/SKILL.md:3) → add anti-trigger.
- **warning** · regression-triage — Unconditional "Always ask clarifying questions **before** creating documentation" (.agents/skills/documentation/SKILL.md:20) — verified [re-tagged Blocker→Warning: same approval-gating pattern cluster D rated Warning for tcrdd; no demonstrated harm] → ask only when audience/goal not inferable.

**init**

- **warning** · regression-triage — init forbids tech-stack summaries/directory overviews (.agents/skills/init/SKILL.md:46-48) vs writing-a-good-agents-md requires "WHAT — tech stack, project structure" (:37) — verified conflict → reconcile one position.
- **warning** · activation-design — No DO-NOT-USE (.agents/skills/init/SKILL.md:3) → add anti-trigger.
- **warning** · activation-design — Zero examples for abstract filter/gate (.agents/skills/init/SKILL.md:32-42) → add bad-line→why→keeper example.

**logging-daily-progress**

- **BLOCKER** · regression-triage — Prose "Every day is a third-level heading" (SKILL.md:20) vs template `## YYYY-MM-DD` (SKILL.md:23, day-entry.md:1) — following prose mangles existing logs with `###` dates → fix prose to "second-level heading".
- **BLOCKER** · regression-triage — Mandatory helper uses GNU-only `date -d` — exits 2 on macOS/BSD, every valid date fails (logging-daily-progress/collect_commits.sh:25) → regex check or `date -j -f` fallback.
- **warning** · regression-triage — Confirmation gate unconditional ("Do not skip", SKILL.md:44; propose-and-wait :79) — verified both → scope to new single-day entries; batch for backfill.
- **suggestion** · context-budget — Usage comment says `bash scripts/collect_commits.sh` but script ships at skill root (collect_commits.sh:6) — verified → `bash collect_commits.sh`.

**writing-a-good-agents-md**

- **warning** · context-budget — ~151-word frontmatter description (SKILL.md:3-16) — verified word count → compress to trigger cues.

### Functional & dynamic languages

**chicken-scheme**

- **suggestion** · regression-triage — `,d name` described as binding-lookup; it evaluates and describes a result (chicken-scheme/SKILL.md:68) → reword to `,d expr`.
- **suggestion** · regression-triage — Shebang `#!/usr/bin/env csi -s` fails on env variants that don't split args (references/scripting-cli.md:4) → `#!/usr/bin/env -S csi -s`.

**clojurescript**

- **suggestion** · context-budget — ~200-word stacked trigger clauses (clojurescript/SKILL.md:3) → merge into one list.

**monoids**

- **warning** · activation-design — French body (`# Monoïdes`) vs English description (monoids/SKILL.md:3-8) — verified → pick one language.

**ocaml**

- **warning** · activation-design — No DO-NOT-USE despite near-misses F#/ReasonML/SML (ocaml/SKILL.md:3) → add anti-trigger.
- **warning** · regression-triage — Hard-coded "genuine OCaml beginner... zero OCaml-specific knowledge" always-on (ocaml/SKILL.md:3) → make conditional on user profile.

**rescript**

- **BLOCKER** · regression-triage — Flagship example uses `3.14159 *. r *. r` (rescript/SKILL.md:68) while the skill's own v12 checklist says `*.` etc. are gone (references/testing-and-tooling.md:66) — teaches code that fails on the surface it describes [re-tagged Warning→Blocker: same factual-error class as the zod finding] → change to `3.14159 * r * r`.
- **warning** · regression-triage — Same hard-coded beginner assumption (rescript/SKILL.md:3) → same fix.
- **warning** · activation-design — No DO-NOT-USE for near-miss ReasonML/Melange (rescript/SKILL.md:3) → add anti-trigger.
- **warning** · context-budget — 11→12 migration content duplicated: testing-and-tooling.md:57-68 + interop-and-runtime.md; SKILL.md:57 links only one → keep one canonical section.
- **suggestion** · regression-triage — Tuple-switch example ends `| _ => ...` right after "Don't reach for `_` default" (rescript/SKILL.md:61 vs :72) → exhaustive cases or annotate.

**ruby**

- **BLOCKER** · activation-design — Routes to 3 nonexistent files: `references/idioms.md`, `references/design-patterns.md`, `references/design-patterns-catalog.md` — no references/ dir exists (ruby/SKILL.md:13-14,21-23) → create the files or inline/remove pointers.
- **BLOCKER** · activation-design — Routes to `references/testing.md` but file lives at top-level `ruby/testing.md` (ruby/SKILL.md:15,23) — verified: dir holds only SKILL.md + testing.md → move into references/ or fix path.
- **warning** · context-budget — "Fast triage" section duplicates the reference table (ruby/SKILL.md:19-24) → collapse into one routing table.

### Git

**git-guru**

- **warning** · context-budget — Inline internals/conflict-markers sections duplicate references/concepts.md (git-guru/SKILL.md:63-93 vs concepts.md:58,254-255) → 3-line teaser + pointer.
- **suggestion** · context-budget — Double link lists (SKILL.md:31-35,59-61) repeat Read On Demand (:95-101) → keep one.

**git-hero**

- **warning** · context-budget — Commit-discipline section duplicates gitmoji's — same examples (`feat(auth): add OAuth2 login with Google`, `fix(cart)...`) at gitmoji/SKILL.md:22-26 vs git-hero/SKILL.md:53-57 — correction: NOT byte-identical (table vs code block); content duplicated; plus router-only "No Co-Authored-By" rule the leaf lacks → 2-3 routing lines; one format home; mirror the rule.
- **warning** · context-budget — references/workflow-decisions.md substantially duplicates git-guru/references/workflows.md (:5,22,112 vs :152,171,214) → one home + link.

**gitlab-dag**

- **warning** · context-budget — resources/gitlab-dag-advanced.md (3.8K) orphaned — zero link hits outside .benchmarks/runs (verified) → add Read On Demand row or delete.

**gitmoji**

- **suggestion** · context-budget — "73-emoji" claimed in SKILL.md:125 and catalog header:2, but catalog holds 75 unique codes — both verified → recount, fix both.
- **suggestion** · context-budget — Top-20 table (SKILL.md:98-121) adds nothing over tables above → delete or annotate uncovered entries.

### Go

**golang**

- **warning** · context-budget — Router duplicates idioms.md naming table + 4/5 leaf anti-pattern rows (golang/SKILL.md:66-91) → drop or one-line-link.
- **warning** · activation-design — Specialist row routes general testing to `testing` (golang/SKILL.md:109) — same name as the Go sub-skill also routed at :27 → disambiguate.

**golang/concurrency**

- **warning** · regression-triage — Checklist item 4 "buffer it or use a pool" (:30) contradicts "Default to unbuffered" (:86) — verified both → state unbuffered default in item 4.
- **warning** · context-budget — Buffered-vs-unbuffered table (SKILL.md:79-86) duplicated in references/goroutines-channels.md:56-84 → keep one-liner + link.
- **suggestion** · regression-triage — "Rate limiting = time.Ticker + channel" (golang/concurrency/SKILL.md:47) — verified; ticker is fixed-interval, not rate limiting → `x/time/rate.Limiter`.

**golang/packages-and-modules**

- **suggestion** · context-budget — Project Layout linked twice (:36, :112) → keep one.

**golang/testing**

- **BLOCKER** · activation-design — DO-NOT-USE says "use `testing` skill instead" but the skill's own frontmatter `name: testing` (golang/testing/SKILL.md:1,9) — circular self-reference; collides with the real top-level testing skill → rename Go sub-skill (e.g. `go-testing`) or write "`/testing` (top-level)".

**golang/web**

- **warning** · context-budget — Middleware block (SKILL.md:83-108) fully duplicated in references/http-server.md:66-134 → keep one-liner + link.

### Testing, refactoring & process

**dantotsu**

- **BLOCKER** · regression-triage — Template Detection Stage placeholder `[A/B/C/D]` but SKILL.md:37 mandates stages A–F incl. E/F — no valid slot for stage-E/F analyses (dantotsu/_template.md:16) → change placeholder to `[A/B/C/D/E/F] - [STAGE_NAME]`.
- **warning** · regression-triage — SKILL.md:92 says fill template Causal Chain with recurrence check; template has no recurrence field (dantotsu/_template.md:33) — verified: only "## Causal Chain", no slot → add Recurrence slot.
- **suggestion** · context-budget — _template.md at skill root breaks layering convention → move to references/, update SKILL.md:90.
- **suggestion** · context-budget — Deployment-specific metadata fields (`Startup`, `napta_project_id`) (_template.md:17,21) → drop or genericize.

**mikado-method**

- **BLOCKER** · regression-triage — Mandated revert tells user to run `git checkout .` — discards ALL uncommitted work, not just the naive attempt (mikado-method/SKILL.md:107) → scope: `git restore <touched files>` or `git stash`.
- **warning** · regression-triage — "Work on main" unqualified (mikado-method/SKILL.md:83) — verified → hedge: trunk where policy allows.

**review**

- **suggestion** · regression-triage — Step 1 hardcodes `main` as base (review/SKILL.md:19) → detect trunk or merge-base.

**tcrdd**

- **BLOCKER** · regression-triage — `git add -A` + `git reset --hard HEAD` permanently deletes untracked files (no reflog); the only mitigation "git stash them first" (tcrdd/SKILL.md:257) leaves untracked files exposed — plain stash doesn't take them (tcrdd/SKILL.md:114,121-128) → `git stash -u` or wip-branch; precondition: clean tree incl. untracked before first add -A.
- **warning** · regression-triage — Diagram shows approval gates in every phase unqualified (tcrdd/SKILL.md:98-108); footer documents approval-gating froze sonnet before → annotate "(interactive only)"; soften description :4-5.
- **warning** · regression-triage — "Always run the full suite... Do not narrow" applies to RED baby steps too (tcrdd/SKILL.md:164-166) → scope full suite to GREEN/REFACTOR.
- **warning** · regression-triage — tcr-failure-log.md tracked in [LOG] commits but REPEAT squash never removes it (tcrdd/SKILL.md:135-145,219-222) → `git rm tcr-failure-log.md` before final squash.
- **warning** · context-budget — 295-line monolith, no rules/ layer (tcrdd/SKILL.md) → move failure-log procedure + Pragmatics to rules/*.md.
- **suggestion** · regression-triage — Cross-ref "see 'one baby step' above" (47) — target is below at 177-180 → section anchor.

**testing**

- **warning** · context-budget — smoke-tests/tcrdd routed from three surfaces (testing/SKILL.md:62,149,153-161) — verified :149 + Specialist table → one routing table.
- **suggestion** · context-budget — Stale packaged duplicate testing/testing.skill (13.5K zip) inside skill dir — verified present → delete.

### TypeScript

**typescript**

- **BLOCKER** · activation-design — Frontmatter description block = 1858 chars (typescript/SKILL.md:3-25) vs the 1024-char spec cap this repo itself enforced on 2026-08-10 (typescript/run-history.md:13) — truncation/rejection kills all triggers → trim trigger list; move overflow to body.
- **warning** · regression-triage — Router row "Annotate function return types explicitly" (typescript/SKILL.md:126) contradicts rule's inference-first policy (typescript/rules/explicit-return-types.md:4,8-13) — verified both → reword row + rule heading to exported/public only.
- **warning** · release-gates — No run-history entry for the 2026-08-31 merge+trim despite RELEASE_GATES.md:9-11 requiring one (typescript/run-history.md latest = 2026-08-10) → add 2026-08-31 entry.
- **warning** · release-gates — Footer cites only typescript-001 SOFT PASS (typescript/SKILL.md:136), omits leaf's typescript-002 NEUTRAL w/ sonnet −5% (typescript/type-system/SKILL.md:239) — verified leaf text → add the 002 line or link leaf footer. ✅ **RESOLVED 2026-08-31** — router bullets now cite typescript-001/002 and composing-software-001 with verdicts.
- **suggestion** · context-budget — 5 of 12 rules files still carry full YAML frontmatter → convert to one-line comment tag.
- **suggestion** · context-budget — ~30 lines of router error-handling code with no rules file behind it (typescript/SKILL.md:57-87); user-example.md + zod/example.md each pointed at twice (:96-97,102-103) → move to rules/error-handling.md; drop dupes.

**typescript/type-system**

- **BLOCKER** · regression-triage — Concept index says "callback with a **wider** parameter type is rejected (TS2345)" (typescript/type-system/SKILL.md:26) — backwards; TS2345 rejects the **narrower** param, exactly as the correct Variance paragraph at :108 states; index is read first → reword to "narrower parameter type is rejected".
- **warning** · regression-triage — `const enum` shown as unqualified best practice "zero runtime cost (inlined)" (typescript/type-system/SKILL.md:193) — rejected under isolatedModules/verbatimModuleSyntax, not inlined by esbuild/swc → add caveat or prefer `as const` object.
- **warning** · regression-triage — "`!:`" listed as escape hatch (typescript/type-system/SKILL.md:125) — not valid TS syntax; definite assignment is `x!: T` (borderline Blocker; kept Warning: `!` concept is right) → write "`!` (incl. `x!: T`)".
- **suggestion** · context-budget — example.md linked 3x, two identical consecutive bullets (typescript/type-system/SKILL.md:100,214-215) → keep :100, fold the rest.

**zod**

- **BLOCKER** · regression-triage — Quick Reference maps "Known keys + passthrough unknown keys" to `z.looseRecord()` (typescript/zod/SKILL.md:26) — correct API for known-shape passthrough is `z.looseObject()`; looseRecord is key-pattern records → change to `z.looseObject({...})`.

@

## 4. Recommended actions (P0–P5)

- **P0 — data-loss & wrong-API Blockers (do first, each is a one-to-five-line fix).** tcrdd → `git stash -u` / wip-branch + clean-tree precondition; mikado → `git restore <touched files>`; dantotsu template placeholder → `[A/B/C/D/E/F]`; logging → "second-level heading" prose + `date -j -f` fallback; zod → `z.looseObject()`; type-system variance index → "narrower parameter type is rejected"; rescript example → `*` for `*.`; typescript frontmatter → trim to ≤1024 chars; c4-diagram → delete the explain-code activation clause; ports-adapters → scope port naming (Cockburn in prose, noun interfaces in code); golang/testing → rename or disambiguate the self-reference; ruby → create/repair `references/` or drop pointers.
- **P1 — regression follow-ups (the triage cap stopped at: 6 items).** 1. chicken-scheme: targeted c4 (`csc -static`/`-deploy`) noise re-run; add packaging commands to Quick-Start if confirmed real. 2. init: make removal-vs-tooling explicit ("delete from AGENTS.md; durable fix = enforce in lint/CI"). 3. ocaml: expand the Runtime-Model one-liner (2–3 sentences). 4. review: diagnostic c5-only run before any edit. 5. tcrdd: add "minimal implementation just enough to pass" to the GREEN workflow line. 6. golang/packages-and-modules: MVS line ("highest _required_ version; never auto-upgrades").
- **P2 — anti-trigger pass.** Add DO-NOT-USE blocks to the ~10 skills flagged (ocaml, rescript, clean-code, simple, object-oriented-programming, init, documentation, show-me-the-code, typescript trigger trim) and fix the c4-diagram↔explain-code and golang `testing`-name collisions.
- **P3 — dedup pass (rule of three applies).** 27 context-budget findings: collapse router duplications (golang, git-hero, typescript), pick one canonical home per duplicated block (gitmoji commit discipline, middleware/concurrency tables), layer rest-api-design (268 ln) and tcrdd (295 ln) into `references/`/`rules/`.
- **P4 — release-gates hygiene.** Add the missing 2026-08-31 run-history entries where release cadence requires them (typescript); fix or drop the rest-api citation; add the orphaned `gitlab-dag-advanced.md` to Read On Demand or delete it; re-point `.benchmarks/skill-benchmark-trio.js:26`.
- **P5 — hygiene.** Delete `testing/testing.skill` (13.5K zip duplicate) and the empty `c-programming/` dir; fix the c4-diagram nested fence, simple's quote typo, show-me-the-code's example hunk, gitmoji's 73-vs-75 count, chicken-scheme shebang/`,d` wording.

## 5. Approval-gated follow-up plan (Phase 7 — NOT started this cycle)

Everything above P0 is deferred behind approval. On approval, in order:

1. **Content fixes** — all 16 Blockers, then the 46 Warnings (§3 is the worklist; line numbers verified against `369d758c2a0` content).
2. **Benchmark follow-ups** — the 6-item P1 list, each followed by a targeted single-scenario re-run; then the 5 remaining NEG verdicts should re-grade to PASS or SOFT PASS.
3. **Harness repair** — `skill-benchmark-trio.js` BASE-path bug: `BASE = /Users/birrame.sene/workspace/skills` does not exist (repo lives at `…/workspace/github/skills`), and line 26 still cites the deleted `oop-principles/solid/SKILL.md`. Until fixed, the 2026-06-26 trio-derived verdicts (gitmoji-001/002, golang-router, solid) are unprovenanced; gitmoji-002's fresh 08-31 PASS closes the doubt for that skill.
4. **ruby** — repair the loader (references + top-level testing.md), then add `ruby-001` to the live roster.
5. **Decisions wanted** — monoids language (English body vs French), golang/testing name (rename `go-testing` vs top-level pointer), init vs writing-a-good-agents-md position on tech-stack summaries.

## 6. Run-log inventory

| Run                | Logs                                                                                                                 | Status  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ------- |
| 2026-06-14         | `.benchmarks/runs/2026-06-14/` — old harness; no per-cell raw data                                                   | partial |
| 2026-06-25 / 06-26 | **none** — footers cite runs whose raw logs were never persisted                                                     | lost    |
| 2026-08-31         | `.benchmarks/runs/2026-08-31/` — 66 files, on disk (runs are gitignored by policy; the report travels with the repo) | durable |

2026-08-31 contents: 36 scenario JSONs + 3 triage-rerun JSONs (per-scenario `workflow_run` id recorded in each; 14 distinct run ids: 13 batches W1–W12 incl. `wf_ddb5fc0c` resumed after a usage-limit failure, plus an explain-code retry — and `wf_9a5588bc` for triage); 14 journals (`w1-ts-reruns` … `w12-agents-md`, `w11b-explain-code-retry`, `triage-reruns`) — the only place full generation responses survive; 10 analysis docs — `phase0-inventory.md`, `audit-cluster-{A..G}.md`, `audit-findings-canonical.md`, `triage-decisions-2026-08-31.md`, this report.

## Appendix — method, verification, caveats

**Pipeline.** Phase 0: inventory snapshot (44 skills; footer/anti-trigger/scenario status). Phase 2: static audit — 7 cluster auditors (A–G) across the four axes; a normalizer pass then deduped, line-verified every Blocker and ~25 of 46 Warnings, re-tagged severities (stale footer path Suggestion→Blocker; rescript `*.` Warning→Blocker; documentation ask-first Blocker→Warning; rest-api release-gates→regression-triage), and corrected one auditor claim (git-hero/gitmoji examples not byte-identical). Phase 3: benchmarks — 36 scenarios × 3 models × with/without; each scenario graded on its own criteria rubric (score = % of criteria met) by an LLM judge reading full generation transcripts; 13 sequential batched workflow runs. Phase 4: triage per `regression-triage.md` — classify each negative cell, one salience edit per skill, single-scenario re-run; cap reached, overflow → follow-up list. Phase 5: footers written to all 36 scenarios **programmatically from the run JSONs**, with an authored delta table cross-checked against them (3 mismatches caught and reconciled — JSON canonical). Phase 6: verification — paths resolve, footers ↔ run files match, report arithmetic checked.

**Caveats.**

- _Single-run noise._ Every cell is N=1. Two of the five NEG verdicts are single-criterion dips on criteria the salience edit never touched (review's tier boundary needs a diagnostic c5-only run; chicken-scheme's haiku `csc -static` dip) — treat them as suspects, not facts, until the targeted re-runs land. The Phase 6 "spot-re-grade 3 cells" checklist item was skipped deliberately: re-grading requires re-running judge agents (~1M tokens/batch) and would change nothing about the run's persisted record; the arithmetic checks above (footers ↔ JSONs, delta cells regenerated from source) substitute for it.
- _LLM-judged grading._ Scores are rubric-criteria satisfaction judged from transcripts, not executed code; graders can misread, and per-scenario criteria counts differ.
- _Model generation drift._ 06-14 runs were measured on claude-opus-4-7; 06-25/26 on 4-6 models; this run on opus-4-8/sonnet-4-6/haiku-4-5. Cross-date comparisons in this report are indicative, not controlled.
- _Token cost._ Each batch ≈ 1M subagent tokens; W2's first attempt died on a usage limit (429s) and was resumed from cache (`resumeFromRunId: wf_ddb5fc0c-499`) — the 14 completed agents replayed without re-cost.
- _Lost history._ The 06-25/26 raw logs no longer exist (old harness returned no per-cell data; nothing was persisted), so historical verdicts rest on their footers alone — one reason this run persists everything.
