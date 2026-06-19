# Design Challenge 01: Caching Strategy for a Twitter Feed

**Difficulty:** Medium

## Prompt

Design a complete caching strategy for a Twitter-like home feed: what gets cached, where, with what eviction policy, and how invalidation works when a tweet is deleted or a profile is updated.

## What to Produce

1. Identify at least 3 distinct things worth caching (not just "the feed") and justify each
2. For each, specify: pattern (cache-aside/write-through/etc.), eviction policy, and TTL
3. Your invalidation strategy for: a deleted tweet, an edited profile, and a newly viral tweet
4. How you'd detect and mitigate a hot key (a viral tweet) specifically
5. At least 2 trade-offs

A full worked solution is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md), which answers this exact prompt in depth.
