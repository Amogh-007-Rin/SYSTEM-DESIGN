# Sample Answer: "Add Caching to a Twitter Feed"

> A fully worked deep-dive answer, building on the [Module 04 Twitter schema](../../module-04-databases/03-interview-prep/sample-answer.md).

---

## Identify the Bottleneck

The home timeline read path is the dominant traffic pattern by a wide margin (reads vastly outnumber tweet writes), and assembling it via JOIN over the follow graph at read time doesn't scale — this was already established in Module 04. The caching question here is really: **where does the precomputed feed live, and what else around it benefits from caching?**

## What to Cache

1. **The precomputed home timeline itself** — a list of tweet IDs per user, in a Redis sorted set (score = timestamp, so it's naturally ordered and supports efficient "give me the next page older than X" range queries).
2. **Individual tweet objects** — cached by tweet ID (cache-aside), since the same popular tweet is rendered into many different users' timelines and fetching its content shouldn't repeat a database hit per appearance.
3. **User profile summaries** (name, avatar) needed to render a timeline — cached by user ID, since the same authors appear repeatedly across many tweets.

## Pattern and Eviction

- **Timeline data**: written via fan-out-on-write (effectively write-through at the feed layer — the feed cache *is* the primary store for this derived view, not a cache of something else).
- **Tweet/profile objects**: cache-aside with LRU eviction and a TTL safety net (e.g., 1 hour) — recency-biased access fits LRU well (new tweets are read far more than old ones), and the TTL bounds staleness if an edit/delete invalidation is ever missed.

## Invalidation Strategy

- Deleting a tweet: explicit cache invalidation of that tweet's cache key, plus removal from any cached timeline sorted sets that reference it (or, more practically at scale, a tombstone check at render time rather than scrubbing every timeline).
- Editing a profile: event-driven invalidation of the profile cache key on update.
- TTL as a backstop for both, in case an explicit invalidation is ever missed.

## Failure Modes to Address

- **Hot key**: a viral tweet's cached object could be read millions of times in a short window. Mitigate by replicating that specific key across multiple cache nodes once detected as hot, rather than letting one node take all the load.
- **Cache stampede**: if a hot tweet's cache entry does expire, use mutex-style locking so only one request recomputes it from the database while others wait briefly, instead of all of them hitting the database simultaneously.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Timeline storage | Redis sorted set per user (fan-out-on-write) | Fast reads; write amplification per tweet, more memory used across many per-user structures |
| Tweet object caching | Cache-aside + LRU + TTL | Simple, self-healing via TTL; first read after eviction pays full latency |
| Hot key mitigation | Detect-and-replicate | Adds operational complexity; only worth it for the (rare but high-impact) viral case |
