# Module 09 — Deep Dive: LSM Trees, S3 Internals, and Storage Reliability

## Why This Matters

Knowing that "LSM trees are good for writes" or "S3 is durable" is trivia until you can explain *why* — and the *why* is what separates a candidate who memorized vocabulary from one who can design a storage system under pressure. This deep dive opens the internals: how an LSM tree turns random writes into sequential ones, how a system advertises "11 nines" of durability without that number being marketing, and the operational layer (RAID, compression, checksums, tiering) every real storage system needs regardless of which model it's built on.

---

## LSM Tree Internals

A Log-Structured Merge tree is built from three cooperating pieces:

1. **Memtable** — an in-memory sorted structure (skip list or balanced tree) that absorbs every write first. Writes here are extremely fast since they never touch disk synchronously beyond an append to a write-ahead log (for crash recovery).
2. **SSTables (Sorted String Tables)** — once the memtable fills past a size threshold, it's flushed to disk as a new, immutable, sorted file. Because the memtable was already sorted, the flush is a single large **sequential** write — the main reason LSM trees are fast for write-heavy workloads: sequential I/O is dramatically cheaper than random I/O, especially on spinning disks, and still meaningfully cheaper on SSDs.
3. **Compaction** — many SSTables accumulate over time (one per flush), and the same key may exist in several with different values (newest write wins). A background compaction process periodically merges SSTables into fewer, larger ones, discarding overwritten/deleted entries and bounding how many files a read must check.

