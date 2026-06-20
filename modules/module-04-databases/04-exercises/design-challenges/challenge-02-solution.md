# Design Challenge 02 — Solution: Sharding Strategy for 1 Billion Users

## Sharding Key: `user_id`

Sharding by `user_id` (hashed) keeps a user's own data (their profile, their own posts) together on one shard, which covers the most common access pattern: "fetch everything about user X." Sharding by `email` would be functionally similar but couples your shard key to a value users can change, which is operationally awkward. Sharding by geography is tempting for data-residency reasons but creates uneven shard sizes (population isn't evenly distributed) and complicates a user who travels or moves.

## Strategy: Hash-Based Sharding (with Consistent Hashing)

Hash-based sharding (`hash(user_id) % N`, or better, a consistent hash ring) distributes users evenly regardless of `user_id` ordering, avoiding the hot-shard risk range-based sharding has if user IDs are assigned sequentially and recent (more active) users cluster on one range. **Use consistent hashing specifically** — see [Coding Challenge 03](../coding-challenges/challenge-03/) — so that adding shards later only remaps the keys between the new shard and its neighbor on the ring, not the entire keyspace.

## Cross-Shard Joins: The Follow Problem

"Posts from people I follow" is the hard case: a follower and their followees can land on different shards. Two practical approaches:
1. **Application-level fan-in**: query each relevant shard for posts from the subset of followees that live there, then merge results in the application layer. Works but adds latency proportional to the number of shards touched.
2. **Denormalize at write time** (the approach used in [Module 04's Twitter design](../challenge-01-solution.md)): fan out each post into a precomputed per-follower feed structure at write time, so the read path never needs a cross-shard join at all — it's a single lookup against the feed store, keyed by the reader, not the post author.

In practice, (2) is what large-scale social systems actually do — cross-shard joins at read time don't scale to this size; precomputation moves the expensive work to write time, where it can be done asynchronously.

## Resharding

Plan for resharding from day one, even if you don't need it yet: use consistent hashing with virtual nodes so that adding a shard only requires migrating the slice of keys between the new node and its ring neighbor — see the exact mechanics in [Coding Challenge 03](../coding-challenges/challenge-03/). Migrate that slice with a dual-write or backfill-then-cutover strategy to avoid downtime (the same "expand-contract" idea from [Module 04's deep dive](../../02-deep-dive/README.md) on migrations, applied to data movement instead of schema changes).

## Primary Keys Across Shards

A simple auto-incrementing integer primary key breaks the moment you have multiple shards — two shards would both generate `id = 1` for unrelated rows. Use a **globally unique ID scheme generated independently of any single shard**, such as Twitter's **Snowflake ID** (timestamp + worker/shard ID + sequence number, packed into a 64-bit integer) — covered in depth in [Module 20](../../../module-20-advanced-patterns/01-concepts/README.md). This guarantees uniqueness across shards without a coordinating service, and as a bonus, Snowflake IDs are naturally sortable by creation time.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Shard key | `user_id` (hashed) | Even distribution; cross-shard joins for relationship-spanning queries become a real engineering problem |
| Cross-shard reads | Precomputed feed (write-time fan-out) | Fast reads; write amplification, plus needing a hybrid strategy for very-high-follower accounts |
| Primary keys | Snowflake-style distributed ID | No coordination needed across shards; slightly more complex than a simple auto-increment |
