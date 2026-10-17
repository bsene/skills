---
name: data-systems
description: >
  Data-system design — choosing databases, data models, storage engines, replication,
  partitioning, transactions, consensus, and batch/stream pipelines. Distilled from
  "Designing Data-Intensive Applications" (Kleppmann) and "Seven Databases in Seven Weeks".

  TRIGGER when: database choice (which database, SQL vs NoSQL, PostgreSQL vs MongoDB,
  Redis, Riak, HBase, CouchDB, Neo4j, graph database, key-value, document, column family),
  data modeling (relational vs document, schema-on-read, many-to-many, joins),
  storage (B-tree, LSM-tree, SSTable, index, OLTP vs OLAP, column store),
  encoding (Avro, Protobuf, Thrift, JSON, schema evolution, backward/forward compatibility),
  replication (leader/follower, multi-leader, leaderless, quorum, replication lag, failover),
  partitioning (sharding, hot spot, consistent hashing, rebalancing, secondary index),
  transactions (ACID, isolation level, snapshot isolation, serializable, write skew, lost update,
  deadlock, 2PC), distributed systems (CAP, clocks, network partition, fencing token, linearizability,
  eventual consistency, consensus, Raft, Paxos, ZooKeeper), pipelines (MapReduce, batch, stream,
  Kafka, CDC, event sourcing, exactly-once, idempotence), and reviews of scalability, reliability, or
  maintainability of a data architecture.
  DO NOT USE for SQL query syntax tuning in one engine, ORM usage, or REST payload design
  (`rest-api-design`).
metadata:
  user-invocable: "false"
---

# Data Systems

Pick data infrastructure from workload facts, not fashion. Every choice trades something: state what is given up.

## Workflow

1. **Characterize the workload.** Read/write ratio, data size and growth, record shape, relationships, access patterns (point lookup, range scan, aggregation, traversal), latency target (use percentiles, not averages), consistency need, failure tolerance.
2. **Model data around access patterns** — [Data models](references/data-models.md).
3. **Choose the store** with the decision table below, then [Database choice](references/database-choice.md).
4. **Decide the durability and scale story**: replication first, partitioning only when one node cannot hold the data or load — [Replication and partitioning](references/replication-and-partitioning.md).
5. **Pick isolation per invariant**, not per habit — [Transactions](references/transactions-and-isolation.md).
6. **Assume partial failure**: timeouts, retries, duplicates, clock skew — [Distributed systems](references/distributed-systems-and-consensus.md).
7. **Derive secondary views** (search, cache, analytics) from one source of truth via logs/streams — [Batch and stream](references/batch-and-stream.md).
8. **Plan evolution**: schemas change, so encode for compatibility — [Storage and encoding](references/storage-and-encoding.md).

## Three Core Qualities

| Quality         | Question                                         | Practical moves                                                                              |
| --------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Reliability     | Does it keep working when parts fail?            | Redundancy, timeouts, retries with idempotency, backups tested by restore, chaos testing     |
| Scalability     | What breaks if load grows 10x?                   | Name the load parameter (req/s, fan-out, hit rate); measure p50/p95/p99; scale up before out |
| Maintainability | Can a new engineer operate and change it safely? | Simple abstractions, observability, automation, small reversible changes, good defaults      |

- Tail latency matters: the slowest calls often hit your best customers, and one slow backend call slows the whole fan-out request.
- Faults (one component deviates) are not failures (whole system stops); design to contain faults.
- Human error is the leading cause of outages: sandboxes, staged rollouts, fast rollback.

## Decision Table (first cut)

| Need                                                   | Start with                              | Watch out for                                        |
| ------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------- |
| General OLTP, joins, constraints, ad hoc queries       | PostgreSQL (relational)                 | Vertical limits; sharding is manual                  |
| Self-contained documents, flexible shape, locality     | MongoDB / CouchDB (document)            | Weak joins; many-to-many modeling; schema drift      |
| Highly available writes, simple key access, always-on  | Riak / Dynamo-style (leaderless KV)     | Conflicts need resolution; eventual consistency      |
| Huge sparse tables, sequential scans by key range      | HBase / Bigtable-style (wide column)    | Row-key design is everything; operational weight     |
| Deeply connected data, path/neighbor queries           | Neo4j (graph)                           | Poor fit for bulk aggregation; scaling out is harder |
| Cache, counters, queues, leaderboards, ephemeral state | Redis (in-memory structures)            | Memory bound; persistence is a deliberate setting    |
| Analytics over many rows, few columns                  | Column-oriented warehouse               | Not for high-rate point writes                       |
| Full-text and faceted search                           | Search index fed from the primary store | Derived data, can lag; never the source of truth     |

Default: **start with PostgreSQL** unless a concrete requirement from the table rules it out; add specialized stores as derived views.

## Anti-patterns

| Smell                                              | Fix                                                         |
| -------------------------------------------------- | ----------------------------------------------------------- |
| Picking a store by popularity                      | Write the access patterns, then choose                      |
| Sharding before measuring a single-node ceiling    | Replicas, indexes, caching, bigger box first                |
| Assuming "transaction" means serializable          | Check the engine's actual default isolation level           |
| Using wall-clock time to order events across nodes | Logical clocks, version vectors, or a consensus-ordered log |
| Dual writes to DB and cache/search in app code     | One source of truth plus CDC/log-derived views              |
| Retrying non-idempotent operations                 | Idempotency keys or deduplication by operation id           |
| Averages as latency SLO                            | Percentiles over a rolling window                           |
| Schema change that breaks old readers or writers   | Add optional fields only; roll out in two phases            |

## Read on demand

| Read when                                                            | Reference                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Modeling data, choosing query style, joins vs denormalization        | [Data models](references/data-models.md)                                             |
| Indexes, B-tree vs LSM, OLTP vs OLAP, wire formats, schema evolution | [Storage and encoding](references/storage-and-encoding.md)                           |
| Replica topology, lag anomalies, quorums, sharding, rebalancing      | [Replication and partitioning](references/replication-and-partitioning.md)           |
| Choosing isolation levels, diagnosing anomalies, distributed commit  | [Transactions and isolation](references/transactions-and-isolation.md)               |
| Timeouts, clocks, linearizability, CAP, consensus, coordination      | [Distributed systems and consensus](references/distributed-systems-and-consensus.md) |
| MapReduce, stream processing, CDC, event sourcing, exactly-once      | [Batch and stream](references/batch-and-stream.md)                                   |
| Comparing the seven databases, picking by workload                   | [Database choice](references/database-choice.md)                                     |

## Sources

- Martin Kleppmann, _Designing Data-Intensive Applications_ (O'Reilly).
- Eric Redmond and Jim R. Wilson, _Seven Databases in Seven Weeks_ (Pragmatic Bookshelf).
