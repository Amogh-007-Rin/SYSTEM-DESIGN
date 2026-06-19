# Sample Answer: "Design the Observability Stack for a Ride-Sharing Platform"

> A fully worked deep-dive answer for a microservices ride-sharing platform (rider app, driver app, matching service, pricing service, trip service, payments service, notification service).

---

## Identify the Critical User Journeys First

Before naming any tooling, identify what actually matters to observe. For ride-sharing, the two critical journeys are: **requesting a ride** (rider opens app → matching service finds a driver → trip starts) and **an in-progress trip** (location updates, pricing, eventual payment). Observability should be built around making these two journeys debuggable end-to-end, not around instrumenting services in isolation.

## Metrics: RED per Service, USE per Resource

Apply RED to every service on the critical path:
- **Matching service** — Rate = match requests/sec, Errors = "no driver found" + timeout rate, Duration = p50/p95/p99 time-to-match.
- **Pricing service** — Rate = quote requests/sec, Errors = pricing calculation failures, Duration = p99 quote latency (this is user-facing wait time before a ride is even requested).
- **Payments service** — Rate = charge attempts/sec, Errors = declined/failed charge rate, Duration = p99 payment processing time.

Apply USE to the resources underneath: the matching service's in-memory driver-location index (utilization = lookups/sec vs. capacity, saturation = queued match requests waiting on the index), the payments service's connection pool to the external payment processor (utilization = checked-out connections, saturation = queued requests waiting for a connection, errors = processor timeout count), and the message queue between trip events and the pricing/notification services (saturation = queue depth — a growing backlog here is an early warning before any user-facing symptom appears).

All metrics are exposed via Prometheus-style `/metrics` endpoints, scraped centrally, and visualized in Grafana — this matches the pull-based model and Histogram-for-latency convention from [01-concepts](../01-concepts/README.md).

## Logs: Structured, Correlated Across Every Hop

Every service emits structured JSON logs, and a **correlation ID** is generated at the rider's app request and propagated via header through the gateway, matching service, pricing service, trip service, and payments service. This is the single most important logging decision for this system — a ride request touches five-plus services, and without a correlation ID, reconstructing "what happened to this one ride request" means manually cross-referencing timestamps across five separate log streams. Logs are centralized (ELK or Loki) so `correlationId=<id>` is a single query across every service.

## Traces: Full Detail for the Critical Path

Distributed tracing (OpenTelemetry instrumentation, Jaeger backend) covers the ride-request journey as a single trace: gateway span → matching span → pricing span → trip-creation span, with the matching service's call to the location index and the pricing service's call to its rate-calculation logic as child spans. This is what answers "why did this specific ride take 4 seconds to match" in a way no aggregate metric can — the trace shows whether the 4 seconds was spent waiting on the location index, a slow pricing calculation, or queued behind other match requests.

> 📊 **Diagram:** `distributed-trace-flow.drawio` — Shows a single ride-request trace as a waterfall: gateway (root span) → matching service → location-index lookup (child span) → pricing service → rate calculation (child span) → trip-creation, with each span's duration visible, making clear which step actually consumed the 4 seconds.

> ⚠️ **Warning:** Tracing 100% of requests at ride-sharing scale (potentially tens of thousands of ride requests per second at peak) is expensive in storage and overhead. A practical strategy: always trace requests that error or exceed a latency threshold (tail-based sampling), and sample a small percentage (e.g., 1%) of otherwise-healthy requests for baseline visibility — full fidelity exactly where it's most valuable, reduced cost everywhere else.

## SLIs, SLOs, and Alerting

- **SLI**: percentage of ride requests matched with a driver within 30 seconds.
- **SLO**: 99% of ride requests matched within 30 seconds, measured over a rolling 7 days (a tighter window than a typical 30-day SLO, because ride-sharing demand is highly time-of-day and event-driven — a week captures rush hours and weekend surges without averaging across irrelevant history).
- **Alerting**: a burn-rate alert pages on-call when the matching failure rate is consuming the weekly error budget fast enough to blow the 99% target, not on every individual unmatched ride. A separate, lower-severity alert (not a page) fires on USE-level saturation signals like queue depth, surfaced on a dashboard for proactive investigation before they become symptom-level.

## Incident Response Path

A page fires on "match success rate breach" (symptom). The on-call engineer's runbook directs them to: check the matching service's RED dashboard (is Rate normal but Errors elevated, or did Rate itself spike — a demand surge vs. a service-level failure look different); check the location-index USE dashboard for saturation; pull a sample of trace IDs for failed matches from the same window and inspect them for a common failing span. This is the concrete "symptom → RED → USE → trace → root cause" path the framework in [03-interview-prep/README.md](./README.md) describes, applied to this specific system.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Trace sampling | Always trace errors/slow requests, sample 1% of healthy ones | Full visibility where it matters most; some healthy-request detail is lost, acceptable given aggregate metrics already cover that case |
| SLO window | 7-day rolling window for matching SLO | Reacts faster to real regressions during demand surges; noisier than a 30-day window for a slower-moving metric |
| Alerting | Burn-rate paging only, USE-level saturation as dashboards-only | Fewer, higher-confidence pages; relies on engineers proactively checking dashboards between incidents, not just waiting to be paged |
