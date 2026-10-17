# What Modern Java Supersedes in Effective Java (3rd, 2018)

The book targets Java 7-9. Apply its judgment, but use these newer tools. Version numbers are the release in which the feature became final; check https://openjdk.org/jeps/ for your JDK.

| Book-era guidance                                                      | Modern replacement                                                                | Since                        |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| Hand-written immutable value class with `equals`/`hashCode`/`toString` | `record` (compact constructor for validation, defensive copy)                     | 16                           |
| Tagged class / visitor for closed hierarchy                            | `sealed interface` + records + pattern `switch` (exhaustive, no `default`)        | 17 sealed, 21 pattern switch |
| `instanceof` then cast                                                 | `if (o instanceof Point p)`                                                       | 16                           |
| Chain of `if`/`switch` with casts                                      | Pattern `switch` with record deconstruction patterns                              | 21                           |
| `Collections.unmodifiableList(new ArrayList<>(...))`                   | `List.of`, `Set.of`, `Map.of`, `List.copyOf` (immutable, null-hostile)            | 9/10                         |
| `.collect(Collectors.toList())`                                        | `.toList()` (unmodifiable)                                                        | 16                           |
| Verbose local types                                                    | `var` for locals when RHS makes the type obvious                                  | 10                           |
| String concatenation for multiline text/JSON                           | Text blocks `"""`                                                                 | 15                           |
| Thread pools + async callbacks for I/O scalability                     | Virtual threads (`newVirtualThreadPerTaskExecutor`)                               | 21                           |
| `ThreadLocal` for request context                                      | `ScopedValue` (check status: preview at time of writing in 21-24)                 | preview                      |
| `finalize`/`Object.clone` discussion                                   | Even more firmly: finalization deprecated for removal                             | 18                           |
| `SecurityManager` guidance                                             | Deprecated for removal; do not build on it                                        | 17                           |
| `Optional` for return values                                           | Same; plus `Optional.isEmpty`, `or`, `stream`, `orElseThrow()` no-arg             | 9-11                         |
| Default-serialization concerns                                         | Records are safer; still prefer JSON/Protobuf                                     | 16                           |
| `Math.random`, `new Random`                                            | `RandomGenerator` (`RandomGenerator.getDefault()`, `ThreadLocalRandom.current()`) | 17                           |
| Builder for large optional-parameter classes                           | Still valid; for records consider a builder or `with*` copy methods               | -                            |
| `StackWalker` / reflection for caller info                             | `StackWalker`                                                                     | 9                            |
| Sequential list ops with first/last tricks                             | `SequencedCollection.getFirst()/getLast()/reversed()`                             | 21                           |

## Items that still hold unchanged

Static factories; minimize mutability; composition over inheritance; PECS; no raw types; `@Override`; `EnumMap`/`EnumSet`; try-with-resources; exception translation; fail-fast validation; prefer executors to threads; avoid Java serialization.

## Items that lost weight

- Builder-for-everything: records plus a few factories cover most value types.
- Marker interfaces vs annotations debate: sealed interfaces give a third, compiler-checked option for closed type sets.
- Bit-fields, `int` enum patterns: obsolete.
- "Use ThreadPoolExecutor sizing formulas for I/O": replace with virtual threads plus a semaphore.
