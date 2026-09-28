---
name: c-programming
description: >
  Write, review, debug, and explain C code. Use for C-only questions, .c files,
  and headers compiled as C, including pointers, allocation, buffers, strings,
  error handling, and C compiler diagnostics. For ambiguous .h files, check
  whether the project compiles them as C or C++; use cpp-expert for C++.
---

# C Programming

Work in the project's C dialect and platform constraints. Check its compiler
flags and existing interfaces before recommending a newer standard or a
platform-specific API. Do not introduce C++ syntax or C++ ownership idioms.

## Review and implementation priorities

- **Ownership and lifetime:** Identify who allocates, who frees, and whether a
  pointer is borrowed or nullable. Initialize pointers before cleanup, release
  each acquired resource once, and leave the caller's pointer unchanged if an
  allocation fails. Use a temporary pointer for `realloc`.
- **Buffers and strings:** Pass lengths or capacities with pointers. Check size
  arithmetic for overflow before allocation, and bounds before indexing or
  copying. Reserve space for the terminating `\0` when producing a C string;
  byte buffers need no terminator. Use `memmove` for overlapping regions.
- **Types and undefined behavior:** Do not read uninitialized values, access
  outside an object, use a pointer after its lifetime, or rely on signed
  overflow. Distinguish an array from a pointer: `sizeof pointer` is not the
  array's byte count. Check conversions between signed sizes and `size_t`.
- **Errors and cleanup:** Check return values that can fail, including
  allocation, I/O, and parsing. Preserve enough context to report the failure;
  inspect `errno` only when the API defines it. Make partial reads, writes, and
  cleanup paths explicit where the operation requires them.
- **Interfaces:** Put declarations in guarded headers and definitions in source
  files. Use `static` for file-local functions and objects. Document ownership,
  buffer capacity, and error results at API boundaries.

For example, when growing an owned buffer, compute and validate the new size
first, assign `realloc` to a temporary pointer, and update the caller's pointer
and capacity only after success. On failure, the old allocation remains owned
by the caller. This pattern should be visible in both implementation and API
documentation.

## Verify

Trace callers and ownership paths before editing. Build with the project's
standard and warning settings; use compiler warnings and a focused runnable
check for changed behavior. Run AddressSanitizer and UndefinedBehaviorSanitizer
when the toolchain supports them and the change touches memory or arithmetic.
