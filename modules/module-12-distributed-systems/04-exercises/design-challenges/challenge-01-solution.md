# Design Challenge 01 — Solution: Distributed Counter Across 5 Nodes

## Why the Naive "Shared Integer" Design Fails

If every node keeps a single integer and gossips it around, two independent problems break correctness immediately:

1. **Duplicate/retried increments double-count.** If node A increments its integer, gossips `total=6` to node B, and the same increment message is redelivered (a duplicate, or a retry after a dropped ack), there's no way to tell "this is the same increment I already applied" from "this is a new increment" — the integer itself carries no identity, only a final value. This is exactly the idempotency problem from [02-deep-dive](../../02-deep-dive/README.md#idempotency-in-distributed-systems): without some notion of "have I already applied this," at-least-once delivery silently corrupts the count.
2. **Concurrent increments at different nodes conflict with no way to merge correctly.** If A and B each increment their own local integer concurrently (A: 5→6, B: 5→6) without having seen each other's update yet, and then exchange values, which is "right" — 6? There's no way to tell that *two* increments happened (the true total should reflect both), because a single shared integer has already discarded the information that they were separate, independent operations.

## The Fix: Give Every Node Its Own Slot (a G-Counter)

Instead of one shared integer, each node maintains a **vector of per-node counters** — conceptually identical to the per-node slots in a vector clock (Module 12 deep dive): `{ A: 0, B: 0, C: 0, D: 0, E: 0 }`. The rule:

- **Increment locally:** a node only ever increments **its own slot**. Node A doing 3 increments produces `{ A: 3, B: 0, C: 0, D: 0, E: 0 }` on A's local copy — it never touches any other node's slot.
- **Merge on receiving a peer's vector:** element-wise **max** per slot (not addition!) — exactly the vector-clock merge rule from [`vector-clocks.ts`](../../02-deep-dive/examples/vector-clocks.ts). If A has `{A:3, B:0, ...}` and receives B's vector `{A:0, B:2, ...}`, A's merged result is `{A:3, B:2, ...}`.
- **Compute the total:** sum every slot in the local vector: `3 + 2 + 0 + 0 + 0 = 5`.

This solves both naive-design problems at once:
- **Duplicates are harmless** — re-merging the same vector (or an older one) via element-wise max is **idempotent**: merging `{A:3,...}` into a vector that already has `A:3` (or higher) changes nothing, so redelivery, retries, and out-of-order delivery are all automatically safe.
- **Concurrent increments merge correctly** — A's 3 increments and B's 2 increments are tracked in separate slots, so merging never loses either one; the sum after merge is always the true total of everything every node has ever locally incremented, once the merge has propagated everywhere.

This data structure is a well-known CRDT (Conflict-free Replicated Data Type) called a **G-Counter** (grow-only counter) — arriving at it from first principles (per-node slots + max-merge) is exactly the reasoning process that matters, whether or not the name is known going in.

## Propagation Mechanism

**Gossip**, directly reusing the mechanic from [Coding Challenge 02](../coding-challenges/challenge-02/): each node periodically picks a random peer and exchanges its full vector, merging by element-wise max (the counter equivalent of merge-by-highest-version). Gossip fits because the merge operation is commutative, associative, and idempotent — it doesn't matter what order updates arrive in or whether they arrive more than once, which is exactly what gossip's unordered, at-least-once-ish propagation requires of whatever it's propagating.

## Computing the Total Mid-Partition

A node always computes its total as the sum of its **local** vector — this is always a valid, monotonically non-decreasing **lower bound** on the true global total. While partitioned away from 2 other nodes, a node simply doesn't yet know about their increments, so it under-counts temporarily; it never over-counts, and once the partition heals and gossip resumes, the merged vector (and therefore the computed total) catches up monotonically — it can only go up, never down or sideways incorrectly, which is the precise guarantee that makes "eventually consistent" a meaningful, trustworthy claim here rather than a hand-wave.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Per-node slots vs. single shared integer | Per-node vector (G-Counter) | Solves duplicate/concurrency correctness; memory grows with cluster size (one slot per node, ever) |
| Propagation | Gossip (periodic random exchange) | No coordinator, no single point of failure; total is only eventually accurate, not instantaneously |
| Merge rule | Element-wise max (not sum) | Idempotent and safe under retries/duplicates; requires every node to track every other node's slot, not just a running total |

## A Scenario Where It's Visibly (Temporarily) Wrong

Immediately after a network partition isolates node E from {A, B, C, D}, and E accepts 10 new increments locally: any client reading the total from A, B, C, or D will under-report by 10 until the partition heals and gossip propagates E's slot to them. The system never reports a number *higher* than true (no double-counting), but it can under-report for as long as the partition lasts — this is the concrete, visible cost of "no central coordinator, no synchronous write quorum" that this design accepts in exchange for always being able to accept writes anywhere.

> 🎯 **Interview Tip:** If you only remember one thing from this exercise, remember the reframe: "don't share one number, give every node its own slot, and merge by taking the max" — this single idea (a G-Counter) is the seed of the broader CRDT family (G-Sets, OR-Sets, PN-Counters for values that also decrement), which is a legitimate, production-grade alternative to coordinator-based consistency for exactly the kind of monotonic, mergeable data this challenge describes.
