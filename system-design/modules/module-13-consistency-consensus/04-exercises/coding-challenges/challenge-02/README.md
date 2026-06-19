# Coding Challenge 02: Simplified Raft Leader Election

## Problem Statement

Implement a simplified Raft leader election in TypeScript — **no log replication, just election.** Simulate a fixed cluster of `RaftNode`s, each starting as a follower, and implement the state machine (`follower` → `candidate` → `leader`) driven by randomized election timeouts and majority `RequestVote` responses, until the cluster converges on exactly one leader.

This is the same mechanism described in [`02-deep-dive/README.md`](../../../02-deep-dive/README.md#leader-election), now made concrete: you'll implement the timeout, the candidacy, the vote-granting rule, and the majority check yourself.

> 📊 **Diagram:** `raft-leader-election.drawio` — Shows a 5-node cluster: one follower's election timeout fires first, it becomes a candidate, sends RequestVote to the other 4, receives 3 votes (a majority of 5), and transitions to leader while the others remain followers.

## Requirements

1. **State machine** — each `RaftNode` is `follower`, `candidate`, or `leader`.
2. **Randomized election timeout** — each node schedules a timeout in `[minTimeoutMs, maxTimeoutMs]` (default 150–300ms, matching real Raft's commonly cited range). If it fires with no leader heartbeat received, the node becomes a candidate.
3. **Candidacy** — becoming a candidate means: increment `term`, vote for self, send `RequestVote` to every peer, and tally results.
4. **Vote granting** — a node grants at most one vote per term, to the first candidate it hears from in that term; if a peer's term is higher than its own, it must first adopt that higher term and clear its previous vote before evaluating the request.
5. **Majority check** — a candidate that collects votes (including its own) from a majority of the cluster becomes leader for that term and starts sending heartbeats (simulated as directly resetting peers' election timers) to suppress new elections.
6. **Split-vote handling** — if no candidate reaches a majority in a term (a split vote, or peers that already voted for someone else), the candidate must **not** crash or hang — it stays a candidate (or steps down if it sees a higher term) and waits for its election timer to re-fire and retry with a fresh, re-randomized timeout. This self-healing retry is what guarantees the cluster eventually elects someone, even if an early round splits.

## Why Randomization Matters Here

If every node used the *same* fixed timeout, every follower would become a candidate simultaneously on every retry, splitting the vote identically every single time — the cluster could deadlock indefinitely. Drawing each timeout independently at random makes it overwhelmingly likely that exactly one node's timer fires meaningfully before the others notice, letting that one node win cleanly most of the time, and guaranteeing that even a split vote resolves within a few retries since each retry's timeouts are redrawn independently.

## Starter / Solution

- [`starter.ts`](./starter.ts) — `RaftNode` skeleton with `startElectionTimer`, `resetElectionTimer`, `becomeCandidate`, `handleRequestVote`, and `becomeLeader` left as `TODO`s (type-checks cleanly; throws `"Not implemented"` at runtime by design)
- [`solution.ts`](./solution.ts) — complete working simulation of a 5-node cluster

## Usage Example

```bash
npx ts-node starter.ts    # type-checks; throws "Not implemented" until you implement it
npx ts-node solution.ts   # runs a full election to completion
```

Expected output (non-deterministic which node wins, deterministic that exactly one does): the simulation starts a 5-node cluster, lets all nodes' election timers run, logs which node times out first and becomes a candidate, logs the vote tally, and after ~3 seconds prints the final state of all 5 nodes — exactly one should be `leader`, the rest `follower`. If you run it repeatedly, you may occasionally see a "no majority — will retry on next timeout" line if two nodes' randomized timeouts land close enough together to split the vote; the simulation should still converge to exactly one leader on a subsequent retry.

> ⚠️ **Warning:** Don't treat a "no majority" log line as a failure — by Raft's design, a split vote is an expected, self-healing event, not a bug. The test that matters is the *final* state after the simulation settles: exactly one leader, everyone else a follower.

## Related Reading

This exercise is the hands-on companion to the consensus and Raft sections of [`02-deep-dive/README.md`](../../../02-deep-dive/README.md#raft-a-detailed-walkthrough).
