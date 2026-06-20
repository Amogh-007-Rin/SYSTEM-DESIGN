# Module 08 — Message Queues & Event-Driven Architecture

> The moment two services can't both be up, fast, and synchronously connected at the same time, a message queue is what lets the system keep working anyway.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 06 — Scalability](../module-06-scalability/) | Horizontal scaling, the idea of decoupling components so they can scale independently, and why tightly-coupled synchronous calls become a bottleneck under load |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain why asynchronous communication exists and articulate its trade-offs against synchronous RPC
- Choose between a message queue (RabbitMQ/SQS) and an event stream (Kafka) for a given access pattern
- Reason precisely about at-most-once, at-least-once, and exactly-once delivery semantics
- Design an event-driven system using the outbox pattern, idempotent consumers, and (briefly) sagas
- Implement an in-memory message queue with retries and a dead letter queue, and simulate Kafka consumer group rebalancing

---

## Estimated Time

**5–6 hours** total: Concepts: ~2h | Deep dive: ~2h | Exercises: ~1.5–2h

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

← [Previous Module ← Module 06 — Scalability](../module-06-scalability/) | [Next Module → Module 09 — Storage](../module-09-storage/)
