# Lambdas, Method References, Streams, Optional

Source: _Effective Java_, 3rd ed. (lambdas and streams chapter; parts of methods chapter), paraphrased.

## Lambdas

| Situation                                        | Rule                                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Function object needed                           | Lambda, not anonymous class (except when you need a stateful instance or multiple methods)                                |
| Lambda longer than ~3 lines                      | Extract a named method and use a method reference                                                                         |
| Method reference vs lambda                       | Reference when shorter and clearer; lambda when the reference name is longer than the body                                |
| New functional interface                         | First check `java.util.function` (`Function`, `Predicate`, `Supplier`, `UnaryOperator`, `BiFunction`, primitive variants) |
| Custom interface justified                       | Descriptive name + contract, or needs `default` methods; annotate `@FunctionalInterface`                                  |
| Overloads taking different functional interfaces | Avoid at the same arity (ambiguity); name them differently                                                                |
| `this` inside a lambda                           | Refers to enclosing instance, unlike anonymous classes                                                                    |
| Serializing a lambda                             | Don't                                                                                                                     |

## Streams

| Do                                                                                                                    | Don't                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Transform, filter, group, reduce sequences                                                                            | Use streams for everything — loops are fine for index math, early exits with several checked exceptions, mutating multiple locals |
| Keep stages pure: no mutation of outer state                                                                          | `forEach` to accumulate; use `collect`                                                                                            |
| Terminate with `collect(toList()/groupingBy/joining)` or `.toList()` (16+)                                            | Use `forEach` for anything besides reporting results                                                                              |
| Use meaningful lambda parameter names, helper methods                                                                 | Long anonymous chains with one-letter names                                                                                       |
| Use `IntStream`/`mapToInt` for numeric work                                                                           | Box `Integer` in streams                                                                                                          |
| Return `Collection` (or `Stream` only when callers will always stream)                                                | Return `Stream` from an API that callers may want to iterate                                                                      |
| Use `Collectors.toMap(k, v, merge)` with a merge function if duplicates are possible                                  | Rely on default (throws on duplicates)                                                                                            |
| Use `parallel()` only for large CPU-bound data from splittable sources (`ArrayList`, arrays, ranges), after measuring | Parallelize `Stream.iterate`, `limit`, I/O, or shared-state pipelines — wrong results or slower                                   |

```java
Map<Genre, List<String>> byGenre =
    books.stream().collect(groupingBy(Book::genre, mapping(Book::title, toList())));
```

Side-effect-free, non-interfering, stateless functions are required by the stream contract; violating them is a bug even if it appears to work sequentially.

## Optional

| Situation                                       | Use                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| Method might have no result, caller must handle | Return `Optional<T>`                                                              |
| Unwrap                                          | `orElse` (cheap default), `orElseGet` (costly), `orElseThrow`, `map`, `ifPresent` |
| Containers (`List`, `Map`, arrays, `Optional`)  | Return empty container, never `Optional<List<T>>`                                 |
| Primitive result                                | `OptionalInt`/`OptionalLong`/`OptionalDouble`                                     |
| Field, parameter, map value, collection element | Don't use `Optional`                                                              |
| `opt.get()` without check                       | Never                                                                             |
