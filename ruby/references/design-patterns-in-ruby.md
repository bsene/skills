# Design Patterns in Ruby

Source: _Design Patterns in Ruby_ (Olsen, 2007). Paraphrased guidance; Ruby's blocks, open classes, and duck typing replace much GoF ceremony.

## Pattern to Ruby idiom

| Pattern                       | Idiomatic Ruby                                                                                    | Watch out for                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Template Method               | Base class calls hook methods; subclasses override. Raise `NotImplementedError` in abstract hooks | Deep hierarchies; prefer a block or injected object when only one step varies       |
| Strategy                      | Pass a block, lambda, or any object responding to `call`                                          | Do not build a class hierarchy for one-method strategies                            |
| Observer                      | `Observable` or a plain array of callables; notify on change                                      | Observers that raise break the subject; leaked subscriptions                        |
| Iterator                      | Define `each`, `include Enumerable`                                                               | Prefer internal iterators; use `Enumerator` for lazy or external iteration          |
| Command                       | Lambda or small object with `call` and optional `undo`                                            | Keep undo data in the command, not global state                                     |
| Composite                     | Leaf and composite share one duck interface; composite includes `Enumerable`                      | Parent back-references create cycles; keep them explicit                            |
| Decorator                     | `SimpleDelegator`/`Forwardable`, or module `extend` on the instance                               | `method_missing` delegation hides the API; define `respond_to_missing?`             |
| Proxy                         | Delegate with `method_missing` + `respond_to_missing?` (lazy load, access control, remote)        | Forwarding every call hides errors; delegate explicit methods when the set is small |
| Adapter                       | Wrapper class, or reopen the adaptee (monkey patch)                                               | Prefer a wrapper over patching classes you do not own                               |
| Singleton                     | Module with `extend self`/module methods, or `Singleton` stdlib                                   | Global state hurts tests; inject instead where possible                             |
| Factory                       | Class methods (`Shape.for(kind)`) or a hash of name to class                                      | Resolve classes through a registry, not string `eval`                               |
| Builder                       | Method chaining or block-configured object (`new {                                                | b                                                                                   | ... }`) | Return a validated object from `build` |
| Interpreter                   | Small AST of objects with `evaluate(context)`                                                     | Prefer a parser library once grammar grows                                          |
| DSL                           | `instance_eval` of a block against a builder object                                               | Block loses caller's `self`/ivars; offer arity-1 block form too                     |
| Convention over configuration | Infer names, paths, and wiring from class and file names                                          | Document the convention; keep one escape hatch                                      |

## Rules of thumb

- Duck typing is the interface: depend on `respond_to?`-level behavior, not class names.
- A block is the lightest Strategy, Command, and Template Method; reach for classes when state or naming adds clarity.
- Open classes are powerful but global. Prefer refinements or a subclass/wrapper for third-party types.
- Lazy initialization and memoization belong in the method (`@x ||= ...`); beware `false`/`nil` results (use `defined?` or `key?`).
- Use `Comparable` (`<=>`) and `Enumerable` (`each`) before writing custom sort or search code.
- Check a pattern earns its place: if Ruby's standard library already provides it, use that.
