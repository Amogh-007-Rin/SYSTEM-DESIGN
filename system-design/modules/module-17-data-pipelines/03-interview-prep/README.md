# Module 17 — Interview Prep: Designing Data Pipelines

## Why This Matters

"Design a real-time analytics pipeline" or "design a fraud detection system" are some of the most architecture-heavy prompts in system design interviews precisely because they force a candidate to make — and defend — a string of connected decisions: batch or stream, Lambda or Kappa, what's the source of truth, where does the data land, and how does it get queried later. Interviewers use these prompts to see whether a candidate reaches for "Kafka and Spark" as buzzwords or can actually justify each piece from the latency, volume, and correctness requirements stated in the prompt. This section gives you a repeatable framework, plus a fully worked example.

---

## A Framework for "Design This Data Pipeline"

1. **Pin down the latency requirement first.** Is "real-time" actually sub-second (fraud detection), seconds-to-minutes (a live dashboard), or "by tomorrow morning" (a daily report)? This single number eliminates entire categories of architecture before anything else is decided.
2. **Pin down the volume and shape of the data.** Events per second, average and peak; size per event; is the data structured, semi-structured, or raw? This drives whether you need a distributed stream processor (Flink) at all, or whether a simpler pipeline suffices.
3. **Decide batch, stream, or both (Lambda/Kappa).** Justify from steps 1–2, not from familiarity with a particular tool.
4. **Design the ingestion path.** Where does data originate (application events, CDC from a database, third-party API, IoT devices), and what's the first system it lands in (a message queue/log, typically Kafka)?
5. **Design the processing path.** What transformations/aggregations happen, in which engine, and what state does that engine need to hold (a running count, a window of recent events, a join against reference data)?
6. **Design the storage/serving layer.** Where do results land for querying — a warehouse for analysts, a low-latency key-value store for a live dashboard, an alert dispatched directly? Different consumers often need different serving stores from the *same* processed data.
7. **Address failure and correctness explicitly.** What happens on a processing node crash — is reprocessing idempotent? What delivery semantics (at-least-once, exactly-once) does the pipeline actually need, and where is that guaranteed?
8. **State trade-offs out loud.** Every choice above has a cost — say it.

> 🎯 **Interview Tip:** Stating the latency requirement as a number in the first sixty seconds of your answer ("the prompt implies sub-second decisions, so this is a streaming problem, not a batch one") is one of the highest-signal moves available — it shows you're deriving the architecture from the requirement instead of pattern-matching to a familiar tool.

---

## What Interviewers Are Listening For

- Did you **derive** the batch/stream/Lambda/Kappa decision from stated latency and correctness needs, instead of asserting it?
- Did you separate **ingestion** (how data first enters the pipeline) from **processing** (what's computed) from **serving** (how results are queried/consumed) as genuinely distinct layers?
- Did you name **what's approximate and what must be exact**? (A live "trips per minute" counter can tolerate brief undercounting; a billing calculation cannot.)
- Did you address **failure modes**: what happens when a consumer crashes mid-batch, when an event arrives late, when a duplicate event arrives twice?
- Did you discuss **backpressure or scale limits** — what happens to the pipeline under 10x the expected load?

> ⚠️ **Warning:** A common interview mistake is describing only the "happy path" — a clean line from source to Kafka to Flink to a dashboard — and never addressing what happens when a node crashes mid-window, an event arrives 30 seconds late, or the same event is delivered twice. Pipeline correctness under failure is usually exactly what separates a strong answer from a superficial one, especially for prompts explicitly about fraud detection or billing.

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design a real-time data pipeline for clickstream analytics").
