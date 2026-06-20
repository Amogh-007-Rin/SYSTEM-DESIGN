# Example Mock Interview Walkthrough — URL Shortener

> A full, annotated transcript of a mock interview for [the URL shortener question](../question-bank/easy/url-shortener.md). Annotations in blockquotes explain *why* a candidate move was good or bad — read those even more carefully than the dialogue.

**Question asked:** "Design a URL shortening service like Bitly."
**Time:** 42 minutes

---

## Step 1 — Clarify Requirements

**Candidate:** Before I start designing, I'd like to ask a few questions. First — do users need custom aliases, or is every short code system-generated?

**Interviewer:** Let's support both, but custom aliases are optional.

**Candidate:** Got it. Do links expire, or live forever by default?

**Interviewer:** Assume they live forever unless the user sets an expiration.

**Candidate:** What scale should I design for — roughly how many new links per day, and what's the ratio of redirects to creations?

**Interviewer:** Let's say 100 million new links a month, and redirects far outnumber creations — assume 100:1.

**Candidate:** That's a useful number — it tells me the read path is the one to optimize hardest. Last question: do we need click analytics, like counts or geography?

**Interviewer:** Basic click counts, nothing fancy.

> 💬 **Annotation:** Notice the candidate didn't just collect answers passively — "that's a useful number, it tells me the read path is the one to optimize hardest" is narrating the *implication* of the answer, not just the answer. This is the difference between asking questions because you're supposed to, and asking questions because you're actually building a mental model.

---

## Step 2 — Estimate Scale

**Candidate:** Let me work through the numbers. 100 million links a month is about 3.3 million a day, so write QPS is roughly 38 per second on average — that's trivially small. Redirects are 100x that, so around 330 million a day, which works out to roughly 3,800 QPS average, call it 7,600 at peak if I assume peak is double average.

For storage: each record is maybe 500 bytes including the long URL and metadata. 3.3 million writes a day times 500 bytes is about 1.6 GB a day, so over five years that's roughly 3 terabytes — small enough that storage volume itself isn't a constraint, but the read QPS is significant enough that I'll want caching.

> 💬 **Annotation:** This is exactly the right depth for a 5-minute estimation step — rounded numbers, stated assumptions ("if I assume peak is double average"), and a closing sentence that connects the numbers to a design decision ("read QPS is significant enough that I'll want caching"). Compare this to a candidate who computes the same numbers but never connects them to anything — that candidate gets much less credit for the same arithmetic.

---

## Step 3 — High-Level Design

**Candidate:** I'll start simple: a client talks to a load balancer, which routes to a set of stateless API servers. Those servers handle two paths — creating a short link, which writes to a database, and resolving a short link, which is a read.

Given the 100:1 read skew, I want a cache in front of the database specifically for the redirect path. So: redirect request comes in, check Redis first; on a hit, redirect immediately; on a miss, fall back to the database and populate the cache.

**Interviewer:** Why not cache the write path too?

**Candidate:** There's nothing to cache on write — it's a single insert, and it only happens once per link. Caching helps when the same data is read repeatedly, which is true for redirects but not for creations.

> 💬 **Annotation:** The interviewer's question here is a classic probe to see if the candidate applies caching mechanically or with reasoning. "There's nothing to cache on write" is the correct, confident answer — a weaker candidate might have hedged or added caching everywhere "to be safe."

---

## Step 4 — Deep Dive

**Interviewer:** Let's go deep on one thing — how do you actually generate the short code?

**Candidate:** Three options come to mind. I could hash the long URL, but that risks collisions and means the same URL always maps to the same code unless I add a salt. I could generate a random string and check for collisions, which works but adds a database round-trip on every collision. The approach I'd actually pick is a counter-based scheme: maintain a globally unique incrementing ID, and base62-encode it into a short string. That's collision-free by construction — no existence check needed.

**Interviewer:** What if you have multiple API servers — doesn't a shared counter become a bottleneck?

**Candidate:** Good catch — yes, a single shared counter would serialize every write through one point. I'd pre-allocate ID ranges to each server instead — server A gets IDs 1 through 1 million, server B gets the next million, and so on. Each server then increments locally without coordinating with the others.

**Interviewer:** Any downside to that?

**Candidate:** Codes become sequential and somewhat guessable, which leaks information like total link count or creation order. If that mattered, I'd XOR the counter with a fixed secret before encoding, or use a shuffled base62 alphabet, rather than going back to random generation and losing the collision-free property.

> 💬 **Annotation:** This exchange is the heart of a strong deep dive: the interviewer pushes twice ("doesn't this bottleneck?", "any downside?"), and the candidate has a real answer both times instead of being caught flat-footed. Anticipating the second-order problem (sequential IDs leak information) *before* being asked would have been even stronger, but volunteering a real trade-off the moment it's raised is still a strong signal.

---

## Step 5 — Wrap Up

**Candidate:** To summarize the weak points: the counter-range approach makes short codes guessable, which I'd mitigate with obfuscation if it mattered for this product. At 10x scale, the single Redis cache and database would likely need to become a sharded cache cluster and a sharded database, partitioned by short code — since every lookup is a single-key point read, there's no cross-shard query complexity to worry about. The main trade-off I made throughout was optimizing hard for the read path at the expense of any complexity on writes, which matches the 100:1 ratio we discussed at the start.

> 💬 **Annotation:** Closing by tying the wrap-up explicitly back to the very first number established in Step 1 ("which matches the 100:1 ratio we discussed at the start") is a small but effective move — it shows the entire 40 minutes was one coherent argument, not a sequence of disconnected steps.

---

## Scorecard for This Session

| Dimension | Score | Notes |
|---|---|---|
| Problem solving | 5 | Clean structure, no wasted time |
| Communication | 5 | Continuous narration, no silences |
| Technical depth | 4 | Strong on ID generation; could have gone deeper on cache invalidation unprompted |
| Trade-off reasoning | 5 | Every decision had a stated cost |
| Scale awareness | 5 | Numbers from Step 2 visibly shaped every later decision |
| Breadth | 4 | Didn't proactively mention failure modes (e.g., cache node failure) |

**Total: 28/30** — see the [blank template](./template.md) to run this format yourself.

---

← [Back to Interview Prep](../README.md)
