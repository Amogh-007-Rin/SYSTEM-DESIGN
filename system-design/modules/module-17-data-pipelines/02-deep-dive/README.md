# Module 17 — Deep Dive: CDC, Lakehouses, Columnar Storage, and Orchestration

## Why This Matters

Knowing "Lambda runs batch and stream side by side" is trivia until you can explain how data actually *gets* into either layer without your application code manually publishing every change, how a multi-petabyte analytics platform avoids paying warehouse prices for raw log storage, why an analytics query that touches 3 columns out of 200 doesn't read all 200, and how a pipeline with twenty interdependent steps reliably runs in the right order every night without a human watching it. This deep dive is the operational layer underneath the concepts — the part that shows up when an interviewer asks "okay, but how does the data actually get there?"

---

## Change Data Capture (CDC)

**Change Data Capture** is the technique of capturing every insert, update, and delete made to a database and turning it into a stream of change events — without changing the application code that writes to that database at all.

The naive alternative — having the application also publish an event to Kafka every time it writes to the database — is fragile: it requires every code path that touches the database to remember to also publish, and a crash between the database write and the publish creates an inconsistency (the classic **dual-write problem**, also discussed via the outbox pattern in [Module 08](../../module-08-message-queues/)). CDC sidesteps this entirely by reading from a place that's *always* accurate and *already* exists: the database's own **transaction log** (PostgreSQL's WAL, MySQL's binlog) — the durable, ordered record every database already writes internally for crash recovery and replication, long before CDC tools existed.

**Debezium** is the dominant open-source CDC platform. It runs as a set of Kafka Connect connectors, one per source database, each tailing that database's transaction log and converting every committed change into a structured event (containing the before-image, after-image, operation type, and metadata) published to a Kafka topic — typically one topic per source table. Downstream consumers (a search index updater, a cache invalidator, a data warehouse loader) subscribe to these topics and react to changes within milliseconds of the commit, with zero changes to the original application.

> 💡 **Note:** CDC's biggest practical superpower is that it makes a database an event source *retroactively* — for a database that's been running in production for years with no events ever published from it, CDC can start streaming every future change without touching a single line of the application that writes to it.

> ⚠️ **Warning:** Transaction-log-based CDC captures the bytes of what *changed*, not why — you get "row 42 in the `orders` table changed `status` from `pending` to `shipped`," not the business event "order was shipped by warehouse worker X." For pipelines that need rich business-event semantics (not just raw row diffs), CDC is often a starting point that's enriched by joining against other event sources, not a complete replacement for application-level event publishing.

A hands-on simulation of tailing a mock transaction log and converting entries into change events is in [`examples/cdc-simulator.ts`](./examples/cdc-simulator.ts).

> 📊 **Diagram:** `cdc-pipeline.drawio` — Shows an application writing only to its own database, a Debezium connector tailing that database's transaction log, converting committed changes into events published to Kafka topics, and multiple independent downstream consumers reacting to those events.

---

## Data Lake vs. Data Warehouse vs. Data Lakehouse

These three terms describe an evolution in where and how analytical data is stored:

| | Data Warehouse | Data Lake | Data Lakehouse |
|---|---|---|---|
| **Data format** | Structured, schema enforced on write | Any format — structured, semi-structured, raw files | Open columnar formats (Parquet/ORC) with an added transactional metadata layer |
| **Storage** | Often proprietary, tightly coupled to compute | Cheap object storage (S3, ADLS), decoupled from compute | Cheap object storage, decoupled from compute |
| **Schema** | Schema-on-write — must be modeled before loading | Schema-on-read — interpreted however a given job chooses | Schema-on-write, enforced via the metadata layer, but on top of lake-style storage |
| **Strengths** | Fast, reliable SQL analytics, strong consistency | Flexible, cheap, holds anything (including raw/ML data) | Warehouse-grade reliability and SQL performance, lake-grade cost and flexibility |
| **Weaknesses** | Expensive at huge scale, rigid schema, often siloed from raw/ML data | Easy to turn into a "data swamp" — ungoverned, inconsistent, hard to trust for BI | Newer ecosystem; still maturing tooling compared to decades-old warehouses |
| **Examples** | Snowflake, Redshift, BigQuery (classic mode) | S3/ADLS + raw files, Hadoop-era HDFS lakes | Databricks Delta Lake, Apache Iceberg, Apache Hudi |

A **data warehouse** stores structured, modeled data (typically star-schema, per the [concepts section](../01-concepts/README.md)) and enforces a schema before any data is loaded, optimized for fast, reliable, governed SQL analytics — but historically expensive to scale and rigid about what it could hold (no raw clickstream JSON, no images for ML training).

A **data lake** stores everything, in any format, cheaply, in object storage, deferring schema interpretation to read time ("schema-on-read") — this flexibility is exactly what made lakes attractive for ML training data and semi-structured logs that a warehouse's rigid schema-on-write model couldn't accommodate. The well-known failure mode is the **data swamp**: without governance, a lake accumulates ungoverned, undocumented, inconsistent data that nobody fully trusts, because "store anything in any format" comes with no guardrails by default.

