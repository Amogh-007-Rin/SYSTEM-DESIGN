# Module 19 — ML Systems & AI Infrastructure: Summary

> This module covered what makes ML systems fail differently than traditional systems (silently, via data shift, not loudly via exceptions), the full ML lifecycle as a feedback loop rather than a pipeline, feature stores as the fix for training-serving skew, the batch-vs-real-time inference decision, A/B testing infrastructure for safely rolling out new models, recommendation systems built on a two-stage candidate-generation/ranking funnel backed by approximate nearest neighbor search, the three distinct types of model drift, the infrastructure behind LLM serving (model parallelism, KV cache, quantization, batching), and end-to-end RAG system design from chunking through generation.

---

## Key Concepts

1. **Training-serving skew** — the failure mode where feature computation logic differs between training (offline) and serving (online), causing a model to see different inputs in production than it learned from.
2. **Feature store** — a system that defines a feature's transformation logic once and materializes it into an offline store (batch-optimized, for training) and an online store (latency-optimized, for serving), preventing skew.
3. **Two-stage recommendation funnel** — cheap candidate generation (narrow millions of items to hundreds) followed by expensive ranking (precisely order those hundreds) — the architecture that makes catalog-scale recommendation tractable.
4. **Two-tower model** — independent user and item neural networks producing embeddings in the same vector space, enabling item embeddings to be precomputed offline and searched via approximate nearest neighbor at serving time.
5. **Approximate nearest neighbor (ANN) search** — FAISS (IVF, product quantization) and HNSW (graph-based) both trade a small amount of recall for sub-linear search speed over millions of vectors.
6. **Data drift, concept drift, prediction drift** — three distinct, separately-monitored ways a deployed model's accuracy can degrade with zero code changes.
7. **KV cache** — stores attention key/value vectors for previously processed tokens so LLM inference avoids quadratically wasteful recomputation per new token; its memory footprint caps concurrent request capacity.
8. **RAG (Retrieval-Augmented Generation)** — grounds an LLM's answer in retrieved real documents (via chunking, embedding, and vector search) instead of relying solely on frozen parametric memory, reducing hallucination.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Inference mode | Batch inference | Real-time inference | Predictions can tolerate staleness (nightly churn scores, weekly recs) — cheaper, simpler | The input is only known at request time and there's a genuine low-latency requirement (fraud scoring, live ranking) |
| Recommendation signal | Collaborative filtering | Content-based filtering | Strong behavioral history exists; want cross-category affinity signal | Cold-start scenario (new item with no engagement data yet) |
| ANN search library | FAISS (IVF + product quantization) | HNSW (graph-based) | Very large scale, distributed shards, tunable memory/speed/recall trade-offs needed | Lower-latency, high-recall search on a single machine is the priority |
| Vector database | pgvector | Pinecone / Weaviate | Already operating PostgreSQL, moderate scale, want to avoid new infrastructure | Anticipating very large scale, need hybrid search or fully managed operations |
| Model precision (LLM serving) | Full precision | Quantized (8-bit/4-bit) | Maximum output quality is critical | Memory/throughput constraints dominate and quality loss is acceptable |

---

## Common Interview Questions from This Module

- What's the difference between how ML systems fail and how traditional systems fail, and why does it matter for monitoring design?
- Why do you need both an online and an offline feature store — isn't that redundant?
- How does a two-tower model make recommendation serving scalable, and why can't you just score every item for every user directly?
- What are data drift, concept drift, and prediction drift, and how do they differ in how they're detected?
- What are the four stages of a RAG pipeline, and which run offline versus online?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Feature store (online + offline split) | Prevents training-serving skew by sharing one feature definition across training and serving |
| Two-stage funnel (candidate generation + ranking) | Makes scoring a massive catalog per request computationally tractable |
| Two-tower architecture | Lets item-side embeddings be precomputed offline, reducing serving-time work to one embedding plus a vector search |
| Approximate nearest neighbor search (FAISS/HNSW) | Turns linear-scan vector search into sub-linear search at the cost of a small, tunable recall loss |
| Shadow mode + gradual A/B rollout | Validates a new model against live traffic with near-zero risk before full production exposure |
| RAG ingestion/query pipeline separation | Keeps expensive document processing (chunking, embedding) offline and out of the per-query latency path |
| Continuous batching (LLM serving) | Improves GPU throughput without letting one long-running request block others in the same batch |

---

## What This Unlocks

After this module, you can tackle:
- [Module 20 — Advanced Patterns](../module-20-advanced-patterns/), which builds on the systems-thinking and trade-off reasoning developed across this and prior modules
- ML-system interview prompts like "design Netflix's recommendation system," "design a RAG-based document Q&A system," or "design a real-time fraud detection system," all of which reduce to the feature store, serving-latency, and monitoring decisions covered in this module
- Real-world ML platform work: building or evaluating a feature store, designing a model rollout/monitoring strategy, or scoping a RAG system for an internal knowledge base

---

## Quick Reference

- **ML systems fail silently**: correct code, degraded accuracy, because the data distribution shifted — this is why drift monitoring exists and traditional monitoring (CPU, error rate) doesn't catch it.
- **ML lifecycle is a loop**: data collection → feature engineering → training → evaluation → deployment → monitoring → back to data collection/retraining.
- **Feature store** = one shared feature definition, two materialized stores (offline for training, online for serving) — the fix for training-serving skew.
- **Batch inference**: cheap, tolerant of staleness. **Real-time inference**: required when input is only known at request time and latency matters.
- **Recommendation**: two-stage funnel (cheap candidate generation via two-tower/collaborative filtering, expensive ranking on the shortlist).
- **ANN search** (FAISS, HNSW): trades small recall loss for sub-linear search speed — necessary past a few hundred thousand vectors.
- **Drift**: data drift (input distribution shifts), concept drift (input-output relationship shifts, needs labels to detect), prediction drift (output distribution shifts).
- **LLM serving**: model/tensor/pipeline parallelism splits huge models across GPUs; KV cache avoids recomputing attention per token but costs memory; quantization and continuous batching trade some quality/fairness for throughput.
- **RAG**: offline ingestion (chunk → embed → index) is separate from online query (embed question → retrieve top-k → generate) — never conflate the two pipelines.

---

← [Previous Module ← Module 18 — Search Systems](../module-18-search-systems/) | [Next Module → Module 20 — Advanced Patterns](../module-20-advanced-patterns/)
