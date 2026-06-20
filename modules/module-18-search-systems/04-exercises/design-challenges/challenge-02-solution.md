# Design Challenge 02 — Solution: Google-Like Type-Ahead with Top-K Results

## Core Data Structure

A plain Trie (as built in [Coding Challenge 01](../coding-challenges/challenge-01/)) is the right *conceptual* model but doesn't survive contact with this scale directly:

- **Memory**: billions of unique historical queries as a literal in-memory Trie, one node per character, is enormous — most production systems instead precompute, **for every prefix up to some length** (e.g., 3-5 characters), a small precomputed list of the top-K completions for that exact prefix, stored as a flat key-value structure (`prefix -> [top-K completions]`) rather than a live, traversable tree. This trades a much larger "index" (every prefix up to length N gets its own precomputed entry) for O(1) lookup with no tree traversal at request time at all.
- **Typo tolerance**: an FST (finite state transducer) — the same structure behind Elasticsearch's completion suggester — represents the full set of valid completions far more compactly than a character-by-character Trie, and FSTs support efficient fuzzy/edit-distance matching natively, which a plain Trie does not.
- **Multiple languages**: the prefix structure is sharded per-language/per-locale rather than being one global structure, since prefix semantics (and even tokenization) differ enough across languages that mixing them in one structure adds complexity without benefit.

## Ranking

Each precomputed `prefix -> top-K` entry is built from a **weighted query log**: weight is primarily historical query frequency over a rolling recent window (not all-time — all-time would never let new trending queries surface), with:
- **Recency decay** — queries from the last few hours/days weighted more heavily than older history, so the structure adapts as trends shift.
- **Breaking-news spike handling** — a separate, faster-updating "trending" signal layered on top of the steady-state precomputed structure specifically so a suddenly-spiking query doesn't have to wait for the next full offline rebuild to surface; this is usually a smaller, more frequently refreshed structure consulted alongside the main precomputed one, with its results merged/boosted into the final top-K shown to the user.
- **Personalization** (out of scope detail, but worth naming) — a production system layers per-user signals (their own search history) on top of the global ranking; I'd mention this exists without designing it in depth unless asked.

> 🎯 The interview-gold answer here is naming that ranking has to be a **mix of a slow, stable offline-computed base layer and a fast, narrow online layer for trending content** — a single static precomputed table would miss breaking news for hours; a fully real-time-computed ranking for every keystroke would be far too slow and expensive to run per request.

## Latency Budget

For a single keystroke, end-to-end:
- **Network round-trip** to the nearest edge/regional server — typically the single largest fixed cost, which is why these systems are deployed at many edge locations (the same motivating idea as a CDN, [Module 10](../../../module-10-cdn/)).
- **Lookup against the precomputed prefix structure** — should be O(1) or close to it (a hashmap/key-value lookup, or an FST traversal bounded by the prefix length, both fast), because all the expensive ranking computation already happened offline, ahead of time.
- **Merging trending-layer results with the base layer** (if applicable) — a small, bounded merge of two short lists, not a recomputation.

Everything related to "what's the right weight for this prefix" happens **offline**, in a periodic batch job (or a streaming pipeline for the trending layer) that rebuilds/refreshes the precomputed structure — never at request time. This is the single most important design decision: request-time work is reduced to "look up an already-computed answer," not "compute the answer now."

## Horizontal Scaling

- The precomputed `prefix -> top-K` structure is sharded by **prefix** (e.g., hash or range of the first 1-2 characters), similar in spirit to the consistent hashing covered in [Module 04](../../../module-04-databases/04-exercises/coding-challenges/challenge-03/) — a request for a given prefix is routed deterministically to the shard(s) responsible for that prefix range.

- Each shard is replicated across multiple nodes for both fault tolerance and to absorb the very high read QPS (every keystroke from every active user, globally) — read-heavy to an extreme degree, so replica count is driven by read throughput needs far more than by fault tolerance alone.
- The trending/online layer is a separate, smaller, more frequently-updated service — small enough that it can potentially be more aggressively replicated (even fully, not sharded) given its much smaller data size.

## Handling the Long Tail

For a prefix that's rare or genuinely novel (a brand-new term, an unusual combination), there's no rich historical log to draw a top-K from:
- Fall back to a smaller set of cheaper heuristic signals — e.g., completions seen at all (even rarely) for this prefix, ranked by whatever frequency exists, even if statistically thin.
- If literally nothing exists for the exact typed prefix, fall back to the closest known shorter prefix's results (i.e., "weathervan" with zero history falls back to whatever "weathervan" had, or even "weather" if needed), rather than returning nothing — an empty dropdown is a worse experience than a slightly-too-broad one.
- Accept and explicitly state that long-tail completions will be **lower quality** than head/torso queries — this is a real, named limitation of frequency-based ranking, not a solved problem, and naming it is itself a good interview signal.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Live Trie vs. precomputed `prefix -> top-K` table | Precomputed table | Much larger storage footprint (every prefix length gets its own entry) in exchange for O(1) request-time lookup with zero traversal cost |
| Ranking freshness | Slow offline base layer + fast online trending layer | More moving parts and an extra merge step at request time, but avoids both "misses breaking news for hours" and "recomputes everything per keystroke" |
| Long-tail handling | Graceful fallback to shorter/thinner-history prefixes rather than returning nothing | Sometimes returns lower-quality or overly broad suggestions for genuinely novel prefixes, but avoids the strictly worse outcome of an empty suggestion list |
