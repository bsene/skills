# Data structures and algorithms

Adapted and condensed from _Learn Programming with OCaml_ by Sylvain Conchon and Jean-Christophe Filliâtre, English translation by Urmila Nair: [chapters 4–9, 11, and 13](https://usr.lmf.cnrs.fr/lpo/lpo.pdf). This adaptation changes the explanations and examples and is licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Use standard-library collections for ordinary work. Implement the book's structures when studying their invariants or when the project requires behavior the existing collections cannot provide.

## Choose the representation from the operations

| Need                   | Starting point             | Cost or invariant to explain                                                                       |
| ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| Immutable ordered keys | `Set.Make` / `Map.Make`    | Balanced search trees; logarithmic lookup/update, ordered traversal                                |
| Mutable key lookup     | `Hashtbl` / `Hashtbl.Make` | Expected constant-time lookup with suitable hashing; collisions and resizing matter                |
| Mutable FIFO           | `Queue`                    | Avoid repeatedly appending to a list                                                               |
| Persistent FIFO        | Two lists                  | Logical contents are `front @ List.rev rear`; cons onto `rear`, reverse only when `front` is empty |
| Growable array         | Geometric capacity growth  | Keep logical size separate from capacity; doubling amortizes repeated extension                    |
| Shared immutable edits | Persistent tree or zipper  | Rebuild the path to the edited node; share unchanged branches                                      |

The two-list queue has constant amortized cost along a successive history of operations from empty. One pop can still take linear time. Repeatedly popping the same old version can repeat the reversal; the amortized claim does not cover arbitrary branching histories.

For a growable array, preserve `0 <= size <= capacity` and check access against `size`. Growing by one slot on each insertion causes quadratic total copying; geometric growth makes it linear over many insertions. When shrinking a generic array, clear discarded references if retaining them would keep large objects alive.

## Recursive memoization needs one shared cache

Wrapping an already recursive function caches only its outer call: internal calls still use the original function. Instead, allocate one table outside the recursive worker and route recursive calls through that worker.

```ocaml
let memo_rec step =
  let cache = Hashtbl.create 32 in
  let rec solve key =
    match Hashtbl.find_opt cache key with
    | Some value -> value
    | None ->
      let value = step solve key in
      Hashtbl.replace cache key value;
      value
  in
  solve

let fib = memo_rec (fun solve n ->
  if n < 0 then invalid_arg "fib"
  else if n < 2 then n
  else solve (n - 1) + solve (n - 2))
```

This adaptation uses `find_opt` and `replace` in place of the book's exception-based lookup and `add`. Memoize deterministic computations with stable keys. The table retains keys and results for the worker's lifetime. This implementation does not detect recursive dependency cycles or provide synchronization between domains. Fibonacci results still overflow `int`.

Prefer bottom-up dynamic programming when the dependency order is known. If each row depends only on the previous row, keep a rolling row rather than the entire table. In-place updates must preserve unread inputs: Pascal's triangle updates right to left so `row.(j - 1)` still belongs to the previous row.

## Graph representation and traversal

Choose adjacency lists for sparse graphs: storage is proportional to vertices plus edges. An adjacency matrix uses quadratic space but supports constant-time edge tests. Traversing all successors in a matrix scans a whole row, even when few edges exist.

For BFS, use a FIFO queue and mark a vertex discovered when enqueuing it, preventing duplicate work. BFS gives shortest paths by edge count for unweighted graphs. DFS needs a visited set on cyclic graphs; deep recursive traversal can overflow the stack.

Dijkstra requires nonnegative weights. Bellman–Ford supports negative edges and can detect reachable negative cycles. State these preconditions before choosing an algorithm. The usual linear BFS/DFS bound assumes adjacency traversal proportional to the edges visited.

## Hash-consing is a specialized equality optimization

Hash-consing interns immutable nodes through a shared constructor. Only with a maintained canonicalization invariant can physical identity stand for structural equality within that interned representation. Hide raw construction and avoid mutable children that invalidate the invariant. Weak storage allows unused interned nodes to be collected; a normal strong table retains them.

Keep ordinary structural equality as the default. Read [runtime-model.md](runtime-model.md) before explaining physical identity, and [testing-and-quality.md](testing-and-quality.md) when validating a custom implementation.
