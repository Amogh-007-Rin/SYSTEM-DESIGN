# Sample Answer: "Design a Leader Election Mechanism for a 5-Node Cluster"

> A fully worked deep-dive answer, building on the leader election basics from [01-concepts](../01-concepts/README.md#leader-election) and the clocks/ordering material from [02-deep-dive](../02-deep-dive/README.md).

---

## Clarify the Failure Model First

Before designing anything, state the assumption out loud: this design assumes **crash and omission failures only** — nodes can stop responding or have messages dropped/delayed, but no node behaves maliciously or sends contradictory answers to different peers (Byzantine failures). That assumption is what makes a majority-vote-based protocol sufficient; if malicious nodes were in scope, the bar would jump to Byzantine fault-tolerant consensus (3f+1 nodes to tolerate f malicious ones), which is a different and much more expensive design.

## Core Requirements

1. Exactly one node believes it's the leader at any given time (or, more precisely, at any given **term** — see below) under normal operation.
2. If the leader crashes, the cluster detects this and elects a new leader within a bounded time window.
3. A leader that becomes partitioned away (not actually crashed) must not be able to keep acting as leader once a new leader has been legitimately elected — and the cluster must reject the stale leader's messages if it resurfaces.
4. With 5 nodes, the system should tolerate up to 2 simultaneous node failures and still be able to elect a leader (majority of 5 is 3; 2 nodes down still leaves 3 reachable).

## The Mechanism

### 1. Terms (Epochs)

Every node tracks a `currentTerm`, starting at 0. An election always increments the term of the node starting it. Every message (vote request, heartbeat) carries the sender's term. **Rule: any node that sees a higher term than its own immediately adopts it and reverts to follower state.** This is what lets the cluster always converge on the most recent legitimate leader and reject anything from an older term — including a partitioned-away former leader that resurfaces still believing it's in charge.

### 2. Heartbeats and Election Timeouts

The leader sends periodic heartbeats (e.g., every 50ms) to all 4 followers. Each follower resets a randomized election timeout (e.g., 150-300ms, randomized specifically to avoid multiple followers timing out simultaneously and splitting the vote) on every heartbeat received. If a follower's timeout fires without a heartbeat, it assumes the leader is gone — crashed or partitioned away, it cannot tell which, and it doesn't need to — and starts an election.

> 💡 **Note:** The randomized timeout window is a small detail with an outsized effect: without it, all followers tend to time out at close to the same instant after a leader failure, all become candidates simultaneously, split the vote among themselves, and have to retry — repeatedly, in the worst case. Randomization makes it overwhelmingly likely exactly one follower times out first and wins cleanly.

### 3. Becoming a Candidate and Requesting Votes

The timed-out follower increments its term, transitions to candidate, votes for itself, and sends a `RequestVote(term, candidateId)` to the other 4 nodes. Each recipient grants its vote if and only if: (a) the request's term is `>=` its own current term, and (b) it hasn't already voted in that term. Condition (b) is what makes "majority" meaningful — each node casts at most one vote per term, so two different candidates cannot both win a majority of the same fixed 5-vote pool in the same term.

### 4. Majority and Becoming Leader

With 5 nodes, a candidate needs **3 votes** (including its own) to become leader. Once it has 3, it transitions to leader and immediately starts sending heartbeats — this is the signal that ends the election and tells every follower who's now in charge for this term.

### 5. Handling the Resurfacing Stale Leader

If the old leader was merely partitioned away (not crashed) and the partition heals, it will try to send a heartbeat carrying its old term. Every follower that has already adopted a higher term (from the new election) rejects this heartbeat outright — and the old leader, upon receiving any response carrying a higher term than its own (or simply trying to replicate and getting rejected), immediately steps down to follower and adopts the higher term. This is the exact mechanic implemented and demonstrated end-to-end in [`01-concepts/examples/leader-election.ts`](../01-concepts/examples/leader-election.ts).

> ⚠️ **Warning:** A design that stops at "heartbeats trigger re-election" without this stale-leader-rejection step is incomplete — it's the part of the design that actually prevents split-brain leadership, and interviewers specifically probe for it by asking "what if the old leader wasn't really dead?"

## Why Not Just Pick the Node With, e.g., the Lowest ID?

A static rule (lowest ID wins) avoids the vote entirely, but it doesn't solve the actual problem: it still needs *failure detection* (how does the cluster know the current "lowest ID" node is down?) and it still needs a way to prevent two nodes from both believing they're leader during a partition. A static rule just relocates the hard part rather than removing it — the vote-based mechanism is what's actually doing the safety work.

## What This Design Deliberately Leaves Out

This is a basic majority-vote election, not a full consensus protocol. It does not (by itself) guarantee that a newly elected leader has every committed write the previous leader had — that additional guarantee (log replication consistency across elections) is exactly what Raft and Paxos add on top of this same heartbeat/term/majority-vote skeleton, covered in [Module 13 — Consistency, Consensus & CAP Theorem](../../module-13-consistency-consensus/). Naming this boundary explicitly in an interview is itself a strong signal — it shows you know where "basic leader election" ends and "full consensus" begins.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Failure model | Crash/omission only, no Byzantine tolerance | Much simpler and cheaper than BFT consensus; unsafe if a node can be malicious |
| Timeout randomization | Randomized election timeout window | Prevents split votes from simultaneous timeouts; adds slight unpredictability to failover time |
| Majority size (5 nodes) | Requires 3/5 votes | Tolerates 2 node failures; a 3rd simultaneous failure makes the cluster unable to elect anyone |
| Term-based rejection | Every node adopts the highest term it's seen | Cleanly resolves stale-leader resurfacing; adds a small amount of bookkeeping per node |
