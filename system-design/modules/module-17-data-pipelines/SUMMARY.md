# Module 17 — Data Pipelines & Stream Processing: Summary

> This module covered how data actually moves and transforms across a system: the batch vs. stream processing split and the MapReduce/Spark and Kafka Streams/Flink engines behind each; ETL vs. ELT pipeline design; OLAP/OLTP and star-schema data warehouse modeling; the Lambda and Kappa architectures for combining (or unifying) batch and stream; and the operational layer underneath all of it — Change Data Capture, data lakes/warehouses/lakehouses, column-oriented storage, and Airflow-style DAG orchestration.

---

## Key Concepts

1. **Batch processing** — processes a complete, bounded dataset in one pass, trading latency for completeness; modeled on MapReduce, generalized by Apache Spark's in-memory DAG execution.
2. **Stream processing** — processes an unbounded sequence of events incrementally as they arrive, trading some completeness/accuracy for low latency; implemented via Kafka Streams (embedded library) or Apache Flink (dedicated cluster, event-time semantics).
3. **ETL vs. ELT** — transform-before-load (ETL) fits limited-compute destinations; load-then-transform (ELT) fits cheap, elastic cloud warehouse compute and preserves raw data for future re-derivation.
4. **OLAP vs. OLTP** — OLTP optimizes for many small transactional reads/writes (the production database); OLAP optimizes for large analytical scans (the warehouse) — never run heavy analytics directly against an OLTP database.
5. **Star schema** — a fact table (one row per business event, mostly numeric) surrounded by dimension tables (descriptive context), deliberately denormalized for fast, simple analytical joins.
6. **Lambda architecture** — runs batch (accurate, delayed) and stream (approximate, fast) layers side by side, merged at a serving layer; costs two codebases implementing similar logic.
7. **Kappa architecture** — stream-only; historical reprocessing replays a durable log through the same streaming job instead of maintaining a separate batch layer.
8. **Change Data Capture (CDC)** — reads a database's existing transaction log (via Debezium) to produce a change-event stream with zero application code changes, avoiding the dual-write problem.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Processing model | Batch (Spark, MapReduce) | Stream (Flink, Kafka Streams) | Latency tolerance is minutes-to-hours and you need complete, exact results (billing, historical reports) | Latency tolerance is milliseconds-to-seconds and approximate-then-refined results are acceptable (fraud checks, live dashboards) |
| Pipeline shape | Lambda (batch + speed layers) | Kappa (stream-only) | Batch and real-time genuinely need different logic, or exactness for historical data matters independently of the live path | The same transformation logic applies to both historical and live data, and your log retention/replay capacity can handle full reprocessing |
| Transform timing | ETL (transform before load) | ELT (transform after load) | Heavy upstream cleaning is required, or the destination has limited compute | Destination is a modern elastic-compute warehouse and you want raw data preserved for future re-derivation |
| Storage layout | Row-oriented | Column-oriented (Parquet/ORC) | Workload reads/writes one full row at a time (OLTP) | Workload aggregates a few columns across many rows (OLAP/analytics) |
| Architecture | Data warehouse | Data lake / lakehouse | Need governed, fast SQL analytics over already-modeled structured data | Need to cheaply store any format (including raw/ML data) with optional lakehouse-style ACID guarantees on top |

---

## Common Interview Questions from This Module

- What's the core difference between batch and stream processing, and how do you decide which one a system needs?
- Explain the Lambda architecture and name its biggest practical drawback.
- What is the Kappa architecture, and why was it proposed?
- What is Change Data Capture, and why is it preferred over having the application publish events directly?
- Why are column-oriented formats like Parquet and ORC faster for analytics than row-oriented storage?
- A pipeline needs to process 100K events/second with sub-500ms latency — what architectural decisions does that latency number force?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| MapReduce (map → shuffle → reduce) | Parallelizes a transformation across many machines with automatic fault tolerance, without the engineer managing distribution themselves |
| Event-time windowing with watermarks (Flink) | Produces correct incremental aggregates over a stream despite events arriving slightly out of order |
| Lambda's batch + speed + serving layers | Combines a stream's low latency with a batch layer's eventual exactness for the same underlying data |
| Kappa's log replay for reprocessing | Avoids maintaining a second batch codebase by replaying history through the same streaming job |
| CDC via transaction log tailing (Debezium) | Streams every database change downstream with zero changes to the application writing to that database |
| Star schema (fact + dimension tables) | Makes the join patterns analytical queries need simple and fast, at the cost of denormalized redundancy |
| Predicate pushdown on columnar formats | Skips entire data blocks that provably can't match a query's filter, without reading them |
| DAG-based task orchestration (Airflow) | Runs a multi-step pipeline's tasks in correct dependency order, with retries and visibility, without manual sequencing |

---

## What This Unlocks

After this module, you can tackle:
- [Module 18 — Search Systems](../module-18-search-systems/), which builds on this module's indexing and data-movement concepts to cover how search indexes are built and kept current
- [Module 19 — ML Systems](../module-19-ml-systems/), where the batch training / real-time inference split is a direct application of this module's batch-vs-stream and Lambda thinking
- Data-pipeline-heavy interview prompts like "design a real-time analytics dashboard," "design a fraud detection system," or "design an ETL pipeline for a data warehouse," all of which reduce to the latency-driven architecture decisions covered in this module

---

## Quick Reference

- **Batch** = bounded data, one final result, minutes-to-hours (MapReduce, Spark). **Stream** = unbounded events, incremental results, milliseconds-to-seconds (Kafka Streams, Flink).
- **ETL**: transform before load, fits limited-compute destinations. **ELT**: load raw then transform inside the warehouse, fits cheap elastic cloud compute.
- **OLTP** = small transactional ops on the app database. **OLAP** = large analytical scans on the warehouse. Star schema = fact table (events) + dimension tables (context), denormalized on purpose.
- **Lambda** = batch + speed layers side by side (two codebases, both correctness and speed). **Kappa** = stream-only, replay the log for reprocessing (one codebase, needs a capable enough stream processor).
- **CDC** (Debezium) tails a database's transaction log to stream every change downstream with no application changes — avoids the dual-write problem.
- **Data warehouse** = structured, schema-on-write, fast governed SQL. **Data lake** = anything, schema-on-read, cheap, risks becoming a "swamp." **Lakehouse** = lake storage + a transactional metadata layer (Iceberg/Delta/Hudi) for warehouse-grade reliability.
- **Parquet/ORC** (columnar) read only needed columns and compress better than row-oriented formats — the default for analytical storage; row-oriented stays default for OLTP.
- **Airflow** orchestrates a pipeline's tasks as a DAG (no cycles), running independent tasks concurrently and dependents only after their dependencies finish — it sequences external systems, it doesn't process data itself.

---

← [Previous Module ← Module 16 — Real-Time Systems](../module-16-real-time-systems/) | [Next Module → Module 18 — Search Systems](../module-18-search-systems/)
