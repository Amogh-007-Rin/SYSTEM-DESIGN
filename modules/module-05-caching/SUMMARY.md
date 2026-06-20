# Module 05 — Caching: Summary

> This module covered caching at every layer of a system: the core patterns (cache-aside, write-through, write-behind), eviction policies, and the production failure modes — stampede, hot keys, penetration — that separate "added a cache" from "added a cache safely."

---

## Key Concepts

1. **Cache-aside** — the application checks the cache, falls back to the database on a miss, and populates the cache itself; the most common default pattern.
2. **Write-through / write-behind** — writes update the cache synchronously or asynchronously alongside the database, trading write latency for read freshness guarantees.
3. **Eviction policies** — LRU, LFU, FIFO, TTL — each predicts "what's needed next" differently, with different pathological cases.
4. **Cache stampede** — many concurrent requests missing the same expired key simultaneously; mitigated by mutex locking or probabilistic early expiration.
5. **Hot key problem** — traffic skew onto one key/node in a sharded cache; mitigated by replication of detected hot keys.
6. **Cache penetration** — queries for nonexistent keys bypass the cache entirely; mitigated by a Bloom filter ruling out provably-absent keys cheaply.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Caching pattern | Cache-aside | Write-through | Simplicity, only cache what's read | Need guaranteed-fresh reads immediately after writes |
| Eviction policy | LRU | TTL-only | Access is recency-biased | All entries should expire uniformly regardless of access |
| Invalidation | Event-driven | TTL-only | Need near-immediate consistency | Simplicity is worth a bounded staleness window |

---

## Common Interview Questions from This Module

- What's the difference between cache-aside and write-through, and when would you choose each?
- What is cache stampede, and how do you prevent it?
- How does a Bloom filter help with cache penetration, and what's the catch?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| LRU cache (hashmap + doubly-linked list) | O(1) get/put with recency-based eviction |
| Bloom filter | Cheaply rules out provably-nonexistent keys, preventing cache penetration |
| Mutex locking / probabilistic early expiration | Prevents cache stampede on popular key expiry |
| Hot key replication | Spreads disproportionate read load off a single cache node |

---

## What This Unlocks

After this module, you can tackle:
- [Module 06 — Scalability](../module-06-scalability/), which assumes caching is one tool in your broader scaling toolkit
- [Module 10 — CDN](../module-10-cdn/), which applies the same caching concepts at the network edge
- Caching deep-dives in interview questions like [Twitter](../../interview-prep/question-bank/medium/twitter.md), [Instagram](../../interview-prep/question-bank/medium/instagram.md), and [distributed cache design](../../interview-prep/question-bank/hard/distributed-cache.md)

---

## Quick Reference

- **Cache-aside** = app-controlled, lazy. **Write-through** = always fresh, slower writes.
- **LRU** evicts least-recently-used; defeated by large sequential scans.
- **Stampede** = many misses on one expired key at once. **Hot key** = traffic skew on one key/node. **Penetration** = queries for keys that never existed.
- **Bloom filter**: no false negatives, tunable false positives — perfect for "definitely not present" checks.
- **Hit rate** is the metric that tells you if a cache earns its complexity.

---

← [Previous Module ← Module 04 — Databases](../module-04-databases/) | [Next Module → Module 06 — Scalability](../module-06-scalability/)
