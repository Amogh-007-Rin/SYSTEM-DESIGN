# Module 14 — Further Reading

- **Prometheus official documentation** (prometheus.io/docs) — the authoritative reference for the metric types, the pull-based scrape model, `rate()`/`histogram_quantile()`, and PromQL covered in [01-concepts](../01-concepts/README.md).
- **OpenTelemetry official documentation** (opentelemetry.io/docs) — the vendor-neutral standard for traces, metrics, and logs instrumentation referenced throughout this module's tracing section; covers the SDK, the propagation format, and exporter configuration for backends like Jaeger and Zipkin.
- **Google SRE Book — Chapter 6, "Monitoring Distributed Systems"** (sre.google/sre-book/monitoring-distributed-systems/) — the original, widely-cited source for the four golden signals (latency, traffic, errors, saturation) that the RED and USE methods in [02-deep-dive](../02-deep-dive/README.md) are directly descended from.
- **Google SRE Book — Chapter 4, "Service Level Objectives"** (sre.google/sre-book/service-level-objectives/) — the canonical treatment of SLIs, SLOs, error budgets, and how they should drive alerting and release decisions, referenced in [01-concepts](../01-concepts/README.md).
- **"The RED Method: How to Instrument Your Services" — Tom Wilkie, Weaveworks** — the original blog post coining the RED method for instrumenting request-serving services, covered in [02-deep-dive](../02-deep-dive/README.md).
- **"The Utilization Saturation and Errors (USE) Method" — Brendan Gregg** (brendangregg.com/usemethod.html) — the original source for the USE method applied to system resources, written by a performance-engineering practitioner with extensive production case studies.
- **Netflix Technology Blog — "The Netflix Simian Army"** — Netflix's own account of Chaos Monkey and the broader chaos engineering tooling it pioneered, covered in [02-deep-dive](../02-deep-dive/README.md#chaos-engineering).
- **Honeycomb.io Engineering Blog** — extensive practical writing on observability (as distinct from traditional monitoring), structured events, and high-cardinality data — a useful counterpoint perspective to the Prometheus-centric metrics model this module leads with.

→ Continue to [Module 15 — Security](../../module-15-security/).
