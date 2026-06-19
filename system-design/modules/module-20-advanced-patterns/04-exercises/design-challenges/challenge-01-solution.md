# Design Challenge 01 — Solution: URL Shortener

## 1. Functional Requirements

- Given a long URL, generate a unique, short alias and return it.
- Given a short alias, redirect (HTTP 301/302) to the original long URL.
- Support optional custom aliases (user-chosen, subject to availability).
- Support optional expiration (a URL stops resolving after a set date).
- **Out of scope** (stated explicitly, the way a senior candidate would): per-click analytics dashboards, user accounts/auth beyond what's needed to own a custom alias. I'm noting these exist as real product features but excluding them from the core design to focus time on the harder distributed-systems problem.

## 2. Non-Functional Requirements (Estimated, Stated as Assumptions)

- **Scale:** 100 million new short URLs created per day; redirects outnumber creations by roughly 100:1 (a link is created once, clicked many times) → **10 billion redirects/day**.
- **Latency:** redirect must feel instant — target **under 50ms** for the redirect lookup, since it's directly on the critical path of someone clicking a link. Creation can tolerate slightly more (a few hundred ms) since it happens far less often.
- **Availability:** redirection is the core value of the product — target **high availability (99.9%+)**; a brief delay in *creating* new links is far less damaging than redirects failing.
- **Durability:** a short URL, once created, should not be lost — users share these links publicly and expect them to work indefinitely (unless explicitly expired).

## 3. Capacity Estimation

- **Writes:** 100M/day ÷ 86,400 sec/day ≈ **~1,160 writes/sec average**; provision for peak (assume 3x average) → **~3,500 writes/sec peak**.
- **Reads:** 10B/day ÷ 86,400 ≈ **~115,000 reads/sec average**, peak (3x) → **~350,000 reads/sec**. This confirms the read:write ratio (~100:1) directly drives the architecture: **this system is read-dominated, so caching the redirect lookup is the single highest-leverage decision in the whole design.**
- **Storage:** assume each record (short code + long URL + metadata) is ~500 bytes. 100M/day × 365 days × 5 years × 500 bytes ≈ **~91 TB** over a 5-year horizon — large, but well within what a sharded relational or key-value store handles routinely; this is not a "needs exotic storage" scale, it's a "needs sharding" scale.
- **Short code space:** a 7-character base62 code ([0-9a-zA-Z]) gives 62⁷ ≈ 3.5 trillion combinations — comfortably more than 100M/day × 5 years (~180 billion), with huge headroom.

> 🎯 **Interview Tip:** Notice the estimation isn't decorative — it directly produced two real design conclusions: (1) this is read-dominated, so cache-first is the right default pattern, and (2) storage scale calls for sharding, not an exotic database category. Capacity estimation that doesn't change a downstream decision is capacity estimation performed for its own sake.

## 4. API Design

```
POST /api/v1/urls
  Request:  { "longUrl": "https://example.com/some/very/long/path", "customAlias": "optional", "expiresAt": "optional ISO8601" }
  Response: { "shortUrl": "https://short.ly/aZ3kP9q", "longUrl": "...", "expiresAt": "..." }

GET /{shortCode}
  → 301/302 redirect to the long URL, or 404 if not found/expired
```

> 💡 **Note:** 301 (permanent redirect) lets browsers cache the redirect itself, reducing future load on this service for repeat visits from the same browser — but it also means analytics on subsequent visits won't hit your server at all. 302 (temporary) keeps every visit hitting the server, trading some redirect-serving load for visibility into every single click. I'd choose 302 if click analytics are a real product requirement, 301 if they're not (echoing the explicit functional-requirements scoping in Step 1).

## 5. Short Code Generation Strategy

Two real options, with a clear winner given the requirements:

| Approach | How | Trade-off |
|---|---|---|
| **Hash the long URL** (e.g., truncated MD5/SHA, base62-encoded) | Deterministic — same input always produces same code | Collisions are possible and must be detected and handled (append a salt and retry); also means the *same* long URL always gets the same short code, which may or may not be a wanted property |
| **Distributed counter / ID generator, base62-encoded** | Generate a unique ID (e.g., a [Snowflake-style ID](../../01-concepts/examples/snowflake-id-generator.ts) or a sharded counter range) and encode it as base62 | No collisions by construction; requires a real distributed-ID strategy rather than a stateless hash |

