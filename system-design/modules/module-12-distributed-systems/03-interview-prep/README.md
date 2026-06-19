# Module 12 — Interview Prep: Distributed Systems Fundamentals

## Why This Matters

Distributed systems questions show up in two very different shapes in interviews: **conceptual** ("what's the difference between a Lamport timestamp and a vector clock?") and **applied**, buried inside a larger system design question ("how would the nodes agree on who's the primary if it goes down?"). Interviewers use this topic specifically to separate candidates who have memorized buzzwords from candidates who understand *why* the mechanism exists — because every mechanism in this module exists to solve one of exactly three problems named in [01-concepts](../01-concepts/): partial failure, no global clock, and network unreliability.

---

## A Framework for Distributed Systems Questions

1. **Name the actual failure mode being protected against.** Don't open with "we'd use Raft" — open with what specifically breaks without it (e.g., "if the leader crashes, writes become unavailable until we elect a new one").
2. **State the trade-off explicitly, both directions.** Every mechanism in this module trades something for something — availability for consistency, write latency for durability, simplicity for fault tolerance. An answer that only states the benefit is incomplete.
3. **Connect the mechanism to the failure model it assumes.** Quorums, gossip, and leader election all assume crash/omission failures, not Byzantine ones — say so if it's relevant, it signals depth.
4. **Use the vocabulary precisely.** "Eventually consistent," "causally consistent," and "strongly consistent" are not interchangeable, and conflating them is one of the fastest ways to lose credibility with an interviewer who works on infrastructure.
5. **Reach for a concrete mechanism, not a vague gesture.** "We'd handle conflicts somehow" is weak; "we'd attach a vector clock to each write and detect concurrent writes as siblings for the application to merge" is the answer that gets follow-up respect.

> 🎯 **Interview Tip:** When a question doesn't specify the failure model, ask. "Are we assuming nodes can crash, or could a node send malicious/corrupted data?" is a clarifying question senior candidates ask and junior candidates skip — and the answer changes which protocols are even on the table.

---

## What Interviewers Are Actually Listening For

- Whether you reach for **specific, named mechanisms** (quorums, vector clocks, gossip, 2PC) instead of hand-waving ("the nodes would just sync up").
- Whether you can explain a mechanism's **failure mode**, not just its happy path (e.g., 2PC's blocking behavior on coordinator failure, not just "it has a prepare phase and a commit phase").
- Whether you understand that **almost nothing here is free** — every consistency or coordination guarantee costs latency, availability, or complexity, and a candidate who treats a mechanism as strictly an improvement with no cost hasn't fully understood it.

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked answer in [`sample-answer.md`](./sample-answer.md) ("Design a leader election mechanism for a 5-node cluster").
