# Skill Optimization Report

**Date:** 2026-06-14
**Method:** `skill-optimizer` rubric (activation-design, context-budget, regression-triage, release-gates) + live `benchmark-loop`
**Coverage:** 36 local skills statically audited (all SKILL.md except `skill-optimizer` itself) + 5 live benchmarks (3 models × with/without)
**Raw benchmark logs:** `.benchmarks/runs/2026-06-14/*.jsonl` (10 files, gitignored)

---

## 1. Executive Summary

### Aggregate findings (agent-tagged)

| Severity | Count |
|----------|-------|
| Blocker | 18 |
| Warning | 47 |
| Suggestion | 54 |

### The one cross-cutting blocker: zero gate readiness

**Not one of 36 skills has a `## Benchmark` footer** (date / model matrix / deltas) required by `release-gates.md`. 17 of the 18 "Blockers" are this same gap. Only **5 skills have a benchmark scenario at all** (`kano`, `refactoring`, `rest-api-design`, `tcrdd`, `typescript-type-system`); the other 31 cannot be gated even in principle. The TypeScript family keeps gate data in side files (`typescript/run-history.md`, `typescript/RELEASE_GATES.md`) instead of the footer the rubric expects.

> Severity note: audit agents tagged this inconsistently — "scenario exists but no footer" and "no scenario + no footer" both came back as Blocker in some clusters, Warning in others. Treat gate readiness as **one universal repo-wide gap**, not 17 independent ones.

### Top 5 cross-cutting patterns

1. **Missing benchmark footers / scenarios** — universal (36/36). Highest-leverage single fix.
2. **Missing `DO NOT USE` / anti-trigger clause** — js, zod, type-system, chicken, golang/web, git-guru, gitlab-dag, gitmoji. Risks mis-activation and skill overlap.
3. **Duplicated content within a file** — anti-pattern tables restating decision tables (golang ×5), three overlapping checklists (rest-api-design), Concepts-vs-table (solid), inline code duplicating references (design-patterns). Pure context-budget waste.
4. **Routers carrying leaf content** — `golang`, `typescript`, `git-hero`, `oop-principles` host teaching content that competes with their own sub-skills; `git-hero` & `oop-principles` also lack `user-invocable: false`.
5. **No integrated example** — chicken, testing, smoke-tests, review, show-me-the-code, explain-code teach via reference tables only, no realistic input→decision→output walkthrough.

### Skills ranked worst → best (by Blocker, then Warning)

| Rank | Skill | B/W/S | Note |
|------|-------|-------|------|
| 1 | **tcrdd** | 0/1/2 | **Benchmark FAIL** — degrades sonnet/haiku (see §2) |
| 2 | git-hero/git-guru | 1/3/1 | router-leaf overlap + run-on description |
| 3 | golang (router) | 1/2/1 | three dispatch tables, heavy payload |
| 4 | golang/web | 1/2/1 | no anti-trigger, duplicate handlers |
| 5 | git-hero (router) | 1/2/2 | no `user-invocable:false`, dup routing |
| 6 | rest-api-design | 1/2/1 | 283 lines, 3 overlapping checklists |
| 7 | oop-principles/design-patterns | 1/1/1 | inline code duplicates references |
| 8-13 | golang/{concurrency,error-handling,packages,testing,types} | 1/1/1 each | per-file dedup + footers |
| 14-16 | gitlab-dag, gitmoji, cupid-checker, mikado-method | 1/1/x | anti-trigger + footer |
| 17-19 | refactoring, kano, composing-software, logging-daily-progress | 1/0/x | scenario/footer only |
| 20-22 | oop-principles (router), solid | 0/2/1 | router-leaf ambiguity / dedup |
| 23-27 | javascript, typescript, type-system, zod, chicken | 0/2/x | anti-trigger + footer |
| 28-31 | testing, smoke-tests | 0/2/x | dedup + missing example |
| 32-36 | review, show-me-the-code, c4-diagram, explain-code, ports-adapters, markdown, writing-claude-md | 0/1/x | footer + minor |

---

## 2. Benchmark Results (live, 3 models × with/without)

Models: `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5`. Gate per `release-gates.md`: **FAIL** if any universal 0%-with-skill criterion or any negative delta; **SOFT PASS** if ≥1 gain and no regressions; **PASS** if clean + meaningful gains.

