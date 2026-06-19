# Module 18 — Interview Prep: Designing Search Systems

## Why This Matters

"Design search for [product]" is one of the most common system design prompts precisely because it forces a candidate to reason about several hard sub-problems at once — relevance ranking, scale, freshness, and (often) geography — and a shallow answer ("we'll use Elasticsearch") signals you haven't actually thought about any of them. Interviewers use this prompt to see whether you can decompose "search" into its real components and make justified trade-offs at each one.

---

## A Framework for "Design Search For X"

1. **Clarify what's being searched and by whom** — text query, structured filters, location-based, or some combination? A hotel search ("4-star, under $200, near downtown") is a very different problem from a code search engine.
2. **Identify the indexing strategy** — what fields need full-text matching (`text` mapping, analyzed) vs. exact filtering/aggregation (`keyword` mapping)? What needs geo-indexing?
3. **Pick a ranking strategy** — start from BM25 as the textual baseline, then name the additional signals that matter for this domain (recency, popularity, distance, personalization) and how they'd combine via a function score.
4. **Design the indexing pipeline** — where does data come from, how does it get transformed into search documents, and critically: how does the index stay in sync with the source of truth as data changes (event-driven vs. polling — see [02-deep-dive](../02-deep-dive/README.md))?
5. **Address scale** — sharding strategy, replica count for read throughput and fault tolerance, how queries fan out and results get merged.
6. **Name what you're explicitly not solving** — e.g., personalized ranking, multi-language stemming, typo tolerance — to show you know the boundary of the question rather than implying false completeness.

> 🎯 **Interview Tip:** The single biggest signal-generating move in a search design interview is naming the *indexing pipeline and sync strategy* before being asked. Most candidates jump straight to "Elasticsearch with shards" and never address how documents get there or stay fresh — bringing it up unprompted demonstrates you understand search is a derived, continuously-rebuilt system, not a one-time index build.

---

## Common Pitfalls

- **Treating search as "just add Elasticsearch"** without discussing mappings, analyzers, or why a particular field needs `text` vs. `keyword` — this is the search equivalent of saying "we'll add a database" without discussing schema.
- **Ignoring relevance entirely** and only discussing infrastructure (shards, replicas) — interviewers specifically probe ranking because it's the part that differentiates "search that returns matches" from "search that returns *good* matches."
- **Forgetting the sync problem** — assuming the search index magically reflects the database, without addressing staleness, event-driven indexing, or reconciliation.
- **Over-indexing on geo or autocomplete when the prompt didn't ask for it** — read the prompt; not every search system needs location awareness or type-ahead, and forcing them in wastes interview time that could go toward the actual ask.

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design search-as-you-type with ranking for an e-commerce site").
