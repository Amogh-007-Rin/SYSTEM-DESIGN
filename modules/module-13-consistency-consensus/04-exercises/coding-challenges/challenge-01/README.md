# Coding Challenge 01: G-Counter CRDT

## Problem Statement

Implement a **G-Counter** (grow-only counter) — a CRDT that lets multiple independent replicas (nodes) each increment a shared logical counter with zero coordination, and still guarantees that merging any two replicas' state always converges to the same correct total, no matter the merge order or how many times a merge happens.

This is the simplest possible CRDT and the one almost every CRDT explanation starts with, because it makes the "commutative, associative, idempotent" property concrete with the least amount of moving parts: each node owns one entry in a map, only ever increments its own entry, and merge is just a per-key `max`.

![G-Counter CRDT merge diagram](../../../01-concepts/diagrams/exports/crdt-counter.png)
*Two G-Counter replicas (node-A: 3, node-B: 2) each incrementing independently, then merging via per-node max to converge on the same total (5) regardless of merge order.*

## Requirements

1. `increment()` — increments **this node's own** counter entry by 1. A replica must never write to another node's entry directly; that's what keeps increments coordination-free.
2. `value()` — returns the total: the sum of every node's counter entry.
3. `merge(other)` — for every `nodeId` known to `other`, set `this[nodeId] = max(this[nodeId] ?? 0, other[nodeId])`. This must be:
   - **Commutative** — `a.merge(b)` and `b.merge(a)` produce the same total.
   - **Associative** — merging in different groupings/orders produces the same total.
   - **Idempotent** — merging the same state twice changes nothing.
4. `state()` — returns a plain `Record<string, number>` snapshot for serialization/printing.

## Why Max, Not Sum, on Merge

A common first mistake is merging by *summing* the two replicas' counters for a shared `nodeId`. That's wrong — if A has already heard that B's counter is at 2, and A merges with B again later (B is now at 2, unchanged), summing would double-count B's contribution as if it incremented twice. Each node's own counter is monotonically non-decreasing, so the higher of two observations of "what node X's counter is" is always the more up-to-date, correct one — which is exactly what `max` gives you, and exactly why it produces a merge that's safe to repeat (idempotent).

## Starter / Solution

- [`starter.ts`](./starter.ts) — skeleton with `increment`, `value`, and `merge` left as `TODO`s (type-checks cleanly; throws `"Not implemented"` at runtime by design until you fill them in)
- [`solution.ts`](./solution.ts) — complete, working reference implementation

## Usage Example

```bash
npx ts-node starter.ts    # type-checks; throws "Not implemented" until you implement it
npx ts-node solution.ts   # runs end-to-end
```

Expected behavior once implemented: node-A increments 3 times (A: 3), node-B increments 2 times (B: 2), node-C increments once (C: 1). After A merges with B and C, and B merges with A, both A and B should report a total `value()` of **6** — and merging again (idempotency check) must still report **6**, not 12 or any other value.

## Related Reading

This exercise is the hands-on companion to the CRDT section of [`02-deep-dive/README.md`](../../../02-deep-dive/README.md#crdts-conflict-free-replicated-data-types), and the data-loss contrast in [`02-deep-dive/examples/lww-vs-crdt-merge.ts`](../../../02-deep-dive/examples/lww-vs-crdt-merge.ts) shows what an LWW approach would have done instead to the same kind of concurrent-update scenario.
