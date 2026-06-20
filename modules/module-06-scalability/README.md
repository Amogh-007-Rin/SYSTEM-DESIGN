# Module 06 — Scalability

> Scalability is the difference between a system that works for your first 100 users and one that still works, unchanged in spirit, for your first 100 million.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 04 — Databases](../module-04-databases/) | Replication, sharding basics, what makes a query expensive at scale |
| [Module 05 — Caching](../module-05-caching/) | Cache-aside and write-through patterns — caching is one of the tools this module assumes you already have |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain the difference between vertical and horizontal scaling, and justify which one fits a given constraint
- Design stateless services and explain why statelessness is the precondition for horizontal scaling
- Walk through the standard "scaling journey" a system follows from a single server to a fully distributed architecture
- Apply Amdahl's Law and Little's Law to reason quantitatively about parallelization limits and queueing behavior
- Diagnose whether a system is CPU-bound, I/O-bound, or memory-bound, and pick the matching mitigation
- Design an auto-scaling policy and reason about the trade-offs of reactive vs. predictive scaling
- Evolve a single-server design through five concrete stages of user growth, naming the bottleneck and fix at each stage

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
| [04 — Exercises](./04-exercises/) | Design challenges |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 05 — Caching](../module-05-caching/) | [Next Module → Module 07 — Load Balancing](../module-07-load-balancing/)
