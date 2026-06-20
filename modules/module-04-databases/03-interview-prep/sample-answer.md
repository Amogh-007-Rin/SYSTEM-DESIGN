# Sample Answer: "Design the Database Schema for a Twitter-Like Social Network"

> Demonstrates schema design and the SQL vs. NoSQL justification at the level expected after Module 04. The full system (API, caching, scaling) is in [Module 20's Twitter capstone](../../module-20-advanced-patterns/04-exercises/design-challenges/challenge-02.md) — this answer is scoped to the data layer.

---

## Requirements Recap

- Users can post tweets (≤280 chars), follow other users, like and retweet tweets.
- Read-heavy: timeline reads vastly outnumber tweet writes.
- Scale: assume 500M users, 100M DAU, ~1B tweets/year.

## SQL vs. NoSQL Decision

**Core entities (users, tweets, follows, likes) live in a relational database** (e.g., PostgreSQL, sharded — see [Design Challenge 02](../04-exercises/design-challenges/challenge-02.md)). Justification: follows and likes are inherently relational (who-follows-whom is a graph-shaped many-to-many relationship), and we want strong consistency on the social graph itself — a "ghost follow" that exists on one replica but not another is a confusing, hard-to-debug class of bug. **The home timeline itself, however, is precomputed and stored in a wide-column or key-value store** (fan-out-on-write into a per-user feed), because at this read volume, computing a timeline via JOIN at request time would be prohibitively expensive — this is denormalization in service of a specific, dominant read path.

## Schema (Relational Core)

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(15) UNIQUE NOT NULL,
  display_name VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE tweets (
  id BIGINT PRIMARY KEY,        -- Snowflake-style ID (see Module 20), sortable by time
  author_id BIGINT NOT NULL REFERENCES users(id),
  content VARCHAR(280) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_tweets_author_created ON tweets(author_id, created_at DESC);

CREATE TABLE follows (
  follower_id BIGINT NOT NULL REFERENCES users(id),
  followee_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);

CREATE TABLE likes (
  user_id BIGINT NOT NULL REFERENCES users(id),
  tweet_id BIGINT NOT NULL REFERENCES tweets(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tweet_id)
);
```

> 💡 **Note:** `retweets` is intentionally modeled separately from `likes` in a full design (a retweet creates a new feed entry for the retweeter's followers; a like doesn't) — omitted here for brevity, but worth raising if an interviewer probes.

## Deep Dive: Why Not Just JOIN for the Timeline?

`SELECT tweets.* FROM tweets JOIN follows ON tweets.author_id = follows.followee_id WHERE follows.follower_id = ? ORDER BY created_at DESC LIMIT 20` is correct and works fine at small scale. It breaks down once a user follows thousands of accounts and the platform has billions of tweets: this query must touch every tweet from every followee, every single time the timeline is viewed, even though the same answer (mostly) is being recomputed over and over between new tweets. The fix is **fan-out-on-write**: when a tweet is created, push its ID into a precomputed feed list (in a key-value/wide-column store) for every follower, so reading a timeline becomes a single cheap lookup instead of a JOIN over the whole follow graph. This trades write amplification (one tweet write becomes N feed writes, for N followers) for read speed — a worthwhile trade given how read-heavy this system is, with the well-known exception of celebrity accounts with huge follower counts, which need a hybrid fan-out-on-read approach to avoid writing millions of feed entries for one tweet.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Core schema | Relational (sharded) | Strong consistency on social graph; requires a sharding strategy at this scale |
| Timeline storage | Denormalized, precomputed feed | Fast reads; write amplification, and extra complexity for high-follower-count accounts |
| Tweet ID | Snowflake-style (time-sortable) | Avoids `ORDER BY created_at` entirely for recency — sortable by ID alone |
