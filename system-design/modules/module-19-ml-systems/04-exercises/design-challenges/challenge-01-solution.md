# Design Challenge 01 — Solution: The Recommendation System for Netflix

## Decomposing the Problem

A single model that scores Netflix's entire catalog (tens of thousands of titles) against every user, on every homepage load, within a sub-second latency budget is not computationally feasible — and most of that scoring effort would be wasted, since the overwhelming majority of titles are obviously irrelevant to any given user. Production recommenders instead use a **two-stage funnel**:

1. **Candidate generation** — cheaply narrow the full catalog down to a few hundred plausible titles per user.
2. **Ranking** — apply a more expensive, precise model to just those few hundred candidates to produce the final ordered rows.

This decomposition is the single most important thing to state up front — it reframes "rank everything" (infeasible) into "cheaply shortlist, then expensively rank a small set" (tractable).

## Candidate Generation

A **two-tower model** fits this stage well: a user tower encodes a user's viewing history, recency, and context into an embedding; an item tower independently encodes each title's metadata and aggregate engagement signals into an embedding in the *same* vector space, trained so a user's embedding lands close to titles they engaged with. Because the towers are independent, **all title embeddings are precomputed offline** and indexed once (via an approximate nearest neighbor index — FAISS or HNSW, covered in the [deep dive](../../02-deep-dive/README.md)); at request time, only the user's embedding needs to be computed fresh, then searched against the precomputed index — turning an O(catalog size) problem into one embedding computation plus a sub-linear vector search. **Collaborative filtering** signals (titles co-watched by similar users) can be blended in as an additional candidate source alongside the two-tower output, giving multiple independent candidate pools that get merged before ranking.

> 📊 **Diagram:** `recommendation-system-two-tower.drawio` — Shows the two-tower architecture: a user tower and an item tower as separate neural networks producing embeddings in the same vector space, item embeddings precomputed and indexed offline, and a single user embedding at request time queried against that index via approximate nearest neighbor search.

## Ranking

The few hundred candidates from the step above go through a heavier ranking model — can afford richer features (predicted watch-completion probability, recency of similar titles watched, time-of-day context, device type) and more expensive computation per item, precisely because it only runs on hundreds of items instead of the full catalog. This is the stage where business logic also gets layered in: diversity constraints (don't show 10 nearly-identical titles in a row), freshness boosts for new releases, and per-row theming (e.g., "Continue Watching" vs. "Because You Watched X" use different candidate pools feeding the same ranking infrastructure).

## Cold Start

- **New user, no viewing history**: the user tower has nothing to embed from behavioral history. Fall back to **content-based / popularity-based candidates** — globally or regionally popular titles, plus any explicit onboarding signal (genre preferences collected at signup) — until enough viewing history accumulates for the collaborative/two-tower signal to take over, typically blended in gradually rather than as a hard switch.
- **New title, no engagement data**: the item tower can still produce an embedding from the title's **metadata alone** (genre, cast, synopsis, content embeddings from the actual video/trailer) even with zero watch history — this is exactly the content-based-filtering complement to collaborative filtering's cold-start weakness discussed in the [deep dive](../../02-deep-dive/README.md). Engagement-based signals get blended in and gradually dominate as real viewing data accumulates.

## Feature Pipeline

- **Precomputed (feature store) features**: a user's genre-affinity vector aggregated over their last 90 days of viewing, a title's rolling completion rate, a user's average session length — all require nontrivial aggregation over historical data and don't change moment-to-moment, so they're computed by a batch/streaming pipeline (built on [Module 17](../../../module-17-data-pipelines/) patterns) and materialized into a low-latency online store for fast lookup at request time.
- **Request-time features**: time of day, device type, what the user just finished watching in this session — only knowable from the live request context, computed inline with no precomputation needed.

> ⚠️ **Warning:** If the 90-day genre-affinity aggregation is implemented once for offline training and reimplemented separately for the online store, any divergence between the two implementations is training-serving skew — the ranking model will be trained on numbers that don't match what it sees in production, degrading ranking quality with no thrown error anywhere. The mitigation is sharing one feature definition between both paths, exactly as described in [01-concepts](../../01-concepts/README.md#feature-stores-online-vs-offline-and-training-serving-skew).

## Evaluation and Rollout

Optimizing purely for **click-through rate** (did the user click a recommended title) is a known trap — it rewards clickbait-y thumbnails and titles that generate clicks but get abandoned after five minutes, not titles a user actually enjoys. A better proxy metric is something closer to **watch-completion rate** or a **longer-horizon retention signal** (did this recommendation correlate with continued subscription), even though it's a noisier, more delayed signal to optimize against. A new ranking model is validated first in **shadow mode** (scoring live traffic without affecting what users actually see, comparing its rankings against the current production model), then via a gradual **A/B test** with the chosen business metric (not raw click-through) as the primary guardrail, ramped slowly with automatic rollback if engagement or retention regresses.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Architecture | Two-stage funnel (candidate generation + ranking) | Makes catalog-scale recommendation tractable at request latency; adds a second model and pipeline to build, tune, and keep in sync |
| Candidate generation | Two-tower model with precomputed item embeddings | Item-side compute moves offline, keeping serving fast; requires periodic re-embedding as the catalog changes and an ANN index to maintain |
| Cold start | Content-based fallback blended with collaborative signal | Solves the "zero data" problem for new users/titles; content-based-only recommendations are weaker than fully personalized ones until enough behavioral data accumulates |
| Optimization metric | Watch-completion / retention proxy, not raw click-through | Better aligned with actual business value; noisier and slower to measure than click-through, making experimentation cycles longer |
