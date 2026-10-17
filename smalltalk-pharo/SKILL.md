---
name: smalltalk-pharo
description: >
  Write and explain Smalltalk in Pharo — message-passing syntax, image-based live development, class definition, Pharo tools (Playground, Inspector, Debugger, System Browser, Iceberg, SUnit), Spec UI presenters, Teapot/Zinc web apps, and the Smalltalk/MVC origins.

  TRIGGER when: Smalltalk, Pharo, Squeak, .st files, Tonel, Iceberg, Metacello baseline, Playground, Inspector, System Browser, SUnit TestCase,
  unary/binary/keyword messages, `Object subclass: #Name`, `printIt`/`doIt`, `self halt`, `thisContext`, Spec / SpPresenter / ComposableModel,
  Teapot, Zinc, Roassal, Morphic, image/changes file, class-side methods, metaclass, MVC history (Reenskaug, Kay, Xerox PARC), or "everything is an object".
  DO NOT USE for Objective-C, Ruby, or generic OOP questions with no Smalltalk angle.
metadata:
  user-invocable: "false"
---

# Smalltalk and Pharo

Pure object language where everything (classes, blocks, the IDE) is a live object. Sources: _Pharo by Example_, _Enterprise Pharo_, _Spec UI Framework for Pharo_, the Pharo cheat sheet, Reenskaug's 1979 MVC note, and Kay's _The Early History of Smalltalk_; paraphrased. Details in [references/pharo-tooling-and-history.md](references/pharo-tooling-and-history.md).

## Language in one table

| Concept               | Rule                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Messages              | Unary `x size`, binary `3 + 4`, keyword `dict at: k put: v`; precedence unary > binary > keyword, otherwise left to right            |
| No operators/keywords | `ifTrue:`, `do:`, `whileTrue:` are ordinary messages to booleans, collections, blocks                                                |
| Cascade               | `OrderedCollection new add: 1; add: 2; yourself` sends all to the first receiver                                                     |
| Blocks                | `[ :x \| x * 2 ]` closures; evaluate with `value:`                                                                                   |
| Return                | `^` returns from method; no `^` returns `self` (hence `yourself` for builders)                                                       |
| Variables             | Temps `\| a b \|`, instance vars, class-side instance vars, globals start uppercase; `self`, `super`, `thisContext` pseudo-variables |
| Literals              | `#sym`, `'str'`, `$c`, `#(1 2 3)`, `{ 1+1. 2 }` dynamic array, `1/3` exact fraction                                                  |
| Class                 | Everything is an instance of a class; classes are instances of metaclasses; class-side methods hold constructors (`Point x: 1 y: 2`) |
| Dispatch              | Late-bound; `doesNotUnderstand:` is the fallback, so polymorphism replaces type checks                                               |

```smalltalk
Object subclass: #Account
  instanceVariableNames: 'balance' classVariableNames: '' package: 'Bank'.

Account >> deposit: amount
  amount <= 0 ifTrue: [ ^ self error: 'positive only' ].
  balance := (balance ifNil: [ 0 ]) + amount
```

## Image-based workflow

1. The image is a saved snapshot of all live objects; code is edited inside it, not compiled from files. Version it with Git through Iceberg (Tonel files) and a Metacello baseline.
2. Explore with Playground (`printIt` shows a result, `inspectIt` opens an Inspector), then browse senders/implementors in the System Browser.
3. Test-driven: write a failing SUnit test, run it, and let the Debugger create the missing method from the stack, then continue.
4. Prefer small methods and polymorphism; use `self halt` or the debugger instead of print logging.

## Tooling cheat sheet

| Task        | Tool                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Run snippet | Playground, `Cmd+D` do it, `Cmd+P` print it, `Cmd+I` inspect                                    |
| Find usage  | "Senders of" / "Implementors of" (`Cmd+N`/`Cmd+M`)                                              |
| Tests       | Subclass `TestCase`, methods named `test...`, `self assert:`, `self should: [...] raise: Error` |
| Persistence | Iceberg, Metacello baselines                                                                    |
| Web         | Teapot (micro-framework on Zinc): routes map to blocks                                          |
| UI          | Spec presenters compose widgets and a layout; Morphic is the graphic layer beneath              |

## MVC origins

Reenskaug's 1979 note frames Thing, Model, View, Editor: the model is the user's mental representation; views display it; editors give the user a way to change it. Smalltalk-80 MVC split this into Model (domain, notifies dependents), View (renders), Controller (input). Models never reference views, communicating through change notifications. Spec keeps the idea: a presenter wires widgets to a domain model.

## Review checklist

1. Methods are short, intention-revealing, and sorted into protocols.
2. No type tests (`isKindOf:`) where polymorphism fits.
3. Class-side constructors validate and initialise; `initialize` is called by `new`.
4. Every new behaviour has an SUnit test; baseline lists dependencies.
