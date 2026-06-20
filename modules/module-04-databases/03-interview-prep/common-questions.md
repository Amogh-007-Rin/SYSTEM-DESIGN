# Module 04 — Common Interview Questions

**Q1: What's the actual difference between SQL and NoSQL, beyond "NoSQL scales better"?**
SQL databases enforce a fixed schema and support ad-hoc queries/JOINs across normalized tables, with strong consistency by default. NoSQL is an umbrella for several different data models (key-value, document, wide-column, graph), each optimized for a specific access pattern, generally trading some query flexibility or consistency for schema flexibility or write throughput. Neither universally "scales better" — they scale differently, for different workloads.

**Q2: Why would adding an index ever be a bad idea?**
Every index speeds up reads that use it but slows down every write to that table (since the index itself must be updated) and consumes additional storage. A table with ten rarely-useful indexes can have meaningfully worse write throughput than the same table with two well-chosen ones.

**Q3: What's the N+1 query problem, and how do you fix it?**
It's running one query to fetch a list of N items, then N additional queries (one per item) to fetch related data — common with ORMs that lazily load associations. The fix is to fetch the related data in a single batched query (`WHERE id IN (...)`) or a JOIN, instead of looping.

**Q4: When would you choose asynchronous replication over synchronous?**
When write latency matters more than the small risk of losing the most recent writes if the leader crashes before they replicate. Synchronous replication guarantees no data loss on leader failure but adds the replica's round-trip latency to every write; asynchronous acknowledges immediately and accepts a small durability risk window.

**Q5: How does consistent hashing solve the resharding problem?**
Naive `hash(key) % N` sharding remaps nearly every key when `N` changes, requiring a massive data migration. Consistent hashing places both nodes and keys on a hash ring; adding or removing a node only remaps the keys between that node and its neighbor on the ring, not the whole keyspace.

**Q6: What's the difference between normalization and denormalization, and when do you denormalize?**
Normalization eliminates redundant data by splitting it across related tables, reducing update anomalies at the cost of needing JOINs to reassemble a full view. Denormalization intentionally duplicates data to avoid those JOINs at read time — typically applied to a specific read path once it's identified as a bottleneck, not applied wholesale to the schema from the start.

**Q7: What does "Read Committed" isolation actually guarantee, and what doesn't it guarantee?**
It guarantees you never see another transaction's uncommitted (dirty) data. It does NOT guarantee that re-reading the same row within your own transaction returns the same value (another transaction's committed change can appear between your two reads) — that's what Repeatable Read additionally protects against.

**Q8: Why is sharding harder to undo than to set up?**
Once data is split across shards by a chosen key, queries, application code, and operational tooling are all built assuming that partitioning. Changing the shard key later requires migrating live data across shards while keeping the system available — exactly the kind of expensive, risky migration [Module 04's deep dive](../02-deep-dive/README.md) on the expand-contract pattern is designed to make safer, but it's never as simple as the original sharding decision was.
