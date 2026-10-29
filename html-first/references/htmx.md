# htmx (v2)

Primary reference: https://htmx.org/docs/

## Core attributes

| Attribute                                                  | Purpose                                                                                                                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hx-get` / `hx-post` / `hx-put` / `hx-patch` / `hx-delete` | Issue the request on trigger                                                                                                                                           |
| `hx-trigger`                                               | Event; modifiers `once`, `changed`, `delay:500ms`, `throttle:`, `from:`; specials `load`, `revealed`, `intersect`, polling `every 2s`; filters `click[ctrlKey]`        |
| `hx-target`                                                | CSS selector or `this`, `closest`, `next`, `previous`, `find`                                                                                                          |
| `hx-swap`                                                  | `innerHTML` (default), `outerHTML`, `beforebegin`, `afterbegin`, `beforeend`, `afterend`, `delete`, `none`; modifiers `transition`, `swap`, `settle`, `scroll`, `show` |
| `hx-select`                                                | Swap only part of the response                                                                                                                                         |
| `hx-swap-oob`                                              | Update other elements by `id` from the same response                                                                                                                   |
| `hx-boost`                                                 | Turn links/forms into AJAX; degrades without JS                                                                                                                        |
| `hx-push-url`                                              | Push URL to history                                                                                                                                                    |
| `hx-indicator`                                             | Element that gets `htmx-request` class during a request                                                                                                                |

## Patterns

```html
<!-- Active search -->
<input
  name="q"
  hx-get="/search"
  hx-trigger="input changed delay:300ms"
  hx-target="#results"
  hx-indicator="#spinner"
/>
<div id="results"></div>

<!-- Inline delete, row removed on success -->
<tr>
  <td>Ada</td>
  <td>
    <button
      hx-delete="/users/1"
      hx-target="closest tr"
      hx-swap="outerHTML"
      hx-confirm="Delete?"
    >
      Delete
    </button>
  </td>
</tr>
```

Server: branch on `HX-Request: true` to return a partial; otherwise return the full page (also set `Vary: HX-Request` when caching).

## Headers

- Request: `HX-Request`, `HX-Target`, `HX-Trigger`, `HX-Boosted`, `HX-Current-URL`.
- Response: `HX-Redirect` (full load), `HX-Location` (no reload), `HX-Retarget`, `HX-Reswap`, `HX-Trigger` (fire client events), `HX-Push-Url`, `HX-Refresh`.
- Headers are ignored on 3xx; prefer 200.

## Events

`htmx:configRequest` (add headers/params), `htmx:beforeSwap` (e.g. allow swapping 4xx/422 validation HTML), `htmx:responseError`, `htmx:sendError`, `htmx:afterSwap`. Re-init third-party JS with `htmx.onLoad(fn)`. Debug with `htmx.logAll()`.

## Security

- Escape every untrusted value server-side; use `hx-disable` on regions rendering raw third-party HTML.
- CSRF: `hx-headers='{"X-CSRF-Token": "..."}'` on `<body>`.
- Config: `htmx.config.selfRequestsOnly`, `allowScriptTags`, `allowEval`; add a CSP.
- `hx-history="false"` on sensitive pages.
