# Module 06 — Further Reading

- **"Designing Data-Intensive Applications" by Martin Kleppmann (O'Reilly, 2017)** — the single best book-length treatment of scalability, reliability, and the trade-offs covered in this module's deep dive (replication, partitioning/sharding, consistency models); Chapters 5 and 6 map almost directly onto this module's topics.
- **AWS Well-Architected Framework — Performance Efficiency Pillar** (docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar) — a vendor-neutral-in-spirit, practically grounded discussion of scaling patterns, including when to scale vertically vs. horizontally.
- **Kubernetes documentation — "Horizontal Pod Autoscaling"** (kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) — the authoritative reference for how HPA actually computes target replica counts, directly relevant to the auto-scaling section of [02-deep-dive](../02-deep-dive/README.md).
- **"Scalability, Availability, Stability, Patterns" by Jonas Bonér** (the classic conference talk and accompanying slide deck on patterns for scaling distributed systems) — widely cited for crisply naming patterns like bulkheading and circuit breakers alongside scaling concerns.
- **Gunther, N. — "Guerrilla Capacity Planning"** (the book that popularized using Amdahl's Law and the Universal Scalability Law for real-world capacity planning) — a deeper, more rigorous treatment of the speedup-vs-workers math introduced in [01-concepts](../01-concepts/README.md).
- **Little, J.D.C. — "A Proof for the Queuing Formula: L = λW" (Operations Research, 1961)** — the original paper proving the formula this module uses for concurrency planning; short, and a good example of a foundational CS/operations-research result still load-bearing in everyday system design.
- **High Scalability (highscalability.com)** — a long-running blog aggregating real "how we scaled X" architecture write-ups from engineering teams across many companies, useful for grounding this module's abstract patterns in concrete, named systems.

→ Continue to [Module 07 — Load Balancing](../../module-07-load-balancing/).
