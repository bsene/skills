# ReScript JSX & React

React-specific setup the SKILL.md component snippet doesn't cover: hooks bindings, JSX v4 config, `preserve` mode, framework scaffolding. Loaded on demand.

Stack as of ReScript 12.x: **`@rescript/react` 0.15.x** bindings + **JSX version 4** (the only version — `v3` and `mode` keys are gone from valid config).

## Component anatomy (the full shape)

Every component is a `make` function; `@react.component` derives the JSX tag machinery from its labeled args:

```rescript
@react.component
let make = (~name, ~count=?, ~onOk=?, ~children, ()) => {
  // ~count and ~onOk arrive as option<int> / option<event => unit>
  let shownCount = count->Option.value(~default=0)
  <div>
    {React.string(`Hello ${name} (${shownCount->Int.toString})`)}
    {React.array(children)}
    <button onClick={e => onOk->Option.forEach(ok => ok(e))}> {React.string("OK")} </button>
  </div>
}
```

Rules that differ from TSX:

- **`children` is a named prop** — label it `~children` to receive it, pass it like any other prop at call sites. The v3 `...children` spread on *components* is removed.
- **Optional props are `option`** — unwrap with `Option`; don't forward them downstream as-if-defined.
- **No class components, no default/name export games** — one `make` per module (per default JSX config); components-as-tags come from the derive, not from writing a `(props) => ...` arrow.
- Everything inside JSX is an expression — conditional rendering is a `switch`, not `condition && <x/>` habit:
  ```rescript
  {switch user {
   | Some(u) => <Profile user={u} />
   | None => <Spinner />
  }}
  ```
- Text nodes are *not* auto-stringified in bindings-land — wrap JS strings: `{React.string(s)}`. Raw string interpolation inside JSX children compiles fine, but the type error you get from a bare non-element is the reminder, read it.
- Context / refs / portals all exist as typed bindings (`React.useContext`, `React.useRef`, `React.createPortal`) — prefer those over hand-rolling `@send` bindings; hand-rolled hooks bindings miss dependency-array semantics (below).

## Hooks — the dependency-array trap

The React bindings type hooks directly, so a wrong-size dependency array is a *type error*, not a silent lint warning. Write them and let the compiler check:

```rescript
let (state, setState) = React.useState(() => 0)

React.useEffect(() => {
  let id = setInterval(() => setState(s => s + 1), 1000)
  Some(() => clearInterval(id))   // return cleanup as option, Some = teardown exists
}, [countLikeValue])               // wrong arity in here = compile error
```

Details people get wrong: `useEffect` with deps uses the *typed* tuple form (deps count is part of the type), the cleanup return is `option<unit => unit>` (`None` for no-cleanup), and `useState` takes a `() => 'a` *thunk*, not a value — mirror the JS semantics, don't "fix" the function type.

## rescript.json — JSX block

```json
{
  "jsx": { "version": 4 },
  "dependencies": ["@rescript/react"]
}
```

That's the whole required config: v4 is the only version and automatic-mode always applies (no `mode` key). The new optional knob:

- **`"preserve": true`** — emits JSX verbatim into the JS instead of lowering it to `React.createElement` calls. Use when the *bundler* owns JSX transforms (esbuild / SWC / Babel with a React preset): ReScript stays out of the createElement business, the JS pipeline stays one source of truth, and React's dev-mode transforms (incl. some fast-refresh setups) behave as in a TS project. Default off; flip it on only when there's actually a JS bundler step doing JSX.

## Framework scaffolding

- **`npx create-rescript-app`** templates: Next.js, Vite React, Node. Start there; hand-assembling the Vite toolchain from blog posts is the error path — the templates pin the working rewatch/esbuild/Vite wiring.
- **Next.js**: ReScript emits into the app via in-source ESM and pages import the `.res.js` modules like any TS module; keep `rescript watch` running alongside `next dev`, don't chain one into the other via npm scripts.
- **Vite**: Vite shouldn't process `.res` files, only their `.res.js` output — the template's config excludes `src` ReScript files and everything ends in a normal ESM import. If a fresh `.res` file isn't being picked up, the usual cause is HMR watching the wrong dir, not the config being wrong.
- **Library distribution**: emit ESM + genType for TS consumers when the package is consumed outside ReScript (see [interop-and-runtime.md](interop-and-runtime.md)); ship the `.res.js`, not the `.res` sources — downstream editors don't need ReScript LSP to *use* it.