# CAP Theorem — Quick Reference

> Full treatment in [Module 13 — Consistency, Consensus & CAP Theorem](../modules/module-13-consistency-consensus/). This page is a fast lookup, not a tutorial.

---

## The Triangle

```
                 Consistency
                     ▲
                    / \
                   /   \
                  /     \
                 /   ?   \
                /         \
               ▼───────────▼
        Availability   Partition
                        Tolerance
```

You cannot have all three simultaneously **during a network partition**. Outside of a partition, all three are achievable — the theorem only bites when the network actually breaks.

---

## Definitions

| Property | Meaning |
|---|---|
| **Consistency (C)** | Every read receives the most recent write or an error. (This is linearizability, not the "C" in ACID.) |
| **Availability (A)** | Every request receives a non-error response, without guarantee it contains the most recent write. |
| **Partition Tolerance (P)** | The system continues to operate despite an arbitrary number of dropped or delayed messages between nodes. |

> ⚠️ **Warning:** "Pick two of three" is the most common misstatement of CAP. Partition tolerance isn't optional in a real distributed system — networks *will* partition. The actual choice is: **when a partition happens, do you sacrifice consistency (stay AP) or availability (become CP)?**

---

## CP Systems (sacrifice Availability during a partition)

| System | Notes |
|---|---|
| HBase | Strongly consistent region servers; unavailable for a region during partition |
| ZooKeeper | Quorum-based; minority partition can't serve writes |
| etcd | Raft-based; same quorum trade-off |
| MongoDB (strong read concern) | Configurable, but default majority writes favor consistency |

## AP Systems (sacrifice Consistency during a partition)

| System | Notes |
|---|---|
| Cassandra | Tunable consistency, but defaults favor availability with eventual consistency |
| DynamoDB (default mode) | Eventually consistent reads by default; strong reads available but cost more |
| CouchDB | Multi-master, conflict resolution on read |

## "CA" Systems

True CA only exists where partitions are physically impossible — a **single-node** database. The moment you replicate across two machines connected by a network, partition tolerance becomes mandatory and CA stops being an option.

---

## PACELC — The Other Half of the Story

CAP only describes behavior **during a partition**. PACELC adds: **if there is no partition (E — Else), do you trade Latency for Consistency?**

> **P**artition → **A**vailability or **C**onsistency; **E**lse → **L**atency or **C**onsistency

| System | PACELC Classification |
|---|---|
| Cassandra | PA/EL — available during partition, low latency normally (weaker consistency) |
| PostgreSQL (single primary, sync replicas) | PC/EC — consistent during partition (blocks), consistent normally (higher latency) |
| DynamoDB | PA/EL by default, PC/EC available via strongly consistent reads |

---

## Choosing in Practice

- **Choose CP when**: correctness of a single write matters more than uptime — financial ledgers, inventory counts, leader election, configuration stores.
- **Choose AP when**: the system must stay responsive even if some replicas are stale — social feeds, view counters, shopping carts (with conflict resolution), presence systems.

See also: [Module 13 concepts](../modules/module-13-consistency-consensus/01-concepts/README.md) for the full consistency models spectrum, and [database-comparison.md](./database-comparison.md) for where each database lands.
