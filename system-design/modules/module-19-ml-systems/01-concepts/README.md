# Module 19 — Concepts: ML Systems & AI Infrastructure

## Why This Matters

A data scientist can train a model with 95% accuracy in a Jupyter notebook in an afternoon. Getting that same model to serve a billion predictions a day, on fresh data, without silently degrading over the next six months, is an entirely different engineering problem — and it is the problem this module is about. The notebook model is a function; a production ML system is a *pipeline of systems*: one that collects and labels data, one that computes the same features consistently in two very different runtime environments, one that serves predictions within a latency budget measured in milliseconds, and one that watches the whole thing and pages someone when the real world quietly stops matching the data the model was trained on. Companies that get this wrong don't get a crash — they get a recommendation engine that slowly gets worse, or a fraud model that silently stops catching new fraud patterns, for weeks, with no error in any log. This module is about building the infrastructure that prevents that.

---

## ML System Design vs. Traditional System Design

Most of what you've learned in this repository — databases, caching, queues, load balancing — still applies directly to ML systems; a feature store is, underneath, a database with a particular access pattern, and a model server is, underneath, a stateless service behind a load balancer. What's genuinely different is the *failure mode*:

| | Traditional System | ML System |
|---|---|---|
| **What can be "wrong"** | Code has a bug, or it doesn't | Code can be 100% correct and still produce bad outputs because the *data* changed |
| **Testing** | Unit/integration tests with deterministic expected outputs | Tests are statistical — you check a distribution of outputs against a distribution of expected behavior, not exact values |
| **Versioning** | Version the code | Version the code, the training data, *and* the model weights — three independently moving parts that must be reproducible together |
| **Failure visibility** | Usually a 500 error or a crash | Often silent — predictions still return successfully, just gradually worse, with no exception thrown anywhere |
| **Rollback** | Redeploy the previous code artifact | Redeploy the previous model weights — and you need to have kept them, plus the exact feature pipeline version that matched them |

> 💡 **Note:** This is why ML systems need a category of tooling traditional web services mostly don't: model registries, feature stores, drift detectors, and experiment tracking. None of these exist because ML engineers like extra infrastructure — they exist because "the code is right but the data drifted" is a failure mode normal monitoring (CPU, error rate, latency) is structurally blind to.

> 🎯 **Interview Tip:** When asked to "design an ML system," the strongest opening move is naming this distinction explicitly: traditional systems fail loudly (exceptions, crashes), ML systems fail quietly (degraded accuracy with no error). Say that your design includes monitoring specifically because of this, before you've even drawn a box — it signals you understand the actual hard problem, not just "call `model.predict()` behind an API."

---

## The ML Lifecycle

Every production ML system, regardless of domain, moves data through the same six stages:

**1. Data Collection** — Raw events (clicks, purchases, sensor readings) land in a data lake or warehouse, usually via the batch/stream pipelines covered in [Module 17](../../module-17-data-pipelines/). This is the foundation everything else depends on; a subtly biased collection process (e.g., only logging successful requests, never failures) poisons every downstream stage.

**2. Feature Engineering** — Raw data is transformed into the numeric/categorical inputs ("features") a model actually consumes — e.g., turning a raw timestamp into "hour of day" and "is_weekend," or aggregating a user's last 30 days of purchases into a single "purchase_frequency" number. This stage is where the **feature store** (below) becomes necessary, because the same feature logic has to run twice, in two different environments.

**3. Training** — A model learns parameters from historical features and labels, typically on a batch compute cluster (GPUs for deep learning, CPU clusters for classical ML). Training is iterative and exploratory — many experiments, most discarded — and produces a versioned model artifact as output.

**4. Evaluation** — The trained model is scored against held-out data the model never saw, using metrics appropriate to the task (precision/recall for classification, AUC for ranking, perplexity for language models). A model that looks good on offline evaluation can still fail in production if the offline evaluation set doesn't represent real traffic — which is exactly what **A/B testing** (below) exists to catch.

