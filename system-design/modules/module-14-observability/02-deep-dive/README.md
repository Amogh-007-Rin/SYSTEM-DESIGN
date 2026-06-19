# Module 14 — Deep Dive: RED, USE, Alerting, and Operational Practice

## Why This Matters

Knowing that metrics, logs, and traces exist doesn't tell you *what* to actually measure, or what to do when a measurement crosses a bad threshold at 3 a.m. The gap between "we have dashboards" and "we reliably catch and resolve incidents before customers notice" is filled by a small number of operational disciplines: a standard shape for instrumenting services (RED) and resources (USE), alerting rules that page on the right things, runbooks that turn a 3 a.m. page into a checklist, and proactive practices — chaos engineering and capacity planning — that find failure modes before production does. This is the layer that turns observability data into actual reliability.

---

## The RED Method (for Services)

RED gives you a minimal, consistent set of metrics to instrument on *every* request-serving service, so any two services in your fleet expose comparable signals:

- **Rate** — requests per second the service is handling.
- **Errors** — the rate of failing requests (as a fraction of Rate, or its own counter).
- **Duration** — the distribution of how long requests take (almost always as a Histogram, so you can derive p50/p95/p99).

This maps directly onto Prometheus types from [01-concepts](../01-concepts/README.md): Rate and Errors are Counters you apply `rate()` to, Duration is a Histogram. The appeal of RED is uniformity — a service's dashboard is "three panels, always," so an on-call engineer unfamiliar with a specific service can still read its health at a glance. [`examples/red-method-calculator.ts`](./examples/red-method-calculator.ts) implements this hands-on: it takes raw request logs and computes Rate, Errors, and Duration percentiles from them.

> 🎯 **Interview Tip:** When asked "what would you monitor for this service," naming RED by name and then immediately mapping it onto the specific service ("rate = checkout requests/sec, errors = failed payment rate, duration = p99 checkout latency") signals you know a real operational framework, not just "I'd add some metrics."

---

## The USE Method (for Resources)

RED is for request-serving services; **USE** is for resources — CPU, memory, disk, network, a connection pool, a thread pool, a queue:

- **Utilization** — the percentage of time/capacity the resource is busy (e.g., CPU % busy, % of a connection pool checked out).
- **Saturation** — how much extra work is queued, waiting for the resource (e.g., run queue length, pending requests in a connection pool wait queue). A resource can be at low utilization but high saturation if work arrives in bursts.
- **Errors** — the count of error events for that resource (disk I/O errors, dropped packets, connection pool timeouts).

> 💡 **Note:** RED and USE are complementary, not competing — RED tells you a service's checkout endpoint got slow; USE tells you *why*, by pointing at the specific saturated resource underneath it (e.g., the database connection pool fully checked out with a growing wait queue). A strong incident response moves from a RED symptom to a USE-level root cause.

---

## Alerting Best Practices

The single most important alerting principle: **alert on symptoms, not causes.** A symptom is something a user would notice (elevated error rate, breached latency SLO, failed checkouts). A cause is an internal detail (high CPU, a pod restarting, a slow query) that *might* explain a symptom, but might also be perfectly fine — chasing every possible cause with its own alert is how teams end up paging on noise.

