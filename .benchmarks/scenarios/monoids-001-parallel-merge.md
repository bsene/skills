---
id: monoids-001-parallel-merge
skill: monoids
---

# Prompt

Write Clojure code that aggregates event logs. Input is a collection of event maps like `{:type "login" :duration-ms 120 :user "u1"}`. Output is a single summary map `{:counts <type -> count>} :total-duration <sum> :users <set of user ids>}`.

Two hard requirements:

- It runs once per Kafka partition and the per-partition summaries are merged afterwards, so a `combine(summaryA, summaryB)` step must exist and must be associative — merging in any grouping/order must give the same result.
- An empty partition must produce a sensible empty summary, not an exception or nil.

Plain core Clojure, no libraries.

# Criteria

- [ ] Response provides a combine step over two summary maps built from pointwise associative ops (merge-with + for counts, + for totals, set union for users) such that merged summaries have the same shape as per-partition summaries
- [ ] Response uses `merge-with +` (pointwise map merge) for the counts map rather than nested manual key updates or a hand-rolled per-key loop
- [ ] Response uses set union (`clojure.set/union`, or `into #{}`/`reduce into`) for the user-id set, not concatenation-then-dedup
- [ ] Response handles empty input via natural neutral elements (0, {}, #{}) — e.g. `reduce` with an init or core functions' 0-arity behavior — with no `(if (empty? coll))` special-case branch returning nil or throwing
- [ ] Response states that associativity is what makes the chunked/partitioned merge order-independent (and safe to parallelize)
- [ ] Response does NOT define a Monoid protocol/record/type abstraction when core `reduce`/`merge-with`/`union` suffice