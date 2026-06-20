# Module 19 — ML Systems & AI Infrastructure

> A trained model is a static artifact; the system around it — pipelines that feed it consistent features, infrastructure that serves it within a latency budget, and monitoring that catches it silently going stale — is what actually makes machine learning work in production.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 17 — Data Pipelines](../module-17-data-pipelines/) | Batch vs. stream processing, ETL/ELT, data pipeline orchestration — the substrate that feeds every ML feature pipeline covered in this module |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Explain what makes ML system design distinct from traditional system design, and reason through the full ML lifecycle from data collection to production monitoring
- Design a feature store, explain why online and offline stores both exist, and diagnose training-serving skew when offline and online feature logic diverge
- Choose between batch and real-time model inference for a given latency/throughput requirement, and design A/B testing infrastructure for safely rolling out new models
- Design recommendation systems using collaborative filtering, content-based filtering, and two-tower architectures, backed by approximate nearest neighbor search (FAISS, HNSW)
- Detect data drift, concept drift, and prediction drift in a deployed model, and reason about the GPU/serving infrastructure (model parallelism, KV cache, quantization, batching) behind LLM inference
- Design a Retrieval-Augmented Generation (RAG) system end to end: chunking, embedding pipelines, vector database choice, retrieval, and generation

---

## Estimated Time

**5–6 hours** total: Concepts: ~2h | Deep dive: ~2h | Exercises: ~1.5–2h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Design challenges (this module has no coding challenges) |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 18 — Search Systems](../module-18-search-systems/) | [Next Module → Module 20 — Advanced Patterns](../module-20-advanced-patterns/)
