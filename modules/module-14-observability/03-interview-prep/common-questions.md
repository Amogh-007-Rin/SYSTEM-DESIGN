# Module 14 — Common Interview Questions

**Q1: What are the three pillars of observability, and why isn't having just one of them "enough"?**
Metrics (aggregated numeric trends), logs (discrete, detailed event records), and traces (the path one request takes across services). Each answers a different question — metrics show *that* something's wrong in aggregate, logs show *what* happened for specific events, traces show *where* time went for one specific request across service boundaries. A system with only one pillar can't, for example, go from "p99 latency spiked" (a metric) to "this specific downstream call in this specific service is the cause" (a trace) to "and here's the exact error it logged" (a log) — the pillars are most powerful correlated together.

**Q2: When would you use a Counter vs. a Gauge vs. a Histogram?**
Counter for anything monotonically increasing that you'll apply `rate()` to, like total requests served. Gauge for a point-in-time value that goes up and down, like current active connections or memory usage. Histogram for a distribution you need percentiles from — especially latency — because histogram buckets can be combined across service instances (unlike a Summary's pre-computed quantiles, which can't be meaningfully averaged across instances).

**Q3: Why is a Histogram usually preferred over a Summary for latency, even though a Summary's quantiles are more "precise"?**
A Summary computes its quantiles client-side, per instance, before export — those quantiles can't be correctly combined across multiple instances after the fact (you can't average a p99 from instance A and a p99 from instance B into a correct fleet-wide p99). A Histogram's buckets are just counts, which add together correctly across any number of instances, letting you compute an approximate but correct fleet-wide percentile. The "precision" of a Summary is a trap the moment you have more than one instance.

**Q4: What's the difference between the RED method and the USE method, and when do you use each?**
RED (Rate, Errors, Duration) is for request-serving services — it answers "is this service healthy from the perspective of the requests flowing through it?" USE (Utilization, Saturation, Errors) is for resources underneath services — CPU, memory, connection pools, queues — and answers "is the infrastructure this service depends on the actual bottleneck?" In practice you use both together: RED surfaces a symptom (checkout got slow), USE helps find the cause (the database connection pool was saturated).

**Q5: What's the difference between an SLI, an SLO, and an SLA?**
An SLI is an actual measured value (e.g., "99.95% of requests succeeded in the last hour"). An SLO is an internal target for that SLI (e.g., "99.9% of requests succeed, measured over 30 days"). An SLA is an external, often contractual promise to customers, typically a looser version of the SLO with financial consequences attached for missing it. The gap between 100% and the SLO is the error budget.

**Q6: Why should alerts be based on symptoms rather than causes?**
A symptom is something a user would notice (elevated error rate, breached latency SLO). A cause is an internal detail (high CPU, a slow query) that *might* explain a symptom but might also be harmless on its own. Alerting on every possible cause produces enormous noise — most "high CPU" moments never actually hurt a user. Alerting on symptoms, ideally tied to SLO burn rate, ensures every page corresponds to something that actually matters, which is also the only sustainable way to avoid alert fatigue.

**Q7: What is alert fatigue, and why is it dangerous rather than just annoying?**
It's the state where on-call engineers receive so many low-signal alerts that they start treating all alerts as probably-noise, responding slower or snoozing them — including during a genuine incident. It's dangerous because it directly degrades incident response time and quality, not just morale; the fix is cutting low-confidence alerts aggressively, not just "getting used to it."

**Q8: How does distributed tracing actually work across service boundaries — what makes it possible?**
Trace context propagation: a trace ID (and the current span's ID, as parent) is attached to outgoing requests, typically as HTTP headers, so the next service continues the same trace instead of starting an unrelated one. OpenTelemetry is the vendor-neutral standard for this instrumentation and propagation format; Jaeger and Zipkin are common backends that store and visualize the resulting traces.

**Q9: What's the purpose of a chaos engineering practice like Chaos Monkey, and what safeguards does it need?**
It deliberately injects failure (e.g., randomly terminating instances) under controlled conditions to find resilience gaps before production reveals them on its own, at a worse time. It needs a defined blast radius (a single instance or low-traffic region, not the whole fleet), a kill switch to abort immediately, and careful timing — without these safeguards, a chaos experiment can cause the exact outage it was meant to prevent.

**Q10: How would you use observability data for capacity planning, concretely?**
Track historical trends in the relevant USE-method resource metrics (e.g., database connection pool utilization, queue depth) alongside request rate growth, and project forward to find when current capacity will be exhausted at the current growth rate. This turns "we should probably scale up soon" into a forecast with a quantified timeline, which can then be validated with load testing against a synthetic version of the projected traffic.
