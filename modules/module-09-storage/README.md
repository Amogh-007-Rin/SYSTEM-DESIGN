# Module 09 — Storage Systems

> Every system eventually has to put bytes somewhere durable — choosing the wrong storage primitive (block, object, or file) is a decision that's painful and expensive to reverse once an application is built on top of it.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 04 — Databases](../module-04-databases/) | B-tree indexes, how a database persists data to disk, replication basics |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Choose between block storage, object storage, and file storage for a given workload, and justify the choice
- Explain how object storage systems like S3 achieve massive scale and high durability, and what "eventually consistent" actually means in practice
- Explain how LSM trees and B-trees differ as database storage engines, and why each is suited to different read/write workloads
- Design a storage backend (including CDN integration) for a media-heavy application like a photo-sharing service
- Reason about RAID levels, compression, checksums, and storage tiering as cost/performance/durability trade-offs, not just trivia

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
| [04 — Exercises](./04-exercises/) | Design challenges (this module has no coding challenges) |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 08 — Message Queues](../module-08-message-queues/) | [Next Module → Module 10 — CDN](../module-10-cdn/)
