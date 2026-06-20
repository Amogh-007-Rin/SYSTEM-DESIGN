# Module 13 — Interview Prep: Defending a Consistency Model Choice

## Why This Matters

Almost no system design interview asks "what is the CAP theorem?" in isolation — it asks you to *use* it: "this database needs to survive a region outage, what do you do?" or "two users edit the same cart at the same time, what happens?" Interviewers are listening for whether you treat consistency as a deliberate, scoped decision (different fields can legitimately need different guarantees) rather than a single global setting you pick once and apply everywhere.

---

## A Framework for "Which Consistency Model Would You Choose Here?"

1. **Identify what's actually at stake on a conflicting or stale read.** Is it money, a unique resource (a seat, a username), or something tolerant of staleness (a view count, a "last seen" timestamp)? The cost of being wrong drives the entire decision.
2. **State the CAP trade-off explicitly for this specific data**, not for the whole system. A single system can legitimately be CP for inventory counts and AP for product view counts simultaneously, with different storage/tables for each.
3. **Name the consistency model on the spectrum**, not just "strong" or "eventual." Say "linearizable reads on the balance field" or "read-your-writes is enough for the profile editor," not just "we'll make it consistent."
4. **If you're choosing AP, name your conflict resolution strategy** — LWW, vector clocks plus an app-level merge UI, or a CRDT — and be honest about what each one costs (LWW can silently drop data; CRDTs require modeling the data as a CRDT-compatible structure, which isn't always natural).
5. **If you're choosing CP, name what happens to the minority side of a partition** — does it error, queue writes for later replay, or redirect to the majority side? "It just becomes unavailable" is true but incomplete; a strong answer says what the user actually experiences.
6. **Walk through at least one concrete failure scenario** (a partition, a leader crash, two concurrent writes) and trace what your chosen model actually does, step by step. This is the part interviewers are checking for — many candidates can name CAP but freeze when asked to trace an actual partition through their own design.

> 🎯 **Interview Tip:** The strongest signal you can give is scoping: "the cart line items can be AP with a CRDT merge, but the final checkout total must be linearizable because double-charging a card is unacceptable." Treating the whole system as one consistency decision is the single most common weakness in this topic's interview answers.

---

## What Interviewers Are Listening For

- Do you understand that "pick two of three" is a misleading way to state CAP, and can you correct it precisely (partition tolerance isn't optional)?
- Can you name a *specific* consistency model on the spectrum (not just "strong" vs. "eventual") for the specific field in question?
- Do you treat conflict resolution as a real design decision with a real cost (LWW's silent data loss vs. a CRDT's modeling overhead), rather than hand-waving "we'll just merge them"?
- Can you trace a concrete failure scenario (a partition, a leader election) through your own proposed design, rather than only being able to explain the theory in the abstract?
- Do you know when consensus (Raft/Paxos) is actually necessary versus when it's overkill for data that would be fine as a CRDT or under a weaker model?

---

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Would you choose a CP or AP database for this system, and why?").
