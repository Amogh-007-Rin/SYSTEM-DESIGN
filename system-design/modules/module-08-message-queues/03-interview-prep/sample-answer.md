# Sample Answer: "Design the Messaging Backbone for an Order Processing System"

> A fully worked deep-dive answer. The flow: order placed → payment → inventory → shipping → notification. This is also the system used in [Design Challenge 01](../04-exercises/design-challenges/challenge-01.md).

---

## Clarify What's Synchronous vs. Asynchronous

The user-facing checkout request needs one synchronous step: **payment authorization**. The customer needs to know immediately whether their card was charged before the order confirmation page renders. Everything after that — reserving inventory, arranging shipping, sending notifications — is a side effect that doesn't need to block the checkout response. That's the dividing line: synchronous up through "payment authorized," asynchronous from there on.

## High-Level Flow

1. Checkout service synchronously calls the payment service to authorize the charge.
2. On success, checkout service publishes an `OrderPlaced` event (using the **outbox pattern** — see below — so the database write "order is confirmed" and the event publish are atomic).
3. An event stream carries `OrderPlaced` to independent consumers: inventory, shipping, and notifications — each reacting at its own pace, none blocking the others.
4. Each downstream step publishes its own completion event (`InventoryReserved`, `ShipmentCreated`) so later steps and observability tooling can react without polling.

## Queue vs. Stream Choice

I'd use **Kafka** (event stream) rather than discrete queues for the backbone, for two reasons specific to this system:
- Multiple independent teams own inventory, shipping, and notifications, and might add more consumers later (e.g., a fraud-detection service that also wants to see every `OrderPlaced` event) — Kafka's native multi-consumer-group fan-out fits this better than wiring a new SQS queue and SNS subscription for every future consumer.
- If a consumer needs to be rebuilt or reprocessed (e.g., a bug in the inventory service's handling logic needs a fix-and-replay), Kafka's retained log allows replay from a past offset; a traditional queue does not.

> 🎯 **Interview Tip:** Don't default to Kafka reflexively — name *why* it fits here (multiple current/future independent consumers, replay value) rather than treating it as the obviously-correct answer for any event-driven system. A simpler SNS+SQS fan-out would be defensible too if the consumer set were small and fixed.

## Reliability Mechanisms

- **Outbox pattern** at the checkout service: the "order confirmed" database row and the `OrderPlaced` outbox row commit in the same transaction, so a crash between confirming the order and publishing the event is impossible — a poller publishes from the outbox afterward, and is itself retried until it succeeds.
- **At-least-once delivery, idempotent consumers everywhere**: every consumer (inventory, shipping, notifications) deduplicates by the event's unique ID before acting, so a redelivered `OrderPlaced` event (from a consumer crash before acknowledging) doesn't double-reserve inventory or send a duplicate shipping label.
- **Dead letter queues** per consumer: if the inventory service repeatedly fails to process a specific event (e.g., a malformed payload from a bug), after N retries it moves to a DLQ instead of blocking that partition's processing indefinitely or being silently dropped. An on-call engineer is alerted on DLQ depth > 0.

## Handling Partial Failure (the Saga Angle)

What happens if payment succeeds but inventory reservation fails (item went out of stock in the gap)? This is a **saga**: a sequence of local transactions across services with **compensating actions** rather than one distributed transaction. Here, a failed inventory reservation triggers a compensating `RefundPayment` command back to the payment service, and an `OrderCancelled` event so the customer is notified instead of being left with a charge and no shipment. (Full orchestration-vs-choreography design for this is the subject of Module 11 — Microservices; here it's enough to name that compensation is needed and what it does.)

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Payment step | Synchronous | User gets an immediate answer; couples checkout availability to payment service availability for this one step only |
| Backbone transport | Kafka (event stream) | Supports future independent consumers and replay; more operational complexity than a couple of SQS queues for a system that will stay small |
| Event delivery to checkout DB | Outbox pattern | Guarantees the event is never silently lost; adds a poller component and a small publish-latency delay versus publishing inline |
| Failure recovery | Saga with compensating actions | Reaches a consistent end state without a distributed transaction; requires writing and testing compensation logic for every step that can fail after an earlier step succeeded |

## Summary

Synchronous only where the user needs an immediate answer (payment); everything downstream is event-driven over Kafka, made reliable with the outbox pattern at the publish boundary, idempotent consumers at every reader, DLQs for poison messages, and saga-style compensation for the cross-service failure case that a single transaction can't cover.