**Chosen approach: a Snowflake-style distributed ID, base62-encoded.** This is the direct application of [this module's distributed ID generation concepts](../../01-concepts/README.md#global-transaction-ids-and-distributed-id-generation): every application server generates IDs independently (no shared coordinator, no network round trip on the hot creation path), the IDs are guaranteed unique by construction, and encoding the resulting integer as base62 gives a short, URL-safe code directly. This sidesteps the hash approach's collision-handling complexity entirely.

## 6. Database Schema

```sql
CREATE TABLE urls (
  short_code   VARCHAR(10)  PRIMARY KEY,   -- base62-encoded ID, indexed for O(1) lookup
  long_url     TEXT         NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMP    NULL,
  owner_id     BIGINT       NULL            -- nullable: anonymous creation is allowed
);
```

**Database category choice:** a **key-value store or a sharded relational database** both work here, since every access pattern (create-by-code, read-by-code) is a simple key lookup with no joins or range queries needed — there's no relational structure being exploited. I'd lean **key-value (e.g., DynamoDB, Cassandra)** specifically because the access pattern is *exclusively* point lookups by a single key, which is exactly what key-value stores are optimized for, and their native horizontal partitioning by key sidesteps having to build custom sharding logic on top of a relational database — directly applying the storage-category decision framework from [Module 09](../../../module-09-storage/01-concepts/README.md).

## 7. Caching Strategy

Given the ~100:1 read:write ratio established in capacity estimation, caching the redirect lookup is the single most important performance decision in this system.

- **Pattern: cache-aside**, per the default recommended in [Module 05](../../../module-05-caching/01-concepts/README.md) — on a redirect request, check Redis first; on a miss, read from the database and populate the cache.
- **Eviction: LRU with a TTL safety net** — redirect access is strongly recency/popularity-biased (a recently-shared link gets clicked heavily for a period, then traffic drops off), which fits LRU's "recently used predicts will-be-used-again" assumption well.
- **Cache penetration consideration**: requests for short codes that never existed (typos, expired probing, scraping) would otherwise hit the database on every single request — a [Bloom filter](../../../module-05-caching/02-deep-dive/examples/bloom-filter.ts) in front of the database, populated with all known short codes, cheaply rules out the "definitely never existed" case before it reaches the database.
- **Invalidation**: short URLs are immutable once created (the long URL behind a code never changes), so there's no invalidation problem on update — only on expiration, handled by the TTL matching `expires_at`, or by an explicit delete-on-expiry sweep.

## 8. Scaling Strategy (10x and 100x)

- **At 10x (35,000 writes/sec, 3.5M reads/sec):** the cache layer absorbs nearly all read traffic if the hit rate stays high (which it should, given the recency-biased access pattern) — the database mostly only sees cache misses and writes. Shard the key-value store by short code (consistent hashing, [Module 04](../../../module-04-databases/04-exercises/coding-challenges/challenge-03/)) to spread write load across multiple nodes.
- **At 100x (350,000 writes/sec, 35M reads/sec):** this is where the **ID generation itself** needs scrutiny — a Snowflake-style generator with a 12-bit sequence (4096 IDs/ms per machine, from [this module's worked example](../../01-concepts/examples/snowflake-id-generator.ts)) supports 4.096M IDs/ms per machine, which is nowhere near the bottleneck; the real pressure point at this scale is **cache hot keys** — an extremely popular short link (a viral post) could receive a disproportionate share of the 35M reads/sec on one cache key, requiring the hot-key mitigation (replicate the specific hot key across multiple cache nodes) covered in [Module 05's deep dive](../../../module-05-caching/02-deep-dive/README.md).
- **What breaks first, if forced to pick one thing:** the cache layer's ability to handle a single viral hot key, not raw database or ID-generation throughput — this is the answer a senior candidate gives instead of a generic "we'd add more servers."

## 9. Observability

- **Redirect latency (p50/p99)** — the core user-facing metric; alert if p99 crosses the 50ms target established in NFRs.
- **Cache hit rate** — per [Module 05](../../../module-05-caching/02-deep-dive/README.md), this is the metric that tells you whether the cache is earning its complexity; a sudden drop signals either a cache failure or an unusual traffic pattern (e.g., a sudden wave of long-tail/never-cached links).
- **404 rate on redirects** — a sudden spike can indicate either an expired-link cleanup running as expected, or a scraping/abuse pattern probing for valid codes.
- **Write success rate and ID-generation error rate** — a Snowflake-style generator throwing its "clock moved backwards" error (per the worked example) should page someone; it means the system briefly stopped generating IDs on at least one node.

## 10. Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Short code generation | Distributed ID (Snowflake-style) + base62 | No collision handling needed; requires real distributed-ID infrastructure (machine ID assignment) versus a stateless hash |
| Database category | Key-value store | Optimal for the pure point-lookup access pattern; loses relational query flexibility the product doesn't currently need |
| Redirect HTTP code | 302 (assuming analytics matters) | Every click hits the server (more load, but full visibility) versus 301's browser-side caching (less load, less visibility) |
| Cache eviction | LRU + TTL | Fits the recency-biased access pattern well; defeated by a sudden mass-scan-like access pattern, a known LRU weakness from Module 05 |
