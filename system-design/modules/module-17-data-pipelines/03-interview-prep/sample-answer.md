# Sample Answer: "Design a Real-Time Data Pipeline for Clickstream Analytics"

> A fully worked deep-dive answer applying the framework from this section's [README](./README.md). The prompt: design a pipeline that ingests clickstream events (page views, clicks, add-to-cart, purchase) from a high-traffic e-commerce site and powers both a live "active users / top products right now" dashboard and historical analytics (conversion funnels by day/week/month).

---

## Step 1 — Pin Down Latency Requirements

This prompt has **two distinct consumers with two distinct latency needs**, which is the single most important observation to make before designing anything:

- The **live dashboard** ("active users right now," "trending products") needs results within seconds — a number that's 10 minutes stale isn't "live."
- **Historical analytics** (conversion funnels by day/week) tolerates results that are accurate as of "by the next morning" — nobody needs yesterday's conversion funnel finished within milliseconds of it happening.

This split is exactly the shape **Lambda architecture** is built for: a low-latency path for the dashboard, a high-accuracy batch path for historical reporting, both reading the same underlying event stream.

## Step 2 — Volume and Shape of the Data

Clickstream events are high-volume (every page view, every click — easily tens of thousands of events/second at meaningful traffic), small (a few hundred bytes each: user ID, event type, page/product ID, timestamp, session ID), semi-structured (JSON), and append-only — an event, once recorded, is never updated or deleted. This shape (high-volume, small, immutable, append-only) is exactly what a log-based message system (Kafka) is built to ingest efficiently.

## Step 3 — Architecture Decision: Lambda

Given the genuinely different latency requirements *and* the genuinely different correctness needs (the dashboard can tolerate slight undercounting; the historical funnel report cannot), this is a case where **Lambda's two explicit layers are the more honest design** rather than Kappa's single-stream simplification — the speed layer and batch layer are allowed to compute slightly different things (a live approximate count vs. an exact historical count), not just the same logic running on a delay.

> 📊 **Diagram:** `lambda-architecture.drawio` — Shows clickstream events flowing into Kafka, then fanning out to both a Flink speed layer (feeding a live dashboard) and a Spark batch layer (feeding the historical warehouse), merged at a serving layer.

## Step 4 — Ingestion Path

- Client-side SDK (browser/mobile) fires a small JSON event for every page view, click, and conversion action, sent to a lightweight ingestion endpoint.
- The ingestion endpoint's only job is to validate the event shape and publish it to a **Kafka topic** (`clickstream-events`), partitioned by `userId` so that all of one user's events land on the same partition, preserving per-user event order — important later for session reconstruction and funnel analysis.
- Kafka is the natural fit here specifically because it durably retains events long enough that both the speed layer (reading the live tail) and the batch layer (reading a full day's worth) can consume from the *same* topic independently, at their own pace, without the ingestion path needing to know about either consumer.

## Step 5 — Processing Path

**Speed layer (Apache Flink):** consumes the live tail of `clickstream-events`, maintaining a small amount of in-memory state per time window — e.g., a 1-minute tumbling window counting distinct `userId`s seen (active users) and a count per `productId` (trending products). Flink's event-time windowing with watermarks handles events arriving slightly out of order (a mobile client on a flaky connection retrying a send) without undercounting a window that's still technically open. Results are pushed to the serving layer every few seconds.

**Batch layer (Apache Spark):** runs nightly (or hourly, for fresher historical numbers) over the complete day's events already durably stored, reconstructing full user sessions, computing exact conversion funnels (view → add-to-cart → purchase, with exact drop-off rates at each stage), and writing the results into the data warehouse in a star schema — a `funnel_events` fact table referencing `users`, `products`, and `date` dimension tables. Because this runs over the *complete* day's data rather than a forever-open window, it produces the exact, non-approximate numbers the historical reporting needs.

> 🎯 **Interview Tip:** Explicitly stating that the speed layer's active-user count is an *approximation* (subject to slight revision as late events settle) while the batch layer's funnel numbers are *exact* — and that this difference is intentional, not a bug — is a strong signal that you understand Lambda's actual trade-off rather than just naming the two layers.

## Step 6 — Storage and Serving Layer

- **Live dashboard**: the speed layer writes its per-window aggregates into a low-latency key-value store (e.g., Redis) that the dashboard's backend polls or subscribes to — a database built for analytical queries would be the wrong fit for "read this one current counter as fast as possible."
- **Historical analytics**: the batch layer writes into a column-oriented data warehouse (Parquet-backed lake table or a managed warehouse like Snowflake/BigQuery), star-schema modeled, queried by a BI tool for funnel/cohort reports. Column-oriented storage matters here because a funnel query typically aggregates a handful of columns (`event_type`, `timestamp`, `productId`) across billions of rows — exactly the access pattern columnar formats are built for.

## Step 7 — Failure and Correctness

- **Duplicate events** (a retried client send) are handled with an idempotency key (a client-generated event UUID) so that both the speed and batch layers can deduplicate — at-least-once delivery from Kafka plus idempotent processing equals effectively-once results without needing a true exactly-once protocol end to end.
- **Late-arriving events**: Flink's watermarking allows a window to wait a bounded grace period for stragglers before finalizing, trading a small amount of latency for substantially better accuracy on the live counts.
- **Speed layer crash**: Flink's periodic checkpointing means a restarted job resumes from its last checkpoint rather than reprocessing the entire stream from scratch or silently losing in-flight window state.
- **Batch layer failure**: simply reruns the next scheduled cycle against the same durably-stored day's data — since the batch layer's input (Kafka, retained, or already-landed raw events in the lake) doesn't disappear, a failed run is just a delayed run, not a data-loss event.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Lambda over Kappa | Two layers (Flink speed + Spark batch) | Higher operational complexity (two codebases) in exchange for genuinely different accuracy guarantees per consumer, which this prompt's two distinct audiences actually need |
| Kafka as ingestion log | Durable, partitioned, multi-consumer | Both layers read independently at their own pace; adds Kafka itself as infrastructure to operate |
| Approximate live counts | Speed layer trades exactness for sub-second freshness | Dashboard numbers may be briefly under/overcounted during a window's grace period — acceptable for a "right now" dashboard, not for billing |
| Star schema in the warehouse | Denormalized fact/dimension model | Fast, simple analytical joins for funnel queries; redundant storage compared to a normalized OLTP schema |
| Idempotency keys for dedup | Client-generated event UUIDs | Achieves effectively-once results on top of at-least-once delivery without a heavier exactly-once protocol |
