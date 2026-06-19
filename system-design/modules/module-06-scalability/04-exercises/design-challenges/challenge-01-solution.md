# Design Challenge 01 — Solution: Scaling a Monolith from 100 to 1M Users

This is the same progression worked through in depth in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) ("How would you scale a system from 1K to 1M users?") — summarized here stage-by-stage for the exercise format.

## Stage-by-Stage Table

| Stage | Bottleneck | Fix | Trade-off Accepted |
|---|---|---|---|
| **100 users** | None yet — single server handles this comfortably | No change; resist the urge to over-architect | Forgoing this stage entirely is itself the right call — premature scaling has a real cost too |
| **1,000 users** | App and DB processes compete for the same machine's CPU/RAM | Move the database to its own dedicated machine | Two machines to operate instead of one; a network hop now exists between app and DB |
| **10,000 users** | Repeated reads of the same hot data (profiles, popular content) hit the database every time | Add a cache-aside Redis layer in front of the hottest read queries | Cache invalidation complexity; a staleness window if an invalidation is ever missed |
| **100,000 users** | A single app server's CPU is now the limit, even with caching absorbing read load | Make the app tier stateless (sessions in Redis, not local memory) and run multiple instances behind a load balancer | Sessions must live in shared infrastructure; load balancer becomes a new component to operate and itself needs redundancy |
| **1,000,000 users** | The single primary database is now the bottleneck for both cache-miss reads (from many app instances) and all writes | Add read replicas for read traffic; move non-urgent work (notifications, thumbnail generation) to an async queue + worker fleet | Replication lag on replica reads; offloaded work completes eventually, not synchronously with the triggering request |

## Where Caching Was Applied

User profile lookups and frequently-viewed post/content objects, cache-aside pattern with LRU + TTL (the same reasoning as [Module 05](../../../module-05-caching/01-concepts/README.md)) — chosen because these are read far more often than they change, making the cache hit rate high and the staleness window from TTL low-risk.

## Where Statelessness Mattered

At the 100K stage, moving sessions out of app server memory (into Redis, or replacing server-side sessions with signed JWTs entirely) was the precondition for running multiple app instances behind a load balancer — without it, a user's session would only exist on whichever single instance first handled their login, breaking the moment the load balancer routed a later request elsewhere.

## Sharding

Not yet needed at 1M *concurrent* users in this scenario — read replicas handle the read-scaling need, and a single primary can typically still absorb the write volume implied by 1M concurrent users (most users are reading far more than writing at any given moment). Sharding becomes necessary once **write throughput** or **total data size** — not concurrent user count alone — exceeds what a single primary (even well-indexed, even with replicas) can hold. If/when that threshold is crossed, shard by `user_id` using consistent hashing, exactly as worked through in [Module 04's sharding challenge](../../../module-04-databases/04-exercises/design-challenges/challenge-02-solution.md).

## Where the Scaling Laws Were Used

**Little's Law**, to size the app tier: at 1M total users with ~10% daily active and a 3x peak multiplier, peak load is roughly 700 requests/sec; at an 80ms average latency, `L = λW ≈ 700 × 0.08 ≈ 56` concurrent in-flight requests needed at peak — a concrete number to size connection pools and worker counts against, instead of guessing.

**Amdahl's Law**, if profiling ever revealed a serial step — e.g., a single database write acting as a synchronization point during a multi-step "create post" transaction. No amount of additional horizontally-scaled app servers shortens that serial step; the only way to speed it up is to reduce the work done inside it (e.g., moving non-essential parts of "create post" — like fan-out to followers' feeds — onto the async queue instead of keeping them inside the synchronous request).
