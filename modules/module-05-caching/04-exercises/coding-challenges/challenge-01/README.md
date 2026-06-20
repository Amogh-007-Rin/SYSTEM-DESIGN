# Coding Challenge 01: LRU Cache

## Problem Statement

Implement an LRU (Least Recently Used) cache with O(1) `get` and `put`, using a `Map` for O(1) lookup plus a doubly-linked list to track recency order in O(1) per move.

## Requirements

1. `get(key)` — returns the value and moves the entry to the front (most-recently-used), or returns `null` on a miss.
2. `put(key, value)` — inserts or updates a value at the front; if the cache is at capacity and this is a new key, evict the entry at the back (least-recently-used) first.
3. Both operations must be O(1) — no scanning the list or the map's keys.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts
```

Expected output (see the comments at the bottom of `starter.ts` for the exact expected state after each operation): inserting `a, b, c` into a capacity-3 cache, then accessing `a` (promoting it), then inserting `d` should evict `b` (the actual least-recently-used entry, not `a` despite being inserted first).
