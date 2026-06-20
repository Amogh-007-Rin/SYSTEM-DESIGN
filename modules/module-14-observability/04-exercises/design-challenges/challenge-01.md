# Design Challenge 01: Observability Stack for a Microservices E-Commerce Platform

**Difficulty:** Medium-Hard

## Prompt

Design the complete observability stack for a microservices e-commerce platform with the following services: API gateway, product catalog service, inventory service, cart service, order service, payment service, and notification service. A request to "place an order" touches at least five of these services in sequence.

## What to Produce

1. For at least four services on the order-placement path, name concrete RED metrics (what Rate, Errors, and Duration mean specifically for that service).
2. For at least two underlying resources (e.g., the inventory service's database connection pool, the order→payment message queue), name concrete USE metrics.
3. Your logging strategy: what gets logged, at what level, and how a correlation ID is generated and propagated across all five-plus services for one order.
4. Your tracing strategy: what the trace for one "place an order" request looks like (name the spans), and what tracing backend/instrumentation you'd use.
5. At least one SLI/SLO for the order-placement journey specifically, and the alerting rule (symptom-based, ideally burn-rate) built on it.
6. At least 2 trade-offs you made (e.g., trace sampling strategy, alerting granularity, log retention/cost).

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md), and the same framework applied to a different system is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) ("Design the observability stack for a ride-sharing platform").
