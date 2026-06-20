# Module 05 — Caching

> Caching is the highest-leverage performance technique in system design — and cache invalidation is famously one of the two hardest problems in computer science.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 04 — Databases](../module-04-databases/) | Read patterns, replication lag, what makes a read expensive |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Choose the right caching pattern (cache-aside, write-through, write-behind, read-through) for a given access pattern
- Choose an eviction policy (LRU, LFU, FIFO, TTL) and justify it
- Explain cache stampede, hot key, and cache penetration problems and their mitigations
- Implement an LRU cache and a bloom filter from scratch
- Design a complete caching strategy for a real, read-heavy system

---

## Estimated Time

**4–5 hours** total: Concepts: ~2h | Deep dive: ~1.5h | Exercises: ~1.5h

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

← [Previous Module ← Module 04 — Databases](../module-04-databases/) | [Next Module → Module 06 — Scalability](../module-06-scalability/)
