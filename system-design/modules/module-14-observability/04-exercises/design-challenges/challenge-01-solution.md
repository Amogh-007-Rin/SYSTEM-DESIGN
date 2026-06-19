# Design Challenge 01 — Solution: Observability Stack for a Microservices E-Commerce Platform

This follows the same framework worked through in full for a different system in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — summarized here for the exercise format, against the order-placement path: API gateway → cart service → inventory service → order service → payment service → notification service.

## RED Metrics per Service

| Service | Rate | Errors | Duration |
|---|---|---|---|
| API gateway | requests/sec across all routes | 4xx + 5xx rate | p99 end-to-end response time |
| Inventory service | stock-check requests/sec | "insufficient stock" + DB timeout rate | p99 stock-check latency |
| Order service | order-creation attempts/sec | failed order-creation rate | p99 order-creation latency |
| Payment service | charge attempts/sec | declined + processor-timeout rate | p99 charge processing time |

## USE Metrics for Underlying Resources

- **Inventory service's database connection pool** — Utilization = checked-out connections / pool size; Saturation = queued queries waiting for a free connection; Errors = connection acquisition timeouts.
- **Order→payment message queue** — Utilization = consumer throughput vs. capacity; Saturation = queue depth (a growing backlog here is an early warning of payment service slowness before any user-facing symptom shows up); Errors = message processing failures requiring redelivery.

## Logging Strategy

A correlation ID is generated at the API gateway the moment an order-placement request arrives, attached via an `x-correlation-id` header, and forwarded on every downstream call: gateway → cart → inventory → order → payment → notification. Every service logs structured JSON at `INFO` for normal lifecycle events (order created, payment authorized, notification queued) and `ERROR` for failures, always including the correlation ID. Logs are centralized (ELK or Loki) so a support engineer investigating one customer's failed order runs a single `correlationId=<id>` query across every service's logs instead of contacting five separate teams.

## Tracing Strategy

One trace per order-placement request, with spans: `gateway` (root) → `cart.validate` → `inventory.check-stock` → `order.create` → `payment.charge` → `notification.enqueue`. Instrumented with OpenTelemetry SDKs in each service, exported to a Jaeger backend. This is what answers "which specific step made this order take 3 seconds" — something the RED dashboards alone only hint at via elevated Duration on one service.

> 📊 **Diagram:** `distributed-trace-flow.drawio` — Shows the order-placement trace as a waterfall of six nested spans (gateway, cart, inventory, order, payment, notification), with span duration visible per service, making clear exactly where time was spent for one specific slow order.

## SLI/SLO and Alerting

- **SLI**: percentage of "place order" requests that complete successfully within 2 seconds end-to-end.
- **SLO**: 99.5% of order-placement requests succeed within 2 seconds, measured over a rolling 30 days.
- **Alerting**: a burn-rate alert pages on-call when the order-placement failure/latency-breach rate is consuming the monthly error budget fast enough to threaten the 99.5% target — not on every individual slow or failed order. USE-level saturation signals (connection pool, queue depth) are dashboard-only, surfaced for proactive investigation rather than paging directly, since elevated saturation doesn't always translate into user-visible symptoms.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Trace sampling | Always trace errors and requests over 1s; sample 2% of otherwise-healthy order-placement traces | Full visibility exactly where it's valuable; reduced cost and storage versus tracing every order at full fidelity |
| Alerting granularity | Single SLO/burn-rate alert for the whole order-placement journey, not per-service alerts | Fewer, higher-confidence pages tied directly to user impact; requires the on-call runbook to walk RED → USE → traces per service to localize the actual failing step, rather than the alert naming it directly |
| Log retention | 30 days hot/searchable, longer-term cold storage after | Keeps centralized logging costs bounded; incident investigation beyond 30 days requires a slower cold-storage retrieval path |

See the full discussion of this same framework — including the trace-sampling rationale and SLO-window reasoning — in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
