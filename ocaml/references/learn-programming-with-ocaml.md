# Learn Programming with OCaml

Use this reference when explaining OCaml through small programs, choosing exercises, or implementing data structures and algorithms.

## Source

_Learn Programming with OCaml: Algorithms and Data Structures_ by Sylvain Conchon and Jean-Christophe Filliâtre, translated into English by Urmila Nair.

- [Book website](https://usr.lmf.cnrs.fr/lpo/) — PDF and EPUB downloads; English translation funded by the OCaml Software Foundation, licensed CC BY-SA 4.0.
- [PDF](https://usr.lmf.cnrs.fr/lpo/lpo.pdf) — edition dated February 2, 2026.
- [Companion code](https://usr.lmf.cnrs.fr/lpo/code.html) — implementations accompanying the book.

## Where to look

Chapter and section numbers refer to the linked PDF.

| Task                                                                      | Chapters / sections                                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Understand compilers, the REPL, dune, and opam                            | Chapter 1                                                                    |
| Learn language constructs through working programs                        | Chapter 2: leap years, Monte Carlo, sieve, file copying, quadtrees, N-Queens |
| Explain type inference, runtime representation, or execution costs        | Sections 3.1–3.3                                                             |
| Implement arrays, bit vectors, ropes, or persistent arrays                | Chapter 4                                                                    |
| Choose sets and dictionaries: search trees, AVL trees, hash tables, tries | Chapter 5                                                                    |
| Compare imperative and persistent queues or priority queues               | Chapter 6                                                                    |
| Represent graphs and compare representation costs                         | Chapter 7                                                                    |
| Implement union-find or zippers                                           | Chapters 8–9                                                                 |
| Study arithmetic algorithms                                               | Chapter 10                                                                   |
| Compare memoization and dynamic programming; explore hash-consing         | Chapter 11                                                                   |
| Explain sorting and its complexity                                        | Chapter 12                                                                   |
| Implement traversal, shortest paths, or minimum spanning trees            | Chapter 13                                                                   |

## How to use it

Read the extracted guidance relevant to the task:

- [Representation and invariants](representation-and-invariants.md) — array aliasing, abstract/private types, persistence, comparators, and remainders.
- [Data structures and algorithms](data-structures-and-algorithms.md) — collection choices, amortized costs, recursive memoization, dynamic programming, graphs, and hash-consing.

Read the relevant section and companion implementation before attributing an algorithm or explanation to the book. Match the exercise to the user's current learning goal; explain the invariant and costs alongside the OCaml syntax.

The preface says the programs were compiled and tested with OCaml 4.14.0. Check examples against the target compiler and libraries before adapting them to a current project. Use the project's dune setup and testing conventions.

For equality and memory explanations, pair section 3.2 with [runtime-model.md](runtime-model.md). For automated validation, read [testing-and-quality.md](testing-and-quality.md).