### kano-001-feature-triage → `kano` — **PASS**
| Model | Without | With | Delta |
|-------|---------|------|-------|
| opus | 80% | 100% | +20% |
| sonnet | 80% | 100% | +20% |
| haiku | 80% | 100% | +20% |

Uniform +20%. Skill's load-bearing lift = forcing explicit Kano classification (all baselines skipped the vocabulary). Decline-decision + cost framing already produced unaided → **trim toward the classification matrix + refusal protocol**, the rest is redundant.

### refactoring-001-long-method → `refactoring` — **PASS** (strongest signal)
| Model | Without | With | Delta |
|-------|---------|------|-------|
| opus | 83% | 100% | +17% |
| sonnet | 33% | 100% | +67% |
| haiku | 0% | 100% | +100% |

Decisive on weak models: haiku 0→100%. Skill enforces smell-naming, Extract-Method-first (vs baseline Extract-Class/new-module over-engineering), in-place scope, rule-of-three. Keep as-is; high value.

### rest-api-001-status-code → `rest-api-design` — **PASS**
| Model | Without | With | Delta |
|-------|---------|------|-------|
| opus | 40% | 100% | +60% |
| sonnet | 40% | 60% | +20% |
| haiku | 40% | 60% | +20% |

Flips the core 400-vs-422 call on all 3 models (every baseline wrongly chose 422). Smaller models adopt the verdict but under-apply secondary idempotency (cache 4xx) and 409 guidance → **raise salience of those two points** for weaker models.

### typescript-001-illegal-states → `typescript-type-system` — **SOFT PASS**
| Model | Without | With | Delta |
|-------|---------|------|-------|
| opus | 100% | 100% | +0% |
| sonnet | 83% | 100% | +17% |
| haiku | 100% | 100% | +0% |

Ceiling effect — frontier baselines already produce textbook discriminated unions. Only lift: shared-base (intersection/extends) on sonnet. **Author a harder scenario** (state transitions, branded ids, nested invariants) to differentiate.

### tcrdd-001-red-green → `tcrdd` — **FAIL** ⚠️
| Model | Without | With | Delta |
|-------|---------|------|-------|
| opus | 100% | 100% | +0% |
| sonnet | 100% | 33% | **-67%** |
| haiku | 83% | 17% | **-66%** |

**The skill actively degrades non-opus models.** Heavy approval-gating + git-gamble workflow makes sonnet freeze (stopped at a setup proposal, never wrote a test) and haiku shortcut (one-shot full impl, single squashed commit). Baselines already do solid red/green naturally. Needs an explicit "just run the loop, gates optional in autonomous mode" path + an anti-one-shot guard before it ships. **Patch immediately** (`regression-triage.md`).

> Side-effect during this run: generation sub-agents committed kata files into the repo; the orchestrator reset HEAD to `76b83e7` and removed stray dirs. Repo verified clean post-run.

---

## 3. Per-Skill Audit

Findings format: `SEVERITY | axis | problem | fix`. Clean axes omitted. All 36 skills additionally carry the universal **gate-readiness gap** (no `## Benchmark` footer) — stated once here, not repeated per skill below unless a scenario already exists and only the footer is missing.

### Language

**javascript/SKILL.md** (46 ln) — 0B/2W/2S
- WARNING | activation | No `DO NOT USE` clause; sibling `typescript` has one → both may load on plain `.js`. | Add "TS-only type questions → use `typescript`".
- WARNING | gate | No scenario covers any of the 5 always-apply JS rules. | Add a `filter().map()` hot-path or null-vs-undefined scenario.
- SUGGESTION | clarity | No top-level checklist / integrated example; pure routing tables. | Add "when reviewing JS, check 1…5".
- SUGGESTION | activation | Fragile rule (`== null` only) buried in `rules/null-undefined.md`. | Inline the one-line imperative next to each rule link.

**typescript/SKILL.md** (114 ln, router) — 0B/2W/1S
- WARNING | gate | Router has no `## Benchmark` footer; gate data lives in `run-history.md`/`RELEASE_GATES.md`. | Add footer or one-line pointer.
- WARNING | budget | Router hosts full Error-Handling (31-72) + At-Scale (76-93) code blocks that belong in sub-skills. | Move to reference/sub-skill; keep dispatch + rules tables.
- SUGGESTION | clarity | No top-level always-apply checklist (strict mode, validate boundaries, no `as`). | Add one.

