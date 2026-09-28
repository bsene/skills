# C Foundations for C++

Source: Kernighan and Ritchie, _The C Programming Language_, 2nd ed. The section numbers below refer to that book. Use these ideas to understand C++ code and C interfaces; keep the language differences explicit.

- **Value parameters (§1.8):** Passing a pointer copies the pointer. Changing `*p` changes the caller's object; reassigning `p` does not. Use a reference when a required object is clearer than a nullable pointer.
- **Arrays (§5.3–5.4, §5.9):** `a[i]` means `*(a + i)`; adding one advances by one element. Pointer arithmetic stays within one array or one past it, which must not be dereferenced. `int a[3][4]` is contiguous, while `int* b[3]` stores three pointers. Prefer `std::span` when a C++20 API needs a pointer and length together.
- **C strings (§1.9, §5.5):** A `char*` alone gives no length or ownership. Check capacity and termination at C boundaries. Use `std::string` or `std::string_view` for ordinary C++ text, and `std::string::c_str()` when a C API needs a terminated string.
- **Shared declarations (§4.5):** Put public declarations in headers and definitions in source files; keep internal names local. In C++ headers, use include guards or `#pragma once`, and avoid non-`inline` definitions that violate the one-definition rule.
- **Macros (§4.11):** Function-like macros may evaluate arguments more than once. Prefer `constexpr` values, functions, or templates for C++ APIs. Inspect a C macro before passing an expression with side effects.
- **C I/O (§7.1, §7.5–7.6):** Store `std::getc` results in `int`, compare with `EOF`, and check `std::ferror` when failure must be distinguished from end-of-file. Check `std::fopen` before use and close an acquired `FILE*`; prefer RAII for C++ owned resources.

The book describes ANSI C, so its syntax and performance advice are historical context. In particular, do not infer that pointer loops are faster than indexed loops in modern C++; measure the actual C++ implementation when speed matters.
