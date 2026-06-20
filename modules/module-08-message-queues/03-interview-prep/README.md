# Module 08 — Interview Prep: Designing the Messaging Backbone

## Why This Matters

"How would these services talk to each other?" is one of the most common turning points in a system design interview — the moment the conversation moves from a single service to a distributed system. Interviewers use it to test whether you reach for synchronous calls everywhere (a red flag for anything beyond a toy system) or can correctly identify which interactions need an immediate answer and which can be decoupled through a queue or event stream.

---

## A Framework for "How Would You Add Messaging Here?"

1. **Identify which interactions are inherently synchronous** — anything where the caller needs an answer right now to proceed (checking inventory before confirming a purchase, authenticating a request) usually stays synchronous.
2. **Identify which interactions are side effects** — work that should happen as a result of an action but doesn't need to block the user's response (sending an email, updating a search index, recording analytics). These are your message queue candidates.
3. **Pick queue vs. stream** — a queue (SQS/RabbitMQ) for "this job needs to happen once"; an event stream (Kafka) if multiple independent consumers need to react to the same event, possibly including consumers that don't exist yet, or need replay.
4. **State your delivery semantics out loud** — say "at-least-once" explicitly, and immediately follow it with how consumers stay idempotent. Don't leave this implicit.
5. **Name your reliability mechanism** — a DLQ for messages that repeatedly fail, the outbox pattern if you need a database write and an event publish to be atomic.
6. **Address failure and backpressure** — what happens if a downstream consumer is slow or down? Where does the backlog go, and how do you know it's growing?

> 🎯 **Interview Tip:** A strong signal in these interviews is naming a *specific* delivery guarantee and a *specific* idempotency mechanism, rather than waving at "we'll use a message queue for reliability." Vague reliability claims without a concrete mechanism (dedup by ID, idempotent upserts) read as not having actually built one of these.

---

## What Interviewers Are Listening For

- Do you default to synchronous calls everywhere, or can you identify which steps genuinely need to be async?
- Do you know the practical difference between a queue and an event stream, not just that "Kafka is for big data"?
- Do you proactively mention idempotency the moment you say "at-least-once," rather than needing to be prompted?
- Do you have a concrete answer for "what if this step fails repeatedly" (DLQ) and "what if the database write succeeds but the publish doesn't" (outbox)?

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design the messaging backbone for an order processing system").
