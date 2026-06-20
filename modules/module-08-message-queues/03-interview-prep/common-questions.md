# Module 08 — Common Interview Questions

**Q1: When would you choose a message queue (SQS/RabbitMQ) over an event stream (Kafka)?**
Choose a queue when you have work that needs to be done once, by one consumer, and then forgotten — task distribution. Choose an event stream when multiple independent consumers need to react to the same event (possibly consumers that don't exist yet), or when you need replay (resetting a consumer group's offset to reprocess history). Kafka models a durable, replayable log of things that happened; a queue models a job to be completed once.

**Q2: What's the difference between at-most-once, at-least-once, and exactly-once delivery?**
At-most-once can lose messages but never duplicates them. At-least-once never loses messages but can deliver the same one more than once — this is the realistic default in distributed systems. Exactly-once (true single delivery) is extremely hard to guarantee end-to-end; what's actually achievable in practice is at-least-once delivery combined with an idempotent consumer, which behaves like exactly-once from the application's point of view.

**Q3: Why do you need idempotent consumers if you already have at-least-once delivery?**
Because at-least-once means duplicates are expected, not exceptional — a consumer crash after processing but before acknowledging causes redelivery. Without idempotency, a duplicate delivery can double-charge a customer or double-decrement inventory. Dedup by message ID (tracking processed IDs in a database with a unique constraint) and preferring idempotent operations (absolute upserts over relative increments) are the standard techniques.

**Q4: What problem does the outbox pattern solve?**
It solves the "dual write" problem: a service updates its database and separately publishes an event, and a crash between the two steps leaves them permanently disagreeing — the database says one thing happened but no event was ever published to tell anyone else. The outbox pattern writes the event into an outbox table in the same transaction as the business write, so a separate poller can publish it afterward; either both writes commit or neither does, so the event can never be silently lost.

**Q5: What's a dead letter queue, and why is it necessary?**
A DLQ is where messages go after failing processing too many times instead of being retried forever or silently dropped. Without one, a poison message (one that will never succeed, e.g., due to a bug in the data) either blocks the queue by being retried indefinitely, or gets dropped with no record it ever existed. A DLQ gives you a place to inspect, alert on, and reprocess failures after fixing the root cause.

**Q6: Explain Kafka's leader/follower/ISR model and why it matters for durability.**
Each partition has one leader broker handling reads/writes and follower brokers replicating its log. The in-sync replica (ISR) set is the subset of followers fully caught up with the leader. A write is only considered committed once acknowledged by the ISR, so if the leader fails, an ISR follower can be promoted with no acknowledged data lost. Setting `min.insync.replicas` too low trades away this durability guarantee for higher write availability.

**Q7: What is consumer lag, and why is it the most important Kafka health metric?**
Consumer lag is the gap between the latest offset written to a partition and the offset a consumer group has actually processed. Rising lag means consumers can't keep up with producers — and if it's not caught early, a slow consumer's lag can grow until it falls outside the topic's retention window, permanently losing data it never got to process.

**Q8: How does the SNS + SQS fan-out pattern work, and what problem does it solve?**
A producer publishes once to an SNS topic, which fans the message out to multiple SQS queues subscribed to it, each consumed independently by a different service. It solves "one event needs to trigger several independent reactions" (e.g., an order-placed event triggering inventory, analytics, and notifications) without the producer needing to know how many consumers exist, and without one slow consumer's queue backing up affecting any of the others.

**Q9: What is backpressure, and how do message queues provide it?**
Backpressure is what happens when a consumer can't keep up with a producer — something has to slow the producer or absorb the excess instead of silently dropping data. A queue absorbs the mismatch in its depth, letting the producer keep publishing at its own rate. The danger is an unbounded queue masking a real capacity problem; production systems pair queues with alerting on queue depth or consumer lag so the mismatch is visible and acted on, not silently absorbed forever.

**Q10: What's the difference between RabbitMQ's exchange types, and why does it matter?**
A direct exchange routes by exact routing-key match, a topic exchange routes by wildcard pattern match (e.g., `orders.*.created`), and a fanout exchange broadcasts to every bound queue regardless of routing key. It matters because the exchange type is how you express your actual fan-out and filtering requirements declaratively, rather than each consumer filtering messages itself after receiving everything.
