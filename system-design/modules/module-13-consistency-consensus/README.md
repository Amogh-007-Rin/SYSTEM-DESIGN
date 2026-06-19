# Module 13 — Consistency, Consensus & CAP Theorem

> When a network splits your database in half, you have to choose between answering with possibly-wrong data or not answering at all — this module is about how to make that choice deliberately instead of by accident.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 12 — Distributed Systems](../module-12-distributed-systems/) | Network partitions, replication, why distributed systems fail differently than single-node systems |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- State the CAP theorem precisely and explain why "pick two of three" is a misleading simplification
- Classify a real database (HBase, Cassandra, DynamoDB, ZooKeeper, etcd, a single-node RDBMS) as CP, AP, or CA and justify what it sacrifices
- Place a consistency guarantee on the spectrum from eventual consistency to strict serializability and explain what each one promises and costs
- Explain how Raft elects a leader and replicates a log, and why that gives you a practical mental model for "consensus" in interviews
- Implement a G-Counter CRDT and a simplified Raft leader election from scratch in TypeScript
- Defend a consistency model choice for a real system (e.g., a distributed shopping cart) against concrete failure scenarios

---

## Estimated Time

**6–8 hours** total: Concepts: ~2.5h | Deep dive: ~3h | Exercises: ~2h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | CAP theorem, CP/AP/CA systems, PACELC |
| [02 — Deep Dive](./02-deep-dive/) | Consistency models spectrum, CRDTs, Raft, ZooKeeper/etcd |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Coding challenges and design challenges |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 12 — Distributed Systems](../module-12-distributed-systems/) | [Next Module → Module 14 — Observability](../module-14-observability/)
