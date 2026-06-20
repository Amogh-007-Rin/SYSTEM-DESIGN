# Design Challenge 01 — Solution: Twitter Schema Design

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — restated briefly here for the exercise format.

## Summary

- **Core entities (`users`, `tweets`, `follows`, `likes`)**: relational (PostgreSQL, sharded at scale — see [Challenge 02](./challenge-02.md)). Follows/likes are inherently relational many-to-many data, and the social graph benefits from strong consistency.
- **Timeline (read path)**: denormalized into a precomputed per-user feed in a key-value/wide-column store, populated via fan-out-on-write when a tweet is created — avoids a JOIN over the entire follow graph on every timeline view.
- **Retweets**: modeled as a distinct entity from likes, since a retweet creates a new feed entry for the retweeter's own followers, while a like does not.

## Indexes

- `tweets(author_id, created_at DESC)` — supports "this user's tweets, newest first" efficiently.
- `follows(follower_id, followee_id)` composite primary key — supports both "who does X follow" and (with a secondary index on `followee_id`) "who follows X" for fan-out.
- `likes(user_id, tweet_id)` composite primary key — supports both "has user X liked tweet Y" (point lookup) and "all likes by user X."

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Timeline storage | Precomputed, denormalized feed | Fast reads; write amplification on every tweet (one write becomes N feed writes) |
| High-follower accounts | Hybrid fan-out-on-read for celebrities | Avoids writing millions of feed entries per tweet; timeline assembly becomes slightly more complex for users who follow celebrities |

See the full schema (with SQL) and the deep dive on fan-out in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
