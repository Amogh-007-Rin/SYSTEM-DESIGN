# Design Challenge 02: Sharding Strategy for 1 Billion Users

**Difficulty:** Medium–Hard

## Prompt

You have a `users` table (and related tables: posts, follows) that has grown to 1 billion users and no longer fits comfortably on a single database node. Design a sharding strategy.

## What to Produce

1. What sharding key would you choose, and why (consider: `user_id`, `email`, geography)?
2. Which sharding strategy (range, hash, or directory-based) fits best, and why?
3. How do you handle queries that need to join across shards (e.g., "show me posts from people I follow," where followees may be on different shards than the follower)?
4. How would you handle resharding if you need to add capacity later — connect this back to [consistent hashing](../coding-challenges/challenge-03/)
5. What happens to auto-incrementing primary keys once you have multiple shards? Propose an alternative.

A full worked solution is at [`challenge-02-solution.md`](./challenge-02-solution.md).
