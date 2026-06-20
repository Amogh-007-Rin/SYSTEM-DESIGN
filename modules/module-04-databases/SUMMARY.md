# Module 04 — Databases: Summary

> This module covered the data layer decisions that are hardest to reverse: ACID guarantees, the real trade-offs between SQL and NoSQL data models, how indexes and replication actually work, and how sharding (and consistent hashing specifically) lets a dataset outgrow a single machine.

---

## Key Concepts

1. **ACID** — Atomicity, Consistency, Isolation, Durability — the transactional guarantees relational databases provide.
2. **NoSQL data models** — key-value, document, wide-column, graph — each suited to different access patterns, not a single alternative to SQL.
3. **B-tree indexing** — turns an O(n) scan into an O(log n) seek for selective queries, at the cost of slower writes and more storage.
4. **Replication** — single-leader, multi-leader, leaderless; synchronous trades latency for durability, asynchronous trades durability risk for speed.
5. **Sharding** — range, hash, and directory-based strategies for splitting data across nodes when one node isn't enough.
6. **Consistent hashing** — minimizes key remapping when shards are added or removed, solving the resharding problem naive modulo hashing creates.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Data model | SQL (relational) | NoSQL | Need ad-hoc queries/JOINs, strong consistency | Access patterns are known upfront, need schema flexibility or extreme write throughput |
| Replication | Synchronous | Asynchronous | Cannot tolerate any data loss on leader failure | Write latency matters more than that small durability risk window |
| Sharding | Hash-based (consistent hashing) | Range-based | Need even distribution, frequent rebalancing | Need efficient range scans across the sharded dimension |

---

## Common Interview Questions from This Module

- SQL or NoSQL? How do you decide?
- How does consistent hashing solve the resharding problem?
- Why is sharding harder to undo than to set up?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| B-tree / composite / covering indexes | Speeds up selective reads without scanning full tables |
| Connection pooling | Avoids repeated, expensive connection setup cost per request |
| Consistent hashing | Minimizes data movement when shards are added or removed |
| Expand-contract migrations | Enables zero-downtime schema changes on large, live tables |

---

## What This Unlocks

After this module, you can tackle:
- [Module 05 — Caching](../module-05-caching/), which assumes you understand read patterns and replication lag
- [Module 12 — Distributed Systems](../module-12-distributed-systems/) and [Module 13 — Consistency, Consensus & CAP Theorem](../module-13-consistency-consensus/), which build directly on replication and consistency concepts introduced here
- Medium/hard interview questions involving schema design, like [Twitter](../../interview-prep/question-bank/medium/twitter.md) and [distributed cache design](../../interview-prep/question-bank/hard/distributed-cache.md)

---

## Quick Reference

- **ACID** = Atomicity, Consistency, Isolation, Durability.
- **4 NoSQL types**: key-value, document, wide-column, graph.
- **B-tree index**: O(log n) seeks, but slower writes and more storage per index.
- **Sync replication** = safer, slower. **Async replication** = faster, small data-loss risk window.
- **Consistent hashing** = adding/removing a node only remaps its own slice of keys, not the whole keyspace.

---

← [Previous Module ← Module 03 — API Design](../module-03-apis/) | [Next Module → Module 05 — Caching](../module-05-caching/)
