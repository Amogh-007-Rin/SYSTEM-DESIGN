# Sample Answer: "Design Search-as-You-Type with Ranking for an E-Commerce Site"

> A fully worked deep-dive answer, applying the framework from [`README.md`](./README.md) and building on indexing/sync concepts from [02-deep-dive](../02-deep-dive/README.md).

---

## Clarify the Scope

I'll assume: a product catalog of ~50 million SKUs, the box is the main entry point to the site (so latency matters enormously — every keystroke should feel instant), results need to show as the user types ("running sh" → already showing "running shoes," "running shorts," etc.), and once they hit enter, full search results need real relevance ranking (text match + business signals), not just alphabetical or popularity-only ordering. I'll explicitly scope out personalization (per-user ranking) and multi-language support to keep the answer focused — I'd mention these as natural extensions if time allows.

This is really **two related but distinct features**: type-ahead suggestions (fast, lightweight, shown per keystroke) and full search results (richer ranking, shown after a query is submitted).

## Type-Ahead: Matching

For the per-keystroke suggestion dropdown, I want sub-50ms responses, so I wouldn't run a full relevance-scored search engine query on every keystroke. Instead:

- Pre-build a dedicated suggestion structure from **historical query frequency** (what users actually search for) plus **catalog terms** (product titles, category names, brand names) — not the full product corpus.
- Use Elasticsearch's **completion suggester** (FST-based) for this, indexed as a separate, small, dedicated index optimized purely for prefix matching — far smaller and faster to query than the full product index, and it supports basic fuzzy matching (typo tolerance) out of the box, which matters a lot for a box people type into quickly.
- Alternative if I were building this from scratch without Elasticsearch: a **trie** keyed by query prefix, where each leaf/node tracks the top-K highest-weighted completions under it (weight = historical search frequency) — exactly the structure from [Coding Challenge 01](../04-exercises/coding-challenges/challenge-01/). This is what I'd reach for if I needed this to run as an in-memory service with no search-engine dependency at all.

## Type-Ahead: Ranking the Suggestions

Matching alone gives you "all completions starting with this prefix" — ranking decides which handful to actually show:
- **Primary signal**: historical query volume for that completion (more people search "running shoes" than "running shoe insoles," so it should rank higher even though both match the prefix "running sho").
- **Secondary signal**: a small boost for category/brand terms that exist in the live catalog with in-stock inventory, so we don't suggest discontinued products prominently.
- Limit to top 5-8 suggestions — beyond that, the dropdown stops being useful and just adds visual noise.

## Full Search: Indexing

For the main product search index:
- **Mapping**: `title` and `description` as `text` (analyzed, stemmed) for full-text matching; `brand`, `category`, `color` as `keyword` for exact filtering and faceted aggregation (the filter sidebar); `price` as a numeric type for range filters; `location` (for "available near me" / ship-from-warehouse proximity, if relevant) as `geo_point`.
- **Denormalization at index time**: a product document combines the product row, its category name, aggregate review rating, and current stock status — fields that live in separate normalized tables in the source database — so a single document read answers the whole query without a runtime join.
- **Sync strategy**: event-driven (CDC) indexing off the product database's write log for near-real-time freshness (price changes, stock-outs should reflect in search within seconds — a customer searching and finding an out-of-stock item is a bad experience), with a nightly full reconciliation reindex as a safety net against any missed events.

## Full Search: Ranking

Start from **BM25** as the textual relevance baseline across `title` (heavily boosted) and `description` (lightly boosted) — a query match in the title should outrank one buried in a long description. Then layer a **function score query** combining:
- **Popularity**: a function of historical sales rank / click-through rate, so a well-selling, frequently-clicked product outranks an obscure one with technically-equal text relevance.
- **Rating**: a modest boost for higher-rated products, with a minimum review-count threshold so a single 5-star review doesn't outrank a well-established product with thousands of 4.5-star reviews.
- **In-stock status**: heavily penalize or exclude out-of-stock items — text-relevant but unbuyable results actively hurt the experience.
- **Sponsored placement**: a separate, transparent boost slot for paid placements, kept distinct from organic relevance so it can be measured and capped independently.

> 🎯 I'd explicitly say out loud: relevance tuning isn't a one-time pass — I'd want to measure search click-through rate and "search abandonment" (user searches, sees results, leaves without clicking anything) per query pattern, and A/B test boost weight changes rather than eyeballing whether results "look right."

## Scale

- Product index sharded across multiple nodes (sized so each shard stays in a comfortable range, commonly cited as roughly tens of GB per shard) with 1-2 replicas per shard for both fault tolerance and read throughput, since search read volume on an e-commerce site dwarfs write volume by orders of magnitude.
- A query fans out to all shards in parallel; each shard returns its local top candidates; the coordinating node merges into the final top-K — standard Elasticsearch scatter-gather, no custom work needed here.
- The suggestion index is small enough to potentially be fully replicated on every search-serving node or kept in a tiny dedicated cluster, since its entire dataset (queries + catalog terms, not full product documents) is orders of magnitude smaller than the product index.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Type-ahead matching structure | Completion suggester / trie, separate from main index | Extra infrastructure/index to maintain; but per-keystroke latency on the full product index would be far too slow |
| Sync strategy | Event-driven (CDC) + nightly reconciliation | More moving parts than pure polling; but stock/price staleness directly costs sales on an e-commerce site, so freshness is worth the complexity |
| Ranking signals | BM25 + popularity + rating + stock + sponsored, blended via function score | More tunable, but requires ongoing measurement (CTR, abandonment) to avoid the boosts silently drifting from "helpful" to "wrong" |
| Facet fields | Mapped as `keyword`, separate from searchable `text` fields | Slight indexing/storage duplication (same data, two purposes) in exchange for correct exact-match filtering and aggregation |
