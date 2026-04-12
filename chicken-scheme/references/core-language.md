# Core Language Patterns

## Modules & Imports (CHICKEN 5)

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

---

## Tail Recursion (guaranteed by CHICKEN)

```scheme
;; Safe: CHICKEN guarantees proper tail calls
(define (sum-to n acc)
  (if (= n 0)
      acc
      (sum-to (- n 1) (+ acc n))))

(sum-to 1000000 0)  ; => 500000500000 — no stack overflow
```

---

## First-Class Continuations (call/cc)

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

---

## Macros (syntax-rules)

```scheme
(define-syntax swap!
  (syntax-rules ()
    ((_ a b)
     (let ((tmp a))
       (set! a b)
       (set! b tmp)))))
```

---

## Records (SRFI-9 style)

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
