# Design Challenge 01 — Solution: Event-Driven Order Processing System

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — summarized here for the exercise format.

## Synchronous Boundary

Only **payment authorization** stays synchronous: the customer needs an immediate answer on whether their card was charged before the checkout page can confirm the order. Inventory reservation, shipping arrangement, and notification are all side effects that don't need to block that response.

## Event Flow

| Event | Published By | Consumed By |
|---|---|---|
| `OrderPlaced` | Checkout service, after payment is authorized (via the outbox pattern) | Inventory service, Notification service, Analytics |
| `InventoryReserved` | Inventory service | Shipping service |
| `InventoryReservationFailed` | Inventory service | Payment service (triggers refund), Notification service |
| `ShipmentCreated` | Shipping service | Notification service |

## Queue vs. Stream Choice

Kafka (event stream), because multiple independent consumers (inventory, shipping, notifications, and likely future ones like fraud detection or analytics) need to react to the same events, and replay value matters if a consumer's processing logic needs to be fixed and rerun against history.

## Delivery Semantics and Idempotency

At-least-once delivery throughout. The inventory service deduplicates by `OrderPlaced` event ID before reserving stock — without this, a redelivered event (from a consumer crash before acknowledging) would double-reserve inventory for the same order.

## Failure Case: Payment Succeeds, Inventory Reservation Fails

This is a **saga** with a compensating action: the inventory service publishes `InventoryReservationFailed` instead of `InventoryReserved`. The payment service consumes this and issues a `RefundPayment` compensating action against the original charge. The notification service consumes the same failure event and informs the customer their order couldn't be fulfilled, rather than leaving them charged with no shipment and no explanation. (Full saga orchestration vs. choreography trade-offs are covered in Module 11 — Microservices.)

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Backbone transport | Kafka | Supports future consumers and replay; more operational overhead than a couple of fixed SQS queues |
| Failure recovery | Saga with compensation | Avoids needing a distributed transaction; requires writing and testing a compensating action for every step that can fail after an earlier step already succeeded |

See the full discussion (including why payment specifically is the one synchronous step) in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
