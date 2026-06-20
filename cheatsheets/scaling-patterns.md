# Scaling Patterns Quick Reference

> A flat index of every scaling pattern covered in this repository, grouped by where it applies. Use this to find the right module fast.

---

## Data Tier Patterns

| Pattern | What It Solves | Module |
|---|---|---|
| Read Replicas | Spreads read load off the primary database | [Module 04 — Databases](../modules/module-04-databases/02-deep-dive/README.md) |
| Sharding | Splits data horizontally across nodes when one node can't hold/serve it all | [Module 04 — Databases](../modules/module-04-databases/02-deep-dive/README.md) |
| Vertical Partitioning | Splits a wide table by column groups to isolate hot columns | [Module 04 — Databases](../modules/module-04-databases/02-deep-dive/README.md) |
| CQRS | Separates read and write models to scale and optimize them independently | [Module 06 — Scalability](../modules/module-06-scalability/02-deep-dive/README.md) |
| Cache-aside | Avoids caching data that's never read; app controls cache population | [Module 05 — Caching](../modules/module-05-caching/01-concepts/README.md) |
| Write-through Cache | Keeps cache and database consistent on every write | [Module 05 — Caching](../modules/module-05-caching/01-concepts/README.md) |
| Connection Pooling | Avoids the cost of opening a new DB connection per request | [Module 04 — Databases](../modules/module-04-databases/02-deep-dive/README.md) |

---

## Application Tier Patterns

| Pattern | What It Solves | Module |
|---|---|---|
| Horizontal Scaling | Adds capacity by adding machines instead of upgrading one | [Module 06 — Scalability](../modules/module-06-scalability/01-concepts/README.md) |
| Load Balancing | Distributes traffic across multiple instances | [Module 07 — Load Balancing](../modules/module-07-load-balancing/) |
| Stateless Services | Enables any instance to handle any request, which enables horizontal scaling | [Module 06 — Scalability](../modules/module-06-scalability/01-concepts/README.md) |
| Circuit Breaker | Stops cascading failures by failing fast against an unhealthy dependency | [Module 11 — Microservices](../modules/module-11-microservices/02-deep-dive/README.md) |
| Bulkhead | Isolates resource pools so one failure doesn't exhaust shared resources | [Module 11 — Microservices](../modules/module-11-microservices/02-deep-dive/README.md) |
| Retry with Exponential Backoff | Avoids overwhelming a recovering dependency with immediate retries | [Module 20 — Advanced Patterns](../modules/module-20-advanced-patterns/01-concepts/README.md) |
| Idempotency Keys | Makes retried requests safe to repeat without duplicate side effects | [Module 03 — API Design](../modules/module-03-apis/02-deep-dive/README.md) |

---

## Async / Decoupling Patterns

| Pattern | What It Solves | Module |
|---|---|---|
| Message Queue | Decouples producers from consumers, buffers load spikes | [Module 08 — Message Queues](../modules/module-08-message-queues/01-concepts/README.md) |
| Event Streaming (Kafka) | Provides durable, replayable, ordered logs of events for many consumers | [Module 08 — Message Queues](../modules/module-08-message-queues/01-concepts/README.md) |
| Saga Pattern | Coordinates a multi-step transaction across services without 2PC | [Module 11 — Microservices](../modules/module-11-microservices/02-deep-dive/README.md) |
| Outbox Pattern | Guarantees an event is published reliably alongside a database write | [Module 08 — Message Queues](../modules/module-08-message-queues/02-deep-dive/README.md) |
| Fan-out | Delivers one event to many downstream consumers/subscribers efficiently | [Module 16 — Real-Time Systems](../modules/module-16-real-time-systems/02-deep-dive/README.md) |

---

## Infrastructure Patterns

| Pattern | What It Solves | Module |
|---|---|---|
| CDN | Moves static/cacheable content physically closer to users | [Module 10 — CDN](../modules/module-10-cdn/) |
| Multi-region Deployment | Reduces latency and increases resilience by serving from multiple geographies | [Module 20 — Advanced Patterns](../modules/module-20-advanced-patterns/01-concepts/README.md) |
| Cell-based Architecture | Limits blast radius by partitioning infrastructure into independent cells | [Module 20 — Advanced Patterns](../modules/module-20-advanced-patterns/02-deep-dive/README.md) |
| Consistent Hashing | Minimizes key remapping when nodes join or leave a distributed system | [Module 04 — Databases](../modules/module-04-databases/02-deep-dive/README.md) |
| Service Mesh | Centralizes service-to-service networking concerns (mTLS, retries, observability) | [Module 11 — Microservices](../modules/module-11-microservices/02-deep-dive/README.md) |
| Blue-Green Deployment | Enables instant rollback by keeping two full production environments | [Module 20 — Advanced Patterns](../modules/module-20-advanced-patterns/02-deep-dive/README.md) |
| Canary Release | Limits the blast radius of a bad deploy by exposing it to a small traffic slice first | [Module 20 — Advanced Patterns](../modules/module-20-advanced-patterns/02-deep-dive/README.md) |
| Strangler Fig | Migrates a monolith to microservices incrementally instead of a risky rewrite | [Module 11 — Microservices](../modules/module-11-microservices/02-deep-dive/README.md) |

See also: [system-design-vocabulary.md](./system-design-vocabulary.md) for term-level definitions.
