# Module 17 — Data Pipelines & Stream Processing

> Every "real-time dashboard," "recommendation engine," and "fraud alert" you've ever used is the visible tip of a data pipeline moving, transforming, and aggregating events you never see — this module is about how those pipelines are actually built.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 08 — Message Queues](../module-08-message-queues/) | Topics, partitions, consumer groups, at-least-once vs. exactly-once delivery — the backbone that stream processing is built on top of |
| [Module 09 — Storage Systems](../module-09-storage/) | Object storage, column-oriented thinking, block vs. object vs. file storage — the foundation for understanding data lakes and warehouses |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain the difference between batch and stream processing, and choose correctly between them for a given workload
- Articulate the Lambda and Kappa architectures, including why Kappa emerged as a simplification of Lambda
- Decide between ETL and ELT pipeline designs based on transformation cost, storage cost, and schema flexibility needs
- Design a star-schema data warehouse, correctly distinguishing fact tables from dimension tables
- Explain how Change Data Capture (CDC) tools like Debezium turn a database's transaction log into a stream of events
- Distinguish data lakes, data warehouses, and data lakehouses, and justify when each fits
- Explain why column-oriented formats (Parquet, ORC) are faster for analytical queries than row-oriented formats
- Reason about DAG-based workflow orchestration (Apache Airflow) for scheduling and sequencing pipeline stages

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
| [04 — Exercises](./04-exercises/) | Design challenges (this module has no coding challenges) |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 16 — Real-Time Systems](../module-16-real-time-systems/) | [Next Module → Module 18 — Search Systems](../module-18-search-systems/)