**typescript/type-system/SKILL.md** (271 ln) — 0B/2W/1S *(scenario exists; only footer missing)*
- WARNING | activation | No `DO NOT USE`; heavy trigger overlap with parent. | Add (runtime/schema → `zod`; naming → `javascript`).
- WARNING | budget | 271 ln; rule pointers buried (`as const` warning L181, `no-interface-prefix` L206); `as const` taught twice (L33 + L164-181). | Surface pointers near top; collapse duplicate.
- SUGGESTION | clarity | No top-level checklist tying to scenario criteria (union/base/discriminant/assertNever/no-`as`). | Add it.

**typescript/zod/SKILL.md** (87 ln) — 0B/2W/2S
- WARNING | activation | No `DO NOT USE`; all triggers are "zod" nouns. | Add "pure compile-time typing → use typescript-type-system".
- WARNING | gate | v4 guidance (`.format()`/`.flatten()` → `z.treeifyError`, L49) is high-regression-risk, unverified. | Add a v4 error-formatting scenario.
- SUGGESTION | clarity | No single end-to-end example (input→schema→safeParse→error tree). | Add one boundary walkthrough.
- SUGGESTION | budget | "Core Principles" (34-42) is prose; → 4-row checklist.

**chicken-scheme/SKILL.md** (98 ln) — 0B/2W/2S
- WARNING | gate | No scenario; activation/pitfall behavior ungated. | Add "compile .scm" or "`(use foo)`→`(import foo)`" scenario.
- WARNING | clarity | No integrated write→compile→run→egg walkthrough. | Add one.
- SUGGESTION | activation | Correctness traps in prose bullets (L82-87, "No `use` in CHICKEN 5"). | Promote to imperative do/do-not near top.
- SUGGESTION | activation | Frontmatter lacks labeled `TRIGGER when:`/`DO NOT USE when:` structure + `user-invocable` key. | Normalize to pack format.

### Golang *(all 7 lack scenario + footer — gate Blocker per cluster convention)*

**golang/SKILL.md** (111 ln, router) — 1B/2W/1S
- BLOCKER | gate | No footer + no golang scenario. | Add footer + `golang-router-001` dispatch scenario.
- WARNING | activation | Router carries Fundamentals (32-78) + Anti-patterns (82-90) + Read-On-Demand (94-100) that overlap sub-skills. | Move to references/sub-skills; keep dispatch only.
- WARNING | activation | `DO NOT USE` (L13) too narrow (only "go" the verb). | Broaden (Go board game, Pokémon GO).
- SUGGESTION | clarity | Three dispatch mechanisms (21-28, 94-100, 104-110). | Merge into one table.

**golang/concurrency/SKILL.md** (142 ln) — 1B/1W/1S
- BLOCKER | gate | No footer + no scenario on highest-risk topic (races/leaks). | Add goroutine-leak/race scenario.
- WARNING | clarity | One integrated example (FetchAll 42-52); rest are isolated snippets. | Add an end-to-end worker-pool + ctx-cancel + errgroup example.
- SUGGESTION | budget | Channel-direction example (60-79) teaches syntax, not a failure mode. | Compress to 2-line rule.

**golang/error-handling/SKILL.md** (108 ln) — 1B/1W/1S
- BLOCKER | gate | No footer + no scenario. | Add `%w` vs `%v` / errors.As scenario.
- WARNING | budget | `%w`/`%v` taught 3× (L24-25, L46-47, L58). | Collapse to one table + one rule.
- SUGGESTION | clarity | No top-level always-checklist (wrap-by-default, never-panic-on-expected). | Add 3-line checklist.

**golang/packages-and-modules/SKILL.md** (114 ln) — 1B/1W/1S
- BLOCKER | gate | No footer + no scenario. | Add module-layout/versioning scenario.
- WARNING | budget | `init()` covered 3× (48-62, 103, + router). | Keep dedicated section; cross-ref the rest.
- SUGGESTION | activation | Soft phrasing mixed with imperatives (L41, L62). | Normalize to imperative.

