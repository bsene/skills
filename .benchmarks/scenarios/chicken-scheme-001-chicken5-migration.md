---
id: chicken-scheme-001-chicken5-migration
skill: chicken-scheme
---

# Prompt

I have an old CHICKEN 4 script that counts the lines of a file passed as an argument:

```scheme
(use utils)

(define (main args)
  (let ((path (car args)))
    (print (length (read-lines path)))))

(main (command-line-arguments))
```

I'm on CHICKEN 5 now. I want to (a) make it an executable shebang script I can run as `./countlines.scm data.txt`, and (b) also produce a self-contained binary I can copy to a production server that does NOT have CHICKEN installed. Give me the updated source and the exact commands for both.

# Criteria

- [ ] Response replaces `(use ...)` with `(import ...)` using CHICKEN 5's `(chicken ...)` module namespaces (e.g. `(chicken base)`, `(chicken io)`)
- [ ] Response reads CLI args via `(command-line-arguments)` with `(chicken process-context)` imported (or `csi -s` argv semantics), not `(argv)` or Racket-style `command-line`
- [ ] Response gives a shebang line invoking csi as a script interpreter (e.g. `#!/usr/bin/env csi -s`, `#!/usr/bin/env -S csi -s`, or `#!/usr/bin/csi -s`)
- [ ] For the no-CHICKEN target, response compiles with `csc -static` or `csc -deploy` (statically linked/self-contained), not a plain `csc countlines.scm` that dynamically links libchicken
- [ ] Response does NOT keep `(use ...)` / CHICKEN 4 idioms and does NOT suggest Racket/Guile constructs (`#lang`, `require`, `raco`, `define-module`)
- [ ] Response does NOT recommend `-unsafe` / `-O4`-or-higher flags as the default production build without profiling justification