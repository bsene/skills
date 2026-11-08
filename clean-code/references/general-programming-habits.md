# General Programming Habits

Language-agnostic readability habits distilled from Joshua Bloch, _Effective Java_ (3rd ed., 2018),
chapter 9 "General Programming" (Items 57, 62, 64, 68). Examples use Java; the rules apply anywhere.
Java-only mechanics live in [`java`](../../java/SKILL.md).

| Habit                                   | Rule                                                                                          | Review smell                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Declare where first used (Item 57)      | Smallest scope; every local gets an initializer; postpone declaration until you can set one.  | Variables declared at the top of a block "like C89".          |
| Prefer scoped loop variables (Item 57)  | `for` / for-each keeps the loop variable inside the loop; `while` leaks it to later code.     | Copy-pasted loop reuses the old iterator and still compiles.  |
| Use a real type, not a string (Item 62) | Numbers become numeric types, yes/no a boolean or enum, composites a small class.             | `className + "#" + id` as a key; parsing strings back apart.  |
| Strings are not capabilities (Item 62)  | A client-chosen string key is a shared global namespace; hand out an unforgeable key object.  | Two callers pick the same string and silently share state.    |
| Refer to objects by interface (Item 64) | Variables, params, returns, fields use the interface; name the class only at construction.    | `LinkedHashSet<X> x = new LinkedHashSet<>()`                  |
| Interface exception                     | Value classes, class-based frameworks, and code that needs extra methods may use the class.   | Forcing an interface where only one implementation can exist. |
| Follow the platform's naming (Item 68)  | Typographical rules (case, constants, packages) are not negotiable; grammar rules are looser. | A style that fights the language's standard library.          |
| Name parameters carefully (Item 68)     | Parameter names are the method's documentation; locals may be short when context is obvious.  | `process(a, b, flag)`                                         |
| Capitalize acronyms as words (Item 68)  | `HttpUrl` over `HTTPURL`: back-to-back acronyms stay splittable.                              | Unreadable run-together capitals.                             |

## How to apply

1. During a review, scan for the smells in the right-hand column first; each maps to a one-line fix.
2. Swapping an implementation type is the test for habit 5: if only the constructor call changes, the interface was used correctly.
3. If swapping the implementation changes behavior (for example, iteration order), the code relied on more than the contract. Say so in the type or a comment.
4. Typed values beat strings for the same reason named constants beat literals: the compiler, `grep`, and the next reader can all see them.

## Source

- Joshua Bloch, _Effective Java_, 3rd ed. (Addison-Wesley, 2018), Items 57, 62, 64, 68.
