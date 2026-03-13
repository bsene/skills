---
name: chicken-scheme
description: Write, compile, debug, and package CHICKEN Scheme programs. Use this skill whenever the user mentions CHICKEN Scheme, call-cc.org, csc, csi, Scheme eggs, Scheme-to-C compilation, R5RS/R7RS Scheme, call/cc, continuations, SRFI, or wants help with any Scheme programming task using CHICKEN. Also trigger for questions about the CHICKEN FFI, C interop from Scheme, egg packaging, REPL usage, or scripting with csi. Even if the user just says "scheme" without specifying CHICKEN, use this skill if context suggests CHICKEN (e.g. they mention eggs, csc, chicken-install, or wiki.call-cc.org).
---

# CHICKEN Scheme Skill

CHICKEN is a Scheme-to-C compiler + interpreter. It produces portable, efficient C from Scheme source and supports R5RS / R7RS (via extension). The main commands are:

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `csi`               | Interactive interpreter (REPL)               |
| `csc`               | Compiler driver (Scheme → C → native binary) |
| `chicken-install`   | Install eggs (libraries)                     |
| `chicken-status`    | List installed eggs                          |
| `chicken-uninstall` | Remove an egg                                |

---

## Quick-Start Workflow

```scheme
;;; hello.scm
(import (chicken base))
(print "Hello, world!")
```

```bash
# Interpreted
csi -s hello.scm

# Compiled to executable
csc hello.scm          # produces ./hello
./hello

# Compiled as shared object (for loading into csi)
csc -shared hello.scm  # produces hello.so
```

---

## Core Language Patterns

### Modules & Imports (CHICKEN 5)

```scheme
;; Built-in modules use the (chicken X) namespace
(import (chicken base))        ; add1, sub1, print, error, etc.
(import (chicken io))          ; read-string, write-string
(import (chicken string))      ; string-split, string-translate
(import (chicken process-context)) ; command-line-arguments, get-environment-variable
(import (chicken file))        ; file-exists?, delete-file, etc.
(import (chicken pathname))    ; make-pathname, pathname-directory, etc.
(import (chicken port))        ; with-output-to-string, open-input-string
(import (chicken format))      ; format (sprintf-style)
(import (chicken time))        ; current-seconds, cpu-time
(import (chicken sort))        ; sort, sort!
(import (chicken random))      ; pseudo-random-integer, randomize
```

### Tail Recursion (guaranteed by CHICKEN)

```scheme
;; Safe: CHICKEN guarantees proper tail calls
(define (sum-to n acc)
  (if (= n 0)
      acc
      (sum-to (- n 1) (+ acc n))))

(sum-to 1000000 0)  ; => 500000500000 — no stack overflow
```

### First-Class Continuations (call/cc)

```scheme
;; Escape continuation (early return)
(define (find-first pred lst)
  (call-with-current-continuation
    (lambda (return)
      (for-each (lambda (x)
                  (when (pred x) (return x)))
                lst)
      #f)))

(find-first even? '(1 3 5 4 7))  ; => 4
```

### Macros (syntax-rules)

```scheme
(define-syntax swap!
  (syntax-rules ()
    ((_ a b)
     (let ((tmp a))
       (set! a b)
       (set! b tmp)))))
```

### Records (SRFI-9 style)

```scheme
(import srfi-9)

(define-record-type <point>
  (make-point x y)
  point?
  (x point-x)
  (y point-y))

(define p (make-point 3 4))
(point-x p)  ; => 3
```

---

## Egg System (Libraries)

```bash
# Install an egg
chicken-install srfi-1         # list utilities
chicken-install srfi-13        # string library
chicken-install http-client    # HTTP requests
chicken-install medea           # JSON parser
chicken-install sqlite3        # SQLite bindings
chicken-install matchable      # pattern matching

# Search eggs online: https://wiki.call-cc.org/eggs
```

```scheme
;; After installing, import in code:
(import srfi-1)      ; iota, fold, filter, etc.
(import matchable)   ; match macro

(match '(1 2 3)
  ((a b c) (+ a b c)))  ; => 6
```

---

## Compiler Flags (csc)

| Flag          | Effect                                         |
| ------------- | ---------------------------------------------- |
| `-o name`     | Output filename                                |
| `-shared`     | Compile to shared library (.so)                |
| `-static`     | Statically link CHICKEN runtime                |
| `-O2` / `-O3` | Optimisation levels                            |
| `-unsafe`     | Disable bounds/type checks (faster, dangerous) |
| `-deploy`     | Self-contained deployment (bundles runtime)    |
| `-c`          | Compile only, don't link                       |
| `-e "expr"`   | Evaluate expr then exit                        |
| `-s file.scm` | Run script then exit                           |
| `-k`          | Keep generated C file (for inspection)         |
| `-debug all`  | Verbose debug output                           |

```bash
# Optimised release build
csc -O3 myapp.scm -o myapp

# Deploy self-contained app (no CHICKEN needed on target)
csc -deploy myapp.scm -o myapp

# Inspect generated C
csc -k myapp.scm
cat myapp.c
```

---

## FFI (Calling C from Scheme)

For details, see `references/ffi.md`.

```scheme
(import (chicken foreign))

;; Inline C declaration
(foreign-declare "#include <math.h>")

;; Wrap a C function
(define c-sqrt
  (foreign-lambda double "sqrt" double))

(c-sqrt 2.0)  ; => 1.4142135623730951

;; Embed C code inline
(define (add-ints a b)
  ((foreign-lambda* int ((int a) (int b))
     "C_return(a + b);")
   a b))
```

---

## Scripting & CLI

```scheme
#!/usr/bin/env csi -s
;;; myscript.scm

(import (chicken process-context)
        (chicken format))

(define args (command-line-arguments))

(if (null? args)
    (fprintf (current-error-port) "Usage: myscript <name>\n")
    (printf "Hello, ~a!\n" (car args)))
```

```bash
chmod +x myscript.scm
./myscript.scm World   ; Hello, World!
```

---

## Writing & Distributing Eggs

For full egg tutorial, see `references/eggs.md`.

Minimal egg structure:

```
my-egg/
├── my-egg.egg      ; metadata
├── my-egg.scm      ; source
└── tests/
    └── run.scm
```

`my-egg.egg`:

```scheme
((synopsis "Does something useful")
 (version "1.0")
 (license "BSD")
 (author "You")
 (components (extension my-egg)))
```

```bash
# Install locally from source
cd my-egg && chicken-install

# Release: create a git tag matching the version string
```

---

## REPL Tips (csi)

```scheme
,?          ; help
,l file     ; load a file
,t expr     ; time an expression
,d name     ; describe a binding
,q          ; quit
```

Enable readline in REPL:

```bash
chicken-install breadline
```

Add to `~/.csirc`:

```scheme
(import breadline)
(current-input-port (make-readline-port))
```

---

## Common Pitfalls

- **`csc` on Windows** may conflict with the C# compiler — use a full path or rename.
- **No `use` in CHICKEN 5** — replace `(use foo)` with `(import foo)`.
- **Dynamic loading** requires a shared library on the `CHICKEN_REPOSITORY_PATH`.
- **`call/cc` is powerful but sharp** — prefer high-level abstractions (threads, conditions) over raw continuations in application code.
- **Unsafe mode** (`-unsafe`) disables all safety checks — only use for hot inner loops after profiling.

---

## Reference Files

- `references/ffi.md` — Detailed FFI guide: foreign-lambda, foreign-safe-lambda, records, callbacks, C embedding
- `references/eggs.md` — Full egg authoring, testing, and publishing workflow
