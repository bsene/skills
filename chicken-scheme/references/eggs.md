# CHICKEN Egg Authoring Reference

Eggs are CHICKEN's library/package format. This guide covers creating, testing, and publishing eggs.

---

## Table of Contents

1. [Egg structure](#1-egg-structure)
2. [The .egg metadata file](#2-the-egg-metadata-file)
3. [Module conventions](#3-module-conventions)
4. [Testing](#4-testing)
5. [Publishing](#5-publishing)
6. [Common egg patterns](#6-common-egg-patterns)

---

## 1. Egg Structure

```
my-egg/
├── my-egg.egg       ; metadata & build spec (required)
├── my-egg.scm       ; main source (or split across files)
├── README.md        ; documentation
├── LICENSE
└── tests/
    ├── run.scm      ; test runner
    └── test-*.scm   ; individual test files
```

---

## 2. The .egg Metadata File

```scheme
;;; my-egg.egg
((synopsis "One-line description of the egg")
 (version "1.2.3")
 (license "BSD")
 (author "Your Name <you@example.com>")
 (uri git "https://github.com/you/my-egg")

 ;; Runtime dependencies
 (dependencies srfi-1 srfi-13)

 ;; Build-only dependencies
 (build-dependencies test)

 ;; What this egg provides
 (components
   ;; A loadable extension module
   (extension my-egg
     (source "my-egg.scm")
     (component-dependencies))

   ;; Or a compiled program
   (program my-tool
     (source "my-tool.scm"))))
```

### Component types

| Type        | Description                                 |
| ----------- | ------------------------------------------- |
| `extension` | Loadable shared library (most common)       |
| `program`   | Compiled executable installed to `bin/`     |
| `c-library` | Compiled C library used by other components |
| `data`      | Data files copied to `share/`               |

---

## 3. Module Conventions

```scheme
;;; my-egg.scm

(module my-egg
  ;; Export list (or * to export everything)
  (my-proc my-other-proc <my-record> make-my-record my-record?)

  (import scheme
          (chicken base)
          (chicken string)
          srfi-1)

  ;; Private helpers
  (define (internal-helper x) ...)

  ;; Public API
  (define (my-proc x)
    ...)

  (define (my-other-proc x y)
    ...)

  ;; Records
  (define-record-type <my-record>
    (make-my-record field1 field2)
    my-record?
    (field1 my-record-field1)
    (field2 my-record-field2)))
```

---

## 4. Testing

Install the `test` egg:

```bash
chicken-install test
```

`tests/run.scm`:

```scheme
(import test my-egg)

(test-group "my-egg basic tests"
  (test "addition" 3 (my-proc 1 2))
  (test "string op" "hello" (my-other-proc "hel" "lo"))
  (test-assert "predicate works" (my-record? (make-my-record 1 2))))

(test-exit)
```

Run tests:

```bash
cd my-egg
chicken-install -test   ; installs egg then runs tests/run.scm
# or directly:
csi -s tests/run.scm
```

---

## 5. Publishing

### Local install (development)

```bash
cd my-egg
chicken-install          ; installs from current directory
```

### Publishing to the official egg repository

1. Host sources publicly (GitHub, GitLab, etc.)
2. Submit a pull request to [https://github.com/chicken-mobile/henrietta-cache](https://github.com/chicken-mobile/henrietta-cache) adding your egg entry, or follow the instructions at [wiki.call-cc.org/eggs tutorial](https://wiki.call-cc.org/eggs%20tutorial).
3. Tag the git commit with the version string from your `.egg` file.

Once listed, users install with:

```bash
chicken-install my-egg
```

### Version bumping workflow

1. Update `version` in `my-egg.egg`
2. Commit changes
3. `git tag 1.2.3 && git push --tags`

---

## 6. Common Egg Patterns

### Egg with C extension code

```scheme
;;; my-egg.egg
((synopsis "Wraps a C library")
 (version "1.0")
 (components
   (extension my-egg
     (source "my-egg.scm")
     (link-options "-lmylib")
     (compile-options "-I/usr/local/include/mylib"))))
```

```scheme
;;; my-egg.scm
(module my-egg (wrapped-fn)
  (import scheme (chicken base) (chicken foreign))
  (foreign-declare "#include <mylib.h>")
  (define wrapped-fn
    (foreign-lambda int "mylib_do_thing" int c-string)))
```

### Multi-file egg

```scheme
;;; my-egg.egg
((components
  (extension my-egg
    (source "src/main.scm")
    (source "src/helpers.scm"))))
```

### Egg providing multiple extensions

```scheme
((components
  (extension my-egg-core)
  (extension my-egg-extras
    (component-dependencies my-egg-core))))
```

### Conditional compilation

```scheme
;;; In source files, use cond-expand for platform checks:
(cond-expand
  (windows
   (define platform-path-sep "\\"))
  (else
   (define platform-path-sep "/")))
```

---

## Useful Egg Development Commands

```bash
# Check what's installed
chicken-status

# List all files an egg installs
chicken-status -files my-egg

# Uninstall
chicken-uninstall my-egg

# Install specific version
chicken-install my-egg@1.2.3

# Install from local directory (without running tests)
chicken-install -no-test

# Dry run (shows what would happen)
chicken-install -dry-run my-egg

# Force reinstall
chicken-install -force my-egg
```
