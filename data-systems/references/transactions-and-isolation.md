# Transactions and Isolation

## ACID, honestly

| Letter | Meaning in practice                                                  |
| ------ | -------------------------------------------------------------------- |
| A      | Atomicity: abort leaves no partial writes (all or nothing)           |
| C      | Consistency: app invariants hold; the app defines them, DB helps     |
| I      | Isolation: concurrent transactions do not see each other's half-work |
| D      | Durability: committed data survives crashes (disk/WAL, replication)  |

Many NoSQL stores offer atomicity only per single key or document. Check before relying on multi-record updates.

## Anomalies and levels

| Anomaly             | Read committed | Snapshot isolation | Serializable |
| ------------------- | -------------- | ------------------ | ------------ |
| Dirty read          | prevented      | prevented          | prevented    |
| Dirty write         | prevented      | prevented          | prevented    |
| Non-repeatable read | possible       | prevented          | prevented    |
| Lost update         | possible       | engine dependent   | prevented    |
| Write skew          | possible       | possible           | prevented    |
| Phantom             | possible       | possible (writes)  | prevented    |

Level names vary across engines; "repeatable read" differs between vendors. Read your engine's docs.

## Fixing specific problems

| Problem                                   | Fix                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| Read-modify-write loses updates           | Atomic update (`SET n = n + 1`), `SELECT ... FOR UPDATE`, or compare-and-set |
| Write skew (two doctors both go off call) | Serializable, or lock the rows the check read, or a constraint               |
| Phantom (check for absence, then insert)  | Unique constraint, materialize conflicts, or serializable                    |
| Long report sees changing data            | Snapshot isolation / repeatable read on a replica                            |

```sql
-- compare-and-set: succeeds only if nobody changed it
UPDATE wiki SET content = 'new' WHERE id = 1 AND content = 'old';
```

## Ways to get serializability

| Approach                        | Idea                                     | Cost                                      |
| ------------------------------- | ---------------------------------------- | ----------------------------------------- |
| Actual serial execution         | One thread, stored procedures, in memory | Throughput of one core; partitioning hard |
| Two-phase locking (2PL)         | Readers block writers and vice versa     | Contention, deadlocks, tail latency       |
| Serializable snapshot isolation | Optimistic; detect conflicts at commit   | Aborts under high contention              |

Retry aborted transactions with backoff, but only if the operation is safe to repeat (no external side effects such as emails).

## Distributed transactions

- Two-phase commit (2PC): coordinator asks all to prepare, then commit. A participant that voted yes must wait for the coordinator, so a coordinator crash blocks locks ("in doubt").
- Avoid cross-system atomicity when possible: use outbox pattern or log-based sagas with idempotent steps and compensation.
- Exactly-once effects come from idempotent processing plus atomic offset/result commit, not from magic delivery.

## Defaults to remember

- PostgreSQL defaults to read committed; MongoDB offers single-document atomicity with multi-document options; Redis has MULTI/EXEC (queued, no rollback) and Lua scripts for atomic logic; Riak and CouchDB have no multi-key transactions.
