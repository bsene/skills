---
name: php
description: Write, review, debug, or explain PHP code. Use whenever the user mentions PHP, .php files, Composer, PSR standards, or PHP frameworks (Laravel, Symfony, etc.), or asks about PHP language features, functions, or syntax. For anything beyond common knowledge — exact function signatures, parameter order, return types, edge-case behavior, deprecations, or version differences — verify against the official documentation at https://www.php.net/ (e.g. function pages like https://www.php.net/manual/en/function.array-filter.php) rather than relying on memory.
---

# PHP

Official reference: https://www.php.net/

When you state a verified signature, return behavior, or version fact, name the
php.net page you verified against — the specific function page
(e.g. `https://www.php.net/manual/en/function.strpos.php`), not a generic
"see php.net". When you answered from stable, well-known syntax with no lookup,
say so explicitly ("no lookup needed — core syntax") instead of hedging on
everything.

## When to check php.net

PHP has a large, inconsistent standard library (argument order, return types, and
null/false edge cases vary function to function, and behavior has shifted across
major versions). Don't guess on these — look them up:

- Exact function signature, parameter order/defaults, or return type
- Whether a function returns `false`, `null`, or throws on failure
- Behavior differences between PHP versions (e.g. PHP 7 vs 8 changes)
- Deprecated or removed functionality
- Anything the user flags as uncertain or asks you to confirm

For well-known language syntax and common patterns you're confident about, just
write the code — no need to look up every function.

## How to look it up

- General manual browsing / search: https://www.php.net/manual/en/
- A specific function: `https://www.php.net/manual/en/function.<name-with-dashes>.php`
  (underscores in the function name become dashes in the URL, e.g. `str_contains` →
  `function.str-contains.php`)
- A specific class/method (e.g. PDO, DateTime): `https://www.php.net/manual/en/class.<name>.php`
- Use `web_fetch` on these URLs, or `web_search` first if unsure of the exact page.

## Notes

- Prefer current, non-deprecated APIs; flag deprecated functions if the user's code uses one.
- Removed in PHP 8.0 (flag and replace on sight): `each()` → `foreach`,
  `create_function()` → closures, `$str{0}` curly-brace string offsets → `$str[0]`.
- If the user names a framework (Laravel, Symfony, WordPress, etc.), its own docs take
  precedence over php.net for framework-specific APIs — php.net is for core language/stdlib.

---

## Benchmark

Scenario: `.benchmarks/scenarios/php-001-stdlib-edge-cases.md` · Run: 2026-09-01 (salience re-run `wf_55504848`) · Log: `.benchmarks/runs/2026-09-01/php-001-stdlib-edge-cases.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 83%  | +0%   |
| claude-sonnet-4-6 | 83%     | 67%  | −16%  |
| claude-haiku-4-5  | 50%     | 67%  | +17%  |

> **NEG (run 2026-09-01)**. Salience re-run (citation imperative + PHP 8.0 removals line, wf_55504848): the universal 0% c6 citation criterion cleared on opus/sonnet. Remaining c1 miss is a criterion artifact — with-skill responses substitute `str_starts_with()` for `strpos()`, so the strict "uses strpos/stripos in every call" wording marks them false with zero argument-order errors; sonnet −16 rides the same artifact (reword queued for next cycle, see triage-decisions-2026-09-01.md). Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/php-002-php8-migration.md` · Run: 2026-09-01 (`wf_f90c5783`) · Log: `.benchmarks/runs/2026-09-01/php-002-php8-migration.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 50%     | 83%  | +33%  |
| claude-sonnet-4-6 | 67%     | 67%  | +0%   |
| claude-haiku-4-5  | 67%     | 83%  | +16%  |

> **PASS (run 2026-09-01)**. Skill drives create_function()→closure and the version-citation criterion: opus +33, haiku +16, no regressions. Sonnet misses behavior-preservation and version citation in both conditions — model gap, not skill harm. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.

Scenario: `.benchmarks/scenarios/php-003-laravel-noisy-context.md` · Run: 2026-09-01 (salience re-run `wf_55504848`) · Log: `.benchmarks/runs/2026-09-01/php-003-laravel-noisy-context.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 83%     | 100% | +17%  |
| claude-sonnet-4-6 | 67%     | 100% | +33%  |
| claude-haiku-4-5  | 83%     | 100% | +17%  |

> **PASS (run 2026-09-01)**. Salience re-run (citation/no-lookup imperative, wf_55504848): the universal 0% no-lookup criterion cleared with-skill on all 3 models — every with-skill response reaches 100%, routing framework APIs to laravel.com and core semantics to php.net. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
