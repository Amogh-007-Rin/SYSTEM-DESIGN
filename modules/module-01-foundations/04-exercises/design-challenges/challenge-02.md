# Design Challenge 02: Write an NFR Document

**Difficulty:** Easy

## Prompt

You've been told: "We're building a flash-sale checkout system. It needs to handle 1 million daily active users, with the expectation of severe traffic spikes (10x normal load) during sale events. 99.9% uptime is the target, and the business has stated that overselling inventory is unacceptable."

Write a complete non-functional requirements (NFR) document for this system, in the style introduced in [`02-deep-dive/README.md`](../../02-deep-dive/README.md).

## What to Produce

Your document should explicitly state, with a number and a one-sentence justification for each:

1. Availability target
2. Latency target (p50 and p99) for the checkout API
3. Consistency model for the inventory count specifically (strong or eventual — justify)
4. Durability requirement for a completed order
5. Expected peak QPS (show your math from the 1M DAU figure, accounting for the 10x spike)
6. Data retention period for order history

A full worked solution is available at [`challenge-02-solution.md`](./challenge-02-solution.md). Try writing your own first — there's more than one defensible answer, especially for the spike-handling QPS math.
