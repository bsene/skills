---
id: php-003-laravel-noisy-context
skill: php
---

# Prompt

Context: Laravel 11 app, `webhooks` table gets ~40k rows/day, deploy to production is Friday, our Vite build randomly misses the admin CSS chunk on cold cache (annoying but unrelated), and ops says the staging deploy hung twice last week on queue workers.

Here's the controller we want reviewed — it's `app/Http/Controllers/WebhookController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class WebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = json_decode($request->getContent());
        if ($payload === null) {
            return response()->json(['error' => 'invalid_json'], 400);
        }

        $eventType = $payload->event ?? 'unknown';
        $allowed = config('webhooks.allowed_events', []);
        $relevant = array_filter($allowed, fn($e) => true, ARRAY_FILTER_USE_KEY);

        if (!in_array($eventType, $allowed)) {
            return response()->json(['error' => 'event_not_allowed'], 403);
        }

        $invoice = Invoice::where('external_id', $payload->id)->first();
        if (!$invoice) {
            return response()->json(['error' => 'invoice_not_found'], 404);
        }

        $tags = collect(explode(',', $payload->tags ?? ''))
            ->map(fn($t) => trim($t))
            ->filter()
            ->unique()
            ->values();

        $invoice->tags()->attach($tags->map(fn($t) => Tag::firstOrCreate(['name' => $t])->id)->all());

        $amounts = $invoice->payments()->pluck('amount')->reject(fn($a) => $a <= 0)->sum();
        $meta = Arr::only((array) $payload->metadata, ['source', 'attempt']);

        return response()->json([
            'event' => $eventType,
            'tags' => $tags->all(),
            'total' => $amounts,
            'meta' => $meta,
        ]);
    }
}
```

Questions — answer each one, and **for each answer, state which official documentation you verified against and give the URL**:

1. `$invoice->tags()` relies on the Invoice–Tag relationship — is `attach()` on that relation the right call here, and what does it actually do to the pivot table?
2. Is the `json_decode` failure handling correct as written — can `$payload === null` ever miss a real decode error?
3. That `array_filter($allowed, fn($e) => true, ARRAY_FILTER_USE_KEY)` line looks suspicious — what does the third argument actually do, and is it doing anything useful here?
4. The `->reject(fn($a) => $a <= 0)` chain on `pluck('amount')` — is that the idiomatic way to filter and sum payment amounts, or is there a better collection method?
5. Anything in the plain-PHP parts of this file you'd double-check against the language docs before Friday's deploy?

# Criteria

- [ ] For the Eloquent relationship / `attach()` and collection-method questions (1 and 4), points to Laravel's own docs (laravel.com/docs/…) as the authoritative source — NOT php.net
- [ ] For the core-PHP parts (`json_decode` failure semantics in 2, the `ARRAY_FILTER_USE_KEY` flag in 3), points to php.net — NOT Laravel docs
- [ ] Uses the canonical php.net function-page form for at least one citation (`https://www.php.net/manual/en/function.<name-with-dashes>.php` — dashes, not underscores)
- [ ] Does not misattribute: no claim that a Laravel-only helper (`Arr::`, collections, `attach()`) is documented on php.net, and no claim a core PHP function is a Laravel API
- [ ] Core-PHP answers are correct on substance: `ARRAY_FILTER_USE_KEY` passes the array key to the callback instead of the value (so with the callback ignoring it, the line is a no-op filter — flag it as useless/buggy), and the `json_decode` answer notes `null` is also a valid JSON literal so a bare `=== null` check conflates a legitimate `"null"` payload with an error
- [ ] Explicitly says at least one thing needed no lookup because it is stable, well-known syntax — rather than hedging on everything
