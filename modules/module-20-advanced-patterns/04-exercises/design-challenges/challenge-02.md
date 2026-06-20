# Design Challenge 02 (Capstone): Design Twitter

**Difficulty:** Capstone (synthesizes Modules 01–08, 10–14, 18)

## Prompt

Design Twitter (now X): a system where users post short text messages ("tweets") to followers, follow other users, and view a home timeline composed of tweets from people they follow, roughly reverse-chronologically (or ranked).

## What to Produce

1. **Functional requirements** — post a tweet, follow/unfollow, view home timeline, view a user's profile timeline, search tweets, like/retweet (decide what's in scope).
2. **Non-functional requirements** — explicit scale numbers (DAU, tweets/day, average and max follower count, read:write ratio for timeline views vs. tweet creation).
3. **Capacity estimation** — storage, write throughput, read throughput, and specifically the fan-out cost of a celebrity account with millions of followers.
4. **Feed generation strategy** — fan-out-on-write vs. fan-out-on-read, and how you handle the celebrity/hot-user edge case where one approach breaks down.
5. **Database schema and sharding strategy** — for tweets, the follow graph, and user data.
6. **Caching strategy** — what's cached and why.
7. **Search** — how tweet search works at a high level.
8. **Ranking** — at least a high-level note on how a ranked (not purely chronological) timeline would change the architecture.
9. **At least 5 explicit trade-offs.**

A full worked solution is in [`challenge-02-solution.md`](./challenge-02-solution.md) — attempt this yourself first.
