# Common Mistakes in System Design Interviews

> Most candidates who fail a system design interview don't fail because they lack knowledge — they fail because of process mistakes that are entirely avoidable once you know to watch for them. This list is deliberately blunt; read it the night before a real interview.

---

## 1. Skipping Requirements Clarification

Jumping straight into "okay, I'll use a load balancer and Postgres" before asking a single question is the single most common mistake. You cannot design correctly for requirements you haven't established, and worse, it signals to the interviewer that you don't distinguish between "a system" and "this specific system with these specific constraints."

**Fix:** Always spend the first ~5 minutes on [Step 1 of the framework](./how-to-approach-system-design-interview.md) — functional requirements, NFRs, and scale — before drawing anything.

---

## 2. Over-Engineering for a Scale Nobody Asked For

Designing a 12-service architecture with Kafka, multi-region replication, and a custom consensus protocol for a system the interviewer described as "a few thousand users" is not impressive — it reads as an inability to match architecture to actual requirements, which is the core skill being tested.

**Fix:** Start from the simplest architecture that satisfies the stated NFRs, and add complexity only when you can name the specific requirement that demands it.

---

## 3. Under-Engineering and Ignoring Stated Scale

The mirror-image mistake: the interviewer says "100M DAU" and the candidate designs a single Postgres instance with no caching, no replication, and no sharding story. This signals the opposite problem — not internalizing what the numbers imply.

**Fix:** Do the back-of-envelope math from [the estimation cheatsheet](./estimation-cheatsheet.md) early, and let the resulting QPS/storage numbers visibly drive your architecture decisions.

---

## 4. Drawing Boxes Without Explaining Them

A diagram full of unlabeled boxes and arrows that the candidate never narrates is a wasted diagram. If you can't explain in one sentence what a component does and why it's there, it shouldn't be on the board yet.

**Fix:** Narrate every component as you draw it — "this is an API gateway, handling auth and rate limiting before requests reach the app servers."

---

## 5. Treating Every Decision as Having One Correct Answer

Saying "I'll use Cassandra" with no justification is far weaker than saying "I'll use Cassandra because this is a write-heavy workload where eventual consistency on reads is acceptable, and I'm trading off the rich query flexibility of SQL for write throughput at scale." The trade-off discussion is the part being evaluated — not the final choice.

**Fix:** For every meaningful decision, state at least one thing you're giving up by choosing it.

---

## 6. Going Silent While Thinking

A candidate who stops talking for 60+ seconds while working through a problem is indistinguishable, from the interviewer's side of the table, from a candidate who is stuck. Silence is read as a red flag even when real progress is happening internally.

**Fix:** Narrate continuously — "let me think through the write path first, then come back to reads" buys you thinking time without looking stuck.

---

## 7. Not Asking About Priorities

Spending equal time on every component, including ones the interviewer doesn't care about, often means running out of time before reaching the part they actually wanted to probe.

**Fix:** Ask "is there a particular area you'd like me to go deeper on?" near the end of requirements clarification, and budget your high-level design time to reach that area.

---

## 8. Ignoring Failure Modes

A design that only describes the happy path — every request succeeds, every server stays up, every network call returns — is an incomplete design. Interviewers routinely probe with "what happens if this database goes down?"

**Fix:** Proactively mention at least one failure scenario and its mitigation per major component (e.g., "if the primary database fails, we promote a replica — there's a brief write-unavailability window during failover, which is the trade-off of single-leader replication").

---

## 9. Memorizing Architectures Instead of Reasoning From Principles

Reciting "Twitter uses a fan-out-on-write timeline architecture" without being able to explain *why* that's the right choice (or when it isn't) falls apart the moment the interviewer changes a constraint, like "what if a user has 50 million followers?"

**Fix:** Learn the *reasoning* behind real-world architectures, not just the architectures themselves — see how [the question bank](./README.md) frames every answer around trade-offs, not facts to memorize.

---

## 10. Never Circling Back to State Weaknesses

Ending the interview as soon as the clock allows, without proactively saying "here's what I'd improve" or "here's what breaks first at 10× scale," wastes a free opportunity to demonstrate self-awareness — a trait that distinguishes senior from junior performance.

**Fix:** Always reserve the last few minutes for [Step 5 — Wrap Up](./how-to-approach-system-design-interview.md#step-5--wrap-up-5-min): name the design's weakest point and what you'd change at 10× scale.

---

← [Back to Interview Prep](./README.md)
