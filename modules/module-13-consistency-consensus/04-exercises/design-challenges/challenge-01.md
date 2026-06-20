# Design Challenge 01: Consistency Model for a Distributed Shopping Cart

**Difficulty:** Medium-Hard

## Prompt

You're designing a distributed shopping cart — which consistency model do you choose, and why? Walk through failure scenarios.

## What to Produce

1. Identify the distinct *parts* of "the cart system" that might legitimately need different consistency guarantees (don't treat it as one monolithic decision) — at minimum, consider cart line items, displayed inventory counts, the actual inventory decrement at purchase time, and checkout/payment capture.
2. For each part, state: CP or AP, and which model on the consistency spectrum (eventual, read-your-writes, linearizable, etc.) applies.
3. If you choose AP anywhere, name your conflict resolution strategy (LWW, vector clocks, or a CRDT) and be explicit about what it costs.
4. If you choose CP anywhere, state explicitly what happens to a request that hits the minority side of a partition — does it error, queue, redirect?
5. Walk through at least **two concrete failure scenarios** end-to-end (e.g., a network partition splitting two devices' sessions, two concurrent purchases of the last unit of stock) and trace exactly what your design does, step by step, for each.
6. State at least 2 trade-offs explicitly.

A full worked solution is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md), which answers this exact prompt in depth.
