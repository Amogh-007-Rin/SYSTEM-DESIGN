# Module 12 — Further Reading

- **"Time, Clocks, and the Ordering of Events in a Distributed System" (Leslie Lamport, 1978)** — the original paper introducing logical clocks and the happened-before relation; short, foundational, and the direct source for [Coding Challenge 01](../04-exercises/coding-challenges/challenge-01/).
- **"The Fallacies of Distributed Computing" (Peter Deutsch, 1994; extended by James Gosling)** — the original short list this module's [01-concepts](../01-concepts/README.md#the-8-fallacies-of-distributed-computing) is built on. Widely reproduced; searching the exact title surfaces the canonical text alongside Sun Microsystems' original framing.
- **"How to do distributed locking" (Martin Kleppmann, 2016, martin.kleppmann.com)** — the widely-read critique of Redlock's safety guarantees under clock and process-pause assumptions, and the origin of the fencing-token argument covered in [02-deep-dive](../02-deep-dive/README.md#distributed-locking-and-the-redlock-controversy).
- **"Is Redlock safe?" (antirez / Salvatore Sanfilippo, 2016, antirez.com)** — Redis's creator's direct rebuttal to Kleppmann's critique, defending Redlock's practical guarantees. Read both posts together; the disagreement itself is the most instructive part.
- **"Dynamo: Amazon's Highly Available Key-value Store" (DeCandia et al., 2007)** — the paper that popularized leaderless replication, quorum reads/writes (R+W>N), gossip-based membership, and vector clocks for conflict detection, all in one production system. Directly underlies the quorum and gossip material in [02-deep-dive](../02-deep-dive/README.md).
- **"Designing Data-Intensive Applications" (Martin Kleppmann, O'Reilly, 2017)** — Chapters 5 (Replication), 8 (Trouble with Distributed Systems), and 9 (Consistency and Consensus) cover this entire module's material — clocks, ordering, quorums, 2PC, and the path to consensus — in far more depth, with the same rigor this module aims for.

---

→ Continue to [Module 13 — Consistency, Consensus & CAP Theorem](../../module-13-consistency-consensus/).
