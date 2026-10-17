# Classes, Common Object Methods, and Immutability

Source: _Effective Java_, 3rd ed. (methods common to all objects; classes and interfaces), paraphrased.

## Object contract decisions

| Method      | Rule                                                                                                    | Prefer today                                        |
| ----------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `equals`    | Override only for value types; must be reflexive, symmetric, transitive, consistent, `false` for `null` | `record`, or `Objects.equals` per significant field |
| `hashCode`  | Always override with `equals`; equal objects must hash equally; use the same fields                     | `Objects.hash(a, b)` (fine unless hot path)         |
| `toString`  | Always override; return all useful state; document format only if parsed                                | `record` auto-generates                             |
| `compareTo` | Consistent with `equals` where possible; never subtract ints (overflow)                                 | `Comparator.comparingInt(...).thenComparing(...)`   |
| `clone`     | Do not implement `Cloneable`                                                                            | Copy constructor / static copy factory              |
| `finalize`  | Never                                                                                                   | `AutoCloseable`                                     |

Pitfalls:

- Subclass adding a value component cannot keep `equals` symmetric with its parent: use **composition** (a field of the other type plus a view method), not inheritance.
- Do not rely on mutable fields in `hashCode` of objects stored in `HashSet`/`HashMap` keys.
- Use `instanceof` pattern matching in `equals`: `o instanceof Point p && x == p.x && y == p.y`.
- `Float`/`Double` fields compare with `Float.compare`/`Double.compare`, not `==`.
- Use `BigDecimal` (or integer cents) for money, never `float`/`double`.

## Immutability recipe

| Step                                                | Detail                                    |
| --------------------------------------------------- | ----------------------------------------- |
| No mutators                                         | "Wither" methods return a new instance    |
| Class `final` (or private constructors + factories) | Blocks malicious/accidental subclassing   |
| All fields `final` and `private`                    | Safe publication for free                 |
| Defensive copy mutable components in **and** out    | `List.copyOf(x)`, `date.clone()` on input |
| Fail-atomic: validation in constructor              | Object is never observable invalid        |

Use `record` when the type is a plain value; remember records are only **shallowly** immutable, so copy collection components in the compact constructor.

## Inheritance vs composition

| Situation                                                       | Choose                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| "is-a" within one package you control, documented for extension | Inheritance with documented self-use                                  |
| Reusing behavior of someone else's class                        | Composition + forwarding (wrapper / decorator)                        |
| Not designed for extension                                      | Make it `final` or constructor-private                                |
| Closed set of subtypes                                          | `sealed interface` + records                                          |
| Shared behavior across unrelated types                          | Interface with `default` methods (do not break existing implementors) |
| Constants                                                       | `enum` or a utility class — not a "constant interface"                |
| Tagged class (`kind` field + switches)                          | Class hierarchy / sealed types                                        |

Constructors must not call overridable methods. Prefer interfaces to abstract classes for types; combine with an abstract skeletal class (`AbstractList` style) when implementers share code.

## Accessibility

- Top-level types package-private unless public API; nested classes `static` unless they need the outer instance (avoids hidden reference leaks).
- One top-level class per file.
- No public mutable fields; expose accessors. Public `static final` array = a hole; expose `List.of(...)` or a clone.
- Modules (`module-info.java`) export only API packages.
