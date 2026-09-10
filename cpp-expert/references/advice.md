# C++ Advice (§1.10)

A subset of the C++ Core Guidelines. References like `[CG: ES.23]` mean rule 23 in the Expressions and Statements section of the [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/).

1. **Don't panic!** All will become clear in time. `[CG: In.0]`
2. **Don't use built-in features exclusively or on their own.** Fundamental features are usually best used indirectly through libraries, such as the ISO C++ standard library. `[CG: P.10]`
3. You don't have to know every detail of C++ to write good programs.
4. **Focus on programming techniques, not on language features.**
5. For the final word on language definition issues, see the ISO C++ standard. `[CG: P.2]`
6. **"Package" meaningful operations as carefully named functions.** `[CG: F.1]`
7. A function should perform a **single logical operation**. `[CG: F.2]`
8. **Keep functions short.** `[CG: F.3]`
9. Use **overloading** when functions perform conceptually the same task on different types.
10. If a function may have to be evaluated at compile time, declare it **`constexpr`**. `[CG: F.4]`
11. **Understand how language primitives map to hardware** (pointers as machine addresses, arrays as contiguous memory, assignment as copy).
12. Use **digit separators** to make large literals readable. `[CG: NL.11]`
13. **Avoid complicated expressions.** `[CG: ES.40]`
14. **Avoid narrowing conversions** — prefer `{}` initialization. `[CG: ES.46]`
15. **Minimize the scope of a variable.**
