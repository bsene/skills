---
id: php-002-php8-migration
skill: php
---

# Prompt

We're upgrading a legacy tool from PHP 5.6 to PHP 8. Review this snippet and rewrite it so it's clean, modern PHP 8 — flag everything that no longer works and replace it, but don't change what the code does:

```php
<?php
define('KNOWN_ROUTES', ['invoice.paid', 'invoice.void']);

function route_label($event, $routes) {
    $prefix = 'invoice.';
    if (strpos($prefix, $event) === 0) {   // hmm, which order is right?
        return 'invoice';
    }
    $label = $event{0} === 'i' ? 'invoice-family' : 'other';
    return $label;
}

function sort_routes($routes) {
    usort($routes, create_function('$a, $b', 'return strcmp($a, $b);'));
    return $routes;
}

function dump_routes($routes) {
    reset($routes);
    while (list($key, $value) = each($routes)) {
        echo "$key => $value\n";
    }
}

$event = 'invoice.paid';
if (str_contains($event, 'invoice')) {
    $label = route_label($event, KNOWN_ROUTES) ?? 'unknown';
    $routes = sort_routes(KNOWN_ROUTES);
    dump_routes($routes);
    $short = fn($r) => count($r) > 0;
    $enabled ??= true;
}
```

# Criteria

- [ ] Flags `each()` as removed in PHP 8 and replaces the `while (list(...) = each(...))` loop with `foreach` (no `reset()` needed)
- [ ] Flags `create_function()` as removed in PHP 8 and replaces it with a closure/anonymous function preserving the same comparison callback behavior
- [ ] Flags `$event{0}` curly brace offsets as removed in PHP 8 and replaces them with `$event[0]` bracket access
- [ ] Does NOT flag constructs that are fine on PHP 8 as deprecated/removed (`str_contains()`, `fn()` arrow functions, `??=`)
- [ ] Replacement code preserves observable behavior — same sort order, same echoed output, same fallback semantics; does not silently change what the snippet does while modernizing
- [ ] States the PHP version where each removal landed (8.0) rather than a vague "newer PHP", citing php.net or the migration page as the source
