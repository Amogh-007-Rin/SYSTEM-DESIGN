# Module 07 — Load Balancing

> A load balancer is the difference between "ten servers" and ten servers that actually behave like one reliable system.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 06 — Scalability](../module-06-scalability/) | Horizontal scaling, statelessness, and why a fleet of identical app servers is the precondition for load balancing to even make sense |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain what a load balancer does and when to reach for a hardware, software, or managed (cloud) solution
- Distinguish L4 (transport-layer) from L7 (application-layer) load balancing and pick the right one for a given workload
- Compare load balancing algorithms (Round Robin, Weighted Round Robin, Least Connections, IP Hash, Least Response Time, Random) and justify a choice for a given traffic pattern
- Design a highly available load balancing tier that has no single point of failure
- Explain connection draining, SSL termination trade-offs, and how load balancers, reverse proxies, API gateways, and service meshes relate to (and differ from) each other

---

## Estimated Time

**3–4 hours** total: Concepts: ~1.5h | Deep dive: ~1h | Exercises: ~1–1.5h

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

← [Previous Module ← Module 06 — Scalability](../module-06-scalability/) | [Next Module → Module 08 — Message Queues](../module-08-message-queues/)
