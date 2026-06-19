# Module 04 — Interview Prep: The Database Decision

## Why This Matters

"SQL or NoSQL?" might be the single most-asked framing question in system design interviews, precisely because a thoughtful answer requires synthesizing access patterns, consistency needs, and scale — exactly the skills the rest of the interview is testing.

---

## "SQL or NoSQL? How Do You Decide?" — A Full Framework

1. **Start from access patterns, not labels.** Will this data be queried in ways you can't fully predict upfront (ad-hoc reporting, JOINs across entities)? That favors SQL. Is access almost always "fetch by a known key"? That opens the door to NoSQL.
2. **Check consistency requirements.** Does correctness of a single value matter immediately and absolutely (inventory count, account balance)? Lean SQL or a strongly-consistent NoSQL configuration. Is staleness for a few seconds invisible to the user (like counts, view counts)? Eventual consistency is fine, broadening your options.
3. **Check write throughput.** Tens of thousands of writes per second sustained, especially time-series-shaped data? Wide-column stores (Cassandra) are purpose-built for this in a way a single relational primary isn't, short of significant sharding investment.
4. **Check schema volatility.** Is the shape of your records still actively evolving (early-stage product)? A document store reduces migration friction; a stabilizing, well-understood domain benefits more from SQL's enforced structure catching bugs early.
5. **State your answer as a trade-off, not a verdict.** "I'd choose PostgreSQL here because we need multi-table consistency for orders and inventory together, accepting that we'll need to plan a sharding strategy once writes outgrow a single primary" is a complete answer.

> 🎯 **Interview Tip:** A strong candidate can defend *either* choice for many prompts — what's being evaluated is whether your reasoning matches the stated requirements, not whether you picked the "textbook" database.

---

## "How Would You Store X?" — Common Patterns

- **Twitter timeline / feed** — write-heavy fan-out, read by user, often denormalized into a precomputed feed structure (cache or wide-column store) rather than computed via JOIN at read time.
- **Instagram posts** — object storage for the media itself ([Module 09](../../module-09-storage/)) plus a relational or document store for post metadata (caption, likes, comments references).
- **Uber trips** — relational for the trip record itself (needs strong consistency around fare/payment), with geospatial indexing for location-based matching queries.

See [`common-questions.md`](./common-questions.md) for more Q&A and [`sample-answer.md`](./sample-answer.md) for the full Twitter schema design walkthrough.
