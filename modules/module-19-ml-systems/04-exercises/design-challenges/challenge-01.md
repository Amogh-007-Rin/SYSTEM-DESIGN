# Design Challenge 01: The Recommendation System for Netflix

**Difficulty:** Hard

## Prompt

Design the recommendation system that powers Netflix's homepage — the rows of personalized titles a user sees, ranked specifically for them, refreshed as their viewing behavior changes.

## What to Produce

1. **Decompose the problem.** Don't describe one monolithic model — explain the stages a request to "give me this user's homepage" actually goes through, and why a single model scoring the entire catalog per request doesn't scale.
2. **Candidate generation.** Describe at least one concrete approach (e.g., a two-tower model, collaborative filtering) for narrowing Netflix's full catalog down to a manageable candidate set per user, and justify why it's cheap enough to run per-request.
3. **Ranking.** Describe how the narrowed candidate set gets precisely ordered, and what additional signals a ranking model can afford to use that candidate generation couldn't.
4. **Cold start.** Address both a brand-new user (no viewing history) and a brand-new title (no engagement data yet) — these require different mitigations.
5. **Feature pipeline.** Identify at least 2 features that must be precomputed (and therefore belong in a feature store) versus computed at request time, and explain the difference.
6. **Evaluation and rollout.** Describe how you'd know a new recommendation model is actually better, including the role of A/B testing and what business metric you'd optimize for (and why it's not simply "click-through rate").
7. At least 2 explicit trade-offs.

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md).
