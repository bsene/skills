---
name: html-first
description: Build HTML-first front ends with htmx (hypermedia-driven, server-rendered partials) and Lit (standards-based web components). Use when the user mentions htmx, hx-get/hx-post/hx-swap/hx-target/hx-trigger, HX-Request headers, hypermedia, HATEOAS UIs, Lit, LitElement, lit-html, web components, custom elements, Shadow DOM, reactive properties, swapped content not updating, validation errors not rendering (422), custom element not upgrading after a swap, or asks for a React/SPA alternative with less JavaScript. DO NOT USE for React/Vue/Svelte apps or general TypeScript typing; use typescript instead.
---

# HTML-first front ends

Two complementary approaches, both leaning on the platform instead of a SPA framework.

| Need                                                       | Reach for                                                             | Reference                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| Server owns state; page updates by swapping HTML fragments | [htmx](https://htmx.org/)                                             | [references/htmx.md](references/htmx.md) |
| Reusable, encapsulated client-side widget (custom element) | [Lit](https://lit.dev/)                                               | [references/lit.md](references/lit.md)   |
| Both                                                       | htmx for page/data flow, Lit for leaf widgets (date pickers, editors) | below                                    |

## Decision rules

1. **Default to htmx** when the interaction is "send request, show server HTML". No JSON API, no client state store, no client router.
2. **Use Lit** only when the widget has real client-side state or must be reused across pages/apps. A custom element is plain DOM, so htmx can swap it in like any other markup.
3. **Do not hand-roll** fetch + `innerHTML` when `hx-*` covers it, and do not reach for Lit for static markup.
4. Keep the server authoritative: validate on the server, return 200 with HTML (htmx ignores headers on 3xx), escape all user content.

## Non-negotiables

1. Return HTML fragments from htmx endpoints, not JSON.
2. Return 200 (or handle `htmx:beforeSwap` for 4xx); do not rely on headers in 3xx.
3. Escape all user content; send the CSRF token via `hx-headers`.
4. In Lit, assign new references to change arrays/objects; do not mutate in place.
5. Do not omit `bubbles: true, composed: true` on events that must leave a shadow root.

## Integrated example

Request: "Inline-edit a user's rating, no SPA."

```html
<!-- server partial -->
<form
  hx-put="/users/1/rating"
  hx-target="this"
  hx-swap="outerHTML"
  hx-trigger="change"
>
  <my-rating name="stars" value="3"></my-rating>
</form>
```

`my-rating` is a form-associated Lit element ([references/lit.md](references/lit.md)); the server validates, then returns the same form re-rendered (200, with errors inline when invalid).

## Using both together

- Server returns `<my-rating value="3" name="stars"></my-rating>` inside an htmx partial; Lit upgrades it on swap automatically (custom element upgrade is native).
- Make the component a form participant (`static formAssociated = true` + `ElementInternals`) or dispatch a bubbling, composed `change` event so `hx-trigger="change"` and `hx-include` work.
- Shadow DOM hides inner nodes from htmx selectors and `hx-*` attributes: put `hx-*` on the host or on light-DOM elements, not inside a shadow root.

## Primary references

- htmx: https://htmx.org/docs/
- Lit: https://lit.dev/docs/
