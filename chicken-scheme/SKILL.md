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

## Egg System (Libraries)

```bash
chicken-install srfi-1         # list utilities
chicken-install matchable      # pattern matching
chicken-install http-client    # HTTP requests
chicken-install medea           # JSON parser

# Search eggs online: https://wiki.call-cc.org/eggs
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

Enable readline: `chicken-install breadline`, then add to `~/.csirc`:

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

## Read On Demand

| Read When | File |
|---|---|
| Modules, imports, tail recursion, call/cc, macros, records | [Core Language](references/core-language.md) |
| Scripting, shebang, CLI tools, compiler flag examples, egg structure | [Scripting & CLI](references/scripting-cli.md) |
| FFI: foreign-lambda, callbacks, C interop, embedding | [FFI Guide](references/ffi.md) |
| Egg authoring, testing, and publishing workflow | [Egg System](references/eggs.md) |
