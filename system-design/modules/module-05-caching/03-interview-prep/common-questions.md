# Module 05 — Common Interview Questions

**Q1: What's the difference between cache-aside and write-through, and when would you choose each?**
Cache-aside only populates the cache on a read miss — simple, and you only cache what's actually requested, but the first read after data changes pays full database latency. Write-through populates the cache on every write, so reads are always served fresh from the cache, at the cost of slower writes (every write touches both the cache and the database).

**Q2: What is cache stampede, and how do you prevent it?**
When a popular key expires, many concurrent requests can all miss simultaneously and all hit the database at once, potentially overwhelming it. Prevent it with mutex locking (only one request recomputes; others wait), probabilistic early expiration (recompute slightly before expiry, randomized per-request), or proactive background refresh of known-hot keys.

**Q3: What's the difference between the "hot key" problem and "cache penetration"?**
Hot key is about traffic skew — one key in a sharded cache gets disproportionate load, overwhelming the one node responsible for it. Cache penetration is about querying keys that don't exist at all, which always miss the cache and always hit the database, regardless of how the cache is sharded.

**Q4: How does a Bloom filter help with cache penetration, and what's the catch?**
It cheaply answers "definitely not present" for keys that were never added, letting you skip the database entirely for those. The catch: it can have false positives (saying "maybe present" for something never added) but never false negatives — so it's safe to trust a "not present" answer, but a "maybe present" answer still requires checking the real source.

**Q5: Why might you choose Redis over Memcached for a given use case?**
Choose Redis when you need anything beyond plain key-value storage — sorted sets for leaderboards, sets for fast membership checks, native clustering, or optional persistence. Choose Memcached when you genuinely only need simple, maximally fast key-value caching with a smaller per-key memory footprint and don't need any of Redis's extra features.

**Q6: What does cache hit rate tell you, and why measure it per-key-pattern instead of globally?**
It tells you whether the cache is earning its operational cost. A global hit rate can hide the fact that one specific access pattern has a terrible hit rate dragging down an otherwise-healthy average — measuring per pattern lets you find and fix (or remove) the specific weak spot instead of being falsely reassured by the aggregate number.

**Q7: Why is LRU not a universally "correct" eviction policy?**
LRU can be defeated by a single large sequential scan over data bigger than the cache — every entry gets evicted to make room for items that will likely never be accessed again, flushing out genuinely hot data in the process. LFU avoids this specific failure mode but has its own overhead and can fail to adapt to changing access patterns over time (an item that was frequently accessed yesterday but not today stays "hot" by count alone).
