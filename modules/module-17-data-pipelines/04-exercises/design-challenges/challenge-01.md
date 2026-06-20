# Design Challenge 01: Real-Time Analytics Pipeline for a Ride-Sharing App

**Difficulty:** Medium–Hard

## Prompt

Design a real-time analytics pipeline for a ride-sharing app (think Uber/Lyft) that needs to power three specific features:

1. **Trips per minute** — a live, citywide and per-city counter of trips started, updated continuously for an internal operations dashboard.
2. **Surge pricing triggers** — when the ratio of active ride requests to available drivers in a given geographic zone crosses a threshold, a surge pricing multiplier must be computed and applied within seconds.
3. **Driver availability heatmaps** — a map visualization showing where available drivers are currently clustered, refreshed every few seconds, used both internally and to show riders "driver density" near them.

## What to Produce

1. State the latency requirement for each of the three features explicitly, and explain whether they genuinely differ from each other.
2. Choose an architecture (batch-only, stream-only/Kappa, or Lambda) and justify it from your latency analysis in step 1 — don't default to "Kafka and Flink" without explaining why.
3. Design the ingestion path: what events does the system need (think about what a driver's app and a rider's app each emit), and how do they get into your pipeline?
4. Design the processing path for surge pricing specifically: what state must be maintained, over what window, and how is the surge multiplier actually computed and distributed back out to the apps in time to matter?
5. Design the storage/serving layer for all three features — they likely need different serving stores. Justify each choice.
6. Identify at least 2 failure modes specific to this domain (e.g., GPS data arriving out of order, a driver's app losing connectivity) and how your design handles them.
7. State at least 3 explicit trade-offs in your design.

There is no single "correct" architecture — focus on deriving each decision from the stated latency and correctness requirements, not from naming trendy tools.
