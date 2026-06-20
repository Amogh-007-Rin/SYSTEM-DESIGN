# Design Challenge 02 — Solution: Twitter

## 1. Functional Requirements

- Post a tweet (text, up to a fixed character limit).
- Follow / unfollow another user.
- View a home timeline: tweets from followed accounts, reverse-chronological by default.
- View a single user's profile timeline.
- Search tweets by keyword.
- **In scope at a high level, not deeply designed:** likes/retweets (mentioned in schema, not separately architected — stating this explicitly rather than silently skipping it).
- **Out of scope:** DMs, media (images/video) storage — noted as a real product surface but excluded to focus on the feed/fan-out problem, which is the architecturally hard part of this prompt.

## 2. Non-Functional Requirements (Estimated, Stated as Assumptions)

- **Scale:** 300M daily active users, 500M tweets/day system-wide.
- **Follower distribution is extremely skewed**: the median user has a few hundred followers; a small number of celebrity accounts have 50M+ followers. I'm calling this out explicitly up front because **it is the single fact that drives the entire feed architecture** — a uniform follower count would make this a much easier problem.
- **Read:write ratio:** home timeline views vastly outnumber tweet creation — assume **~1000:1**, since most usage is scrolling a feed, not posting.
- **Latency:** home timeline load should feel instant, target **under 200ms**.
- **Consistency:** eventual consistency is acceptable for timeline freshness (a tweet appearing in followers' feeds a few seconds late is a non-issue); this directly licenses the asynchronous fan-out architecture below.

## 3. Capacity Estimation

- **Tweet writes:** 500M/day ÷ 86,400 ≈ **~5,800 writes/sec average**, peak (3x) ≈ **~17,000/sec**.
- **Timeline reads:** at a 1000:1 ratio, ≈ **5.8M reads/sec average**, peak ≈ **~17M/sec**. This confirms — even more starkly than the URL shortener — that **this is an overwhelmingly read-dominated system, and the read path (timeline assembly) is the entire architectural problem**, not tweet storage itself.
- **The celebrity fan-out problem, quantified:** if a celebrity with 50M followers tweets, and the system fans that tweet out by writing it into all 50M followers' timeline caches immediately, that's **50M writes triggered by a single tweet** — a write amplification of 50,000,000:1 for that one event. This single number is *why* a uniform fan-out strategy doesn't work, and is the capacity-estimation result that should directly drive the feed generation design in the next section.
- **Storage:** a tweet record (~300 bytes incl. metadata) × 500M/day × 365 × 5 years ≈ **~270 TB** over 5 years — a sharding-scale problem, same conclusion as the URL shortener, not an exotic-storage problem.

## 4. Feed Generation Strategy

| Approach | How | Trade-off |
|---|---|---|
| **Fan-out-on-write** | When a tweet is posted, immediately push its ID into every follower's precomputed timeline (a per-user list/sorted-set in a cache or store) | Reads are extremely fast (just read the precomputed list) — but write cost scales with follower count, which is catastrophic for celebrity accounts per the math above |
| **Fan-out-on-read** | Timeline is assembled at read time by querying tweets from everyone the user follows and merging | Write cost is flat regardless of follower count — but read cost scales with how many accounts a user follows, and assembling a timeline from scratch on every view is expensive at the read volumes estimated above |

**Chosen approach: a hybrid, split by follower count** — this is the standard production answer (and the one Twitter itself has described using):

- **Regular accounts (the vast majority):** fan-out-on-write. When they tweet, push the tweet ID into every follower's precomputed timeline (a Redis sorted set per user, score = timestamp, directly reusing the pattern from [Module 05's sample answer](../../../module-05-caching/03-interview-prep/sample-answer.md)). Their follower counts are small enough that this write amplification is cheap.
- **Celebrity accounts (a small, identifiable set above a follower-count threshold):** **skip fan-out-on-write entirely.** Their tweets are not pushed into millions of timelines. Instead, at read time, each user's timeline assembly separately fetches "tweets from celebrities I follow" (a small list, since most users follow only a handful of celebrities, even if each celebrity has millions of followers) and merges that with their precomputed regular-account timeline.
- This hybrid converts the catastrophic 50M-write fan-out into a small, bounded read-time merge per timeline view instead — directly solving the write-amplification problem quantified in capacity estimation, at the cost of a more complex read path (two sources to merge instead of one).

