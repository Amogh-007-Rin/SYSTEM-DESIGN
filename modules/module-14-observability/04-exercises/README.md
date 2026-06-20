# Module 14 — Exercises

## Coding Challenges

| Challenge | Description |
|---|---|
| [01 — Prometheus Metrics with prom-client](./coding-challenges/challenge-01/) | Instrument a TypeScript Express app with request rate, error rate, and latency histogram metrics using `prom-client`, exposed on a `/metrics` endpoint |
| [02 — Structured Logging with Correlation IDs](./coding-challenges/challenge-02/) | Add JSON structured logging to an Express app, with a correlation ID generated or propagated per request via the `x-correlation-id` header |

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Observability Stack for a Microservices E-Commerce Platform](./design-challenges/challenge-01.md) | Design the full metrics/logs/traces stack, SLOs, and alerting strategy for a multi-service e-commerce system |

Challenge 01 (Prometheus metrics) is the most directly practical exercise in this module — instrumenting a real Express app with `prom-client`'s Counter and Histogram is close to identical to what you'd do on a real production service on day one. Challenge 02 builds the correlation mechanism that makes Challenge 01's metrics, plus the logs they sit beside, actually correlatable per-request — do them in order.
