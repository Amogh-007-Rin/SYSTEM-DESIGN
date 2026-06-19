# Module 05 — Deep Dive: Invalidation, Stampedes, and Hot Keys

## Why This Matters

"There are only two hard things in Computer Science: cache invalidation and naming things" (Phil Karlton) is a joke with a real point — caching is conceptually simple (store the answer, skip the slow path next time) but operationally treacherous (how do you know when the cached answer is wrong?). This deep dive covers the failure modes that separate "added a cache" from "added a cache that's safe in production."

---

## Cache Invalidation Strategies

- **TTL (time-to-live)** — entries expire automatically after a fixed duration. Simple, but means there's always a window where stale data can be served.
- **Event-driven invalidation** — explicitly delete or update a cache entry the moment its source data changes. More immediate consistency, but requires every write path to remember to invalidate every affected cache key — easy to miss one.
- **Cache versioning** — embed a version number in the cache key itself (`user:42:v3`); "invalidation" becomes simply incrementing the version and letting old-versioned keys expire naturally via TTL, never explicitly deleted.
- **Cache tags** — group related cache entries under a tag so an entire group can be invalidated together (e.g., invalidate every cached page referencing a product when its price changes).

> ⚠️ **Warning:** Event-driven invalidation that touches multiple services is a common source of subtle bugs — if service A updates data that service B has cached, and the invalidation message gets lost or arrives out of order, B serves stale data with no obvious error anywhere. TTL as a safety net (even a long one) bounds how wrong the system can be for how long, even when explicit invalidation fails.

---

## Cache Stampede (Thundering Herd)

When a popular cache key expires, many concurrent requests can all miss simultaneously and all hit the database at once — a stampede that can take down the very database the cache was protecting.

**Mitigations:**
- **Mutex locking** — only one request recomputes the value; others wait for it (or briefly serve stale data) instead of all hitting the database.
- **Probabilistic early expiration** — recompute slightly *before* actual expiry, with randomized timing per-request, so requests don't all expire in the same instant.
- **Background refresh** — proactively refresh hot keys before they expire, so they (ideally) never actually miss under normal load.

> 📊 **Diagram:** `cache-stampede-solution.drawio` — Shows N concurrent requests hitting an expired key; without mitigation, all N hit the database simultaneously; with mutex locking, only 1 hits the database while N-1 wait for its result.

---

## Hot Key Problem

In a distributed cache (sharded across nodes), a single extremely popular key (a viral post, a celebrity's profile) can receive disproportionate traffic, overwhelming the one node responsible for it even while every other node is idle. **Mitigations**: replicate hot keys across multiple nodes (read from any replica), or maintain a local in-process cache layer in front of the distributed cache specifically for detected hot keys.

---

## Cache Penetration

A flood of requests for keys that **don't exist** (neither in cache nor database) bypasses the cache entirely every time — there's nothing to cache for a miss on a nonexistent key, so every such request hits the database. This can be an organic pattern (looking up deleted/never-existed IDs) or a deliberate attack. **Mitigation: a Bloom filter** in front of the database — a compact probabilistic structure that can say "definitely not present" cheaply, letting the system skip the database entirely for keys that provably don't exist, while still hitting the database for keys the filter says might exist. Implemented hands-on in [`examples/bloom-filter.ts`](./examples/bloom-filter.ts).

---

## Cache Warming

Pre-populating a cache with expected-hot data *before* it's needed — e.g., loading tomorrow's featured content into cache during off-peak hours, rather than letting the first user request pay the cache-miss cost. Useful when you can predict what will be hot (scheduled content, known high-traffic events) rather than relying entirely on reactive caching.

---

## Distributed Caches at Scale

A single Redis instance becomes a capacity and availability bottleneck past a certain point. **Redis Cluster** shards keys across multiple nodes using a hash-slot scheme (a relative of the [consistent hashing](../../module-04-databases/04-exercises/coding-challenges/challenge-03/) covered in Module 04), allowing the cache itself to scale horizontally rather than being a single point of failure for the whole system's read path.

## Multi-Layer Caching Architectures

Real systems often stack caches: an in-process (per-instance) cache for the hottest few thousand keys, backed by a shared distributed cache (Redis) for everything else, backed by the database. Each layer trades capacity for latency — the in-process layer is fastest but smallest and inconsistent across instances; the distributed layer is shared and larger but a network hop away.

## Cache Hit Rate

`hit rate = cache hits / (cache hits + cache misses)`. This is the single most important metric for evaluating whether a cache is earning its operational cost — a cache with a 30% hit rate may not be worth the complexity and memory it costs, while a 95%+ hit rate on a hot dataset can mean the database almost never sees read traffic at all. Track it per-key-pattern, not just globally — a low overall hit rate can hide a few specific keys with a very poor hit rate dragging the average down.

---

## Key Takeaways

- TTL is a safety net even when you have event-driven invalidation — it bounds how wrong the system can be for how long when an explicit invalidation is missed.
- Cache stampedes happen when many requests miss the same expired key simultaneously; mutex locking and probabilistic early expiration are the standard mitigations.
- The hot key problem is about traffic skew across a sharded cache, not the cache being too small overall — replication or a local layer in front of the distributed cache mitigates it.
- Cache penetration (queries for nonexistent keys) bypasses caching entirely; a Bloom filter cheaply rules out provably-nonexistent keys before they ever reach the database.
- Hit rate is the metric that tells you whether a cache is worth its complexity — measure it per access pattern, not just globally.