> 🎯 **Interview Tip:** This hybrid is the answer that signals senior-level thinking on this exact prompt — naming "fan-out-on-write" alone and stopping is a mid-level-complete-but-incomplete answer, because it doesn't survive contact with the celebrity-account number you'd get from capacity estimation. Always let the numbers from Step 3 force this conclusion rather than reciting the hybrid as a memorized fact.

## 5. Database Schema and Sharding

```sql
CREATE TABLE tweets (
  tweet_id    BIGINT PRIMARY KEY,   -- Snowflake-style ID: sortable by time, no central coordinator
  author_id   BIGINT NOT NULL,
  content     VARCHAR(280) NOT NULL,
  created_at  TIMESTAMP NOT NULL
);

CREATE TABLE follows (
  follower_id  BIGINT NOT NULL,
  followee_id  BIGINT NOT NULL,
  created_at   TIMESTAMP NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);
```

- **Tweet IDs**: Snowflake-style, per [this module's ID generation example](../../01-concepts/examples/snowflake-id-generator.ts) — sortable by creation time (useful for the timeline merge in Step 4) and generated without a central coordinator, which matters given the write throughput estimated above.
- **Sharding `tweets`**: by `tweet_id` (which embeds a timestamp) or by `author_id` — sharding by `author_id` is preferable here because profile-timeline reads (a single author's tweets) stay single-shard, while home-timeline assembly already has to fan out across many authors regardless of how `tweets` is sharded.
- **Sharding `follows`**: by `follower_id`, since "who does X follow" (used to build X's timeline) is the dominant query; "who follows Y" (used for fan-out-on-write) becomes a cross-shard scatter-gather for popular accounts — acceptable, since that's precisely the celebrity case routed around fan-out-on-write anyway.

## 6. Caching Strategy

- **Precomputed home timelines** (regular-account portion): Redis sorted set per user, written via fan-out — this *is* the primary store for this derived view, not a cache of something else, matching the write-through-style reasoning in [Module 05's sample answer](../../../module-05-caching/03-interview-prep/sample-answer.md).
- **Individual tweet objects**: cache-aside, LRU + TTL — the same popular tweet is rendered into many different timelines and shouldn't repeat a database hit per appearance.
- **Hot key mitigation**: a viral tweet's cached object can be read millions of times in a short window — replicate that specific key across multiple cache nodes once detected as hot, per [Module 05's deep dive](../../../module-05-caching/02-deep-dive/README.md).

## 7. Search

Tweet search is a full-text search problem, not a database query problem — directly the domain of [Module 18 — Search Systems](../../../module-18-search-systems/01-concepts/README.md). At a high level: tweets are asynchronously indexed (via a message queue consumer reading off the tweet-creation event stream, per [Module 08](../../../module-08-message-queues/01-concepts/README.md)) into an inverted-index search engine (e.g., Elasticsearch), which handles tokenization, ranking by relevance/recency, and the actual query serving — kept entirely separate from the primary tweet-storage path so search load never competes with the timeline read/write path.

## 8. Ranking (High-Level Note)

A purely chronological timeline (what's designed above) is the simpler case. A **ranked** timeline (showing the "best" tweets first, not strictly newest-first) changes the architecture meaningfully: instead of a simple sorted-by-time merge, timeline assembly needs a ranking step — score each candidate tweet (recency, predicted engagement, author affinity) and reorder — which typically means fan-out-on-write populates a *candidate pool* per user (still bounded, still solving the same write-amplification problem) rather than the final, fully-ordered list, with a separate ranking pass applied at read time. This is the same fan-out-write/ranking-read split used by large-scale feed systems, and it's worth naming explicitly that "ranked" is not a small tweak — it adds a whole scoring subsystem, even though the fan-out problem it builds on is unchanged from Step 4.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Feed generation | Hybrid fan-out (write for regular accounts, read-time merge for celebrities) | Solves the write-amplification problem; read path is more complex (two sources to merge) |
| Tweet ID | Snowflake-style | Sortable, coordinator-free; requires machine-ID assignment infrastructure |
| `follows` sharding | By `follower_id` | Fast "who do I follow" lookups; "who follows me" becomes scatter-gather (acceptable, since celebrities route around fan-out-on-write anyway) |
| Search | Separate indexed search engine, async via queue | Search load never competes with the primary timeline path; introduces indexing lag (eventual consistency for search results) |
| Timeline consistency | Eventual | Enables the async fan-out architecture entirely; a tweet may take a few seconds to appear in all followers' feeds, which the stated NFRs accept |
