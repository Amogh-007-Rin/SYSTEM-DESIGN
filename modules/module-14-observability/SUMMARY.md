# Module 14 — Observability: Monitoring, Logging & Tracing: Summary

> This module covered observability as the discipline of making a distributed system's internal state inspectable from the outside: the three pillars (metrics, logs, traces) and the Prometheus data model behind metrics, structured logging with correlation IDs, distributed tracing and context propagation, SLIs/SLOs/error budgets, the RED and USE methods for instrumenting services and resources, alerting that pages on symptoms rather than causes, and the operational practices — runbooks, chaos engineering, capacity planning — that turn observability data into actual reliability.

---

## Key Concepts

1. **Three pillars of observability** — metrics (aggregate trend), logs (detailed event record), traces (per-request path across services) — most powerful correlated together, not used in isolation.
2. **Prometheus metric types** — Counter (monotonically increasing), Gauge (point-in-time value), Histogram (bucketed observations, combinable across instances) — Histogram is preferred over Summary for anything aggregated fleet-wide.
3. **Structured logging with correlation IDs** — JSON log lines tagged with a correlation ID propagated via header, making "find every log line for this one request, across every service" a simple query instead of manual cross-referencing.
4. **Distributed tracing** — a trace made of spans, connected across service boundaries via explicit trace context propagation; OpenTelemetry is the standard instrumentation layer, Jaeger/Zipkin are common backends.
5. **SLI / SLO / SLA and error budgets** — measured value, internal target, external contractual promise, and the budget of acceptable failure between 100% and the SLO that should drive alerting and release decisions.
6. **RED method** — Rate, Errors, Duration — the standard instrumentation shape for request-serving services.
7. **USE method** — Utilization, Saturation, Errors — the standard instrumentation shape for the resources underneath those services.
8. **Alert on symptoms, not causes** — page on user-facing impact and SLO burn rate; use cause-level signals for dashboards and runbook diagnosis, not paging, to avoid alert fatigue.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Latency metric type | Histogram | Summary | You need to aggregate/combine percentiles across multiple service instances | You need exact client-side quantiles for a single instance and will never combine across replicas |
| Invalidation/visibility cost | Full-fidelity tracing (100% of requests) | Sampled tracing (errors/slow requests always, sample the rest) | Traffic volume is low enough that full tracing is cheap | High request volume makes full tracing expensive in storage/overhead |
| Alerting basis | Static threshold (e.g. "CPU > 80%") | SLO burn-rate alerting | Quick to set up, no SLO infrastructure exists yet | You need alerts tied to actual user impact and want to avoid alert fatigue |
| Log centralization | ELK stack (Elasticsearch, full-text indexed) | Loki (label-indexed, compressed log content) | You need rich full-text search across log content | You want lower-cost storage at scale and already pair with Grafana/Prometheus-style labels |

---

## Common Interview Questions from This Module

- What are the three pillars of observability, and why isn't having just one of them "enough"?
- When would you use a Counter vs. a Gauge vs. a Histogram, and why is a Histogram usually preferred over a Summary for latency?
- What's the difference between the RED method and the USE method, and when do you use each?
- What's the difference between an SLI, an SLO, and an SLA?
- Why should alerts be based on symptoms rather than causes, and what is alert fatigue?
- How does distributed tracing work across service boundaries — what makes it possible?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Counter / Gauge / Histogram (Prometheus data model) | Gives each kind of measurement (cumulative total, point-in-time value, distribution) a type matched to how it should be aggregated and queried |
| Correlation ID propagation | Lets every log line and trace span for one request, across every service it touches, be joined together by a single ID |
| Trace context propagation (spans, parent-child) | Reconstructs the full causal path and timing of one request across distributed services |
| RED method | Standardizes service-level instrumentation so any two services expose comparable health signals |
| USE method | Standardizes resource-level instrumentation to find the saturated dependency underneath a RED-level symptom |
| SLO-based burn-rate alerting | Ties alerting directly to user-facing impact and a measurable error budget, instead of arbitrary static thresholds |
| Chaos engineering (Chaos Monkey, GameDays) | Proactively surfaces resilience gaps under controlled blast radius, before production reveals them at a worse time |

---

## What This Unlocks

After this module, you can tackle:
- [Module 15 — Security](../module-15-security/), where audit logging, intrusion detection, and security monitoring build directly on this module's logging and alerting foundations
- Operational deep-dives in interview questions that ask "how would you monitor/debug this system," now answerable with RED/USE, SLOs, and a concrete correlation/tracing mechanism instead of "add some logging"
- Real production on-call work: instrumenting a service with `prom-client`, wiring structured logging with correlation IDs, and writing the runbooks and alerts this module's exercises practiced directly

---

## Quick Reference

- **Metrics** = aggregate trend. **Logs** = detailed event. **Traces** = per-request path. Correlate all three via a correlation ID / trace ID.
- **Counter** only goes up — apply `rate()`. **Gauge** is a snapshot value. **Histogram** (not Summary) for anything you'll aggregate across instances, like latency.
- **SLI** = measured value. **SLO** = internal target. **SLA** = external contractual promise. **Error budget** = the gap between 100% and the SLO.
- **RED** (services): Rate, Errors, Duration. **USE** (resources): Utilization, Saturation, Errors. RED finds the symptom; USE finds the likely cause.
- Alert on **symptoms** (SLO burn rate), not every internal **cause** — alert fatigue is a correctness problem, not just an annoyance.
- **Chaos engineering** (Chaos Monkey, GameDays) proactively tests resilience under a controlled blast radius and kill switch.

---

← [Previous Module ← Module 13 — Consistency & Consensus](../module-13-consistency-consensus/) | [Next Module → Module 15 — Security](../module-15-security/)
