# Module 09 — Storage Systems: Summary

> This module covered the storage layer underneath every system: block, object, and file storage and when each fits; how object stores like S3 achieve massive scale and durability; how distributed file systems like GFS/HDFS organize huge datasets across many machines; and how database storage engines (LSM trees vs. B-trees) trade off read and write performance at the lowest level.

---

## Key Concepts

1. **Block storage** — raw, fixed-size disk blocks mounted as a volume; the right fit for databases and anything needing low-latency random reads/writes under direct OS control.
2. **File storage** — a hierarchical, POSIX-style namespace shared over the network (NFS/EFS); fits multiple servers needing shared mutable file access.
3. **Object storage** — immutable blobs plus metadata addressed by a flat key namespace (S3); trades POSIX semantics for near-infinite horizontal scale.
4. **GFS / HDFS** — distributed file systems that split huge files into large replicated chunks, tracked by a centralized master/NameNode, optimized for large sequential I/O.
5. **LSM tree** — a write-optimized storage engine: writes land in an in-memory memtable, flush sequentially to immutable SSTables, and a background compaction process merges them over time.
6. **B-tree** — a read-optimized storage engine that updates a single sorted, balanced structure in place; the default index/storage structure in PostgreSQL and MySQL.
7. **Storage tiering** — matching storage cost to access frequency (hot/warm/cold), usually automated via lifecycle policies as data ages.
8. **Durability vs. availability** — durability is "the bytes are never lost" (S3's 11 nines); availability is "the service can be reached right now" (S3's ~99.99%) — distinct guarantees, often confused.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Storage category | Object storage | Block storage | Write-once, read-many, whole-object access at huge scale (images, video, backups) | Need low-latency random byte-level reads/writes (databases, boot volumes) |
| Storage engine | LSM tree | B-tree | Write-heavy workload (logging, time-series, event ingestion) | Read-heavy workload with complex queries and range scans |
| Compression algorithm | LZ4 / Snappy | gzip / zstd | Latency-sensitive hot path (LSM SSTable writes) | Storage/bandwidth cost matters more than CPU latency (archival) |
| Metadata architecture | Single centralized master (GFS/HDFS) | Sharded/federated metadata | Simplicity, no consensus protocol needed for ordinary ops | Namespace too large for one machine's memory |
| Consistency model | Eventually consistent | Strongly consistent | Maximizing availability/scale across replicas (classic object stores) | Application correctness requires immediate read-after-write visibility |

---

## Common Interview Questions from This Module

- When would you choose block storage over object storage, and why?
- What's the core difference between an LSM tree and a B-tree as a storage engine, and when would you pick each?
- AWS advertises "11 nines" of durability for S3 — what does that mean, and how does it differ from availability?
- How does a CDN relate to an object store like S3 — are they redundant?
- Why do GFS and HDFS centralize metadata in a single master, and what are the risks of that choice?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Memtable → SSTable → compaction (LSM tree) | Converts random writes into sequential disk I/O for high write throughput |
| Presigned upload URLs | Lets clients upload directly to object storage without proxying large transfers through application servers |
| Metadata/blob separation | Keeps small, frequently-queried metadata in a fast database while bulk bytes live in storage optimized for size and durability |
| Chunking + replication (GFS/HDFS) | Distributes huge files across many machines while tolerating individual node failure as the normal case |
| Storage tiering with lifecycle policies | Automatically moves aging, rarely-accessed data into cheaper storage classes |
| Checksums + redundancy | Detects data corruption and enables self-healing recovery from a healthy replica |

---

## What This Unlocks

After this module, you can tackle:
- [Module 10 — CDN](../module-10-cdn/), which builds directly on the object-storage-as-origin model covered here
- [Module 13 — Consistency & Consensus](../module-13-consistency-consensus/), which formalizes the eventual-consistency trade-offs introduced here
- Storage-heavy interview prompts like "design Instagram," "design Dropbox," or "design a distributed file system," all of which reduce to the block/object/file and metadata/blob decisions covered in this module

---

## Quick Reference

- **Block** = raw disk blocks, OS-managed filesystem on top. **File** = shared POSIX namespace over the network. **Object** = immutable blob + metadata, flat key namespace, HTTP API.
- **LSM tree**: fast writes (sequential flush), slower reads (check memtable + multiple SSTables), needs compaction. **B-tree**: fast reads (one structure), slower random writes (in-place update).
- S3's "11 nines" = durability (data never lost). "99.99%" = availability (service reachable now). Different guarantees.
- GFS/HDFS: large chunks + replication + one centralized master for metadata = simple consistency model, but a SPOF/scale ceiling that HA standbys and federation address.
- Compression: LZ4/Snappy = fast, lower ratio. gzip/zstd = slower, higher ratio. Pick based on whether latency or storage cost dominates.
- Tiering: hot (frequent access, fast/expensive) → warm (occasional, cheaper) → cold/archive (rare, cheapest, slow retrieval) — automate with lifecycle rules.

---

← [Previous Module ← Module 08 — Message Queues](../module-08-message-queues/) | [Next Module → Module 10 — CDN](../module-10-cdn/)
