# Database Choice (Seven Databases view)

Each engine in _Seven Databases in Seven Weeks_ optimizes a different corner. Match to workload.

## Profiles

| Database   | Model                       | Query style                                                                              | Consistency / scale stance                                                        | Reach for it when                                     |
| ---------- | --------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| PostgreSQL | Relational                  | SQL, stored procedures, extensions (full-text, trigram, fuzzy, cube, pivot via crosstab) | ACID, single node plus replicas                                                   | Default OLTP; strong constraints; rich ad hoc queries |
| Riak       | Key-value, Dynamo-style     | Key get/put, links, MapReduce, secondary indexes                                         | Eventually consistent, tunable `n/r/w`, vector clocks, no single point of failure | Must stay writable through node loss; simple access   |
| HBase      | Wide column, Bigtable-style | Row-key get/scan, filters                                                                | Strong per-row consistency, sits on HDFS, sorted by row key                       | Billions of rows, sequential scans, Hadoop ecosystem  |
| MongoDB    | Document (BSON)             | JSON-ish query language, aggregation, indexes, geospatial                                | Replica sets with failover, auto-sharding                                         | Evolving shapes, nested data, developer speed         |
| CouchDB    | Document (JSON)             | HTTP/REST, MapReduce views, replication                                                  | Multi-master replication, MVCC revisions, conflicts surfaced                      | Offline-first, sync between devices/sites             |
| Neo4j      | Property graph              | Traversals, Cypher                                                                       | ACID, mostly single-machine scale                                                 | Social/recommendation/path/dependency queries         |
| Redis      | In-memory data structures   | Commands on strings, hashes, lists, sets, sorted sets, pub/sub                           | Fast, optional persistence (snapshots, append-only log), replication              | Cache, counters, rate limits, queues, leaderboards    |

## Selection flow

1. Need multi-row ACID and ad hoc queries? **PostgreSQL**.
2. Is the data mostly relationships with deep traversal? **Neo4j** (or recursive SQL if shallow).
3. Must writes survive node and datacenter failure with no coordinator? **Riak**-style leaderless.
4. Sync across disconnected clients? **CouchDB**.
5. Nested, varying records, read whole? **MongoDB** (or PostgreSQL `jsonb`).
6. Enormous ordered tables, scan by key prefix? **HBase**.
7. Sub-millisecond ephemeral state? **Redis**.

## Polyglot guidance

- One source of truth; others derived (see [Batch and stream](batch-and-stream.md)).
- Each added datastore costs operations, backups, monitoring, and skills. Justify it with a measured need.
- PostgreSQL covers many secondary needs (jsonb documents, full-text search, queues via `SKIP LOCKED`, pub/sub via `LISTEN/NOTIFY`) before a second store is warranted.

## Questions to ask per candidate

| Question                                          | Why it matters                        |
| ------------------------------------------------- | ------------------------------------- |
| Atomic scope: row, document, or multi-record?     | Determines invariants you can enforce |
| Consistency under partition?                      | Stale reads and conflicts             |
| How does it shard, and can keys be changed later? | Hot spots and migrations              |
| How are backups and restores verified?            | Reliability is proven by restore      |
| What happens on node loss? On disk full?          | Operational maintainability           |
| Query flexibility vs known access patterns        | Index and key design cost later       |
