# Module 11 — Microservices Architecture

> Microservices don't make distributed systems problems go away — they trade one big, simple problem (a monolith's deployment bottleneck) for many small, hard ones (network calls, partial failure, and data consistency across service boundaries).

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 03 — API Design](../module-03-apis/) | REST/gRPC contracts, versioning — the shape of the calls services make to each other |
| [Module 07 — Load Balancing](../module-07-load-balancing/) | L4/L7 load balancing, service mesh sidecars, API gateway vs. load balancer distinction |
| [Module 08 — Message Queues](../module-08-message-queues/) | Asynchronous, event-driven communication — the backbone of choreographed sagas and decoupled services |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain the real differences between a monolith, SOA, and microservices, and argue both sides of the trade-off
- Decompose a monolithic system into services using business-capability, DDD subdomain, and Conway's Law lenses
- Choose between synchronous (REST/gRPC) and asynchronous (event-driven) communication for a given service interaction
- Design a saga (choreography or orchestration) with explicit compensating transactions for a multi-service transaction
- Implement a circuit breaker and explain how it, the bulkhead pattern, and a service mesh prevent cascading failure

---

## Estimated Time

**6–7 hours** total: Concepts: ~2.5h | Deep dive: ~2.5h | Exercises: ~2h

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

← [Previous Module ← Module 10 — CDN](../module-10-cdn/) | [Next Module → Module 12 — Distributed Systems](../module-12-distributed-systems/)