**golang/testing/SKILL.md** (149 ln) — 1B/1W/1S
- BLOCKER | gate | No footer + no scenario. | Add table-driven/t.Helper scenario.
- WARNING | budget | t.Helper/t.Cleanup/t.Parallel snippets (94-129) re-expand the decision table. | Drop or fold the one nuance (t.Parallel loop-var capture).
- SUGGESTION | clarity | `-race` only as anti-pattern row (L141). | Promote to top-level always-rule.

**golang/types-and-interfaces/SKILL.md** (169 ln) — 1B/1W/1S
- BLOCKER | gate | No footer + no scenario. | Add "accept interfaces, return structs" scenario.
- WARNING | budget | Interface-pollution & generics rules duplicated (22-26 vs 154-155; L78 vs L158). | Deduplicate; anti-patterns reference rule rows.
- SUGGESTION | budget | iota/bitmask blocks teach syntax. | Move to `references/collections-generics.md` (exists).

**golang/web/SKILL.md** (161 ln) — 1B/2W/1S
- BLOCKER | gate | No footer + no Go-web scenario (rest-api-001 is language-agnostic). | Add Go handler/middleware/JSON scenario or bind rest-api-001.
- WARNING | activation | No `DO NOT USE`; broad triggers fire on non-web JSON marshaling. | Add anti-trigger.
- SUGGESTION | budget | Two full handlers (33-47, 122-138) teach same mechanics. | Keep createUser; trim HealthHandler to one-liner.

### Testing / QA

**testing/SKILL.md** (91 ln) — 0B/2W/3S
- WARNING | gate | No footer + no scenario. | Add `testing-00x` scenario.
- WARNING | budget | Prose (33-35) duplicates the pyramid table (37-41). | Drop prose.
- SUGGESTION | budget | Anti-Patterns table (60-69) overlaps Core Beliefs (24-29) + Decision Guide (45-56). | Consolidate.
- SUGGESTION | clarity | No integrated before/after "hard-to-test = design problem" example. | Add one.
- SUGGESTION | activation | **Stale pointer**: L79 says `references/smoke-tests.md` was moved, but the file still exists on disk. | Delete the leftover file or the row.

**tcrdd/SKILL.md** (96 ln) — 0B/1W/2S — ⚠️ **benchmark FAIL, see §2**
- WARNING | gate | Scenario exists but no `## Benchmark` footer. | Add footer; **and fix the regression** (gate path for autonomous mode + anti-one-shot guard).
- SUGGESTION | clarity | Approval gate (the critical, skip-prone rule) is prose, not numbered. | Promote pre-phase gates to bold do-not-omit.
- SUGGESTION | budget | git-gamble fallback stated 3× (L40, L80, workflow). | Keep one canonical (table row).

**smoke-tests/SKILL.md** (109 ln) — 0B/2W/2S
- WARNING | gate | No footer + no scenario. | Add "identify smoke tests / write Hurl gate" scenario.
- WARNING | budget | Run commands duplicated (56-58, 84-89, reference). | Trim; defer Jest specifics to reference.
- SUGGESTION | activation | `DO NOT USE` (L8) only redirects to `testing`; no guard against e2e/edge-case misuse. | Add it.
- SUGGESTION | clarity | No integrated identify→write→wire-CI example. | Add one.

**review/SKILL.md** (52 ln) — 0B/1W/2S
- WARNING | gate | No footer + no clean-dispatch scenario (fires on "review PR" but not explain-only). | Add it.
- SUGGESTION | clarity | Load-bearing "never reconstruct the diff" only inline in step 1. | Bold as non-negotiable.
- SUGGESTION | budget | Guardrails (49-52) restate Workflow steps. | Merge.

**show-me-the-code/SKILL.md** (22 ln) — 0B/1W/2S
- WARNING | gate | No footer + no scenario; "no exceptions even one-liners" claim is exactly what a with/without delta should verify. | Add it.
- SUGGESTION | clarity | No example of the required `diff -u` output. | Add one canonical sample.
- SUGGESTION | clarity | Format constraints are a flat bullet list. | Convert to "before emitting, confirm" checklist.

### Refactoring / Quality

