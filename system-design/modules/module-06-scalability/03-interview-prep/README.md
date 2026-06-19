# Module 06 — Interview Prep: Scaling a System

## Why This Matters

"How would you scale this to 10 million users?" is the single most common follow-up in a system design interview, asked after almost any prompt, because it tests whether you understand your own design's limits — not whether you can recite "add a cache" and "add a load balancer" as disconnected buzzwords.

---

## A Framework for "How Would You Scale This?"

1. **State the current bottleneck explicitly.** Don't jump to a solution before naming what's actually breaking — a single database, a single app server's CPU, a synchronous write path. "We'd add more servers" without naming why the current setup fails is the most common shallow answer.
2. **Quantify, even roughly.** "We expect 10,000 requests/sec, each taking ~50ms" lets you reach for Little's Law and talk about concurrency requirements with numbers instead of vague confidence.
3. **Apply the scaling journey in order.** Don't propose sharding before you've separated the database and added caching — interviewers notice when a candidate skips straight to the most advanced-sounding answer instead of the next logical step.
4. **Name the trade-off of every change.** More replicas means replication lag; a cache means invalidation complexity; sharding means cross-shard queries get hard. A scaling answer with no acknowledged trade-off is a red flag, not a strength.
5. **Connect to statelessness.** Any time you propose "add more servers," say *why that's possible* — because the application tier is stateless and any instance can serve any request.
6. **Acknowledge what doesn't scale linearly.** Use Amdahl's Law language if relevant: "this step is inherently serial, so adding workers here won't help past a point — we need to reduce or parallelize the serial part itself."

> 🎯 **Interview Tip:** Walking through scale in stages (1K → 100K → 10M users) rather than jumping straight to the "final" massively-distributed architecture demonstrates that you understand scaling as a *journey* with real intermediate states, not a single end-state you reverse-engineer from a famous company's public architecture diagram.

---

## What Interviewers Are Listening For

- Did you identify the *actual* bottleneck before proposing a fix, or did you pattern-match to "scale = add servers + add cache" without justification?
- Did you ever say a number out loud (requests/sec, latency, data size) and reason from it, even approximately?
- Did you state a trade-off for every scaling decision, or present each change as purely positive?
- Did you recognize when a problem *wasn't* about more capacity at all — e.g., a single serial bottleneck no amount of horizontal scaling fixes?

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank and [`sample-answer.md`](./sample-answer.md) for a full worked example: "How would you scale a system from 1K to 1M users?"
