# Design Challenge 02: Fraud Detection Pipeline at 100K Transactions/Second

**Difficulty:** Hard

## Prompt

Design a fraud detection pipeline for a payment processor that must:
- Ingest and evaluate **100,000 transactions per second** at peak.
- Return a fraud decision (`approve` / `decline` / `flag-for-review`) in **under 500ms** per transaction, end to end.
- Use signals that require state: a transaction's risk depends on recent history (this card's transactions in the last hour, this device's transactions in the last day, velocity of spending vs. this account's normal pattern).
- Never silently drop a transaction — every transaction must receive a decision, even under failure conditions.

## What to Produce

1. Translate the 100K/sec and sub-500ms requirements into concrete architectural constraints — what does this rule out immediately, and why?
2. Design the ingestion and processing path. What does "state" mean here concretely, and where does it physically live so that a lookup doesn't itself blow the latency budget?
3. Design what happens when the fraud model/rules engine itself is slow, down, or uncertain — the system must still return a decision within budget without silently dropping the transaction.
4. Discuss exactly-once vs. at-least-once processing in this context: is double-charging or double-declining a real risk, and how do you prevent it?
5. Design how slower, more thorough fraud analysis (a Lambda-style batch layer) fits in, given that the real-time decision has already been made by the time batch analysis would finish.
6. State at least 3 explicit trade-offs in your design.

There is no single "correct" architecture — focus on deriving every decision from the stated throughput, latency, and zero-drop requirements.
