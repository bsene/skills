# Methods and Exceptions

Source: _Effective Java_, 3rd ed. (methods; exceptions chapters), paraphrased.

## Method design

| Concern             | Rule                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Validate parameters | At entry; `Objects.requireNonNull(x, "x")`, `IllegalArgumentException`; document in Javadoc `@throws`. Private methods use `assert` |
| Defensive copies    | Copy mutable input **before** validating (TOCTOU); copy mutable output; do not use `clone()` on non-final parameter types           |
| Signatures          | Careful names; <=4 params; avoid adjacent same-typed params (use helper class/record/builder)                                       |
| Parameter types     | Interface types (`Map`) over concrete (`HashMap`); two-element enum over `boolean` flag                                             |
| Overloading         | Avoid same-arity overloads whose arguments can both match; the overload is chosen at compile time, overriding at runtime            |
| Varargs             | For zero-or-more; for one-or-more take `(first, T... rest)`; hot path: provide fixed-arity overloads                                |
| Return values       | Never `null` for arrays/collections; `Optional` when "no result" is a legitimate answer                                             |
| Javadoc             | Every exported API: preconditions, postconditions, side effects, thread-safety, `@param/@return/@throws`                            |
| Local variables     | Smallest scope, initialize at declaration, `var` when type is obvious from RHS; `for` loops over `while`                            |
| For-each            | Use over indexed loops; not usable for destructive filtering (`removeIf`), transforming in place, or parallel iteration             |
| Libraries           | Use `java.util`/`java.time`/`Objects`; use `ThreadLocalRandom`/`SplittableRandom`, never `Math.random` in new code                  |
| Strings             | `StringBuilder` in loops; `+` is fine for one-off; don't use strings for typed data (enums, records, keys)                          |
| Primitives          | Prefer primitives; boxed types compared with `==` or unboxed `null` are traps; `Integer.compare` for ordering                       |
| Reflection          | Only when unavoidable (frameworks); instantiate reflectively, then use via an interface                                             |
| Native methods      | Rarely needed now (JNI -> Foreign Function & Memory API, final in Java 22)                                                          |
| Optimization        | Measure first (JMH); good API design beats micro-tweaks                                                                             |
| Naming              | Standard conventions: `UpperCamel` types, `lowerCamel` members, `UPPER_SNAKE` constants, `T/E/K/V` type params                      |

## Exception decision table

| Condition                                                  | Use                                                                                                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Caller can reasonably recover                              | Checked exception (sparingly)                                                                                                                |
| Programming error / violated precondition                  | Unchecked (`IllegalArgumentException`, `IllegalStateException`, `NullPointerException`, `IndexOutOfBounds`, `UnsupportedOperationException`) |
| Unrecoverable JVM/resource condition                       | `Error` — never throw or catch yourself                                                                                                      |
| Control flow (loop exit, normal branch)                    | Never exceptions                                                                                                                             |
| Lower layer exception leaks abstraction                    | **Translate** to a higher-level one and **chain** the cause: `throw new DomainException("...", e)`                                           |
| Method can fail with a checked exception that's rarely hit | Provide state-testing method (`hasNext`) or `Optional`/result type                                                                           |
| Failure details needed                                     | Put capture data in exception fields and the message (parameter values)                                                                      |
| Partial update on failure                                  | Keep failure atomicity: validate first, or operate on a copy, or roll back                                                                   |
| Catch                                                      | Never an empty `catch`; if truly ignorable, name the variable `ignored` and comment why                                                      |
| Resource handling                                          | `try-with-resources`; suppressed exceptions are preserved                                                                                    |

Checked exceptions and lambdas do not mix: wrap inside the lambda, or use a small functional interface that declares the exception.

Document every checked exception with `@throws`; document unchecked ones that are part of the contract. Never use `throws Exception`.

```java
try (var in = Files.newBufferedReader(path)) {
  return parse(in);
} catch (IOException e) {
  throw new ConfigException("cannot read " + path, e);
}
```
