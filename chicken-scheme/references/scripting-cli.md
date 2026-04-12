# Scripting & CLI

## Shebang Scripts

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

## Compiler Flag Examples

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

## Writing & Distributing Eggs

For full egg tutorial, see `eggs.md`.

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
