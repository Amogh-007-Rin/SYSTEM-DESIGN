# Module 13 — Concepts: CAP Theorem and the Consistency Trade-off

## Why This Matters

Imagine a payments system with database nodes in São Paulo and Frankfurt. A transatlantic fiber cut severs them for forty seconds — a routine event, not a disaster. A customer in São Paulo tries to check their balance. What should the São Paulo node do? It cannot reach Frankfurt to confirm it has the latest write. It has exactly two options: answer with the data it has (which might be stale) or refuse to answer until the network heals. There is no third option where it magically gets both a guaranteed-correct answer and an immediate response. That forced choice, repeated at every node in every distributed system whenever a partition occurs, is the entire content of the CAP theorem — and it's why "should this database block or answer?" is one of the most consequential design decisions you can make.

This module is the theoretical foundation for almost every distributed data store discussed elsewhere in this repository: [Module 04's](../../module-04-databases/) replication strategies, [Module 09's](../../module-09-storage/) storage engines, and [Module 12's](../../module-12-distributed-systems/) failure handling all eventually run into the same wall. Understanding CAP and its refinements is what lets you explain *why* Cassandra and HBase made opposite choices, instead of just memorizing that they did.

---

## CAP Theorem: Formal Definition

The CAP theorem (Brewer's conjecture, formally proven by Gilbert & Lynch in 2002) states that a distributed data store can provide at most **two** of the following three guarantees **simultaneously, during a network partition**:

- **Consistency (C)** — every read receives the most recent write or an error. This is *linearizability*, not the "C" in ACID — every node that answers must agree, as if there were only one copy of the data.
- **Availability (A)** — every request to a non-failing node receives a (non-error) response, without guaranteeing it contains the most recent write.
- **Partition Tolerance (P)** — the system continues to operate despite an arbitrary number of messages being dropped or delayed between nodes.

> 💡 **Note:** "Partition" here means a network partition — nodes that are each individually healthy but cannot communicate with each other — not a database sharding partition. The terminology collision trips up a lot of people on first exposure.

---

## Why CAP Is Often Misunderstood

The popular shorthand "pick two of three" is wrong, and it's worth being precise about why. **Partition tolerance is not optional** — in any real distributed system, the network *will* drop or delay messages eventually. You don't get to choose whether partitions happen; you only get to choose what your system does *when* one happens. So the real choice CAP describes is:

> **When a partition occurs, do you sacrifice Consistency or Availability?**

That's it. There is no scenario where you keep both C and A *during* a partition — that combination (CA) only exists in a world without partitions, which is not the world distributed systems live in. This reframes CAP from "pick 2 of 3 attributes" to "decide your failure-mode behavior in advance."

> ⚠️ **Warning:** A common interview mistake is saying "we chose CA" for a multi-node system. CA is not a real option for anything that spans more than one node connected by an unreliable network — at best you've chosen CP or AP and just haven't hit a partition yet to find out which.

---

## CP Systems: Consistency Over Availability

A **CP** system refuses to serve requests it cannot guarantee are consistent once partitioned, returning an error or blocking instead.

**Examples:** HBase (a region server unreachable from its required quorum of the cluster won't serve writes for that region), ZooKeeper (designed explicitly to sacrifice availability — a minority partition can't process writes at all), Etcd (built on Raft consensus, the same trade-off).

**What they sacrifice:** availability during a partition. A minority-side node (or a node that can't reach a quorum) will reject reads and writes rather than risk serving stale or conflicting data. This is the right choice when *being wrong* is worse than *being unavailable* — for example, ZooKeeper coordinating distributed locks: a stale lock state could mean two processes believe they hold the same lock simultaneously, which is far worse than one process briefly failing to acquire any lock at all.

---

## AP Systems: Availability Over Consistency

An **AP** system keeps answering requests during a partition, even if that means returning data that hasn't yet converged across all replicas.

**Examples:** Cassandra (tunable consistency, but its default posture favors availability — any reachable replica answers), DynamoDB in its AP configuration (eventually consistent reads by default), CouchDB (multi-master replication that resolves conflicts after the fact).

**What they sacrifice:** consistency during a partition. Two replicas on opposite sides of a split can each accept writes, and those writes can conflict — the system must reconcile them later (see conflict resolution in [02-deep-dive](../02-deep-dive/README.md)). This is the right choice when *availability* matters more than *up-to-the-millisecond correctness* — a shopping cart that lets you keep adding items during a partition, reconciling duplicate adds afterward, is far better than a cart that refuses to let you shop at all.

---

## CA Systems: Only Possible Without Partitions

A **CA** system is consistent and available, but only because it has defined away the possibility of a partition — typically because it's a **single-node system** (a traditional RDBMS instance with no replicas) or a tightly coupled cluster where the network between nodes is treated as infallible (which it never truly is, but the failure mode is "the whole system goes down," not "the system splits into two functioning halves with different views").

> 🎯 **Interview Tip:** If asked to classify a single-node PostgreSQL or MySQL instance, "CA" is the correct, defensible answer — *because there's nothing to partition*. The instant you add a second node for replication or failover, you've reintroduced the possibility of a partition, and you're back to choosing CP or AP for what happens when it occurs.

---

## PACELC: CAP's Sequel

CAP only describes behavior **during a partition**. PACELC (Abadi, 2010) extends it by pointing out that even when there's **no partition**, every distributed system still makes a latency-vs-consistency trade-off on every request:

> **If Partitioned: Availability or Consistency? Else: Latency or Consistency?**

In normal operation (no partition), do you wait for all replicas to acknowledge a write before confirming it (favoring consistency, at the cost of latency — every write waits for the slowest replica), or do you confirm immediately and replicate asynchronously (favoring latency, at the cost of letting a reader see stale data even with no partition in sight)? Cassandra is PA/EL — available during a partition, low-latency normally. A system using synchronous multi-region replication is typically PC/EC — consistent in both regimes, paying a latency tax for it constantly, not just during failures.

> 📊 **Diagram:** `cap-theorem.drawio` — Shows the three CAP properties as a triangle with the "pick 2 of 3" framing crossed out, replaced by a partition-event timeline branching into the CP path (block/error) and AP path (serve possibly-stale data), with PACELC's added normal-operation latency/consistency fork shown alongside it.

A worked TypeScript simulation of exactly this branch point — what a CP node does vs. what an AP node does when a partition is simulated — is in [`examples/cap-simulation.ts`](./examples/cap-simulation.ts).

---

## Key Takeaways

- CAP is not "pick 2 of 3" — partition tolerance isn't optional, so the real choice is CP vs. AP *specifically during a partition*; CA only exists for systems with no partition to survive (single-node).
- CP systems (ZooKeeper, Etcd, HBase) sacrifice availability — they'd rather error than risk an inconsistent answer.
- AP systems (Cassandra, DynamoDB in AP mode, CouchDB) sacrifice consistency — they keep answering and reconcile divergence later.
- PACELC adds the trade-off CAP leaves out: even with zero partitions, you're still choosing between latency and consistency on every write.
- There's no universally "correct" choice — it depends on whether *being wrong briefly* or *being unavailable briefly* is more costly for the specific data in question.
