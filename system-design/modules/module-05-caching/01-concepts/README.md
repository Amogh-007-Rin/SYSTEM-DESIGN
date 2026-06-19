# Module 05 — Concepts: Caching

## Why This Matters

A database query that takes 20ms feels instant — until 50,000 users hit the same query in the same second and your database falls over. Caching is how systems serve far more reads than their source of truth could ever handle directly, by keeping a copy of the answer somewhere faster and cheaper to read from. It's the single highest-leverage performance technique available to a system designer, which is also exactly why it shows up in nearly every later module in this repository.

---

## Where You Can Cache

Caching exists at every layer of a system, and a real architecture typically uses several simultaneously:

- **Client-side** — the browser/app caches responses locally, avoiding the network entirely on a hit.
- **CDN** — caches static (and sometimes dynamic) content at edge locations close to users (full treatment in [Module 10](../../module-10-cdn/)).
- **Reverse proxy** (Nginx) — caches responses in front of application servers.
- **Application-level** — an in-process cache (a `Map`, or a library like `node-cache`) for data needed repeatedly within a single process.
- **Distributed cache** (Redis, Memcached) — a shared cache layer accessible by many application server instances.
- **Database query cache** — some databases cache the result of recent queries internally.

---

## Caching Patterns

| Pattern | How It Works | Trade-off |
|---|---|---|
| **Cache-aside (lazy loading)** | App checks cache first; on miss, reads from DB and populates the cache | Only caches what's actually requested; first request after a miss pays full latency |
| **Write-through** | Every write goes to the cache and the database together, synchronously | Cache is always consistent with the DB; write latency includes both writes |
| **Write-behind (write-back)** | Write goes to the cache immediately; DB write happens asynchronously afterward | Lowest write latency; risk of data loss if the cache fails before the DB write completes |
| **Read-through** | The cache itself (not the app) knows how to load from the DB on a miss | Simplifies application code; requires cache infrastructure that supports this (not all do natively) |

> 🎯 **Interview Tip:** Cache-aside is the default answer for most read-heavy systems in an interview — it's simple, and you explicitly control what gets cached. Reach for write-through only when you've stated *why* (e.g., "this data is read immediately after being written, so I want to guarantee the cache never serves a stale value right after a write").

---

## Cache Eviction Policies

A cache has finite size — something must be evicted to make room for new entries:

- **LRU (Least Recently Used)** — evict the entry that hasn't been accessed for the longest time. The most common default; implemented from scratch in this module's exercises.
- **LFU (Least Frequently Used)** — evict the entry accessed the fewest times. Better than LRU when access frequency, not recency, predicts future use, but more bookkeeping overhead.
- **FIFO** — evict the oldest-inserted entry regardless of access pattern. Simple, but ignores usage entirely.
- **TTL-based** — entries expire after a fixed duration regardless of access. Often combined with another policy (e.g., LRU + a max TTL safety net).

> ⚠️ **Warning:** LRU isn't free of pathological cases — a single sequential scan over a dataset larger than the cache will evict every genuinely "hot" entry to make room for items that will never be accessed again. This is a known weakness worth naming if asked to defend LRU.

---

## Redis vs. Memcached

| | Redis | Memcached |
|---|---|---|
| Data structures | Strings, hashes, lists, sets, sorted sets, bitmaps | Strings only (values are opaque blobs) |
| Persistence | Optional (RDB snapshots, AOF log) | None — pure in-memory, data lost on restart |
| Clustering | Native (Redis Cluster) | Client-side sharding only |
| Use case fit | Anything beyond simple key-value (leaderboards, rate limiting, pub/sub) | Simple, maximally fast key-value caching with a smaller memory footprint per entry |

> 💡 **Note:** Memcached's simplicity is a feature, not a limitation — if you genuinely only need "cache a blob behind a key, as fast as possible, with no persistence," its lower per-key memory overhead and simpler operational model can be the right choice over Redis's larger feature surface.

### Redis Data Structures and Their System Design Use Cases

- **Strings** — simple cached values, counters (`INCR`)
- **Hashes** — caching an object's fields without re-serializing the whole thing for a partial update
- **Lists** — simple queues, recent-activity lists
- **Sets** — unique membership tests (e.g., "has this user already seen this notification?")
- **Sorted sets** — leaderboards, rate limiting windows, priority queues (score = priority/time)
- **Bitmaps** — extremely compact membership/flag tracking at huge scale (e.g., daily active user tracking, one bit per user)

---

## Key Takeaways

- Caching exists at every layer (client, CDN, proxy, application, distributed cache) and real systems combine several layers.
- Cache-aside is the most common default pattern; write-through and write-behind are justified by specific consistency or latency requirements.
- LRU, LFU, FIFO, and TTL each predict "what will be needed next" differently — and each has known pathological cases worth naming.
- Redis's rich data structures (sorted sets, bitmaps, etc.) solve specific system design problems beyond plain caching — leaderboards, rate limiting, presence.
- Memcached's simplicity can be the right trade-off when you genuinely just need a fast, simple key-value cache with no extra features.
