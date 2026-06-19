# Module 08 — Deep Dive: Kafka Internals, Backpressure, and Reliable Event Publishing

## Why This Matters

Knowing that Kafka "has partitions and consumer groups" gets you through the basics, but it doesn't explain what happens when a broker dies mid-write, when a consumer falls behind, or when a database write and an event publish need to be atomic across two different systems. This is where message-queue design gets hard — and where interviewers probe to see if you've operated something like this versus just read about it once.

---

## Kafka Deep Dive: Leaders, Followers, and ISR

Each Kafka partition has one **leader** broker that handles all reads and writes for that partition, and zero or more **follower** brokers replicating the leader's log. The **in-sync replica (ISR) set** is the subset of followers fully caught up with the leader at any moment. A write is only committed once acknowledged by every replica in the ISR (configurable via `acks` and `min.insync.replicas`) — this is what makes Kafka durable against a single broker failure: if the leader dies, an ISR follower is promoted, with no acknowledged data lost.

> ⚠️ **Warning:** If `min.insync.replicas` is set too low (e.g., 1), you can lose "acknowledged" data when the sole in-sync replica fails before others catch up. This is a real production trade-off between write availability (lower requirement, fewer rejected writes during a partial outage) and durability (higher requirement, stronger guarantee).

**Log compaction** is a retention strategy that keeps only the most recent message per key indefinitely, instead of deleting messages purely by age — turning a topic into a changelog of current state, useful for rebuilding a downstream cache or table by replaying just the latest value per key.

**Consumer lag** is the gap between the latest offset written to a partition and the offset a consumer group has actually processed. It's the single most important Kafka health metric: rising lag means consumers can't keep up, and if uncaught, lag can grow until a consumer falls outside the retention window and permanently loses data it never got to.

> 📊 **Diagram:** `kafka-architecture.drawio` — Shows a partition's leader broker, two follower brokers in its ISR, and a consumer group whose offset trails the partition's latest write (illustrating lag).

---

## Backpressure

Backpressure is what happens when a consumer can't keep up with a producer — the system needs a mechanism to slow the producer or absorb the excess, instead of silently dropping data or running out of memory. A message queue is itself a backpressure mechanism: the producer keeps publishing at its own rate while the queue's depth (not the producer's blocking) absorbs the mismatch. The risk is an unbounded queue masking a real capacity problem — depth keeps growing instead of surfacing the issue. Production systems pair queues with **alerting on queue depth/consumer lag** and sometimes explicit **producer-side rate limiting**, so backpressure is visible and addressed, not silently absorbed forever.

---

## Idempotent Consumers

Because at-least-once delivery is the realistic default (Module 08 concepts), every consumer must assume a message might be delivered and processed more than once — a consumer crash after processing but before acknowledging is enough to cause a redelivery. An **idempotent consumer** is one where processing the same message twice produces the same end state as processing it once, so duplicate delivery is harmless rather than a correctness bug.

Common techniques:
- **Deduplication by message ID** — track processed message IDs (in a set, or a unique constraint in a database) and skip any ID already seen.
- **Idempotent operations by design** — prefer `UPDATE balance = 100` (idempotent — running it twice gives the same result) over `UPDATE balance = balance + 10` (not idempotent — running it twice doubles the effect).
- **Upserts keyed by a natural ID** — writing "the state for order X is now SHIPPED" is safe to repeat; appending "ship order X" to a log of actions is not, without separate dedup.

> 🎯 **Interview Tip:** If you say "at-least-once delivery" in an interview, immediately follow it with how your consumer stays idempotent. Stating the delivery guarantee without addressing duplicates is an incomplete answer — interviewers will ask "what if the same message arrives twice?" if you don't pre-empt it.

This module's [`examples/idempotent-consumer.ts`](./examples/idempotent-consumer.ts) implements message deduplication against a simulated at-least-once delivery stream.

---

## The Outbox Pattern

A classic reliability bug: a service updates its database (e.g., marks an order as paid) and then separately publishes an event (`OrderPaid`) to a message broker. If the process crashes between the two steps, or the broker is briefly unreachable, the database and the event stream disagree forever — the database says "paid" but no event was ever published, so nothing downstream (shipping, notifications) ever finds out.

The **outbox pattern** fixes this by writing the event into an `outbox` table in the *same database transaction* as the business write. A separate poller (or a change-data-capture process reading the database's write-ahead log) reads new outbox rows and publishes them to the broker, then marks them published. Because the business write and the outbox write are one atomic transaction, the event can never be "forgotten" — either both happen or neither does, and the publish step can be retried safely (the poller is itself just another at-least-once consumer of the outbox table, so it needs the same idempotency discipline).

> 📊 **Diagram:** `outbox-pattern.drawio` — Shows a service writing both a business row and an outbox row in one transaction, with a separate poller reading unpublished outbox rows and publishing them to a message broker.

This module's [`examples/outbox-pattern.ts`](./examples/outbox-pattern.ts) simulates a transactional outbox table being polled and published.

---

## Saga Pattern (Brief Intro)

When a single business operation spans multiple services, each with its own database, there's no single ACID transaction to wrap it in. A **saga** is a sequence of local transactions across services, coordinated either by a central orchestrator or by each service reacting to the previous step's event (choreography), with explicit **compensating actions** to undo earlier steps if a later step fails (e.g., refund a payment if inventory reservation fails after the charge succeeded). Sagas are how event-driven systems achieve "all or effectively-all" outcomes without a distributed transaction. This module only introduces the concept — the full deep dive on orchestration vs. choreography and compensation design lives in **Module 11 — Microservices**.

---

## Event Sourcing

Most systems store *current state* (a `users` table with the latest values) and overwrite it on each update. **Event sourcing** instead stores *every state change* as an immutable event (`AccountOpened`, `FundsDeposited`, `FundsWithdrawn`) and derives current state by replaying those events. This gives you a complete audit trail for free, the ability to reconstruct state as of any point in time, and the ability to add new read models later by replaying history through new logic — at the cost of more complex querying (you generally need a separate read-optimized projection rather than querying the event log directly) and the operational discipline of treating the event schema as a long-lived contract.

> 💡 **Note:** Event sourcing and Kafka pair naturally — Kafka's retained, ordered, replayable log is a near-perfect transport and storage layer for an event-sourced system's event stream — but they're independent ideas. You can event-source with any durable append-only log, and you can use Kafka heavily without ever adopting event sourcing.

---

## Key Takeaways

- A Kafka write is durable once acknowledged by the in-sync replica set; `min.insync.replicas` trades write availability against durability, and consumer lag is the key health signal for whether consumers are keeping up with producers.
- Backpressure is the queue absorbing a producer/consumer speed mismatch — useful until an unbounded queue hides a real capacity problem that needs alerting and action, not just absorption.
- At-least-once delivery makes idempotent consumers mandatory, not optional; dedup by message ID and idempotent-by-design operations (upserts over increments) are the standard techniques.
- The outbox pattern makes a database write and an event publish atomic by writing both in one transaction, with a poller publishing from the outbox afterward — solving the "write succeeded but the event was never published" failure mode.
- Sagas coordinate multi-service business operations with compensating actions instead of distributed transactions; event sourcing stores state as a replayable log of changes rather than overwriting current state.
