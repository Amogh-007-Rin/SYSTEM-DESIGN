# Module 19 — Exercises

> 💡 **Note:** This module has **design challenges only — no coding challenges**, per the module specification. ML system design is best practiced as architecture-level reasoning (what components exist, how data flows between them, what trade-offs each choice makes) rather than as small isolated coding problems — the hands-on coding in this module instead lives in the worked TypeScript examples inside [`01-concepts/examples/`](../01-concepts/examples/) and [`02-deep-dive/examples/`](../02-deep-dive/examples/), which you should make sure you've run and understood before attempting these design challenges.

## Design Challenges

| Challenge | Description |
|---|---|
| [01 — Netflix Recommendation System](./design-challenges/challenge-01.md) | Design the recommendation system for Netflix — candidate generation, ranking, cold start, A/B testing |
| [02 — RAG-Based Document Q&A System](./design-challenges/challenge-02.md) | Design a RAG-based document Q&A system — ingestion pipeline, vector DB, retrieval, generation |

Challenge 02's underlying retrieval mechanism (approximate nearest neighbor search) is demonstrated hands-on in [`02-deep-dive/examples/ann-search.ts`](../02-deep-dive/examples/ann-search.ts) — run it before attempting the challenge if you haven't already. A structurally similar fully-worked answer for a different ML system design prompt is in [`03-interview-prep/sample-answer.md`](../03-interview-prep/sample-answer.md) ("Design a real-time fraud-scoring ML inference system") — attempt each challenge yourself first, then compare your reasoning against that worked example's framework.
