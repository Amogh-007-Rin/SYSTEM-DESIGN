# Module 18 — Common Interview Questions

**Q1: What is an inverted index, and why is it faster than scanning rows for text search?**
An inverted index maps each unique term to the list of documents (a postings list) containing it, so "find documents with this word" becomes a single lookup instead of a scan over every document's text. Multi-term queries become set operations on postings lists — intersection for AND, union for OR — which is fast because postings lists are typically stored sorted, making intersection/union linear in the size of the lists involved, not the size of the corpus.

**Q2: Explain TF-IDF. What does each part mean, and what's its weakness?**
TF (term frequency) measures how often a term appears in a specific document; IDF (inverse document frequency) measures how rare that term is across the whole corpus, computed as `log(N / df)`. Multiplying them rewards terms that are frequent in *this* document but rare *overall* — a strong signal that the document is specifically about that term. The weakness: term frequency contributes linearly and unboundedly, so a document repeating a word 100 times scores far higher than one repeating it 10 times, even though neither is genuinely "10x more relevant" to a human reader.

**Q3: How does BM25 improve on TF-IDF?**
BM25 adds two refinements: term-frequency saturation (via parameter `k1`), so additional occurrences of a term contribute diminishing returns instead of growing linearly forever, and document-length normalization (via parameter `b`), which prevents long documents from winning purely by containing more words overall. BM25 is the default ranking algorithm in Lucene and Elasticsearch for these reasons.

**Q4: What's the difference between a `text` and a `keyword` field mapping in Elasticsearch, and why does it matter?**
A `text` field is analyzed — tokenized, lowercased, optionally stemmed — for full-text matching. A `keyword` field is stored exactly as-is, used for exact-match filtering, sorting, and aggregations. Mapping a field as the wrong type breaks functionality silently: mapping `status` as `text` means it gets tokenized, breaking exact filtering on the literal value; mapping a product title as `keyword` means you lose full-text matching on it entirely.

**Q5: Why does Elasticsearch shard an index, and what happens when you run a query?**
A single node can't hold an entire large index or serve all its query load, so an index is split into shards, each an independent Lucene index, distributed across nodes. A query fans out to every shard in parallel; each shard scores and returns its own top candidates, and a coordinating node merges those candidate result sets into the final top-K — a scatter-gather pattern.

**Q6: How would you implement autocomplete, and what's the difference between matching and ranking in that context?**
Matching (which completions exist for this prefix) can be done with a trie, with Elasticsearch's edge n-grams (indexing every prefix of a term as a token), or with a completion suggester (an FST-based structure built for this purpose). Ranking (which of those matches to actually show, and in what order) requires a separate weight per term — typically historical query frequency or business priority — and an efficient way to retrieve the top-K *highest-weighted* matches under a prefix, not just an arbitrary K matches.

**Q7: What is geohashing, and what's its key limitation?**
Geohashing recursively subdivides the world into a grid and encodes a (lat, lon) pair as a base32 string, where points sharing a long common prefix are usually geographically close — turning "find things near here" into a prefix lookup. The key limitation: two points can be meters apart but fall on opposite sides of a grid cell boundary, ending up with completely different prefixes; production systems compensate by also searching neighboring cells, not just the exact cell match.

**Q8: How does faceted search work in Elasticsearch — what's the relationship between filters and aggregations?**
A filter (in a `bool` query's `filter` clause) narrows the result set without affecting relevance scoring — it's a strict yes/no per document and is cacheable. An aggregation, run in the same request alongside the filtered query, computes counts (or other metrics) per facet value within that filtered set — that's the "Nike (412) Adidas (289)" counts next to filter checkboxes. Facet fields must be mapped as `keyword`, since aggregating a `text` field aggregates on individual tokens, not whole values.

**Q9: How do you keep a search index in sync with a source-of-truth database, and what are the trade-offs?**
Two approaches: polling (periodically query for rows changed since the last sync and re-index them — simple, but staleness is bounded by the poll interval) and event-driven indexing via Change Data Capture (every database write emits an event that triggers an immediate targeted re-index — near-real-time, but requires a CDC pipeline like Debezium and has subtler failure modes like lost or out-of-order events). Production systems often combine event-driven sync for freshness with periodic reconciliation as a safety net.

**Q10: Why is "dual writes" (writing to the database and search index directly in application code) considered risky?**
If the write to the search index fails after the database write succeeds (or vice versa), the two diverge silently with no automatic recovery — there's no transaction spanning both systems. Deriving the search index update from the database's actual committed write (via CDC tailing the write-ahead log/binlog) is more robust because the index is always built from what was *actually* durably committed, not from an application assuming two independent writes both succeeded.