A **data lakehouse** (Databricks' Delta Lake, Apache Iceberg, Apache Hudi) is the attempt to get both: data sits in cheap object storage in an open columnar format exactly like a lake, but an added **transactional metadata layer** on top provides ACID transactions, schema enforcement, time travel (querying data as it existed at a past point), and the reliability guarantees that previously only a warehouse offered — without needing to copy data into a separate, proprietary warehouse system at all.

> 🎯 **Interview Tip:** If asked to design a modern analytics platform from scratch, naming the lakehouse pattern — "store once in open columnar format on object storage, add a transactional metadata layer (Iceberg/Delta) on top, let both BI tools and ML training jobs read the same copy" — signals current, practitioner-level knowledge, since avoiding the classic warehouse-vs-lake duplication (and the ETL pipeline needed to keep two copies in sync) is exactly the problem lakehouses were built to solve.

---

## Column-Oriented Storage: Parquet and ORC

Traditional row-oriented storage (the layout most OLTP databases use) stores every column of a row contiguously — fetching one full row (all its columns) is fast, but an analytical query like `SELECT AVG(fare) FROM rides` that only needs *one* column out of twenty still has to read every row's full set of columns off disk, discarding nineteen-twentieths of what it read.

**Parquet** and **ORC** are **column-oriented** ("columnar") file formats: all values for a single column are stored contiguously, across all rows, rather than row-by-row. This delivers two compounding wins for analytical workloads:

1. **I/O reduction**: a query that only needs 3 of 50 columns reads only those 3 columns' data off disk — not the other 47. For wide analytical tables, this alone can cut I/O by an order of magnitude.
2. **Compression efficiency**: values within a single column tend to be far more similar to each other than values across different columns of the same row (a `city` column might have only a handful of distinct values repeated millions of times) — columnar layout lets compression algorithms exploit that similarity far more effectively than compressing heterogeneous row-major data, often achieving dramatically better compression ratios.

Both formats also store **column statistics per block** (min/max values, null counts) that let a query engine skip entire blocks that provably can't contain matching rows for a filter (`WHERE date >= '2024-01-01'`) without reading them at all — a technique called **predicate pushdown**.

> ⚠️ **Warning:** Columnar formats are a poor fit for OLTP-style workloads that read or write one full row at a time (fetch this one order, update this one user) — reconstructing a full row means touching every column's separate storage location, which is the opposite of what row-oriented storage is good at. This is exactly why production application databases stay row-oriented while their downstream analytical copies convert to columnar formats — different access pattern, different optimal layout.

---

## Apache Airflow: DAG-Based Workflow Orchestration

A real pipeline is rarely one job — it's typically a chain: extract from five sources, wait for all five, transform, load into a staging table, validate, then load into the final warehouse table, then trigger a downstream report. Each step depends on specific other steps finishing first, and steps can fail and need retrying. **Apache Airflow** is the dominant tool for expressing and running exactly this: pipelines are defined as a **DAG (Directed Acyclic Graph)** of tasks, where edges express "this task must finish before that one starts," and Airflow's scheduler handles running tasks in dependency order, retrying failures, alerting, and providing a UI to see the current state of every run.

The "directed acyclic" part matters concretely: dependencies must point in one direction with no cycles, because a cycle (task A depends on B, which depends on A) would mean the pipeline could never start — Airflow validates this at DAG-definition time and refuses to schedule a cyclic graph.

Airflow DAGs are defined as Python code (not a drag-and-drop UI or static config), which means dependency logic, dynamic task generation, and branching can all be expressed with real programming constructs — a deliberate design choice that trades some declarative simplicity for the full expressive power of a general-purpose language.

> 💡 **Note:** Airflow orchestrates *when and in what order* tasks run — it is not itself a data processing engine. A typical Airflow task is a thin wrapper that triggers a Spark job, runs a SQL query against a warehouse, or calls an API; the heavy data processing happens in those external systems, with Airflow as the conductor deciding the order and handling retries/alerting around them.

A minimal DAG executor that runs tasks respecting dependency order, in the spirit of what Airflow's scheduler does, is in [`examples/dag-executor.ts`](./examples/dag-executor.ts).

> 📊 **Diagram:** `lambda-architecture.drawio` *(shared with [01-concepts](../01-concepts/README.md))* — also useful here to visualize where an Airflow-orchestrated batch layer and an independently-running speed layer would sit relative to each other.

---

## Key Takeaways

- CDC reads a database's existing transaction log to produce a change-event stream with zero application code changes, sidestepping the dual-write problem that manually-published events suffer from — but it captures row-level diffs, not business intent.
- Data warehouses (structured, schema-on-write, fast SQL) and data lakes (anything, schema-on-read, cheap, prone to becoming an ungoverned "swamp") solved different problems; lakehouses (Delta Lake, Iceberg, Hudi) add a transactional metadata layer on top of lake-style storage to get both without keeping two copies of the data in sync.
- Columnar formats (Parquet, ORC) read only the columns a query needs and compress far better than row-oriented formats, which is why analytical warehouses and lakes standardize on them — at the cost of being a poor fit for single-row OLTP access patterns.
- Predicate pushdown (skipping whole blocks using stored min/max statistics) is a major reason columnar query engines can be dramatically faster than naively scanning every row.
- Airflow orchestrates the *order and retry logic* of a multi-step pipeline as a DAG of tasks defined in code — it coordinates external systems (Spark, warehouses, APIs) rather than processing data itself.
