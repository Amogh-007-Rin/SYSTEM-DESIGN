# Design Challenge 01 — Solution: Caching Strategy for a Twitter Feed

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — summarized here for the exercise format.

## What to Cache

1. **Precomputed home timelines** (Redis sorted sets, per user) — the dominant read path; computed via fan-out-on-write.
2. **Individual tweet objects** (cache-aside, LRU + TTL) — the same popular tweet appears in many different timelines.
3. **User profile summaries** (cache-aside, LRU + TTL) — the same authors appear repeatedly across many tweets.

## Invalidation

| Event | Strategy |
|---|---|
| Tweet deleted | Explicit invalidation of the tweet's cache key; tombstone check at render time instead of scrubbing every cached timeline referencing it |
| Profile edited | Event-driven invalidation of the profile cache key on update |
| Tweet goes viral | Not an invalidation case — a hot-key *replication* case (see below) |

## Hot Key Mitigation

Detect a key receiving disproportionate read volume (via per-key request rate monitoring) and replicate that specific tweet object across multiple cache nodes, so reads can be served by any of several nodes instead of all hitting the single node the consistent-hashing scheme would otherwise assign it to.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Timeline caching | Write-time fan-out into per-user sorted sets | Fast reads; write amplification, complexity for very-high-follower accounts |
| Tweet/profile caching | Cache-aside, LRU + TTL | Simple, self-healing via TTL; first read after eviction pays full latency |

See the full discussion (including why TTL matters as a safety net even with event-driven invalidation) in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
