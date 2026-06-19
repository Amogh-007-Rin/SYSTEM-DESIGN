# Module 13 — Consistency, Consensus & CAP Theorem: Summary

> This module covered the forced trade-offs every distributed data store makes: the CAP theorem's choice between consistency and availability during a network partition, the full consistency-models spectrum from eventual to strict serializable, conflict resolution strategies (LWW, vector clocks, CRDTs), and the consensus mechanisms (Paxos's intuition, Raft's detailed leader election and log replication) that let a cluster of unreliable nodes agree on a single truth.

---

## Key Concepts

1. **CAP theorem** — during a network partition, a distributed system must choose Consistency or Availability; Partition tolerance isn't optional, so "CA" is only a real option for single-node systems.
2. **PACELC** — extends CAP to normal operation: even with no partition, every write trades latency against consistency (Else: Latency or Consistency).
3. **Consistency models spectrum** — eventual, monotonic reads, read-your-writes, session, linearizability, and strict serializability each make a specific, named promise at a specific coordination cost.
4. **Last-Write-Wins (LWW)** — timestamp-based conflict resolution that silently discards the losing concurrent write, with no error raised to anyone.
5. **Vector clocks** — detect whether two writes are causally ordered or genuinely concurrent, without resolving the conflict automatically.
6. **CRDTs (Conflict-Free Replicated Data Types)** — data structures whose merge is commutative, associative, and idempotent, guaranteeing automatic convergence with zero coordination (e.g., G-Counter, PN-Counter, OR-Set).
7. **Consensus (Paxos/Raft)** — getting a majority of unreliable nodes to agree on one value via majority quorums whose pairwise overlap prevents two different values from both being chosen.
8. **Raft leader election & log replication** — randomized election timeouts elect a leader with a majority vote; the leader then replicates log entries, committing once a majority of nodes have stored them durably.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Partition behavior | CP (block/error) | AP (serve possibly-stale data) | Being wrong is worse than being unavailable (locks, balances, inventory counts) | Being unavailable is worse than being briefly stale (shopping carts, social feeds, view counts) |
| Conflict resolution | Last-Write-Wins | CRDT merge | Simplicity matters more than preserving every concurrent write; conflicts are rare and low-stakes | Concurrent writes are expected and none should be silently dropped (carts, collaborative editing, counters) |
| Consistency guarantee | Linearizability | Eventual consistency | The field is load-bearing for correctness (account balance, username uniqueness, distributed lock) | The field can tolerate brief staleness in exchange for lower latency and higher availability |
| Write coordination | Synchronous multi-region (PC/EC) | Asynchronous replication (PA/EL) | Correctness matters more than write latency, constantly, not just during failures | Low latency matters more, and the application can tolerate eventual convergence |
| Consensus implementation | Paxos | Raft | Already deeply embedded in an existing system (legacy reasons) | Building something new — Raft's decomposition into election/replication/safety is dramatically easier to implement and reason about correctly |

---

## Common Interview Questions from This Module

- State the CAP theorem precisely. Why is "pick two of three" a misleading way to describe it?
- Classify Cassandra, ZooKeeper, and a single-node PostgreSQL instance as CP, AP, or CA, and justify each.
- What does PACELC add that CAP doesn't cover?
- Walk through how Raft elects a leader, including why the election timeout is randomized.
- What's the difference between linearizability and eventual consistency, and why is linearizability expensive to provide?
- How does a CRDT guarantee convergence without coordination? Name the three properties its merge function must satisfy.
- Would you choose a CP or AP database for a distributed shopping cart? Defend your answer against a concrete failure scenario.
- What's the difference between what a vector clock tells you and what a CRDT does for you?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| CP read path (quorum check, block/error on failure) | Refuses to answer rather than risk serving stale or conflicting data during a partition |
| AP read path (always answer locally, flag staleness) | Keeps serving requests during a partition, accepting possible staleness |
| G-Counter / PN-Counter CRDT | Distributed counters that accept writes from any region with zero coordination and still converge correctly |
| OR-Set CRDT | Sets (e.g., cart line items) where concurrent adds and removes both resolve deterministically without losing data |
| Raft leader election (randomized timeout + majority vote) | Elects a single leader in a cluster of unreliable nodes without a designated coordinator |
| Raft log replication (majority acknowledgment before commit) | Guarantees a committed write survives leader crashes, because a majority already has it durably stored |

---

## What This Unlocks

After this module, you can tackle:
- [Module 14 — Observability](../module-14-observability/), where understanding consistency guarantees informs what "correct" even means when monitoring distributed state
- Deeper system design interview questions that require justifying a database's consistency model, not just naming one (e.g., distributed locks, leaderboard counters, collaborative editing systems)
- Real-world evaluation of databases like Cassandra, DynamoDB, ZooKeeper, etcd, and Spanner by their actual CAP/PACELC posture rather than marketing claims

---

## Quick Reference

- **CAP**: during a partition, choose Consistency (CP) or Availability (AP) — partition tolerance isn't optional, so CA only exists for single-node systems.
- **PACELC**: even without a partition, you're choosing latency vs. consistency on every write.
- **Spectrum** (weakest → strongest): eventual → monotonic reads → read-your-writes → session → linearizable → strict serializable.
- **LWW** is simple but silently drops concurrent writes. **Vector clocks** detect conflicts but don't resolve them. **CRDTs** resolve them automatically (commutative + associative + idempotent merge).
- **Consensus** = majority quorum + guaranteed pairwise overlap, so two different values can never both be "chosen."
- **Raft** = randomized election timeout + majority vote (leader election) + majority acknowledgment before commit (log replication).

---

← [Previous Module ← Module 12 — Distributed Systems](../module-12-distributed-systems/) | [Next Module → Module 14 — Observability](../module-14-observability/)