**5. Deployment** — The model artifact is packaged and exposed for inference, either as a batch job or a real-time serving endpoint (both covered below). Deployment is rarely instantaneous and total — it's usually gradual (canary, shadow traffic, or an A/B split) specifically because evaluation alone cannot fully predict production behavior.

**6. Monitoring** — Once live, the model's input distributions and prediction quality are continuously tracked, because — as established above — an ML system can degrade with zero code changes, purely because the world the model was trained on has shifted. (Full mechanics in the [deep dive](../02-deep-dive/README.md).)

> 📊 **Diagram:** `ml-lifecycle.drawio` — Shows the six-stage ML lifecycle as a loop (not a line): data collection → feature engineering → training → evaluation → deployment → monitoring, with an arrow from monitoring back to data collection, illustrating that production monitoring signals (e.g., "this feature's distribution shifted") feed directly back into retraining.

> ⚠️ **Warning:** Treating this as a one-way pipeline instead of a loop is a common design mistake. The most important arrow in the diagram is the one from monitoring back to data collection/retraining — without it, you've built a system that degrades and never recovers, only ever alerts a human to intervene manually.

---

## Feature Stores: Online vs. Offline, and Training-Serving Skew

A **feature store** is a centralized system for computing, storing, and serving the inputs a model needs — and it exists to solve one specific, expensive problem: **training-serving skew**.

Here's the problem it solves. During training, a feature like "user's average order value over the last 30 days" is typically computed by a batch job running a SQL-like aggregation over a data warehouse — fast, flexible, optimized for throughput over millions of rows at once. At inference time, in production, that same feature has to be computed (or looked up) in milliseconds, for one user, as part of an API request — a completely different runtime with completely different constraints. If two separate teams (or even the same engineer, at different times) implement that "30-day average order value" calculation twice — once in a batch SQL query for training, once in application code for serving — there is no guarantee the two implementations agree. A subtle bug, an off-by-one in the date window, a different rounding rule: any of these means the model is trained on slightly different numbers than the ones it sees in production, and accuracy quietly degrades for reasons that look like nothing in any log.

A feature store fixes this by giving both environments a **single, shared feature definition**, materialized into two physically different stores tuned for two different access patterns:

| | Offline Store | Online Store |
|---|---|---|
| **Used during** | Training, batch evaluation | Real-time inference |
| **Typical backing technology** | Data warehouse / data lake (e.g., a columnar store, Parquet on object storage) | Low-latency key-value store (Redis, DynamoDB, Cassandra) |
| **Access pattern** | Large batch reads — "give me this feature for 10 million users as of various historical timestamps" | Single-key point lookups — "give me this feature for user 42, right now" |
| **Latency requirement** | Seconds to minutes is fine | Single-digit milliseconds |
| **Data freshness** | Can be hours/days stale (point-in-time correct for training) | Must be as fresh as the use case requires (seconds to minutes, depending on the feature) |

The critical guarantee a feature store provides is that the *transformation logic* — the code that turns raw events into the feature value — is defined **once** and run by both paths (or, in the most rigorous designs, the online store is populated by streaming the same transformation that backs the offline store, rather than reimplementing it). This is the single biggest lever for preventing training-serving skew; a worked illustration of what happens when that guarantee is violated is in [`examples/feature-store-skew.ts`](./examples/feature-store-skew.ts).

> 📊 **Diagram:** `feature-store-architecture.drawio` — Shows a single shared feature transformation definition feeding two materialized stores (an offline store backed by a data warehouse for training, and an online key-value store for real-time inference), with both training and serving reading the same logical feature.

> 🎯 **Interview Tip:** If asked "why do you need both an online and offline feature store — isn't that redundant?", the precise answer is: they're not storing different data conceptually, they're storing the *same* feature definitions materialized for two incompatible access patterns (batch-and-slow vs. point-and-fast). The redundancy is deliberate and is what prevents training-serving skew, not what causes it — the skew risk comes from *not* sharing the feature definition, not from having two stores.

---

## Model Serving: Batch vs. Real-Time Inference

