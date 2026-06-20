# Module 14 — Interview Prep: Designing an Observability Stack

## Why This Matters

"How would you monitor this system?" or "walk me through how you'd debug a slow request in production" shows up as a deep-dive follow-up in almost every system design interview, because it tests whether a candidate has actually operated something in production versus only having designed it on a whiteboard. A candidate who can name "add monitoring" but can't say what they'd measure, where they'd put the instrumentation, or what they'd alert on hasn't really answered the question.

---

## A Framework for "Design the Observability Stack for X"

1. **Start from the three pillars** — name metrics, logs, and traces explicitly, and state what each is for in this specific system, rather than a generic definition.
2. **Apply RED to every service** — for each major service in the architecture, name what Rate, Errors, and Duration concretely mean (e.g., "checkout service: checkout attempts/sec, failed-payment rate, p99 checkout latency").
3. **Apply USE to the resources underneath** — name the specific resources likely to bottleneck (database connection pools, message queue depth, cache hit rate) and what utilization/saturation/errors mean for each.
4. **Propose concrete tooling** — Prometheus + Grafana for metrics, an ELK/Loki stack for logs, OpenTelemetry + Jaeger/Zipkin for traces — and justify *why* this combination, not just name-drop them.
5. **Define at least one SLI/SLO** for the system's most critical user journey, and connect it to an alerting strategy (burn-rate alerting, not static thresholds).
6. **Name the correlation mechanism** — a correlation ID propagated through headers — that ties a metric spike to specific traces to specific log lines.
7. **Acknowledge cost/overhead trade-offs** — what you would *not* instrument at full fidelity (e.g., sampling traces rather than recording 100% of them at high volume) and why.

> 🎯 **Interview Tip:** Interviewers are listening for whether you treat observability as something designed *into* the architecture (which services emit what, how they're correlated) rather than "we'd add some logging and dashboards later." Naming RED/USE and SLO-based alerting by name, and applying them to the specific services in front of you, is the single biggest signal of real operational experience.

---

## What Interviewers Are Actually Listening For

- **Specificity over name-dropping.** Saying "we'd use Prometheus and Grafana" earns nothing alone; saying what metric, on what service, with what alert threshold logic, does.
- **Awareness of trade-offs.** Full tracing on every request is expensive at scale — sampling strategies (e.g., always trace errors and slow requests, sample a percentage of the rest) show awareness that observability itself has a cost.
- **A path from symptom to root cause.** Can you describe, concretely, how an on-call engineer would go from "p99 latency alert fired" to "found the actual cause" using the stack you just proposed?
- **SLOs tied to the actual business**, not generic — "99.9% of checkout requests succeed within 500ms" is stronger than "the system should be reliable."

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design the observability stack for a ride-sharing platform").