- **Page on symptoms** (user-facing impact, SLO burn rate) — unambiguously worth waking someone up for.
- **Use causes for diagnosis, not paging** — surface them in dashboards and runbooks so once a symptom-based alert fires, the on-call engineer can quickly find the likely cause, without a separate page for every possible cause.
- **Avoid static thresholds where possible** — "CPU > 80%" means something different at 10% baseline load versus 70%. Where a threshold is unavoidable, set it per-service from observed normal behavior, not a single repo-wide default.
- **Tie alerts to error budgets** — a burn-rate alert (from [01-concepts](../01-concepts/README.md#slis-slos-slas-and-error-budgets)) pages only when failure is fast enough to threaten the SLO's period target, which inherently filters out blips too small to matter.

> ⚠️ **Warning:** "Alert fatigue" — too many low-signal pages — actively degrades incident response: on-call engineers start treating all alerts as probably-noise and respond slower (or snooze them) even during a real incident. Every alert that fires and needed no action erodes trust in the next one. The fix is ruthlessly cutting cause-based and poorly-tuned threshold alerts down to a small set of high-confidence, symptom-based ones — not "page less" in the abstract.

> 📊 **Diagram:** `metrics-alerting-pipeline.drawio` — Shows the pipeline from instrumented services exposing `/metrics`, through a Prometheus scrape, through alerting rules evaluated against SLO burn rate, to a page being routed to on-call — with a parallel path showing the same metrics feeding dashboards for diagnosis once paged.

---

## On-Call Runbooks and Incident Response

A **runbook** is a written, specific procedure for responding to a known alert — what to check first, the likely causes, mitigation steps to try, and who to escalate to. Its value is converting an incident from "think from scratch, under stress, at 3 a.m." into "follow steps someone calmer already worked out." Good runbooks are linked directly from the alert, kept current as the system changes, and specific ("check connection pool saturation on the `orders` dashboard, link here") rather than generic ("investigate the issue").

A typical incident response flow: **Detect** (an alert fires, ideally on a symptom with SLO/burn-rate context) → **Triage** (assess severity and user impact) → **Mitigate** (rollback, fail over, shed load — stop the bleeding before the root cause is fully understood; restoring service matters more than diagnosing immediately) → **Resolve** (find and fix the actual root cause) → **Postmortem** (a blameless write-up of what happened and what changes will prevent recurrence — the long-term value of an incident, beyond just resolving it).

> 💡 **Note:** "Blameless" postmortems exist because the goal is systemic fixes, not finding someone to blame — an engineer who fears blame will hide exactly the information (what they tried, what they suspected) needed to actually prevent recurrence.

---

## Chaos Engineering

Rather than waiting for production to reveal failure modes, **chaos engineering** deliberately injects failure into a system, under controlled conditions, to find weaknesses before they cause a real outage. Netflix's **Chaos Monkey** is the canonical example: it randomly terminates production instances, forcing every service to actually be resilient to instance failure rather than just assuming it is. The broader practice extends this to network partitions, added latency, dependency failures, and resource exhaustion — each testing a specific assumption the system implicitly relies on.

**GameDays** are scheduled, larger-scale chaos exercises — often simulating a severe scenario (a full availability zone outage, a critical dependency going down) with the team actively responding, sometimes without advance warning of exactly when, to rehearse incident response itself, not just test the system's resilience.

> ⚠️ **Warning:** Chaos experiments need safeguards — a defined blast radius (one instance or one low-traffic region, not the whole fleet), a kill switch to abort immediately, and low-traffic timing for early experiments. Skipping these turns a controlled experiment into a self-inflicted real outage, defeating the entire purpose.

---

## Capacity Planning Using Observability Data

Observability data isn't only for incidents — historical metrics (request rate growth, resource utilization trends, USE-method saturation over time) are the actual input to capacity planning: when will the current database tier run out of connections at current growth rates? How much headroom does checkout have before p99 latency degrades under projected Black-Friday-level traffic? Without this data, capacity planning is guesswork; with it, it's a forecast with a quantified error bar, and load testing can validate that forecast against synthetic traffic before it happens for real.

---

## Key Takeaways

- RED (Rate, Errors, Duration) is the standard instrumentation shape for services; USE (Utilization, Saturation, Errors) is the standard shape for resources underneath them — RED finds the symptom, USE finds the likely cause.
- Alert on symptoms (user-facing impact, SLO burn rate), not every internal cause — cause-level signals belong in dashboards and runbooks for diagnosis, not pages.
- Alert fatigue from low-signal pages degrades incident response by training on-call engineers to distrust alerts — a correctness problem, not just an annoyance.
- Runbooks convert incident response from improvisation under stress into a rehearsed procedure; blameless postmortems exist to surface systemic fixes that blame would cause people to hide.
- Chaos engineering (Chaos Monkey, GameDays) and observability-driven capacity planning both turn "hope the system holds up" into a tested, forecasted claim — under strict blast-radius and kill-switch safeguards for chaos experiments specifically.