**refactoring/SKILL.md** (92 ln) — 1B/0W/2S *(scenario exists)*
- BLOCKER | gate | Scenario exists (`refactoring-001`) but no `## Benchmark` footer. | Add footer (this skill benchmarks strongly — see §2).
- SUGGESTION | budget | "When NOT to Refactor" (69-82) partly duplicates Always-On Guardrails (37-40). | Collapse; finish the back-reference.
- SUGGESTION | clarity | No inline before/after Extract-Method example. | Add one.

**mikado-method/SKILL.md** (114 ln) — 1B/1W/1S
- BLOCKER | gate | No footer + no scenario; always-revert / one-commit-per-leaf untestable. | Add `mikado-001-revert-discipline`.
- WARNING | activation | No output-shape cue despite mandated 3-part output (Mermaid map + plan + revert). | Add "produce a Mikado graph" trigger.
- SUGGESTION | budget | "What is the Mikado Method?" (27-33) is low-signal prose. | Trim.

**kano/SKILL.md** (133 ln) — 1B/0W/1S *(scenario exists)* — **PASS** in §2
- BLOCKER | gate | Scenario exists (`kano-001`) but no `## Benchmark` footer. | Add footer.
- SUGGESTION | budget | Evaluation matrix (69-78) restates classification table (30-36). | Cross-reference.

**cupid-checker/SKILL.md** (96 ln) — 1B/1W/1S
- BLOCKER | gate | No footer + no scenario; mandated 5-property output untested. | Add `cupid-001`.
- WARNING | activation | Description is one ~80-word prose blob (L4). | Reformat to `TRIGGER when:` bullets.
- SUGGESTION | budget | Green/red table (83-89) overlaps `references/cupid-properties.md`. | Single source; table points to reference.

**oop-principles/SKILL.md** (60 ln, router) — 0B/2W/1S
- WARNING | gate | Lacks `user-invocable: false` yet routes to two sub-skills marked so; also has standalone content (Seven Rules) muddying router/leaf identity. | Decide router-vs-hybrid; if router, move Seven Rules into a sub-skill.
- WARNING | activation | Body answers class-shape questions inline (30-52) instead of dispatching. | Add explicit dispatch rule.
- SUGGESTION | gate | No dispatch-correctness scenario. | Add one.

**oop-principles/design-patterns/SKILL.md** (144 ln) — 1B/1W/1S
- BLOCKER | budget | 5 full inline TS examples (52-135) duplicate `references/patterns.md` ("→ Full examples" repeated under each); they teach the patterns, not unique failure modes. | Cut inline code to one-line summaries (as already done at 139-143); defer to patterns.md.
- WARNING | gate | `user-invocable: false` set, but no dispatch scenario. | Add one for pattern-named queries.
- SUGGESTION | budget | Pattern Summaries (49-143) restate the Selector table (17-30). | Merge "when to use" into the selector.

**oop-principles/solid/SKILL.md** (35 ln) — 0B/2W/1S
- WARNING | budget | "Concepts" (24-33) restates Quick Reference table (15-21) almost verbatim. | Drop Concepts; fold the fix snippet into the table.
- WARNING | gate | `user-invocable: false` set, no scenario. | Add a SOLID-violation scenario.
- SUGGESTION | clarity | No inline before/after (e.g. DIP). | Add one.

**composing-software/SKILL.md** (97 ln) — 1B/0W/2S
- BLOCKER | gate | No footer + no scenario; broadest overlap-prone trigger surface (vs oop) with no mis-activation gate. | Add scenario incl. an anti-trigger case (class/SOLID query defers).
- SUGGESTION | budget | Anti-patterns (74-81) & Composition-vs-Inheritance checklist (60-68) overlap. | Cross-reference.
- SUGGESTION | clarity | No inline pipe/compose before/after. | Add one.

### Architecture / Docs

**rest-api-design/SKILL.md** (283 ln) — 1B/2W/1S *(scenario exists)* — **PASS** in §2
- BLOCKER | gate | Scenario exists (`rest-api-001`) but no `## Benchmark` footer. | Add footer.
- WARNING | budget | Largest pack; "Modern Notes" (268-275) restates JSONP/RFC7807/cursor/idempotency already inline. | Cut or collapse to a one-line changelog.
- WARNING | budget | Three overlapping checklists — Review (246-252), Pre-Launch (254-266), Anti-Patterns (234-244). | Merge into one Blocker/Concern/Nit table.
- SUGGESTION | clarity | Two error shapes (Response Envelope L68 + Error Envelope L83) to reconcile. | Consolidate under one heading.