**Reads** check the memtable first (newest data), then SSTables newest-to-oldest, stopping at the first match — which is why a read can be slower than a write here: an old, untouched key might require checking several SSTables. Real implementations (RocksDB, Cassandra) mitigate this with per-SSTable **Bloom filters** (cheaply skip SSTables that provably lack the key — the same structure covered in [Module 05's bloom filter exercise](../../module-05-caching/02-deep-dive/examples/bloom-filter.ts)) and **sparse indexes** that let a lookup jump close to the right offset instead of scanning the whole file.

> 📊 **Diagram:** `lsm-tree-structure.drawio` — Shows writes flowing into the memtable, periodic flushes producing immutable SSTables on disk, a background compaction merging older SSTables, and a read path checking the memtable then SSTables newest-first.

> ⚠️ **Warning:** Compaction isn't free — it consumes disk I/O and CPU in the background, and a poorly-tuned compaction strategy under heavy write load can cause "write stalls" where writes briefly block because compaction can't keep up with the rate new SSTables are being created. This is a real operational failure mode in Cassandra and RocksDB deployments, not a theoretical concern.

A hands-on simulation of the memtable → SSTable → compaction → read path is in [`examples/lsm-tree-simulator.ts`](./examples/lsm-tree-simulator.ts).

---

## How S3 Works Internally (High Level)

S3 doesn't publish its exact internal architecture, but the publicly described model is informative for system design purposes:

- **Replication for durability**: every object is replicated across multiple devices, in multiple facilities, within a region. AWS advertises "11 nines" (99.999999999%) of annual durability — meaning if you stored 10,000,000 objects, you'd statistically expect to lose one object roughly every 10,000 years. This comes from the combination of replica count and independent failure domains (different racks, different facilities) — losing an object requires multiple independent failures before re-replication can repair the loss.
- **Durability vs. availability are different numbers**: durability (11 nines) is about *never losing the bytes*; availability (S3 Standard advertises ~99.99%) is about *the service being reachable right now*. A system can be extremely durable (data is safe) while briefly unavailable (a request times out) — separate guarantees, separate SLAs, and conflating them is a common interview mistake.
- **Eventual consistency model**: historically, S3 was the textbook example of eventual consistency — a write might not be immediately visible from a read against a different internal replica, especially for overwrites or list operations shortly after a write. AWS announced **strong read-after-write consistency for all operations** in December 2020 — but understanding the eventually-consistent model still matters, since many other distributed stores (and S3-compatible alternatives) still work this way. [`examples/object-store-eventual-consistency.ts`](../01-concepts/examples/object-store-eventual-consistency.ts) simulates exactly this replication window.

> 🎯 **Interview Tip:** If asked "is S3 strongly or eventually consistent?", the precise answer is: "S3 itself has offered strong read-after-write consistency since December 2020, but you should still design defensively for eventual consistency when working with other object stores or older systems, because the underlying replication-based architecture is the same."

---

## RAID Levels in a System Design Context

RAID (Redundant Array of Independent Disks) combines multiple physical disks into one logical volume — the layer underneath block storage, and a frequent quick interview tangent when discussing disk-level durability:

| RAID Level | How It Works | Trade-off |
|---|---|---|
| **RAID 0** | Striping — data split across disks, no redundancy | Fastest, but one disk failure loses everything; never used when durability matters |
| **RAID 1** | Mirroring — every disk is a full copy of another | Fast reads, survives a disk failure, but doubles storage cost for the same usable capacity |
| **RAID 5** | Striping with distributed parity | Good capacity efficiency, survives one disk failure, but rebuild is slow/IO-intensive and a second failure during rebuild loses data |
| **RAID 10** | Striped mirrors — RAID 0's speed plus RAID 1's redundancy | Best performance/redundancy balance, at RAID 1's 2x storage cost |

> 💡 **Note:** RAID protects against a *disk* failing — not data corruption, accidental deletion, or a whole datacenter going down. It's a building block for durability at one layer, not a replacement for backups or cross-region replication. Cloud block storage (EBS) typically already replicates underneath the abstraction you're given, which is why you rarely configure RAID yourself in the cloud.

---

## Data Compression in Storage

Compression trades CPU time for reduced storage size and (often) reduced network/disk I/O time, since fewer bytes need to move:

| Algorithm | Compression Ratio | Speed | Typical Use |
|---|---|---|---|
| **LZ4** | Lower | Extremely fast (both directions) | Real-time pipelines where compression CPU cost must stay negligible (e.g., LSM tree SSTables) |
| **Snappy** | Lower-moderate | Very fast | Same niche as LZ4 — used inside Cassandra, RocksDB, Hadoop/Parquet for speed over ratio |
| **gzip (DEFLATE)** | Higher | Slower | Archival data, HTTP response compression — storage/bandwidth cost matters more than CPU latency |
| **Zstandard (zstd)** | Tunable (rivals gzip's ratio at LZ4-like speed at low levels) | Fast, tunable | Default choice when you want to explicitly tune the speed/ratio trade-off |

> ⚠️ **Warning:** Compression is not free even when it's fast — it always costs CPU, and compressed data must be decompressed before use, adding latency to every read. Favor higher ratio (gzip/zstd) when storage/bandwidth cost dominates; favor speed (LZ4/Snappy) when latency dominates, or skip compression for already-hot, frequently-read data.

---

## Checksums and Data Integrity

Disks, networks, and memory can all silently corrupt bits — a checksum (CRC32, SHA-256) computed when data is written and re-verified on read is how a storage system catches this before serving corrupted bytes to a user. S3 checksums every object internally; HDFS verifies checksums on every block read and re-replicates from a healthy replica on a mismatch; database storage engines (B-tree and LSM alike) checksum their on-disk pages/SSTables so corruption is caught at read time instead of silently propagating.

> 💡 **Note:** A checksum detects corruption; it doesn't fix it. Detection only becomes self-healing when paired with redundancy — a second, presumably-uncorrupted replica to recover the correct data from — which is why checksums and replication are always discussed together in distributed storage design.

---

## Storage Tiering: Hot, Warm, and Cold

Not all data deserves the same storage cost. Storage tiering matches a data's access frequency to a storage class's cost/latency profile:

- **Hot** — frequently accessed, needs low latency (S3 Standard, an SSD-backed volume). Highest cost per GB.
- **Warm** — accessed occasionally, latency can be slightly higher (S3 Standard-IA). Lower cost, small retrieval fee.
- **Cold/Archive** — rarely accessed, retrieval can take minutes to hours (S3 Glacier, Glacier Deep Archive). Lowest storage cost by far, but real retrieval latency and fees.

Lifecycle policies automate moving objects between tiers by age or last-access time (e.g., "Standard-IA after 30 days, Glacier after 180") — optimizing cost without manual work, since access naturally cools over an object's life (a freshly uploaded photo is viewed heavily in its first days, then almost never again).

---

## Key Takeaways

- LSM trees get write speed by converting random writes into sequential ones (memtable → SSTable flush) and pay for it with potentially-multi-file reads, mitigated by Bloom filters and sparse indexes — and compaction is a real, tunable operational cost, not a background detail you can ignore.
- "11 nines" of durability and "99.99% availability" are different guarantees (data safety vs. service reachability) — don't conflate them in an interview.
- RAID protects against individual disk failure at one layer of the stack; it is not a substitute for backups, snapshots, or cross-region replication.
- Compression trades CPU for size/bandwidth — LZ4/Snappy favor speed (good for hot paths like LSM SSTables), gzip/zstd favor ratio (good for archival/bandwidth-constrained cases).
- Checksums detect corruption; combined with redundancy, a system can also self-heal by recovering the correct data from a healthy replica.
- Storage tiering (hot/warm/cold) matches cost to actual access frequency, typically automated via lifecycle policies as data ages.
