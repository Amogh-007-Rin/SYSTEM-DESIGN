# Module 01 — Deep Dive: Requirements, SLAs, and Estimation

## Why This Matters

"Design a chat app" is not a complete spec — it's a prompt. Two engineers who both build a working chat app can produce wildly different systems depending on unstated assumptions: is this for 100 friends or 2 billion WhatsApp users? Does a message need to survive a datacenter outage? The difference between a good system designer and a great one is almost entirely in how rigorously they turn a vague prompt into explicit, numbered requirements before writing a single line of architecture. This deep dive gives you that machinery.

---

## The SDLC and Where Design Fits

The Software Development Life Cycle is typically drawn as: **Requirements → Design → Implementation → Testing → Deployment → Maintenance**. System design lives right after requirements gathering and before implementation — it's the bridge between "what does the business need" and "what do engineers build." Skipping or rushing this step is why teams end up rewriting systems eighteen months in: the implementation satisfied requirements nobody had actually finished clarifying.

> 💡 **Note:** In an interview, you don't get a separate "requirements phase" meeting — clarifying questions *are* the requirements phase, compressed into the first five minutes. Treat them with the same seriousness you would in a real project.

---

## Functional vs. Non-Functional Requirements

- **Functional Requirements (FRs)** describe *what* the system does: "users can post a message," "users can follow other users," "the system sends a notification on new followers."
- **Non-Functional Requirements (NFRs)** describe *how well* it does it: latency targets, availability targets, throughput, durability guarantees, security and compliance constraints.

NFRs are what actually drive architecture decisions. Two systems with identical FRs ("store and retrieve a message") can have completely different architectures depending on NFRs: a personal note-taking app and a banking transaction log both "store and retrieve records," but one needs single-digit-millisecond reads for one user, and the other needs strict durability and auditability for millions of users and regulators. You cannot pick a database, a replication strategy, or a caching layer without first knowing the NFRs.

> ⚠️ **Warning:** A classic interview mistake is jumping straight to "I'll use Kafka and Cassandra" before establishing *why* — what NFR specifically demands that choice? Always let an NFR justify a technology, never the reverse.

---

## SLAs, SLOs, and SLIs

These three terms form a chain from promise → target → measurement:

| Term | Definition | Example |
|---|---|---|
| **SLA** (Service Level *Agreement*) | A contractual promise to a customer, often with financial penalties for breach | "99.9% uptime per month, or you get a service credit" |
| **SLO** (Service Level *Objective*) | An internal target, usually stricter than the SLA, that the team aims to hit | "99.95% uptime" (gives buffer before breaching the 99.9% SLA) |
| **SLI** (Service Level *Indicator*) | The actual metric you measure to know whether you're meeting the SLO | "% of successful HTTP responses in the last 30 days, measured at the load balancer" |

The gap between the SLA and the internal SLO is your **error budget** — how much unreliability you're allowed to spend (on risky deploys, experiments, planned maintenance) before you're at risk of breaching what you've promised customers.

> 🎯 **Interview Tip:** If an interviewer asks "what availability should this system target?", a strong answer cites a specific number *and* justifies it against the product: "I'd target 99.95% — this is a consumer social feed, not a payments system, so a few minutes of monthly downtime is an acceptable trade for keeping costs and complexity down."

---

## Capacity Estimation Fundamentals

Capacity estimation ("back-of-envelope math") translates a product description into the numbers that determine your architecture: how many requests per second, how much storage, how much bandwidth. The skill isn't precision — it's getting within an order of magnitude, fast, using a small set of inputs:

- **DAU** (Daily Active Users)
- **Requests per user per day**
- **Average request/response size**
- **Read:write ratio**
- **Data retention period**

From these five numbers you can derive nearly everything else: total daily requests, average and peak QPS, daily and total storage, and bandwidth.

### Worked Example: A Twitter-Like Service

Assume 100 million DAU, each posting or reading 10 times a day on average, with each "item" averaging 1KB, a 10:1 read:write ratio, and 5 years of retention.

```
Total requests/day = 100,000,000 × 10 = 1,000,000,000 (1 billion)
Average QPS        = 1,000,000,000 / 86,400 ≈ 11,574 QPS
Peak QPS            = Average QPS × 2 (a common rule of thumb)  ≈ 23,148 QPS
Write QPS           = Peak QPS × (1 / (10 + 1)) ≈ 2,104 QPS
Read QPS             = Peak QPS × (10 / (10 + 1)) ≈ 21,044 QPS
Daily write storage = 2,104 writes/sec × 86,400 sec × 1KB ≈ 174 GB/day
5-year storage       ≈ 174 GB × 365 × 5 ≈ 317 TB
```

That last number alone tells you this cannot be a single-machine database — you're already in sharding-and-object-storage territory before you've designed a single API endpoint.

> 💡 **Note:** Always state your rounding explicitly out loud ("I'll treat a day as 100,000 seconds instead of 86,400 to make the mental math easier — that's a 13% overestimate, which is fine for our purposes"). Precision theater wastes interview time; defensible approximation builds trust.

See [`cheatsheets/numbers-every-engineer-should-know.md`](../../../cheatsheets/numbers-every-engineer-should-know.md) and [`interview-prep/estimation-cheatsheet.md`](../../../interview-prep/estimation-cheatsheet.md) for the reference tables this kind of math depends on.

---

## Key Takeaways

- System design sits between requirements gathering and implementation in the SDLC — rushing it is why systems get rewritten.
- Functional requirements describe *what*; non-functional requirements describe *how well*, and NFRs are what actually drive architecture decisions.
- SLA → SLO → SLI form a chain from external promise, to internal target, to the actual measurement that tells you which one you're hitting.
- The gap between your SLA and your SLO is your error budget — the unreliability you're allowed to spend before breaching a customer promise.
- Capacity estimation only needs five inputs (DAU, requests/user/day, request size, read:write ratio, retention) to derive QPS, storage, and bandwidth within an order of magnitude.
