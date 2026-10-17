# Replication and Partitioning

## Why replicate

Availability, read scaling, geographic latency. Replication is about keeping copies consistent as changes arrive.

## Topologies

| Topology      | Writes go to         | Pros                                 | Cons / hazards                                 |
| ------------- | -------------------- | ------------------------------------ | ---------------------------------------------- |
| Single leader | One node             | Simple, no write conflicts           | Failover risk, leader is a write bottleneck    |
| Multi-leader  | A leader per site    | Local writes, tolerates site outages | Write conflicts need resolution                |
| Leaderless    | Any replica (quorum) | No failover, high availability       | Stale reads, sloppy quorums, conflict handling |

## Sync vs async

- Fully synchronous: one slow replica stalls writes. Common compromise: one sync follower, rest async ("semi-sync").
- Async: writes can be lost if the leader dies before followers catch up.

## Failover pitfalls

- Promoting a lagging follower drops acknowledged writes.
- Two nodes both believing they are leader (split brain): require fencing.
- Timeout too short causes needless failover; too long prolongs outage.

## Replication lag anomalies and guarantees

| Anomaly                            | Guarantee that fixes it | Tactic                                        |
| ---------------------------------- | ----------------------- | --------------------------------------------- |
| User does not see own write        | Read-your-writes        | Read own data from leader or by timestamp     |
| Value goes back in time on refresh | Monotonic reads         | Pin a user to one replica                     |
| Answer seen before its question    | Consistent prefix reads | Keep causally related writes in one partition |

## Leaderless quorums

With `n` replicas, write to `w`, read from `r`: choose `w + r > n` so read and write sets overlap. Typical `n=3, w=2, r=2`. Even so, edge cases (concurrent writes, partial failures, sloppy quorum, clock-based last-write-wins) can return stale data.

- Read repair and anti-entropy converge replicas.
- Concurrent writes: last-write-wins loses data silently; prefer version vectors with sibling merge (the Dynamo/Riak approach) or CRDTs for mergeable types.
- Riak exposes `n`, `r`, `w` per request, which lets you tune per operation.

## Partitioning (sharding)

| Scheme       | Good for                   | Problem                                      |
| ------------ | -------------------------- | -------------------------------------------- |
| Key range    | Range scans                | Hot spots (e.g. timestamp keys)              |
| Hash of key  | Even spread                | Range queries must hit all partitions        |
| Compound key | Hash first part, sort rest | Needs known first-part for efficient queries |

- Hot keys (celebrity user): add random suffix and merge on read.
- Secondary indexes: **local** (per partition; query scatters to all) vs **global** (partitioned by term; writes touch many partitions).
- Rebalancing: use many more fixed partitions than nodes, or dynamic splitting. Avoid `hash mod N` (moves nearly everything when N changes).
- Request routing: client-side map, routing tier, or any-node forwarding; a coordination service tracks assignments.
- Automatic rebalancing plus automatic failure detection can cascade; keep a human in the loop for big moves.

## Sequence

1. Single node + backups. 2. Add read replicas. 3. Cache. 4. Partition only when write volume or data size demands.
