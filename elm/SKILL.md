---
name: elm
description: >
  Write, review, and debug Elm front-end code — The Elm Architecture (Model/Msg/update/view), custom types, Maybe/Result, JSON decoders, Cmd/Sub, HTTP, and JavaScript ports.

  TRIGGER when: Elm, .elm files, elm.json, elm make, elm-test, elm-format, elm reactor, Html.Attributes, Browser.element/sandbox/application,
  `update : Msg -> Model -> ( Model, Cmd Msg )`, Json.Decode/Json.Encode, decoder errors, port module, ports, flags, Elm HTTP requests,
  Maybe/Result handling, "no runtime exceptions" front end, or converting a JS/React app to Elm.
  DO NOT USE for PureScript, ReasonML/ReScript, or generic TypeScript UI work.
metadata:
  user-invocable: "false"
---

# Elm

Pure, statically typed language compiling to JavaScript, with no runtime exceptions in practice and enforced architecture. Source: _Programming Elm_ (Jeremy Fairbank, Pragmatic Bookshelf); paraphrased.

## The Elm Architecture

| Piece                                         | Role                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Model`                                       | Single record holding all app state                                                      |
| `Msg`                                         | Custom type listing every event that can happen                                          |
| `update : Msg -> Model -> ( Model, Cmd Msg )` | Only place state changes; `case` on `Msg`                                                |
| `view : Model -> Html Msg`                    | Pure render; events produce `Msg` values                                                 |
| `subscriptions`                               | `Sub Msg` for time, websockets, port input                                               |
| `Cmd`                                         | Describes an effect (HTTP, port out, random); runtime performs it and sends back a `Msg` |

Entry points: `Browser.sandbox` (no effects), `Browser.element` (effects, flags, embeddable), `Browser.application` (URL routing).

```elm
type Msg = Increment | GotUser (Result Http.Error User)

update msg model =
    case msg of
        Increment -> ( { model | count = model.count + 1 }, Cmd.none )
        GotUser (Ok u) -> ( { model | user = Just u }, Cmd.none )
        GotUser (Err _) -> ( { model | error = Just "load failed" }, Cmd.none )
```

## Types that remove bugs

- Custom types model states exactly; replace booleans and nullable fields: `type Remote a = Loading | Failed Http.Error | Loaded a`.
- `Maybe` replaces null, `Result err ok` replaces exceptions; the compiler forces every `case` branch.
- Type aliases (`type alias User = {...}`) give the record a constructor function usable in decoders.
- Write annotations on top-level functions; read compiler messages, they are prescriptive.
- Make impossible states unrepresentable instead of validating at runtime.

## JSON decoders

| Task                     | Tool                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| Primitive / field / list | `Decode.string`, `Decode.field "x" ...`, `Decode.list d`                                  |
| Build a record           | `Decode.map3 User a b c`, or `elm-json-decode-pipeline` (`required`, `optional`)          |
| Optional or nullable     | `Decode.maybe`, `Decode.nullable`, `optional "k" d default`                               |
| Variants                 | `Decode.andThen` on a tag field, `Decode.succeed`/`Decode.fail`                           |
| Run                      | `Decode.decodeString`; HTTP: `Http.get { url, expect = Http.expectJson GotUser decoder }` |

Decoders validate untrusted data at the boundary; a failed decode is a `Result`, never a crash. Encode with `Json.Encode.object [ ( "k", Encode.string v ) ]`.

## Ports and flags

- Flags: initial JS data passed to `init` (decode it; use `Decode.Value` to stay safe).
- `port module Main exposing (..)`; outgoing `port save : Encode.Value -> Cmd msg`; incoming `port onData : (Decode.Value -> msg) -> Sub msg`.
- JS side: `app.ports.save.subscribe(fn)` and `app.ports.onData.send(v)`.
- Always decode incoming port values; keep ports few and message-shaped. Use them for localStorage, third-party JS libs, and custom elements.

## Tooling

| Task              | Command                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| Init / dev server | `elm init`, `elm reactor`                                                  |
| Build             | `elm make src/Main.elm --output=main.js` (add `--optimize` for production) |
| Test              | `elm-test` (`Test`, `Expect`, fuzz tests)                                  |
| Format            | `elm-format --validate src/`                                               |

## Review checklist

1. State changes live only in `update`; `view` has no logic beyond rendering.
2. No catch-all `_ ->` hiding new `Msg` or custom-type variants.
3. External data (HTTP, flags, ports) goes through decoders.
4. Large models split into modules with their own `Msg`, mapped with `Html.map`/`Cmd.map`.
