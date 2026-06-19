# Sample Answer: "Design a Real-Time Fraud-Scoring ML Inference System"

> A fully worked deep-dive answer applying the framework from this section's [README](./README.md). This prompt is a close cousin of "design a real-time recommendation/ranking system" — the same feature-store and serving-latency reasoning applies, with fraud's specific twist of needing extremely low false-negative tolerance and delayed ground-truth labels.

---

## Clarify the Task and Business Metric

The system scores each payment transaction, at the moment it's submitted, with a fraud probability used to approve, decline, or route the transaction to manual review. The business metric is **not** raw model accuracy — it's a combination of **fraud losses prevented** (catching true fraud) weighed against **false-positive rate** (declining legitimate transactions, which damages user trust and revenue). This tension — minimizing missed fraud without blocking too many legitimate transactions — should be named explicitly, because it directly determines the model's decision threshold, not just its architecture.

## Latency Requirement and Serving Path Decision

A payment cannot be approved until a fraud decision is made, so this is unambiguously **real-time inference**, with a strict latency budget — typically tens of milliseconds, since the fraud check is one step in a larger checkout flow that itself has a total latency budget the user will tolerate. This rules out batch inference entirely: the input (this specific transaction, right now) doesn't exist until the request arrives, so there's nothing to precompute in advance for the decision itself — though plenty of the *features* that feed the decision can and should be precomputed, which is exactly what the feature store below is for.

## Feature Design and the Feature Store

Fraud features split cleanly into two latency categories:

- **Precomputed (online feature store) features**: aggregates that take real computation over historical data but don't change request-to-request — e.g., "this card's average transaction amount over the last 30 days," "number of distinct merchants this card has used in the last 24 hours," "this user's account age." These are computed by an offline batch/streaming pipeline (built on the patterns from [Module 17](../../module-17-data-pipelines/)) and materialized into a low-latency online store (Redis or DynamoDB), keyed by card ID / user ID, so the serving path can fetch them with a single fast lookup instead of recomputing a 30-day aggregate inline.
- **Request-time features**: only knowable from the incoming request itself — transaction amount, merchant category, time of day, device fingerprint, IP geolocation. These are computed inline during the request, cheaply, with no external dependency.

> ⚠️ **Warning:** The single highest-leverage thing to say explicitly here is that the 30-day aggregate feature **must be computed by the exact same logic during training (offline, batch) and serving (online, precomputed into the low-latency store)** — this is training-serving skew, and for a fraud model specifically, a skewed feature is dangerous in a very concrete way: it can mean the model was trained believing "high transaction velocity" means one thing, while production silently computes a different number for the same conceptual feature, directly degrading fraud catch rate with no error thrown anywhere.

> 📊 **Diagram:** `feature-store-architecture.drawio` — Shows a single shared feature transformation definition feeding two materialized stores (an offline store backed by a data warehouse for training, and an online key-value store for real-time inference), with both training and serving reading the same logical feature — directly applicable to this fraud system's velocity/aggregate features.

## Model Architecture

Fraud scoring on tabular, mixed categorical/numeric features (transaction amount, merchant category, account age, velocity aggregates) is the textbook use case for **gradient-boosted decision trees** (e.g., the architecture family behind XGBoost/LightGBM) rather than a deep neural network — tree ensembles handle tabular data with heterogeneous feature types extremely well, train fast, and (importantly for this domain) are far more interpretable than a deep model, which matters because regulators and fraud analysts often need to know *why* a transaction was flagged, not just that it was.

## Serving Architecture

The model is loaded into memory on a fleet of stateless serving instances behind a load balancer (standard patterns from [Module 06](../../module-06-scalability/) and [Module 07](../../module-07-load-balancing/)), horizontally scaled to absorb transaction volume. The request path: incoming transaction → fetch precomputed features from the online feature store (one fast key-value lookup) → compute request-time features inline → single model forward pass → return a fraud probability and the resulting decision (approve / decline / route to manual review) based on a tuned threshold — all within the latency budget established above.

## Handling Delayed Ground Truth and Concept Drift

Fraud has a uniquely hard labeling problem: whether a transaction was actually fraudulent often isn't confirmed until a user disputes a charge weeks later (a chargeback). This means:
- **Training labels arrive with real delay**, so the training pipeline has to account for a lag window before a transaction's outcome is considered "settled" and safe to use as a label.
- **Concept drift is a first-class, expected risk, not an edge case** — fraud patterns actively evolve as fraudsters adapt to whatever the current model catches, meaning the input-output relationship the model learned can go stale faster than in most ML domains. This justifies a **shorter retraining cadence** than many other ML systems, and strongly motivates having a **fast-reacting rules-based override layer** sitting alongside the ML model (e.g., hard velocity limits) that can react within hours instead of waiting for the next retraining cycle.

## Safe Rollout

A new fraud model version never replaces the old one instantly. It first runs in **shadow mode** — scoring live transactions in parallel with the current production model, with its output logged but not used for any real approve/decline decision — so its predictions can be compared against the current model's and against eventual ground-truth labels once they arrive, with zero risk to real transactions. Only after shadow-mode validation does it move to a small **A/B traffic split** with guardrail metrics (fraud loss rate, false-positive rate) monitored for regression, ramping to full traffic gradually.

## Monitoring

Beyond standard infrastructure monitoring (latency, error rate, throughput), this system specifically needs: **prediction drift monitoring** (is the percentage of transactions flagged as fraud shifting meaningfully week over week, independent of any retraining?), **data drift monitoring** on the key velocity/aggregate features (are their distributions shifting?), and a **feedback loop from confirmed chargebacks back into the training pipeline**, closing the lifecycle loop described in [01-concepts](../01-concepts/README.md#the-ml-lifecycle) so the model retrains on its own real-world misses, not just its original training set.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Inference mode | Real-time, not batch | Required by the use case (decision blocks checkout); meaningfully more expensive than batch — always-on capacity, strict SLA |
| Model architecture | Gradient-boosted trees, not a deep network | Fast training, strong tabular performance, and interpretability for fraud analysts/regulators; potentially lower ceiling than a deep model on very large, complex feature sets |
| Velocity features | Precomputed in an online feature store | Single fast lookup at serving time instead of expensive inline aggregation; requires strict shared-logic discipline with the offline training pipeline to avoid skew |
| Drift response | Short retraining cadence + rules-based override layer | Reacts to adversarial concept drift faster than retraining alone could; rules layer adds maintenance overhead and can itself go stale |
| Rollout | Shadow mode, then gradual A/B ramp | Near-zero risk validation before real exposure; delays time-to-value for a genuinely better new model by the length of the shadow/ramp period |
