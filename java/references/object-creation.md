# Object Creation and Lifecycle

Source: _Effective Java_, 3rd ed. (creation and destruction chapter), paraphrased.

## Choosing a creation mechanism

| Situation                                          | Use                                                     | Notes                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Few, well-named variants of construction           | Static factory (`of`, `from`, `valueOf`, `getInstance`) | Named, can cache, can return a subtype, may return existing instance                       |
| Many optional parameters (>~4)                     | Builder (or record + `withX` copies)                    | Telescoping constructors and JavaBeans setters both lose; setters leave half-built objects |
| Immutable value with all fields required           | `record`                                                | Compact constructor validates                                                              |
| Class needs collaborators (DB, clock, HTTP client) | Constructor injection                                   | Do not hard-wire; do not use static singletons for them                                    |
| Exactly one instance needed                        | Single-element `enum`                                   | Serialization- and reflection-safe                                                         |
| Utility class of statics                           | Private constructor that throws                         | Stops accidental instantiation                                                             |
| Expensive immutable object requested repeatedly    | Cache / reuse (`static final`, `valueOf`)               | Compile `Pattern` once, not per call                                                       |
| Subclass-friendly hierarchy of builders            | Generic self-typed builder (`abstract T self()`)        | Only when hierarchy truly needs it                                                         |

```java
public record Range(int lo, int hi) {
  public Range {
    if (lo > hi) throw new IllegalArgumentException(lo + " > " + hi);
  }
  public static Range of(int lo, int hi) { return new Range(lo, hi); }
}
```

```java
// Builder with required args in the builder constructor
Pizza p = new Pizza.Builder(Size.LARGE).cheese().onion().build();
```

Naming conventions for factories: `from` (type conversion), `of` (aggregate), `valueOf` (verbose from/of), `instance`/`getInstance`, `create`/`newInstance` (always new), `getType`/`newType` (other class).

## Avoid unnecessary objects

| Smell                                        | Fix                                            |
| -------------------------------------------- | ---------------------------------------------- |
| `new String("x")`, `new Integer(1)`          | Literal / `valueOf`                            |
| `Long sum` accumulator (boxing in a loop)    | Primitive `long`                               |
| `String.matches(regex)` in a hot path        | Pre-compiled `static final Pattern`            |
| Adapter/view created repeatedly (`keySet()`) | Fine — views are cheap and shared; do not copy |

Do not pool ordinary objects; only pool genuinely expensive ones (connections). Modern GCs make small-object pools a net loss.

## Resources and cleanup

| Need                                             | Use                                                                                                             |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Close files, sockets, statements                 | `try (var in = ...) { }` — multiple resources in one header                                                     |
| Safety net for a leaked native handle            | `java.lang.ref.Cleaner`, only as backstop                                                                       |
| Class with `finalize()`                          | Remove it — deprecated for removal, unpredictable, a security hazard                                            |
| Stale references in a custom cache/stack         | Null the slot when the class manages its own memory; use `WeakHashMap` / `Cleaner` for caches keyed on liveness |
| Listeners/callbacks registered but never removed | Hold weak references or require explicit deregistration                                                         |

## DI vs singleton

Do not write `static getInstance()` for classes that wrap a resource; pass the dependency (or a `Supplier<T>`) through the constructor. This makes tests trivial and removes global state. A DI container (Spring, Guice) is optional; plain constructor wiring in `main` is enough for small apps.
