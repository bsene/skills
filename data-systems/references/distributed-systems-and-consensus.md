# Distributed Systems and Consensus

## Unavoidable faults

| Fault                   | Consequence                                                  |
| ----------------------- | ------------------------------------------------------------ |
| Network loss/delay      | Cannot tell a dead node from a slow one; only timeouts exist |
| Unsynchronized clocks   | Wall-clock ordering and expiry are unreliable                |
| Process pauses (GC, VM) | A node may act on an expired lease without knowing           |
| Partial failure         | Some parts work, others do not, nondeterministically         |

## Practices

- Every remote call: timeout, bounded retry with jitter, idempotency key, circuit breaker.
- Do not use local time to order writes across nodes (last-write-wins silently drops data). Use logical/version clocks, or a hybrid logical clock.
- Use time only for coarse things (TTL, logging), with error bounds in mind.
- **Fencing tokens**: a lock/lease grants a monotonically increasing token; the storage rejects writes with older tokens. Leases alone are unsafe.
- Truth is decided by a majority (quorum), not by one node's belief about itself.
- Test with fault injection: partitions, delays, node kill.

## Consistency models

| Model        | Promise                                     | Cost                                 |
| ------------ | ------------------------------------------- | ------------------------------------ |
| Eventual     | Replicas converge if writes stop            | Weak, anomalies visible              |
| Causal       | Cause is seen before effect                 | Metadata tracking                    |
| Linearizable | Behaves like a single copy, real-time order | Latency; unavailable under partition |

Linearizability is needed for: locks and leader election, uniqueness constraints, cross-channel timing dependencies. It is not needed for most reads; causal consistency is often enough.

## CAP, stated usefully

During a network partition you choose between consistency (linearizable) and availability. Outside partitions, the real trade is latency vs consistency. Treat CAP as a narrow result, not a database taxonomy.

## Consensus

Consensus = nodes agree on one value, even with failures. Needed for: leader election, atomic commit, total-order broadcast, uniqueness.

- Algorithms: Paxos, Raft, Zab (ZooKeeper), Viewstamped Replication. Usually need a majority alive: 3 nodes tolerate 1 failure, 5 tolerate 2.
- Total-order broadcast = replicated log; equivalent to consensus.
- Do not write your own. Use ZooKeeper, etcd, or Consul for locks, config, membership, leader election; keep its data small.
- Cost: synchronous replication, sensitive to network, lower throughput; reserve it for the small control-plane data.

## Failure-mode checklist for reviews

1. What happens if this call times out after the server acted?
2. What if the same message arrives twice or out of order?
3. What if two nodes both think they hold the lock?
4. What if a replica is minutes behind?
5. What if a clock jumps by seconds?