**c4-diagram/SKILL.md** (80 ln) — 0B/1W/1S
- WARNING | gate | No footer + no scenario. | Add "draw the architecture of X" scenario.
- SUGGESTION | activation | Cross-skill handoff from explain-code is the only dispatch cue, easy to miss. | Note the bidirectional contract.

**explain-code/SKILL.md** (53 ln) — 0B/1W/2S
- WARNING | gate | No footer + no scenario. | Add "explain how this service works" scenario.
- SUGGESTION | clarity | Workflow steps (16-23) not framed as do-not-omit (analogy/gotcha skippable). | Mark analogy + gotcha as required.
- SUGGESTION | budget | Three examples (26-53) share identical Analogy/Walkthrough/Gotcha structure. | Keep one full; reduce others to scale notes.

**ports-adapters-architecture/SKILL.md** (91 ln) — 0B/1W/2S
- WARNING | gate | No footer + no scenario. | Add "refactor to hexagonal" scenario.
- SUGGESTION | activation | "clean/onion/layered comparison" (L7) may over-trigger. | Scope to "...vs hexagonal".
- SUGGESTION | budget | `for_<action>` naming stated twice (L60, L78). | Cite once.

**markdown/SKILL.md** (65 ln) — 0B/1W/1S
- WARNING | gate | No footer + no scenario. | Add "GFM alert/footnote" scenario.
- SUGGESTION | activation | Title uses inconsistent `# SKILL:` prefix (L12). | Rename to `# GitHub Flavored Markdown`.

**writing-a-good-claude-md/SKILL.md** (98 ln) — 0B/1W/2S
- WARNING | gate | No footer + no scenario. | Add "audit my CLAUDE.md" scenario.
- SUGGESTION | budget | "Six Principles" table (29-38) overlaps "Audit Checklist" (42-53). | Cross-link instead of restating.
- SUGGESTION | clarity | Title `# writing-a-good-claude-md Skill` repeats raw slug (L8). | Rename to `# Writing a Good CLAUDE.md`.

### Version Control / Workflow *(all 5 lack scenario + footer)*

**git-hero/SKILL.md** (72 ln, router) — 1B/2W/2S
- BLOCKER | gate | No footer + no router-dispatch scenario. | Add footer + `git-hero-001`.
- WARNING | activation | Router hosts Commit Discipline (30-64) overlapping `git-guru`'s scope. | Move into git-guru/reference.
- WARNING | gate | Lacks `user-invocable: false` despite being a router (L5). | Add it or document hybrid.
- SUGGESTION | clarity | Routing duplicated (frontmatter 7-12 vs table 24-26). | One source.
- SUGGESTION | budget | Three commit examples (51-53) teach the format once. | Trim or annotate distinct cases.

**git-hero/git-guru/SKILL.md** (102 ln) — 1B/3W/1S
- BLOCKER | gate | No footer + no scenario. | Add footer + "undo a pushed commit" scenario.
- WARNING | activation | ~600-char run-on description (L3), no `DO NOT USE`, over-claims. | Add anti-trigger; tighten.
- WARNING | budget | Internals duplicated inline (62-80) AND as on-demand reads (L96, L99). | Pick one.
- WARNING | budget | Two Read-On-Demand mechanisms (32-34 vs 94-101); `commit-anatomy.md` vs `commit.md` filename conflict. | Consolidate; verify filename.
- SUGGESTION | clarity | Destructive-op safety buried as step 4 (L50). | Promote to standalone do-not-omit rule.

**git-hero/gitlab-dag/SKILL.md** (96 ln) — 1B/1W/2S
- BLOCKER | gate | No footer + no scenario. | Add "convert stage-ordered pipeline to `needs:`" scenario.
- WARNING | activation | No `DO NOT USE`, no failure-cue triggers ("pipeline too slow"). | Add cues + anti-trigger (non-GitLab CI).
- SUGGESTION | clarity | Output-format checklist buried at end (89-95). | Move near top as the contract.
- SUGGESTION | budget | Markdown-breaking unbalanced backtick at L79. | Backtick only `parallel:matrix`.

