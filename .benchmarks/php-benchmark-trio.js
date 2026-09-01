export const meta = {
  name: 'php-benchmark-trio',
  description: 'Benchmark the php skill (3 scenarios) across 3 models x with/without, grade against criteria, return deltas',
  phases: [
    { title: 'Generate', detail: '18 cells: 3 scenarios x 3 models x 2 conditions, text-only responses' },
    { title: 'Grade', detail: 'strict per-criterion scoring of each response' },
  ],
}

const BASE = '/Users/birrame.sene/workspace/github/skills'

const SCENARIOS = [
  {
    id: 'php-001-stdlib-edge-cases', skill: 'php', path: `${BASE}/php/SKILL.md`,
    prompt: String.raw`Write a PHP 8 utility parse_webhook(array $headers, string $body): array for a webhook endpoint. It must:

1. Find the value of the X-Request-Id header in $headers (an assoc array like ['Content-Type' => 'application/json', 'x-request-id' => 'abc123']) case-insensitively — the key casing varies between clients.
2. Validate $body as JSON and decode it; on invalid JSON return ['error' => 'invalid_json'].
3. Take the decoded event field (a string like 'invoice.paid.v2') and check whether it starts with 'invoice.'; if so, extract the route pattern — everything up to and including the first dot-separated segment after 'invoice' (e.g. 'invoice.paid').
4. Look up the extracted pattern in KNOWN_ROUTES (a defined constant: ['invoice.paid', 'invoice.void']); return ['route' => <pattern>, 'request_id' => <id>] when found, ['error' => 'unknown_route'] when not.

Explain briefly, in comments or prose, which return values you relied on for each check.`,
    criteria: [
      'Uses strpos/stripos with ($haystack, $needle) argument order (haystack first) in every call',
      'Checks match results with strict comparisons (!== false, === 0) — never loose truthiness on any function that can return 0 or false (strpos/stripos, preg_match, array_search)',
      'Distinguishes array_search/in_array returning key 0/true on a legitimate first-element match from a miss (strict comparison, and passes true for the $strict parameter where types matter)',
      "Handles json_decode's null ambiguity via json_last_error()/json_last_error_msg() or JSON_THROW_ON_ERROR — not a bare $data === null check alone",
      "Distinguishes preg_match returning false (PCRE error) from 0 (no match) via a strict check or any approach that cannot conflate the two",
      'Names php.net (URL or explicit reference tied to the specific functions in question) as the verification source for signature/return-behavior claims — not Stack Overflow/w3schools; a generic "see php.net" line disconnected from the claims does not count',
    ],
  },
  {
    id: 'php-002-php8-migration', skill: 'php', path: `${BASE}/php/SKILL.md`,
    prompt: String.raw`We're upgrading a legacy tool from PHP 5.6 to PHP 8. Review this snippet and rewrite it so it's clean, modern PHP 8 — flag everything that no longer works and replace it, but don't change what the code does:

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
}`,
    criteria: [
      'Flags each() as removed in PHP 8 and replaces the while (list(...) = each(...)) loop with foreach (no reset() needed)',
      'Flags create_function() as removed in PHP 8 and replaces it with a closure/anonymous function preserving the same comparison callback behavior',
      'Flags $event{0} curly brace offsets as removed in PHP 8 and replaces them with $event[0] bracket access',
      'Does NOT flag constructs that are fine on PHP 8 as deprecated/removed (str_contains(), fn() arrow functions, ??=)',
      'Replacement code preserves observable behavior — same sort order, same echoed output, same fallback semantics; does not silently change what the snippet does while modernizing',
      'States the PHP version where each removal landed (8.0) rather than a vague "newer PHP", citing php.net or the migration page as the source',
    ],
  },
  {
    id: 'php-003-laravel-noisy-context', skill: 'php', path: `${BASE}/php/SKILL.md`,
    prompt: String.raw`Context: Laravel 11 app, webhooks table gets ~40k rows/day, deploy to production is Friday, our Vite build randomly misses the admin CSS chunk on cold cache (annoying but unrelated), and ops says the staging deploy hung twice last week on queue workers.

Here's the controller we want reviewed — it's app/Http/Controllers/WebhookController.php:

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

Questions — answer each one, and for each answer, state which official documentation you verified against and give the URL:

1. $invoice->tags() relies on the Invoice–Tag relationship — is attach() on that relation the right call here, and what does it actually do to the pivot table?
2. Is the json_decode failure handling correct as written — can $payload === null ever miss a real decode error?
3. That array_filter($allowed, fn($e) => true, ARRAY_FILTER_USE_KEY) line looks suspicious — what does the third argument actually do, and is it doing anything useful here?
4. The ->reject(fn($a) => $a <= 0) chain on pluck('amount') — is that the idiomatic way to filter and sum payment amounts, or is there a better collection method?
5. Anything in the plain-PHP parts of this file you'd double-check against the language docs before Friday's deploy?`,
    criteria: [
      "For the Eloquent relationship / attach() and collection-method questions (1 and 4), points to Laravel's own docs (laravel.com/docs/...) as the authoritative source — NOT php.net",
      'For the core-PHP parts (json_decode failure semantics in 2, the ARRAY_FILTER_USE_KEY flag in 3), points to php.net — NOT Laravel docs',
      'Uses the canonical php.net function-page form for at least one citation (https://www.php.net/manual/en/function.<name-with-dashes>.php — dashes, not underscores)',
      'Does not misattribute: no claim that a Laravel-only helper (Arr::, collections, attach()) is documented on php.net, and no claim a core PHP function is a Laravel API',
      'Core-PHP answers are correct on substance: ARRAY_FILTER_USE_KEY passes the array key to the callback instead of the value (so with the callback ignoring it, the line is a no-op filter — flag it as useless/buggy), and the json_decode answer notes null is also a valid JSON literal so a bare === null check conflates a legitimate "null" payload with an error',
      'Explicitly says at least one thing needed no lookup because it is stable, well-known syntax — rather than hedging on everything',
    ],
  },
]

