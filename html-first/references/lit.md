# Lit (v3)

Primary reference: https://lit.dev/docs/ (package: `lit`)

## Minimal component

```ts
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("click-counter")
export class ClickCounter extends LitElement {
  static styles = css`
    button {
      font: inherit;
    }
  `;

  @property({ type: Number }) start = 0; // public, attribute-backed
  @state() private count = 0; // internal

  connectedCallback() {
    super.connectedCallback();
    this.count = this.start;
  }

  render() {
    return html`<button @click=${this.#inc}>${this.count}</button>`;
  }

  #inc() {
    this.count++;
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: this.count,
      }),
    );
  }
}
```

Without decorators (plain JS or no `experimentalDecorators`): `static properties = { start: { type: Number }, count: { state: true } }` and `customElements.define('click-counter', ClickCounter)`.

## Template syntax

| Syntax          | Meaning                         |
| --------------- | ------------------------------- |
| `${x}`          | Child expression (auto-escaped) |
| `.prop=${x}`    | Set property                    |
| `?attr=${bool}` | Boolean attribute               |
| `@event=${fn}`  | Listener (auto-bound to host)   |
| `attr=${x}`     | Attribute                       |

## Rules

- Properties are the API, `@state` is private. Never mutate objects/arrays in place; assign a new reference to trigger render.
- Lifecycle: `connectedCallback` -> `willUpdate` (derive values) -> `render` -> `firstUpdated`/`updated` (DOM access). `await this.updateComplete` in tests.
- Styles are scoped by Shadow DOM; theme through CSS custom properties and `::part()`. Opt out with `createRenderRoot() { return this; }` (light DOM) when you need global CSS or htmx selectors.
- Dispatch `bubbles: true, composed: true` events to cross the shadow boundary.
- Useful directives (`lit/directives/*.js`): `repeat` (keyed lists), `classMap`, `styleMap`, `ifDefined`, `when`, `live`.
- Shared state: `@lit/context` for DI, reactive controllers for reusable logic, `@lit-labs/ssr` for server rendering.
- Testing: `@open-wc/testing` or Web Test Runner; fixture, interact, `await el.updateComplete`.
