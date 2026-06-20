# Module 18 — Search Systems

> Search is the feature users notice instantly when it's bad — "why can't I find the thing I know exists" is one of the fastest ways to lose trust in a product, which is why almost every nontrivial system eventually needs a real search layer instead of a `LIKE '%query%'` query.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 04 — Databases](../module-04-databases/) | Indexing fundamentals (B-trees), why `LIKE` queries don't scale, sharding and replication basics |
| [Module 09 — Storage](../module-09-storage/) | How data is durably persisted and read back, block vs. object vs. file storage trade-offs that also apply to search index segments |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain how an inverted index turns "find documents containing this word" from an O(n) scan into a fast lookup, and compute TF-IDF and BM25 relevance scores by hand
- Describe Elasticsearch's architecture (indices, shards, replicas, mappings, queries) and reason about how it scales horizontally
- Design autocomplete/type-ahead systems using tries, edge n-grams, and completion suggesters
- Design geo-search (geohashing, S2 cells) and faceted search (filters + aggregations)
- Design a search indexing pipeline that keeps a search index in sync with a source-of-truth database

---

## Estimated Time

**4–5 hours** total: Concepts: ~2h | Deep dive: ~1.5h | Exercises: ~1.5h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Coding challenges and design challenges |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 17 — Data Pipelines](../module-17-data-pipelines/) | [Next Module → Module 19 — ML Systems](../module-19-ml-systems/)
