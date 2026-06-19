# Sample Answer: "How Would You Scale a System from 1K to 1M Users?"

> A fully worked deep-dive answer. The system: a social-media-style app with a REST API, a relational database, user-generated posts, and a home feed — the same general shape used in [Module 04's Twitter schema](../../module-04-databases/03-interview-prep/sample-answer.md) and [Module 05's feed caching example](../../module-05-caching/03-interview-prep/sample-answer.md).

---

## Start With Numbers, Not Vibes

Before proposing anything, pin down rough scale. Assume 1M total registered users, 10% daily active (100K DAU), each making ~20 requests/session, averaged over a day with a 3x peak-hour multiplier. That's roughly 700 requests/sec at peak. Assume each request averages 80ms. By Little's Law (`L = λW`), peak concurrency needed is roughly `700 × 0.08 ≈ 56` concurrent in-flight requests — small enough that this is firmly a "scale the architecture sensibly" problem, not an exotic one.

---

## Stage 1: 1,000 Users — Single Server

App and database on one machine. At this scale, the entire problem is premature optimization — the right move is to *not* over-architect. **Bottleneck:** none yet, possibly the database competing with the app for the same machine's RAM under any real load. **Fix:** none needed yet, or at most, move the database to its own (still single) machine if local testing shows resource contention.

## Stage 2: 10,000 Users — Separate the Database, Add Caching

The app server's CPU starts becoming visibly busy under concurrent request handling, and the database is now also serving more queries than it was sized for if it's still co-located. **Bottleneck:** shared CPU/RAM contention between app and DB processes, and repeated reads of the same hot data (popular profiles, frequently-viewed posts). **Fix:** move the database to a dedicated machine; add a cache-aside Redis layer (Module 05) in front of read-heavy queries — user profile lookups, post content. This alone usually buys significant headroom without adding any new servers.

## Stage 3: 100,000 Users — Multiple Stateless App Servers + Load Balancer

A single app server's CPU is now the bottleneck even with caching absorbing read load, because the increased valid traffic itself exceeds what one process can handle. **Bottleneck:** app server compute capacity. **Fix:** ensure the app tier is fully stateless (sessions in Redis or JWTs, not local memory — see [01-concepts](../01-concepts/README.md)), then run multiple app server instances behind a load balancer (Module 07). This is the point where statelessness, decided earlier, pays off — any instance can serve any request, so scaling out is just "add more instances."

## Stage 4: 1,000,000 Users — Database Read Replicas + Async Processing

With the app tier now horizontally scaled, the single primary database becomes the next bottleneck — it's now serving both the cache-miss read traffic from many app server instances and all write traffic. **Bottleneck:** database read capacity, and any synchronous work (image processing on upload, notification fan-out) blocking request latency directly. **Fix:** add read replicas for the read-heavy queries that survive cache misses, explicitly routing writes (and any read-immediately-after-write paths) to the primary; move non-urgent work (thumbnail generation, email/push notifications, search index updates) onto an async queue (Module 08) consumed by an independently-scaled worker fleet, off the request's critical path.

## Stage 5: Beyond — Sharding and Geo-Distribution

If write volume or total data size outgrows a single primary even with replicas, shard the database by a key like `user_id` (consistent hashing, as in [Module 04's sharding challenge](../../module-04-databases/04-exercises/design-challenges/challenge-02.md)), accepting that cross-shard queries (e.g., "posts from people I follow," spanning shards) now need either application-level fan-in or a precomputed feed structure. If users are globally distributed and latency to a single region is unacceptable, deploy to multiple regions, accepting eventual consistency for data where brief staleness is tolerable and routing data-residency-constrained users to specific regions.

---

## Trade-offs Named at Each Stage

| Stage | Choice | Trade-off Accepted |
|---|---|---|
| 10K | Cache-aside Redis layer | Invalidation complexity; a staleness window if invalidation is ever missed |
| 100K | Stateless app tier + load balancer | Sessions must live in shared infrastructure, not local memory |
| 1M | Read replicas + async queue | Replication lag on reads; eventual (not immediate) completion of offloaded work |
| Beyond | Sharding + geo-distribution | Cross-shard queries become hard; cross-region consistency requires a deliberate conflict strategy |

---

## Why This Answer Works

It never proposes a fix without first naming the bottleneck that motivates it, it applies the scaling journey from [01-concepts](../01-concepts/README.md) in order rather than jumping to sharding immediately, it uses Little's Law to ground the numbers instead of asserting scale qualitatively, and every stage explicitly states the trade-off being accepted rather than presenting the change as a free win.
