# Module 05 — Interview Prep: Adding Caching to a System

## Why This Matters

"How would you add caching to this system?" is one of the most common deep-dive follow-ups in a system design interview, precisely because a good answer requires you to identify *what's actually slow*, not just say "add Redis" as a reflexive incantation.

---

## A Framework for "How Would You Add Caching Here?"

1. **Identify the actual bottleneck** — is it a specific expensive query, a specific hot piece of data, or general read load? Caching the wrong thing wastes memory and adds complexity for no benefit.
2. **Decide what to cache** — full objects, computed aggregates (counts, rankings), or query results? Cache the thing that's expensive to produce and cheap to invalidate correctly.
3. **Pick a pattern** — cache-aside by default; write-through if you need the cache to never be stale immediately after a write.
4. **Pick an eviction policy and TTL** — justify it against the access pattern (recency-biased data fits LRU; uniformly-aged data might fit a flat TTL better).
5. **Name your invalidation strategy explicitly**, and acknowledge the staleness window it implies.
6. **Name the failure mode you're choosing to accept** — stampede risk, hot key risk, or penetration risk — and how you'd mitigate the one most relevant to this system.

> 🎯 **Interview Tip:** Always state the cache invalidation strategy out loud, even briefly. A candidate who says "we'll cache user profiles" without saying what happens when a profile is edited has left the hardest part of the problem unaddressed.

---

## When NOT to Cache

- Data that changes on every read and must always be exactly current (e.g., a live auction's current highest bid in the final seconds).
- Data accessed so rarely that the memory cost of caching it exceeds the savings from avoiding the occasional database hit.
- Data where a stale read has real consequences and there's no acceptable invalidation strategy (e.g., a security permission check shouldn't be served from a cache that might lag a revocation).

See [`common-questions.md`](./common-questions.md) and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Add caching to a Twitter feed").
