# Module 12 — Distributed Systems Fundamentals

> The moment your system spans more than one machine, you trade a world of simple guarantees for a world of partial failures — this module is about learning to reason rigorously about that trade.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 06 — Scalability](../module-06-scalability/) | Why systems are split across multiple machines in the first place |
| [Module 08 — Message Queues](../module-08-message-queues/) | Asynchronous communication, at-least-once delivery, and why ordering isn't free |
| [Module 11 — Microservices](../module-11-microservices/) | Independently deployed services that must coordinate despite network unreliability |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain why distributed systems are fundamentally harder than single-machine systems, citing partial failure, the lack of a global clock, and Peter Deutsch's 8 fallacies of distributed computing
- Classify a failure as crash, omission, or Byzantine, and explain why the distinction changes what protocols you need
- Compare single-leader, multi-leader, and leaderless replication and justify which one fits a given consistency/availability requirement
- Implement and reason about logical clocks (Lamport timestamps, vector clocks) to order events without a synchronized physical clock
- Explain quorum reads/writes, gossip protocols, Two-Phase Commit, and why distributed locks (Redlock) are more controversial than they first appear

---

## Estimated Time

**6–8 hours** total: Concepts: ~2.5h | Deep dive: ~2.5h | Exercises: ~2.5h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Coding challenges and design challenges |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 11 — Microservices](../module-11-microservices/) | [Next Module → Module 13 — Consistency, Consensus & CAP Theorem](../module-13-consistency-consensus/)