const MODELS = ['opus', 'sonnet', 'haiku']
const NOFILE = `Respond in TEXT ONLY. Do NOT create, edit, or delete any files. Do NOT run git or any shell/bash commands. Do NOT use any tools that modify the filesystem. Just write your answer as a chat reply.`

const GRADE_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    passes: { type: 'array', items: { type: 'boolean' }, description: 'one boolean per criterion, in order' },
  },
  required: ['passes'],
}

// args: optional array of scenario ids to run (default all) — used for triage re-runs
const RUN = Array.isArray(args) && args.length ? SCENARIOS.filter(s => args.includes(s.id)) : SCENARIOS

const cells = []
for (const s of RUN) for (const model of MODELS) for (const cond of ['without', 'with'])
  cells.push({ s, model, cond })

log(`Running ${cells.length} cells (${RUN.length} scenarios x ${MODELS.length} models x 2 conditions)`)

const graded = await pipeline(
  cells,
  (cell) => {
    const genPrompt = cell.cond === 'with'
      ? `You are an AI coding assistant. For guidance you MAY read ONLY this one file: ${cell.s.path} — read nothing else, and do NOT read anything under .benchmarks/. ${NOFILE}\n\nUser request:\n${cell.s.prompt}`
      : `You are an AI coding assistant. ${NOFILE} Do NOT read any skill files.\n\nUser request:\n${cell.s.prompt}`
    return agent(genPrompt, { model: cell.model, phase: 'Generate', label: `gen:${cell.s.id}:${cell.model}:${cell.cond}` })
  },
  (response, cell) => {
    if (!response) return { ...cell, score: null }
    const list = cell.s.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    const gradePrompt = `You are a strict benchmark grader. Score the RESPONSE against each criterion. Mark a criterion pass=true ONLY if the response clearly and substantively satisfies it; if absent, vague, or wrong, mark false. Criteria that say "does NOT ..." pass only if the response avoids that mistake.\n\nCRITERIA (${cell.s.criteria.length}):\n${list}\n\nRESPONSE:\n"""\n${response}\n"""\n\nReturn passes[] aligned to criteria order.`
    return agent(gradePrompt, { model: 'sonnet', phase: 'Grade', label: `grade:${cell.s.id}:${cell.model}:${cell.cond}`, schema: GRADE_SCHEMA })
      .then((g) => {
        const passes = (g && g.passes) || []
        const n = cell.s.criteria.length
        const passed = passes.slice(0, n).filter(Boolean).length
        return { id: cell.s.id, model: cell.model, cond: cell.cond, score: Math.round((passed / n) * 100), passes: passes.slice(0, n) }
      })
  },
)

const results = {}
for (const g of graded.filter(Boolean)) {
  if (g.score === null) continue
  results[g.id] = results[g.id] || {}
  results[g.id][g.model] = results[g.id][g.model] || {}
  results[g.id][g.model][g.cond] = { score: g.score, passes: g.passes }
}
for (const id of Object.keys(results))
  for (const m of Object.keys(results[id])) {
    const r = results[id][m]
    if (r.with != null && r.without != null) r.delta = r.with.score - r.without.score
  }

return results