**git-hero/gitmoji/SKILL.md** (124 ln) — 1B/1W/2S
- BLOCKER | gate | No footer + no scenario. | Add "emoji for a security fix" (`🔒️` override) scenario.
- WARNING | activation | No `DO NOT USE` clause. | Add (plain Conventional Commits, no emoji).
- SUGGESTION | budget | "Top 20 Quick Reference" (97-120) re-lists emoji from earlier tables. | Drop or keep only uncovered.
- SUGGESTION | clarity | No top-level selection checklist; override is prose (L43). | Add 3-step pick-an-emoji checklist.

**logging-daily-progress/SKILL.md** (108 ln) — 1B/0W/2S
- BLOCKER | gate | No footer + no scenario. | Add "log today" (confirm-before-write + Impact/Learnings/Commits shape) scenario.
- SUGGESTION | budget | Cadence variants (87-92) restate triggers (5-10) + workflow step 3 (62-64). | Fold into workflow/triggers.
- SUGGESTION | clarity | Critical "draft then show before writing" gate buried as last sub-bullet of step 5 (L79). | Promote to its own step.

---

## 4. Recommended Next Actions (prioritized)

### P0 — Correctness regression (do first)
1. **Patch `tcrdd`** — benchmarked **FAIL** (sonnet -67%, haiku -66%). Add an autonomous-mode path ("run the loop, approval gates optional") + an explicit anti-one-shot guard. Re-run `tcrdd-001` to confirm the regression clears (`regression-triage.md` exit criteria).

### P1 — Wire the gate (universal, highest leverage)
2. **Add `## Benchmark` footers to the 5 skills that already have scenarios** — `kano`, `refactoring`, `rest-api-design`, `typescript-type-system`, `tcrdd` (post-fix). The runs in `.benchmarks/runs/2026-06-14/` already supply the deltas. This alone clears 5 of the "Blockers".
3. **Decide the TypeScript footer convention** — either move `run-history.md`/`RELEASE_GATES.md` data into footers, or add a one-line pointer so the gate is discoverable.

### P2 — Author missing scenarios for high-value skills
4. Golang (7 skills, 0 scenarios) — start with `concurrency` (races/leaks) and `error-handling` (`%w` vs `%v`), the highest-regression-risk topics.
5. `composing-software`, `cupid-checker`, `mikado-method` — each mandates a specific output shape with no gate.
6. Harden `typescript-001` — current scenario is saturated (SOFT PASS, ceiling effect); add state-transition / branded-id variants.

### P3 — Add anti-trigger clauses (mis-activation risk)
7. Add `DO NOT USE` to: `javascript`, `typescript-zod`, `typescript-type-system`, `chicken-scheme`, `golang/web`, `git-guru`, `gitlab-dag`, `gitmoji`.

### P4 — Context-budget trims (no behavior change, pure savings)
8. Golang ×5 — remove anti-pattern tables that restate decision tables.
9. `rest-api-design` — merge 3 overlapping checklists + cut "Modern Notes" (283→~230 ln).
10. `design-patterns` — cut 5 inline code blocks to one-line summaries (defer to `references/patterns.md`).
11. `solid` — drop "Concepts" (duplicates the table).

### P5 — Structural / hygiene
12. Clarify routers — add `user-invocable: false` to `git-hero` & `oop-principles`; move leaf content out of `golang`, `typescript`, `git-hero` routers.
13. Delete stale `testing/references/smoke-tests.md` (SKILL.md:79 says it was moved; file still on disk).
14. Fix `gitlab-dag` L79 unbalanced backtick; rename inconsistent titles (`markdown`, `writing-a-good-claude-md`).
15. Add integrated examples to: `chicken-scheme`, `testing`, `smoke-tests`, `review`, `show-me-the-code`, `explain-code`.

---

## 5. Backlog Application Status (2026-06-24)

Branch `chore/apply-skill-optimization-backlog`. Text/static portion of the backlog applied; live benchmark runs are the only remaining step.

