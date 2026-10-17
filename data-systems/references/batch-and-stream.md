# Batch and Stream Processing

## Principle

Keep one **system of record**; build everything else (indexes, caches, search, warehouse views) as **derived data** that can be rebuilt from it. Derived data flows through immutable, ordered logs.

## Batch

| Idea                                                | Note                                                        |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Input immutable, output new files                   | Reruns are safe; bugs are fixable by reprocessing           |
| MapReduce: map, shuffle, reduce                     | Simple but writes intermediate data to disk                 |
| Dataflow engines (Spark, Flink)                     | Keep intermediate state in memory/pipelined; usually faster |
| Joins: sort-merge, broadcast hash, partitioned hash | Choose by size: small side broadcast, else partition both   |
| Use cases                                           | Search indexes, recommendations, ETL, reports, ML features  |

Unix pipe analogy: small tools, uniform interface, outputs feed inputs, no mutation of inputs.

## Stream

| Concept          | Detail                                                                         |
| ---------------- | ------------------------------------------------------------------------------ |
| Log-based broker | Kafka-style: partitioned append-only log, consumers track offsets, replayable  |
| Message queue    | AMQP-style: per-message ack, delete after consume, no replay                   |
| CDC              | Capture DB changes as a stream to feed search/cache/warehouse                  |
| Event sourcing   | Store events as truth; state is a fold over events                             |
| Windows          | Tumbling, hopping, sliding, session; decide event time vs processing time      |
| Stream joins     | Stream-stream (window), stream-table (enrich), table-table (materialized view) |

- Handle late events with watermarks or allowed lateness.
- Fault tolerance: checkpoint state, or make the operation idempotent.
- **Exactly-once effect** = at-least-once delivery + idempotent or transactional output.

## Dual writes: do not

Writing to DB and search index (or cache) from app code creates divergence under races and partial failures. Write to the DB, then publish via CDC or outbox; consumers update derived stores in log order.

## Lambda vs unified

Maintaining separate batch and stream code paths doubles logic. Prefer one engine that reprocesses from the log for backfill.

## Correctness mindset

- End-to-end idempotence: carry a request id from the client to the final write.
- Unique constraints via a single partition/log order.
- Auditability: immutable logs let you replay and verify.
- Timeliness (derived views lag) is acceptable; integrity (no lost or duplicated effects) is not.
