# Lisp programming from the bookshelf

Original summaries and examples based on the local books below. The reference is self-contained; loading it does not require access to `~/Documents/Books`. Use the target dialect's standard and implementation manual to settle behavior that differs from a book's teaching language.

| Source in the Books folder                                                                                                                 | Sections used                                 | Apply to                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------- |
| Daniel P. Friedman and Matthias Felleisen, _The Little Schemer_, fourth edition (`The Little Schemer.pdf`)                                 | Commandments; chapters 1–5, 8                 | Structural recursion, higher-order functions, collectors               |
| Harold Abelson and Gerald Jay Sussman with Julie Sussman, _Structure and Interpretation of Computer Programs_, second edition (`sicp.pdf`) | §§1.1.5, 1.2.1, 2.1.2, 3.1–3.3, 3.5, 4.1–4.2  | Process shape, representation, state, delayed evaluation, interpreters |
| Paul Graham, _ANSI Common Lisp_ (`Graham, Paul - ANSI Common Lisp.pdf`)                                                                    | §§3.1–3.4, 4.1, 4.8, 6.5–6.9, 12.1–12.4, 12.8 | Common Lisp collections, closures, mutation                            |
| Paul Graham, _On Lisp_ (`onlisp.pdf`)                                                                                                      | Chapters 3–5, 7–10, 12–13                     | Function abstractions and safe Common Lisp macros                      |
| _Revised⁷ Report on the Algorithmic Language Scheme_, small language (`r7rs.pdf`)                                                          | §§3.2, 3.4–3.5, 4.1.3, 4.2.2, 4.3, 6.1, 6.4   | Scheme portability checks                                              |

## Recursive lists and trees

From _The Little Schemer_ and _SICP_:

- Establish the input shape: a flat proper list, nested proper lists, or arbitrary pairs. A traversal designed for proper lists need not accept dotted or cyclic structures.
- Handle the empty case before selecting the head or tail. Every recursive path must reduce a measure toward that case; a tree traversal processes both relevant subparts.
- Choose the base result to match the operation: zero for a sum/count, one for a product, the empty list for list construction. Test empty, singleton, and nested inputs.
- Repeatedly appending to a growing list can make construction quadratic. For a linear traversal, accumulate with `cons`, then reverse once if order matters.
- Distinguish recursive syntax from a recursive process: pending work after a call consumes space. A tail call has no remaining work; Scheme requires proper tail recursion, while portable Common Lisp does not guarantee it.
- Use a collector/continuation when the caller needs control over combining several results. Do not introduce continuation-passing style for an ordinary traversal with a simple return value.

This original Scheme example counts leaves of finite, acyclic nested proper lists; empty sublists contribute zero:

```scheme
(define (leaf-count xs)
  (cond ((null? xs) 0)
        ((pair? (car xs))
         (+ (leaf-count (car xs)) (leaf-count (cdr xs))))
        ((null? (car xs)) (leaf-count (cdr xs)))
        (else (+ 1 (leaf-count (cdr xs))))))

(unless (and (= (leaf-count '()) 0)
             (= (leaf-count '(a)) 1)
             (= (leaf-count '(a (b () c) ())) 3))
  (error "leaf-count regression"))
```

Teaching conventions are narrower than language semantics. _The Little Schemer_ defines `atom?` as neither a pair nor the empty list; Common Lisp's `atom` includes `nil`. Scheme `cons` accepts any second argument, including a non-list. Do not generalize the book's list-only exercises into API restrictions. Use numeric equality for numbers and structural equality for compound values, rather than extending its restricted use of `eq?`.

## Common Lisp collections and ownership

From _ANSI Common Lisp_, chapters 3, 4, 6, and 12:

- Choose equality deliberately: `eq` for object identity where guaranteed, `eql` for identity plus same-type numeric/character values, `equal` for structural lists and string contents. `equal` does not recursively compare arbitrary arrays or structures. Use `=` for numeric equality across numeric types.
- Lists are linked conses. Repeated indexed access with `nth` costs traversal; use sequential traversal, a vector for indexed access, or a hash table for keyed lookup as the workload requires.
- `cons` and `append` can share tails; `copy-list` copies only the outer spine. Before `nconc`, `nreverse`, `delete`, or `sort`, establish which structure the caller owns and retain the returned value. Destructive sequence operations need not preserve the original head.
- Never mutate quoted constants. Allocate mutable data explicitly; a shallow copy does not isolate nested objects.
- Closures retain lexical bindings, including mutable state. Common Lisp special variables are dynamically bound; inspect declarations before assuming a closure captured a lexical value.

