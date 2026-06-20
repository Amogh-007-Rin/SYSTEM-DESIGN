# Module 19 — Interview Prep: Designing ML Systems

## Why This Matters

"Design Netflix's recommendation system," "design a RAG-based document Q&A system," and "design a real-time fraud detection system" have become standard senior/staff-level system design prompts at most large tech companies, precisely because they test something a generic "design Twitter" prompt doesn't: can a candidate reason about a system where the same code can be correct and still silently fail because the data shifted underneath it? This section gives you a repeatable framework for ML system design interviews, plus a fully worked example.

---

## A Framework for "How Would You Design This ML System?"

1. **Clarify the prediction task and the business metric it serves.** "Recommend videos" is not a spec — is the goal maximizing watch time, click-through rate, or long-term retention? The metric shapes everything downstream, including what "good" even means for evaluation.
2. **Characterize the data and define the features.** What raw signals exist (user history, item metadata, real-time context)? Which need to be precomputed (and therefore live in a feature store) versus computed at request time?
3. **Decide the model architecture at the right level of abstraction.** You're rarely expected to derive a novel architecture — name the right *category* (two-tower for candidate generation, gradient-boosted trees for tabular fraud scoring, a fine-tuned LLM for generation) and justify it from the task's shape.
4. **Design the training pipeline.** Where does labeled data come from? Batch retraining cadence? How is the offline evaluation set kept representative of live traffic?
5. **Design the serving path.** Batch or real-time? What's the latency budget, and does every dependency (feature lookups, model forward pass, any retrieval step) fit inside it?
6. **Design the rollout and monitoring strategy.** How does a new model get validated against production traffic (shadow mode, A/B test) before full rollout, and what triggers an automatic rollback or retraining?

> 🎯 **Interview Tip:** Say the words "training-serving skew" and "data drift" out loud, unprompted, at the appropriate point in your answer. These two phrases, used correctly and in context, are some of the highest-signal moments in an ML system design interview — they immediately tell the interviewer you've operated (or deeply studied) a real ML system, not just read about model architectures.

---

## What Interviewers Are Listening For

- Did you separate **candidate generation** (cheap, approximate, narrows millions to hundreds) from **ranking** (expensive, precise, on the narrowed set) instead of describing one undifferentiated "the model scores everything" step?
- Did you explicitly address **how features are computed identically in training and serving** — i.e., did the words "feature store" or an equivalent mechanism appear, or did you wave away training-serving skew?
- Did you name a **monitoring strategy** distinct from normal infrastructure monitoring (CPU, latency, error rate) — something that would actually catch a model quietly getting worse with no thrown exceptions?
- Did you justify **batch vs. real-time inference** from an actual latency requirement, rather than defaulting to real-time because it sounds more sophisticated?
- For generative/LLM-adjacent prompts, did you keep the **offline ingestion pipeline** (chunking, embedding, indexing) and the **online query pipeline** (retrieve, generate) conceptually separate, and discuss latency/cost for each independently?
- Did you mention a **safe rollout mechanism** (shadow traffic, A/B test, gradual ramp) rather than implying a new model just replaces the old one instantly in production?

> ⚠️ **Warning:** A common failure mode is spending the entire interview on model architecture trivia (which embedding dimension, which loss function) and never reaching the systems half of the question — the feature pipeline, the serving latency budget, the monitoring story. In a *system design* interview (as opposed to an ML theory interview), the systems half is usually weighted at least as heavily as the modeling half, often more so.

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design a real-time fraud-scoring ML inference system").
