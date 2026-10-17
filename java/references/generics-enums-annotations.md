# Generics, Enums, Annotations

Source: _Effective Java_, 3rd ed. (generics; enums and annotations chapters), paraphrased.

## Generics

| Situation                        | Rule                                                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Any `List`, `Map`, `Class` usage | Parameterize; never raw. Use `List<?>` when type is irrelevant                                                                     |
| Unchecked warning                | Eliminate; if provably safe, `@SuppressWarnings("unchecked")` on the **smallest** scope with a comment                             |
| Arrays vs lists                  | Prefer `List<T>`; arrays are covariant and reified, generics are invariant and erased — mixing yields warnings                     |
| Producer of `T`s (you read)      | `? extends T`                                                                                                                      |
| Consumer of `T`s (you write)     | `? super T`                                                                                                                        |
| Both                             | Exact `T` (PECS: producer-extends, consumer-super)                                                                                 |
| Return type                      | Never a wildcard type                                                                                                              |
| Method that works for many types | Generic method: `static <E> Set<E> union(Set<? extends E>, Set<? extends E>)`                                                      |
| Bound on a type parameter        | `<T extends Comparable<? super T>>`                                                                                                |
| Heterogeneous container          | Type-safe key: `Map<Class<?>, Object>` with `cast` on `Class<T>`                                                                   |
| Varargs of generics              | Warns (heap pollution); use `List<T>` params or `@SafeVarargs` on `final`/`static` methods that neither store nor expose the array |

```java
static <T> void copy(Collection<? super T> dst, Collection<? extends T> src) { dst.addAll(src); }
```

If a wildcard-capture helper is needed, write a private generic helper (`swapHelper`) behind a public wildcard signature.

## Enums

| Situation                        | Use                                                                   |
| -------------------------------- | --------------------------------------------------------------------- |
| Fixed set of constants           | `enum`, not `int`/`String` constants                                  |
| Data attached to each constant   | Fields + constructor; getters                                         |
| Behavior varying per constant    | Abstract method with constant-specific bodies (no `switch` on `this`) |
| Subset of an enum                | `EnumSet.of(...)`, never bit flags                                    |
| Map keyed by enum                | `EnumMap<K, V>`, not `ordinal()` indexing                             |
| Need a number tied to a constant | Instance field, never `ordinal()`                                     |
| Extensible "enum"                | Enum implementing an interface                                        |
| Strategy shared by few constants | Nested "strategy enum" instead of duplicated switches                 |
| Singleton                        | Single-element enum                                                   |

With Java 21, a `switch` expression over an enum (or sealed type) without `default` is exhaustive and compiler-checked.

## Annotations and interfaces

| Situation                      | Rule                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Overriding / implementing      | Always `@Override` (compiler catches overload-vs-override bugs)                                                               |
| Marking a type with no methods | Marker **annotation**, not marker interface — unless you need a type for parameters                                           |
| Marker interface wanted        | When methods must accept only marked types (`Serializable`-style)                                                             |
| Single-method contract         | `@FunctionalInterface`                                                                                                        |
| Custom annotation              | Prefer annotations over naming patterns (`testFoo`); set `@Retention`/`@Target` explicitly; repeated values via `@Repeatable` |
| Interface for constants only   | Never                                                                                                                         |
| Interface evolution            | `default` methods carry risk; document them, test with existing implementors                                                  |
