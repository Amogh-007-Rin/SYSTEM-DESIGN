# Design Challenge 01: Distributed Counter System Across 5 Nodes

**Difficulty:** Hard

## Prompt

Design a distributed counter system (e.g., counting "likes" on a post, or page views) that works across 5 nodes **without a central coordinator**. Any of the 5 nodes must be able to accept an increment even while some of the others are unreachable, and the system must eventually report a correct, consistent total once all nodes can communicate again.

## Constraints

- No single leader — any node can accept a write (an increment) at any time.
- The system must tolerate up to 2 of the 5 nodes being down or partitioned away at once and still accept writes.
- Network messages between nodes may be delayed, dropped, duplicated, or delivered out of order.
- "Eventually consistent" is acceptable for the total — it does not need to be instantaneously correct on every node at every moment.

## What to Produce

1. Explain why a naive "each node keeps an integer and gossips the integer" design fails under retries/duplicate messages, and under concurrent increments at different nodes.
2. Propose a concrete data structure each node maintains that solves both problems above (hint: think about what happens if you give every node its **own** slot to increment, rather than sharing one number).
3. Describe the propagation mechanism nodes use to converge (which mechanism from this module fits, and why).
4. Describe how a node computes the "current total" from its local state at any point, including while it's still missing updates from a partitioned peer.
5. Identify at least 2 trade-offs of your design, and one scenario where it would give a visibly wrong answer (even if only temporarily).

> 💡 **Note:** This is intentionally close to a real, well-known data structure used in production CRDTs (Conflict-free Replicated Data Types) — if you get to a design that resembles one without having heard the term before, that's a good sign you've reasoned your way to a real solution rather than recalling one.

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md).
