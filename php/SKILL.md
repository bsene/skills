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
