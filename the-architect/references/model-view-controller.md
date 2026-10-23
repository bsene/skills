# Model-View-Controller

MVC separates an interactive program into the state users care about, what shows that state, and what changes it. It is a general approach, not a single rigid pattern; most disagreements are about which variant is meant.

## Roles

| Part       | Responsibility                                                    | Must not                                 |
| ---------- | ----------------------------------------------------------------- | ---------------------------------------- |
| Model      | Holds state and the rules that act on it; announces its changes   | Know any concrete view or widget         |
| View       | Renders (part of) the model; one model can have several views     | Hold business rules or mutate the model  |
| Controller | Turns user input into model changes; mediates and validates input | Become a god class steering every object |

Slogan: smart models, thin controllers, dumb views.

Mnemonic: view = the user's eyes, controller = hands, model = mind. Reenskaug counted a fourth object, the user, who holds several views of the model at once; that is why view and controller are factored apart.

## The mechanism: Observer

The model notifies attached views of change; views pull the values they need. Without notification you are left with input-process-output plus setters and objects poking inside each other. Direct calls are an acceptable simplification when only one view exists.

```text
user input -> Controller -> Model.update()
                              |  changed notification
                              v
                       View(s) re-read Model and redraw
```

## Original Smalltalk-80 MVC

Reenskaug sketched it at Xerox PARC in 1978-79 (first as Thing-Model-View-Editor); Smalltalk-80 shipped it as the framework for every window.

| Piece        | Smalltalk-80 detail                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| Model        | Any object. `Object` implements the dependents protocol, so no base class or interface is needed               |
| Notification | Model runs `self changed: #aspect`; each dependent receives `update: #aspect` and decides what to redraw       |
| Wiring       | `model addDependent: view`; a view knows exactly one model and one controller, a controller one model and view |
| View         | `displayView` / `displayOn:` draw within a display box; views nest as superview / subviews                     |
| Controller   | Owns input for its view. Control is granted to the controller whose view contains the cursor                   |
| Control loop | Active controller loops `isControlActive` -> `controlActivity`, polling mouse and keyboard; no event queue     |
| Scheduling   | A global controller manager hands control between top-level windows' controllers                               |

```smalltalk
"Model: announces, never references a view"
Counter >> increment
    count := count + 1.
    self changed: #count

"View: pulls on update"
CounterView >> update: aspect
    aspect == #count ifTrue: [self display]
```

What to keep from the original:

- The model is plain and view-ignorant; the dependents mechanism is the only link.
- Change notice carries an aspect, not data; views pull what they show.
- Input handling is its own object, so it can be swapped or faked.

What later frameworks changed: widget toolkits own event dispatch (no polling controller), views and controllers merge, and pluggable views take aspect/selector parameters instead of subclassing. The Smalltalk language side is in the `smalltalk-pharo` skill.

## When it earns its place

- Several views or input devices over one model (tree and list of the same data, GUI plus MIDI or script controller, VT-100 vs window).
- A model that must stay testable without a screen.
- It is weak for non-interactive code (a compiler, a batch report); plain input-process-output is enough there.

## Common confusions

| Confusion                         | Reality                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Controller" means two things     | Smalltalk: input handler tied to a view. Web: request handler / application controller (Fowler) |
| Any three layers is MVC           | Three layers with no change notification is layered design, not MVC                             |
| Views/models are freely swappable | Only if substitutes honour the exact same interface toward the controller                       |
| "Model" is the database table     | The model is behaviour plus state; a data-only bean forces logic into the controller            |
| Server-side web is MVC            | Approximates it; the request/response cycle has no live observer push                           |
| On-screen widgets are controllers | Often they are views; the real controllers are mouse and keyboard (blurred on touch UIs)        |

## Variants

| Variant                          | Difference                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Model-View-Presenter (Taligent)  | Presenter coordinates and wires objects; interactors map events to commands/selections on the model |
| Presentation-Abstraction-Control | Hierarchy of agents; a mediator keeps view and model fully decoupled                                |
| Application model (two models)   | A domain model plus a UI-state model (selection, edit buffers) between it and the view              |
| Document-View (MFC)              | Document = model; frame/view merge view and controller                                              |

## Testing

Driving the controller through the real view makes tests slow and coupled. Keep input handlers as separate classes, instantiate them with fakes, fire events directly, and assert on the model. Domain logic then needs no view at all.

## Relation to this skill

MVC sits on the delivery side of a boundary: views and controllers are adapters, the model is the policy they call. In a hexagonal layout the controller is an inbound adapter driving a use-case port. See [Ports and Adapters](ports-adapters.md). Origins in Smalltalk: see the `smalltalk-pharo` skill.

## Source

Paraphrased from Reenskaug's MVC notes (https://folk.universitetetioslo.no/trygver/themes/mvc/mvc-index.html), Krasner and Pope, "A Cookbook for Using the Model-View-Controller User Interface Paradigm in Smalltalk-80" (JOOP, 1988), and the c2 wiki pages ModelViewController and ModelViewPresenter (https://wiki.c2.com/?ModelViewController, https://wiki.c2.com/?ModelViewPresenter).