Once trained, a model needs to actually produce predictions, and the latency requirement of the use case decides the serving architecture:

- **Batch inference** runs the model over a large, known set of inputs on a schedule (nightly, hourly), writing results to a database or file for later lookup. This fits use cases where predictions don't need to reflect the very latest data — e.g., "compute a churn-risk score for every customer overnight" or "generate this week's email recommendation batch." It's cheap, simple, and lets you fully use large batch hardware (e.g., a GPU cluster running at full utilization for a bounded window), since there's no per-request latency SLA to hit.
- **Real-time (online) inference** serves one prediction per incoming request, synchronously, typically with a strict latency budget (tens to low hundreds of milliseconds). This fits use cases where the input is only known at request time — e.g., fraud-scoring a transaction as it happens, or ranking search results for a specific query. Real-time serving requires the model (and all its features, from the online feature store above) to be available with consistently low latency, which usually means the model is kept warm in memory on a fleet of serving instances behind a load balancer, exactly like any other low-latency stateless service covered in [Module 06](../../module-06-scalability/) and [Module 07](../../module-07-load-balancing/).

| | Batch Inference | Real-Time Inference |
|---|---|---|
| **Latency** | Minutes to hours acceptable | Milliseconds required |
| **Cost efficiency** | High — large batches, full hardware utilization | Lower per-prediction efficiency, but necessary for the use case |
| **Freshness** | Predictions can be stale between batch runs | Always reflects current input |
| **Example** | Nightly churn scores, weekly recommendation refresh | Fraud scoring, ad-click prediction, live search ranking |

> ⚠️ **Warning:** A common design mistake is defaulting to real-time inference "to be safe" when the use case doesn't actually need it. Real-time serving is meaningfully more expensive and operationally heavier (always-on GPU/CPU capacity, strict SLAs, online feature store dependency) than batch — always justify real-time serving from a genuine latency requirement in the prompt, not from assuming it's always the better choice.

---

## A/B Testing Infrastructure for ML Models

Offline evaluation metrics (accuracy, AUC) are necessary but not sufficient — they're computed against historical data, and a model that wins offline can still lose in production if the offline test set doesn't fully represent live traffic, or if the metric being optimized (e.g., click-through rate) doesn't actually capture what the business cares about (e.g., long-term retention). **A/B testing infrastructure for ML** routes a portion of live production traffic to a new ("challenger") model while the rest continues to see the current ("control") model, then compares real business metrics between the two groups statistically.

The infrastructure needs three pieces beyond a normal web A/B test: **consistent bucketing** (the same user should reliably see the same model variant across requests, usually via a hash of the user ID), **shadow traffic / shadow mode** (running the new model on live traffic *without* using its output, purely to compare its predictions against the current model's before risking any real exposure), and **guardrail metrics** (automatic rollback triggers if a core business metric, like revenue or latency, regresses past a threshold — not just waiting for a human to notice).

> 💡 **Note:** "Shadow mode" is the ML-specific risk-reduction step most traditional A/B testing skips — because a bad ranking model doesn't crash anything, you can safely let it run silently in parallel and just log what it *would* have returned, before ever showing a single real user its output. This is the ML equivalent of canary deployment, but for behavior correctness rather than just system stability.

---

## Key Takeaways

- ML systems fail differently than traditional systems: code can be entirely correct and the system can still degrade, because the input data distribution shifted — this is why ML-specific monitoring infrastructure exists.
- The ML lifecycle is a loop, not a pipeline: production monitoring signals should feed back into data collection and retraining, not dead-end at a dashboard.
- Feature stores exist specifically to prevent training-serving skew, by defining a feature's transformation logic once and materializing it into an offline store (batch-optimized, for training) and an online store (latency-optimized, for serving).
- Choose batch inference when predictions can tolerate staleness (cheaper, simpler); choose real-time inference only when the use case genuinely requires per-request freshness within a strict latency budget.
- A/B testing for ML needs consistent bucketing, shadow-mode traffic comparison, and automated guardrail rollbacks — offline evaluation metrics alone cannot fully predict production model behavior.
