# Module 18 — Search Systems: Summary

> This module covered how full-text search actually works under the hood (inverted indexes, TF-IDF, BM25), how Elasticsearch productionizes that at scale (shards, replicas, mappings, function score), and the two extensions that show up constantly in real search systems: geo-search and autocomplete — plus the unglamorous but critical problem of keeping a search index in sync with the database it's derived from.

---

## Key Concepts

1. **Inverted index** — maps each term to the documents containing it (a postings list), turning text search into a lookup instead of a scan; multi-term queries become postings-list intersection (AND) or union (OR).
2. **TF-IDF** — scores relevance by rewarding terms frequent in a document but rare across the corpus; the conceptual basis for modern ranking.
3. **BM25** — production ranking algorithm (used by Lucene/Elasticsearch) that improves on TF-IDF with term-frequency saturation and document-length normalization.
4. **Elasticsearch shards and replicas** — an index is split into shards for horizontal scale, each replicated for fault tolerance and read throughput; queries scatter to all shards and results are merged centrally.
5. **Function score** — blends BM25's text relevance with non-text signals (recency, popularity, distance) into a final ranking.
6. **Geohashing / S2 cells** — encode location into strings/cells where shared prefixes imply geographic proximity, turning "near me" into a prefix lookup.
7. **Faceted search** — combines a non-scoring filter with an aggregation computed over that same filtered set, producing the "342 results have a pool" counts next to filter checkboxes.
8. **Event-driven (CDC) vs. polling sync** — keeps a derived search index current with its source-of-truth database, trading freshness against infrastructure complexity.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Index sync strategy | Event-driven (CDC) | Polling | Freshness matters (price, availability changes) | Simplicity is acceptable and a bounded staleness window (minutes) is fine |
| Autocomplete matching | Trie / edge n-grams | Completion suggester (FST) | Simpler to reason about and build from scratch | Need typo tolerance and a far smaller memory footprint at large scale |
| Ranking signal mix | Single dominant signal (e.g., pure text relevance) | Blended function score (text + recency + popularity + geo) | Prototype/simple use case | Production relevance, where pure-text or pure-popularity ranking has known bad failure modes |
| Geo indexing | Geohashing (flat grid) | S2 cells (spherical hierarchy) | Simplicity, good enough away from poles/boundaries | Need robustness against cell-boundary adjacency and pole distortion |

---

## Common Interview Questions from This Module

- Explain how an inverted index works, and why it's faster than scanning documents for a text match.
- What's the difference between TF-IDF and BM25, and why does Elasticsearch use BM25?
- How does Elasticsearch scale a single index across multiple machines, and what happens when a query runs?
- How would you design autocomplete with ranked (not just matched) suggestions?
- How do you keep a search index in sync with a constantly-changing source database?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Inverted index (postings lists) | Fast term -> document lookup; the foundation of all text search |
| TF-IDF / BM25 scoring | Ranks documents by relevance, not just presence of a match |
| Trie with weighted top-K retrieval | Autocomplete matching + ranking in one structure |
| Geohashing / S2 cells | Turns 2D location into a prefix-lockup-friendly indexable value |
| Function score (base score + signal blending) | Combines text relevance with business/recency/distance signals |
| Event-driven (CDC) indexing | Keeps a derived search index near-real-time consistent with its source database |

---

## What This Unlocks

After this module, you can tackle:
- [Module 19 — ML Systems](../module-19-ml-systems/), which builds on ranking concepts here (relevance, scoring, blending signals) toward learned ranking models
- Search-heavy interview questions for marketplaces, e-commerce, and social platforms (location search, faceted filtering, type-ahead)
- Real-world Elasticsearch/OpenSearch design and operations work, including mapping design, sharding strategy, and relevance tuning

---

## Quick Reference

- **Inverted index**: term -> postings list of document IDs. AND = intersect, OR = union.
- **TF-IDF**: `tf * idf`, rewards frequent-in-doc, rare-in-corpus terms. **BM25**: TF-IDF + saturation + length normalization; what Elasticsearch actually uses.
- **Elasticsearch**: index = collection of documents; shard = independent Lucene index (scale); replica = copy (fault tolerance + read throughput); mapping = schema (`text` = analyzed/full-text, `keyword` = exact-match/filterable).
- **Function score** = BM25 base score blended with recency/popularity/distance signals.
- **Autocomplete** = matching (Trie / edge n-grams / completion suggester) + ranking (weight per completion, top-K retrieval).
- **Geo-search** = geohash/S2 prefix locality turns "near me" into a prefix lookup; watch for boundary-adjacency edge cases.
- **Faceted search** = filter (narrows, no scoring effect) + aggregation (counts per facet value within that filtered set); facet fields must be `keyword`.
- **Index sync** = event-driven (CDC) for freshness, polling for simplicity; production systems often combine both (event-driven + periodic reconciliation).

---

← [Previous Module ← Module 17 — Data Pipelines](../module-17-data-pipelines/) | [Next Module → Module 19 — ML Systems](../module-19-ml-systems/)
