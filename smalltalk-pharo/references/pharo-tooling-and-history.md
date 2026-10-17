# Pharo tooling, Spec, web, and history

Paraphrased from _Pharo by Example_, _Enterprise Pharo_ (Teapot chapter), _Spec UI Framework for Pharo_ (Fabry, Ducasse, 2017), the Pharo cheat sheet, Reenskaug's 1979 MVC notes, and Kay's _The Early History of Smalltalk_. Not available as text: `SmalltalkHistoryHOPL.pdf` (image-only scan, skipped).

## Spec (UI framework)

| Idea            | Note                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Presenter class | Subclass of `ComposableModel` (older Spec) or `SpPresenter` (Spec 2); owns widgets and domain wiring     |
| Widgets         | Created in an init method (`self newButton`, `self newList`); store in instance variables with accessors |
| Layout          | Declared separately (`SpecLayout composed` / Spec 2 `SpBoxLayout`), composing rows and columns           |
| Behaviour       | Register actions in an init-presenters step (`button action: [ ... ]`), not inside the layout            |
| Open            | `MyPresenter new openWithSpec` (Spec 2: `open`)                                                          |

Keep domain logic in the model; the presenter only translates between widgets and model.

## Teapot web service

```smalltalk
Teapot on
  GET: '/welcome' -> 'Hello';
  GET: '/user/<id>' -> [ :req | (req at: #id) asInteger printString ];
  start.
```

Teapot sits on Zinc HTTP; routes map patterns to blocks or static values, with converters, response codes, and JSON output helpers. Stop with `teapot stop`.

## Version control and packaging

- Iceberg manages Git repositories from the image; code is stored as Tonel files per class.
- A Metacello `BaselineOf...` class declares packages, dependencies, and groups; load with `Metacello new baseline: 'X'; repository: 'github://user/repo'; load`.
- Commit often; the image itself is not the source of truth.

## History in brief

- Smalltalk grew at Xerox PARC in the 1970s (Kay, Ingalls, Goldberg, others), driven by the Dynabook idea: a personal, programmable medium. Key design choices: everything is an object, objects communicate only by messages, and the system is its own live environment.
- Reenskaug (visiting PARC, 1978-79) introduced Model-View-Controller; his 1979 note uses Thing-Model-View-Editor vocabulary with a planning-system example. MVC spread through Smalltalk-80 and later influenced most UI frameworks.
- Lessons to reuse: small uniform core, late binding, live feedback, and separation of domain from presentation.
