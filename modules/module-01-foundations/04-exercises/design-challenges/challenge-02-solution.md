# Design Challenge 02 — Solution: NFR Document for a Flash-Sale Checkout System

## 1. Availability Target

**99.95%** — slightly above the stated 99.9% floor, to leave an error budget for the sale-day spike itself (the highest-risk window is exactly when you can least afford an outage).

## 2. Latency Targets

- **p50: 150ms** — checkout should feel instantaneous under normal load.
- **p99: 800ms** — under 10x spike load, some tail latency is acceptable as long as requests still complete rather than time out; a hard timeout above this should return a clear "high demand, please retry" rather than hang.

## 3. Consistency Model: Inventory Count

**Strong consistency**, specifically for the decrement-on-purchase operation. Justification: the business has explicitly stated overselling is unacceptable — this is the one NFR in this whole document that cannot be relaxed for performance. Everything else (e.g., "X people are viewing this item" social proof counters) can be eventually consistent; the actual stock decrement cannot.

## 4. Durability Requirement

A completed order (one that has charged the customer and decremented inventory) **must survive any single-node failure** — write to durable storage with at least synchronous replication to one standby before acknowledging the order to the client. Losing a paid order is both a customer trust failure and a potential compliance/financial issue.

## 5. Peak QPS Estimate

```
DAU = 1,000,000
Assume avg 3 checkout-related requests/user/day under normal load (browse → cart → checkout)
Normal total requests/day = 3,000,000
Normal average QPS = 3,000,000 / 86,400 ≈ 35 QPS
Normal peak QPS (2x avg, standard rule of thumb) ≈ 70 QPS

Sale-event spike = 10x normal peak
Sale-event peak QPS ≈ 700 QPS
```

The system must be provisioned (and load-tested) for **~700 QPS sustained**, not 70 — sizing for the normal case and hoping auto-scaling catches up during a flash sale is a common and costly mistake, because auto-scaling has lag and flash-sale traffic arrives near-instantly at the announced start time.

## 6. Data Retention

**7 years** for order history — driven by typical financial record-keeping and tax compliance requirements (verify against actual jurisdiction-specific regulations in a real system), not an arbitrary engineering choice.

---

> 🎯 **Interview Tip:** Notice that every number above is paired with a one-sentence "why." An NFR document that's just a table of numbers with no justification is barely more useful than no NFR document — the justification is what lets a future engineer know whether a number can be safely relaxed.