| Item | Status |
|------|--------|
| **P0** tcrdd regression | **FIXED + CONFIRMED.** Added Mode (autonomous path), one-step-at-a-time guard, baby-step vs one-shot example. Re-ran `tcrdd-001` (2026-06-25, 3 models × with/without): sonnet 33%→100%, haiku 17%→83%, opus 100%. No negative delta — regression cleared, gate PASS. |
| **P1** benchmark footers | **Done.** Footers added to `kano`, `refactoring`, `rest-api-design`, `typescript/type-system`, `tcrdd` (from 2026-06-14 run data); `typescript` router gets a pointer to the leaf footer + side-files. Footer count 1 → 12. |
| **P2** missing scenarios | **Authored + run + follow-ups closed** (6). Benchmarked 2026-06-25. After follow-ups: **6 PASS/clean** — `golang-error-handling` (haiku +33), `composing-software` (haiku 0→83), `cupid-checker` (+25–37), `mikado-method` (+43–71), `golang-concurrency` (PASS after salience edit, haiku +28), `typescript-002` (NEUTRAL — earlier −16 was noise, N=3 shows haiku +11). See per-skill footers. |
| **P3** anti-triggers | **Done.** `DO NOT USE` added to `javascript`, `typescript/zod`, `typescript/type-system`, `golang/web`, `git-guru`, `gitlab-dag`, `gitmoji` (`chicken-scheme` already had one). |
| **P4** budget trims | **Done.** golang ×5 dedup, `rest-api-design` 3 checklists → 1 + cut Modern Notes, `design-patterns` inline code → summaries, `solid` Concepts dropped. ~260 lines saved, behavior-neutral. |
| **P5** hygiene | **Done.** `user-invocable: false` on `git-hero`/`oop-principles` routers; deleted stale `testing/references/smoke-tests.md`; fixed `gitlab-dag` backtick; renamed `markdown`/`writing-a-good-claude-md` titles; integrated examples added to `chicken-scheme`, `testing`, `smoke-tests`, `review`, `show-me-the-code` (`explain-code` already had them). |

### Benchmark runs — DONE (2026-06-25)

All footers now carry run data. `tcrdd-001` post-fix cleared its regression (gate PASS). The P2 batch (7 scenarios × 3 models × with/without = 42 cells + 42 gradings) ran via Workflow `skill-benchmark-batch`. Outcomes:

- **PASS (5):** `communication-001`, `golang-error-handling-001`, `composing-software-001`, `cupid-checker-001`, `mikado-method-001`.
- **NEUTRAL→PASS (1):** `golang-concurrency-001` — first pass zero lift; fixed by front-loading a "check every time" review checklist → re-run (N=3) opus +16 / sonnet +11 / **haiku +28**.
- **FAIL→NEUTRAL (1):** `typescript-002` — the haiku −16% was **noise**; repeat-sample (N=3) shows haiku **+11%**, no real regression. Scenario is hard (opus caps 67% even with skill).

### Follow-ups — CLOSED (2026-06-25)

1. ✅ **`typescript-002` regression** — re-run N=3 via Workflow `skill-benchmark-followups`; confirmed noise, no triage needed.
2. ✅ **`golang-concurrency` flat** — added imperative review checklist (exit path, cancellation, bounded fan-out, unbuffered coupling, errgroup, loop-var, -race); now PASS.

### ⏳ Optional, non-blocking

- **`mikado-method` haiku** — RESOLVED: the 57% was single-run noise; N=6 re-run scored 100% on every sample. No edit needed.
- **`communication` (86%) / `typescript-002` (67%) on haiku** — gains real, ceilings modestly lower; optional weak-model salience pass, though given the mikado/ts-002 noise findings, **re-sample at N≥3 first** before treating either ceiling as real.

---

## Appendix — Method & Caveats

- **Static audit**: 6 parallel read-only agents, one per skill cluster, scoring against the 4-axis rubric derived from `.agents/skills/skill-optimizer/rules/`.
- **Benchmark**: 5 orchestrator agents, each running 3 models × {baseline, skill-on} = 30 generation runs + grading, raw logs in `.benchmarks/runs/2026-06-14/`.
- **Caveats**: Scores are single-run (no repeat sampling → ±1 criterion noise possible); grading was LLM-judged against the scenario checklists. Severity tagging of the gate gap was inconsistent across audit agents — normalized in §1. Model `claude-opus-4-7` in the rule defaults was superseded by `claude-opus-4-8`.
