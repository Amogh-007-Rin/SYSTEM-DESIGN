# Module 20 — Advanced Patterns & Putting It All Together

> This is the capstone: the patterns that separate "I can design a system" from "I can design a system that survives a bad day at FAANG scale," and the synthesis exercises that prove you can combine everything from Modules 01–19 under interview conditions.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 01 — Foundations](../module-01-foundations/) | This module is a capstone/synthesis module — it assumes and actively draws on **all of Modules 01–19** (databases, caching, scalability, load balancing, message queues, storage, CDN, microservices, distributed systems, consistency/consensus, observability, security, real-time systems, data pipelines, search, ML systems). There is no single new "building block" prerequisite; the prerequisite is the entire course. |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Design multi-region systems and reason about active-active vs. active-passive trade-offs, cross-region replication, and conflict resolution
- Generate globally unique, sortable IDs at scale and explain the trade-offs between UUID, Snowflake, and ULID schemes
- Design a distributed rate limiter that stays correct when enforced across many nodes, using Redis and Lua for atomicity
- Apply cell-based architecture, bulkheads, shadow traffic, and canary deployments to limit blast radius and ship safely at scale
- Operate at a senior/staff level in a system design interview: drive the conversation, manage ambiguity, and justify depth of trade-off discussion
- Independently design a complete, production-grade system from scratch (URL shortener, Twitter, Uber) touching every layer covered in this course

---

## Estimated Time

**6–8 hours** total: Concepts: ~2.5h | Deep dive: ~2h | Exercises: ~3h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Capstone design challenges (no coding challenges in this module) |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module](../module-19-ml-systems/) | [Back to Module Index](../../README.md)
