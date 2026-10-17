---
name: java
description: >
  Idiomatic, modern Java (17/21+) — API and class design, immutability, generics, enums, lambdas and streams, exceptions, concurrency, serialization, and aspect-oriented programming with AspectJ / Spring AOP.

  TRIGGER when: language (Java, .java files, JDK, JVM, Maven, Gradle, pom.xml),
  objects (static factory, builder, constructor, equals, hashCode, toString, Comparable, clone, immutable class, record, sealed interface),
  generics (wildcard, PECS, bounded type, raw type, type erasure, unchecked warning),
  enums/annotations (enum, EnumMap, EnumSet, @Override, marker annotation, @FunctionalInterface),
  functional (lambda, method reference, Stream, Collectors, Optional, parallel stream),
  errors (checked vs unchecked exception, try-with-resources, exception translation, Objects.requireNonNull, defensive copy),
  concurrency (synchronized, volatile, ExecutorService, CompletableFuture, ConcurrentHashMap, virtual threads, thread safety),
  serialization (Serializable, serialization proxy, readObject, Jackson vs Java serialization),
  AOP (AspectJ, aspect, pointcut, advice, join point, @Aspect, Spring AOP, load-time weaving, cross-cutting concern),
  ask (Effective Java, idiomatic Java, Java best practices, Java code review, how to design a Java API).
  DO NOT USE when: user says "Java" for JavaScript, or for Kotlin/Scala-only questions.
metadata:
  user-invocable: "false"
---

# Java

Write small, explicit, immutable-by-default Java. Prefer the newest language feature that removes boilerplate (records, sealed types, pattern matching, virtual threads) over hand-rolled patterns from older books. Sources: _Effective Java, 3rd ed._ (Bloch, 2018) for design judgment; _AspectJ in Action_ (Laddad) for aspects.

## Workflow

1. Identify the **target Java version** (`pom.xml` / `build.gradle` `release`, `.java-version`). Modern items below need 16+ (records), 17+ (sealed), 21+ (virtual threads, pattern switch).
2. Pick the theme row below and load only that reference.
3. Apply the decision table; check "Modern Java" before reaching for a pre-Java-16 pattern.
4. Before finishing, run the review checklist at the bottom.

## Route to References

| Situation                                                              | Load                                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Creating objects: factories, builders, DI, singletons, resources       | [object-creation.md](references/object-creation.md)                       |
| `equals`/`hashCode`/`toString`/`Comparable`, immutability, composition | [classes-and-immutability.md](references/classes-and-immutability.md)     |
| Generics, wildcards, enums, annotations, interfaces                    | [generics-enums-annotations.md](references/generics-enums-annotations.md) |
| Lambdas, method references, streams, `Optional`                        | [lambdas-and-streams.md](references/lambdas-and-streams.md)               |
| Method signatures, defensive copies, overloading, exceptions           | [methods-and-exceptions.md](references/methods-and-exceptions.md)         |
| Threads, locks, executors, thread-safe classes, virtual threads        | [concurrency.md](references/concurrency.md)                               |
| `Serializable`, deserialization security, alternatives                 | [serialization.md](references/serialization.md)                           |
| Which Effective Java items modern Java supersedes                      | [modern-java.md](references/modern-java.md)                               |
| Cross-cutting concerns, AspectJ, Spring AOP pitfalls                   | [aspectj.md](references/aspectj.md)                                       |

## Core Rules (always on)

| Rule                                                                             | Why                                      |
| -------------------------------------------------------------------------------- | ---------------------------------------- |
| Minimize mutability and accessibility; fields private, classes final by default  | Fewer invariants to defend               |
| Use `record` for transparent immutable data carriers                             | Generates `equals`/`hashCode`/`toString` |
| Program to interfaces; return `List`/`Map`, not `ArrayList`/`HashMap`            | Swap implementations freely              |
| Never use raw types; fix or narrowly suppress unchecked warnings                 | Keeps the compiler's type safety         |
| Prefer standard library (`java.util.function`, `Objects`, `List.of`) to your own | Reader already knows it                  |
| Fail fast: validate arguments at entry, throw standard exceptions                | Errors surface at the cause              |
| Always `try-with-resources` for `AutoCloseable`                                  | `finally`-based close hides exceptions   |
| Prefer concurrency utilities over `wait`/`notify`; avoid shared mutable state    | Most races are design errors             |
| Do not use Java serialization for new code                                       | Attack surface and fragile contracts     |
| Never return `null` for a collection/array; return empty                         | No null checks at call sites             |

## Review Checklist

- **Blockers**: raw types; `equals` without `hashCode`; mutable state exposed through getters; unsynchronized shared mutable fields; swallowed exceptions (`catch (...) {}`); `finalize`/`clone` overriding; deserializing untrusted bytes.
- **Warnings**: `Optional` as field/parameter; stream with side effects; `int` for money; telescoping constructors; checked exception where caller cannot recover; string constants for enum-like values; `synchronized` around alien method calls.
- **Suggestions**: class → `record`; `instanceof` chain → sealed interface + pattern `switch`; thread pool for blocking I/O → virtual threads; hand-written `Comparator` → `Comparator.comparing`.

## Sources

- Bloch, _Effective Java_, 3rd ed. (2018) — item guidance paraphrased by theme.
- Laddad, _AspectJ in Action_ — aspect guidance.
- Official docs: https://docs.oracle.com/en/java/javase/ and https://openjdk.org/jeps/
