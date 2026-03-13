# CHICKEN Scheme FFI Reference

CHICKEN's Foreign Function Interface lets Scheme call C (and vice versa) with minimal overhead.

---

## Table of Contents

1. [Basic foreign-lambda](#1-basic-foreign-lambda)
2. [Inline C with foreign-lambda\*](#2-inline-c-with-foreign-lambda)
3. [foreign-safe-lambda (GC-safe)](#3-foreign-safe-lambda-gc-safe)
4. [C structs with define-foreign-record-type](#4-c-structs)
5. [Callbacks: Scheme → C → Scheme](#5-callbacks)
6. [Embedding raw C blocks](#6-embedding-raw-c-blocks)
7. [Type mapping reference](#7-type-mapping-reference)

---

## 1. Basic foreign-lambda

Wraps an existing C function.

```scheme
(import (chicken foreign))

(foreign-declare "#include <stdio.h>")
(foreign-declare "#include <math.h>")

;; (foreign-lambda <return-type> <c-name> <arg-types> ...)
(define c-sin  (foreign-lambda double "sin"  double))
(define c-cos  (foreign-lambda double "cos"  double))
(define c-puts (foreign-lambda int    "puts" c-string))

(c-sin 1.5707963)  ; => ~1.0
(c-puts "hi")      ; prints "hi\n", returns 3
```

---

## 2. Inline C with foreign-lambda\*

Write the C body inline; use `C_return(value)` to return.

```scheme
;; (foreign-lambda* <return-type> ((<type> <name>) ...) "C body")
(define add-floats
  (foreign-lambda* double ((double a) (double b))
    "C_return(a + b);"))

(add-floats 1.5 2.5)  ; => 4.0

;; void return: use (foreign-lambda* void ...)
(define print-n
  (foreign-lambda* void ((int n))
    "printf(\"%d\\n\", n);"))

(print-n 42)
```

---

## 3. foreign-safe-lambda (GC-safe)

Use when the C function may trigger a GC (e.g., allocates Scheme objects, calls back into Scheme). Slightly slower due to GC check.

```scheme
(define safe-strlen
  (foreign-safe-lambda int "strlen" c-string))
```

Use `foreign-safe-lambda*` for the inline variant.

---

## 4. C Structs

### Manual approach

```scheme
(define make-point
  (foreign-lambda* (c-pointer "Point") ((double x) (double y))
    "Point *p = malloc(sizeof(Point));
     p->x = x; p->y = y;
     C_return(p);"))
```

### With the `foreigners` egg (recommended)

```bash
chicken-install foreigners
```

```scheme
(import (chicken foreign) foreigners)

;; C struct: typedef struct { float x, y; } Vec2;
(define-foreign-record-type (vec2 "Vec2")
  (float x vec2-x vec2-x!)   ; getter + setter
  (float y vec2-y vec2-y!))

(define make-vec2
  (foreign-lambda (c-pointer "Vec2") "make_vec2" float float))

(let ((v (make-vec2 1.0 2.0)))
  (printf "x=~a y=~a\n" (vec2-x v) (vec2-y v))
  (vec2-x! v 99.0)
  (printf "x=~a\n" (vec2-x v)))
```

### Enums with `foreigners`

```scheme
(define-foreign-enum-type (direction int)
  (direction->int int->direction)
  ((north dir/north) NORTH)
  ((south dir/south) SOUTH)
  ((east  dir/east)  EAST)
  ((west  dir/west)  WEST))

(display dir/north)  ; => 0 (or whatever NORTH is)
```

---

## 5. Callbacks

Passing a Scheme procedure as a C function pointer.

```scheme
(import (chicken foreign))

;; Declare the callback type
(define-external (my_callback (int x)) int
  (* x 2))

;; Pass it to C
(foreign-declare "
  extern int my_callback(int);
  int call_it(int x) { return my_callback(x); }
")

(define call-it (foreign-lambda int "call_it" int))
(call-it 21)  ; => 42
```

For more complex callbacks use `make-callback` from the `foreigners` egg.

---

## 6. Embedding Raw C Blocks

Use `#>...<#` reader syntax for embedding arbitrary C:

```scheme
;; Include headers (declaration section)
#>
#include <stdlib.h>
#include "mylib.h"
<#

;; Execute C code inline at runtime
(foreign-code "setup_library();")
```

Or use `foreign-declare` for declarations and `foreign-code` for executable statements:

```scheme
(foreign-declare "#include <string.h>")
(foreign-code   "memset(buf, 0, sizeof(buf));")
```

---

## 7. Type Mapping Reference

| CHICKEN type           | C type                             |
| ---------------------- | ---------------------------------- |
| `int`                  | `int`                              |
| `long`                 | `long`                             |
| `short`                | `short`                            |
| `char`                 | `char`                             |
| `float`                | `float`                            |
| `double`               | `double`                           |
| `bool`                 | `int` (0/1)                        |
| `c-string`             | `char *` (null-terminated, copied) |
| `c-string*`            | `char *` (not freed on GC)         |
| `(c-pointer T)`        | `T *`                              |
| `c-pointer`            | `void *`                           |
| `(function R (A ...))` | function pointer                   |
| `void`                 | `void` (no return)                 |
| `scheme-object`        | `C_word` (raw Scheme value)        |
| `nonnull-c-string`     | `char *`, error if NULL            |

---

## Tips & Gotchas

- **Always use `C_return()`** (not plain `return`) inside `foreign-lambda*` bodies.
- **`c-string` copies the string** on entry and exit — use `c-string*` to avoid the copy (but you manage memory).
- **GC can move objects** during C calls — never hold raw pointers to Scheme-managed data across a potential GC point; use `foreign-safe-lambda` or pin with `object-evict`.
- **`csc -k`** keeps the generated `.c` file — invaluable for debugging FFI issues.
- For large C libraries, consider the **`bind`** egg which auto-generates bindings from headers.
