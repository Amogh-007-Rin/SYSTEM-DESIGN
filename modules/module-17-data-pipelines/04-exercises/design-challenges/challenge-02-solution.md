# Design Challenge 02 — Solution: Fraud Detection Pipeline at 100K Transactions/Second

## Translating the Numbers Into Constraints

- **100,000 transactions/second** rules out any design where a transaction is evaluated by a single process or a small number of machines — this volume requires horizontal partitioning across many parallel consumers from the start, not as a later optimization.
- **Sub-500ms end-to-end** rules out batch processing for the actual decision entirely (batch's unit of latency is minutes-to-hours), rules out any synchronous network call to a slow data store on the hot path (a single poorly-indexed database query at this volume can itself exceed the entire budget), and rules out anything resembling Lambda's batch layer being in the decision path — the decision must come entirely from a streaming/low-latency path, with batch relegated to *after-the-fact* analysis only (see step 5).
- **"Never silently drop a transaction"** rules out fire-and-forget processing anywhere in the pipeline — every stage needs an explicit acknowledgment/retry or fallback story, because at this volume, even a brief blip causing dropped transactions translates to thousands of un-evaluated transactions per second of outage.

These three constraints together point at a **stream-only (Kappa-style) architecture**, with the state needed for fraud signals kept close (low-latency, often in-memory or in a fast local cache) rather than fetched from a general-purpose database per transaction.

## Ingestion and Processing Path

Transactions are published to a partitioned event log (Kafka), **partitioned by card/account ID** — this is the critical decision, because every fraud signal that matters (this card's velocity, this account's normal spending pattern) is naturally scoped to one card/account, so partitioning this way guarantees all of one card's transactions are processed in order by the same consumer instance, with no cross-partition coordination needed to evaluate a single transaction.

A fleet of stream processing consumers (Flink, for stateful windowed aggregation at this throughput) each own a subset of partitions and maintain **local, in-memory state** per card/account: a rolling count and sum of transactions in the last hour, a rolling velocity metric, recent merchant categories. This state lives in the stream processor's own local state store (Flink's RocksDB-backed state backend, checkpointed periodically) rather than in an external database — a network round-trip to a separate database for every one of 100,000 transactions/second would itself threaten the latency budget, so the state needs to be co-located with the computation.

For each transaction, the consumer:
1. Updates the relevant card/account's rolling state.
2. Evaluates a rules engine and/or a lightweight ML model scoring function against the current state plus the transaction's own features.
3. Emits a decision (`approve` / `decline` / `flag-for-review`) to a response topic / directly back to the payment gateway awaiting the result.

> 🎯 **Interview Tip:** Explicitly saying "the fraud state lives in the stream processor's local state store, not a separate database, because a database round-trip on the hot path at 100K/sec would itself blow the latency budget" is exactly the kind of derived-from-constraints reasoning interviewers are listening for at this level of prompt.

## Handling a Slow, Down, or Uncertain Fraud Engine

The system must never silently drop a transaction, which means a slow/down rules engine needs an explicit fallback path, not an unhandled timeout:

- **Hard latency budget per stage**: the rules engine evaluation is given a strict timeout well inside the 500ms total budget (e.g., 150ms), leaving room for the surrounding ingestion/response legs.
- **Fail-safe default on timeout**: if the engine doesn't respond inside its budget, the transaction is **not silently approved or dropped** — it's routed to `flag-for-review` (a conservative default that a human or a slower async process resolves later) rather than guessing. This is a deliberate business trade-off: a brief engine slowdown produces a spike in manual reviews, not a spike in either fraud risk or dropped transactions.
- **Circuit breaker on the model-scoring dependency**: if the ML scoring service is degraded for a sustained period, the consumer falls back to a simpler, cheaper rules-only evaluation rather than continuing to wait on a consistently-slow dependency for every transaction.

## Exactly-Once vs. At-Least-Once

Kafka's delivery model is at-least-once by default — a consumer can, after a crash and restart, reprocess a transaction it had already evaluated before crashing. For a fraud decision, **reprocessing the same transaction and reaching the same decision twice is harmless** as long as the decision-emission step is idempotent: each transaction carries a unique ID, and the response topic / downstream payment gateway treats a second decision for the same transaction ID as a no-op rather than double-charging or double-declining. This means the design doesn't need true end-to-end exactly-once semantics (which would add real complexity and latency overhead) — at-least-once delivery plus an idempotent decision-application step achieves the same practical outcome (each transaction is *acted upon* exactly once) at lower cost.

> 💡 **Note:** This is the same pattern (idempotency key + at-least-once delivery = effectively-once outcome) used in the clickstream sample answer's deduplication strategy and discussed generally for message queues in [Module 08](../../../module-08-message-queues/) — it recurs across this entire space because true exactly-once delivery is expensive and usually unnecessary once idempotency is handled at the consumer.

## Where Batch Fits (Lambda's Slower Layer, After the Fact)

The real-time decision has already happened by the time a batch job could possibly finish, so batch's role here is **not** making the original decision — it's after-the-fact accuracy improvement and model training:
- A nightly/hourly Spark job re-evaluates the full day's transactions with a more expensive, more accurate model (one too slow to run within the 500ms budget), flagging transactions the real-time system approved but that the more thorough analysis now considers suspicious — these become chargebacks-prevention leads or feed into account-level risk scores affecting *future* transactions, not the original one.
- This same batch layer is also where the next generation of the real-time model is **trained** — the real-time rules engine and ML model are themselves outputs of a batch training pipeline that periodically reprocesses historical labeled fraud outcomes (confirmed fraud, confirmed legitimate) to improve the live scoring function.

This is genuinely a Lambda-shaped problem at the *system* level even though the live decision path is Kappa-shaped: a fast, approximate, in-the-moment layer (the real-time fraud check) and a slow, thorough, after-the-fact layer (batch re-analysis and model retraining), explicitly not trying to merge into one "live" answer the way the ride-sharing challenge's features could.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Partition by card/account ID | Guarantees ordered, local processing of all of one card's transactions | A single extremely high-velocity card/account (or an attack deliberately hammering one) can create a hot partition; needs monitoring and potentially special-cased handling |
| In-memory/local state store instead of external database | Keeps per-transaction state lookups inside the latency budget | State is tied to the specific consumer instance owning that partition; losing that instance requires fast recovery from checkpoints, not a simple stateless restart |
| Fail-safe `flag-for-review` default on timeout | Never silently drops or guesses on a transaction | Engine slowdowns convert into spikes in manual review volume — an operational cost, not a data-loss or fraud-risk cost, which is the intended trade |
| At-least-once delivery + idempotent decision application | Avoids the cost/complexity of true exactly-once semantics | Requires every downstream consumer of a decision to correctly implement idempotency by transaction ID — a correctness requirement pushed onto every consumer, not solved once centrally |