This original Common Lisp example makes sharing visible without modifying a literal:

```lisp
(let* ((tail (list :b :c))
       (whole (cons :a tail))
       (copy (copy-list whole)))
  (assert (eq (cdr whole) tail))
  (setf (car tail) :changed)
  (assert (equal whole '(:a :changed :c)))
  (assert (equal copy '(:a :b :c))))
```

## Common Lisp macro safety

From _On Lisp_, chapters 3–5 and 7–10:

- Start with a function, possibly accepting a thunk. Use a macro when the interface needs unevaluated syntax, caller-visible bindings, or evaluation control. Bottom-up design means extracting useful operations from actual programs; it does not require creating a DSL.
- Specify which forms run, how many times, and in what order. Bind a value once when reuse would duplicate effects; preserve intentional conditional evaluation.
- Use `gensym` for private generated bindings. Also inspect free references: a fresh temporary does not prevent a caller's local function or macro binding from changing an expansion's meaning. Document any intentional capture, such as an anaphoric binding.
- Keep expansion functions free of application side effects; expansion can occur during compilation, inspection, or loading. Ensure helpers needed at expansion time are available in a fresh compilation environment.
- Inspect `macroexpand-1`, then execute with effectful arguments and caller names that could collide. Expansion shape alone does not prove runtime semantics.
- For generalized places, use standard facilities such as `incf` or `define-modify-macro` when applicable. A place can contain effectful subforms; repeating it in a hand-written `setf` expansion can evaluate those subforms twice (_On Lisp_, chapter 12).

This original macro evaluates its numeric test once and evaluates the body only when the value is positive:

```lisp
(defmacro when-positive (expression &body body)
  (let ((value (gensym "VALUE")))
    `(let ((,value ,expression))
       (when (plusp ,value) ,@body))))

(let ((calls 0) (value :caller))
  (assert (eq (when-positive (incf calls) value) :caller))
  (assert (= calls 1))
  (when-positive 0 (incf calls))
  (when-positive -1 (incf calls))
  (assert (= calls 1)))
```

## State, streams, and interpreters

From _SICP_, §§1.1.5, 2.1.2, 3.1–3.3, 3.5, and 4.1–4.2:

- Keep clients behind constructors/selectors so representation changes remain local. Add that boundary where there is a representation invariant to protect.
- Substitution explains pure procedure applications; assignment and shared state require tracking environments, bindings, and object identity. Trace which closures share a binding when debugging state.
- For mutable structures, check aliases and cycles before using a recursive list traversal. Mutation changes what other references observe.
- A stream requires explicit delayed computation in an eager language. State whether forcing is memoized, when effects occur, and which retained references keep a realized prefix alive. SICP's stream helpers are teaching definitions, not automatically installed APIs.
- When implementing an evaluator, make the environment and supported syntax explicit. Decide operand order and eager/lazy evaluation deliberately; do not accidentally inherit them from the host language or expose host `eval` to untrusted input.

## Scheme portability checks

Use R7RS-small to distinguish standard Scheme behavior from teaching conventions and implementation extensions:

- Only `#f` is false; `'()` and zero are true. Bare `()` is not a self-evaluating empty-list expression.
- Operator and operand evaluation order in a procedure call is unspecified. `let` initializer order is also unspecified; use `let*` or explicit sequencing when effects must occur in order.
- Proper tail recursion applies to calls in tail context, including mutual calls. It does not make a traversal with pending additions or `cons` operations a constant-space process.
- Quoted constants are immutable. Use constructors for objects that will be changed.
- Prefer `syntax-rules` for portable hygienic macros. Do not transplant Common Lisp `defmacro` or `gensym` patterns without the implementation's macro-system rules.
- Check imports and library availability against the project's actual Scheme report. R7RS-small is not a claim that a given implementation supports all of it.
