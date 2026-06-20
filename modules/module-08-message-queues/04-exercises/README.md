# Module 08 — Exercises

## Coding Challenges

| Challenge | Description |
|---|---|
| [01 — In-Memory Message Queue with DLQ](./coding-challenges/challenge-01/) | Implement a message queue with at-least-once delivery, visibility timeouts, retry counting, and a dead letter queue |
| [02 — Kafka Consumer Group Simulation](./coding-challenges/challenge-02/) | Simulate partition assignment and rebalancing across consumers joining/leaving a consumer group |

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Event-Driven Order Processing System](./design-challenges/challenge-01.md) | Design the full event-driven flow: order placed → payment → inventory → shipping → notification |

Challenge 01 (the message queue) is the most directly applicable to production debugging — visibility timeouts and DLQs are exactly what you'll configure on a real SQS queue. Challenge 02 builds the mental model for *why* Kafka consumer groups rebalance and what that means for your application code (a brief pause in consumption, and partitions reassigned mid-flight) — understanding it is what separates "I've used Kafka" from "I understand what Kafka is doing when a consumer pod restarts."
