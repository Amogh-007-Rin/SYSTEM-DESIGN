# Design Challenge 02 — Solution: Distributed File System Metadata Layer

## What the Metadata Layer Tracks

**Per file/directory (the namespace):**
- Path / hierarchical name, parent directory pointer
- Owner, permissions
- File size, creation/modification timestamps
- An ordered list of **chunk IDs** that make up the file's content

**Per chunk:**
- Chunk ID
- Which chunkservers/DataNodes currently hold a replica of this chunk (the "chunk location map")
- Replica health/version, used to detect a stale replica after a chunkserver was offline

## Why Centralize Metadata in One Master?

A single master/NameNode means there's exactly one place that needs to agree with itself about the state of the namespace and chunk locations — no distributed consensus protocol is needed for ordinary metadata operations, which massively simplifies the design compared to a fully distributed metadata store. The two biggest risks this creates:

1. **Single point of failure** — if the master crashes, the entire filesystem becomes unusable (chunkservers still hold data, but nothing can resolve a path to its chunks).
2. **Scalability ceiling** — the entire namespace and chunk location map must fit in the master's memory for fast lookups; past a certain number of files, one machine's RAM becomes the hard limit on how large the filesystem can grow.

## Mitigating the Single Point of Failure

- **Operation log + checkpoints**: every metadata mutation is appended to a write-ahead log (mirroring how a database WAL works) before being applied in memory, and periodic checkpoints snapshot the in-memory state so recovery doesn't require replaying the log from the beginning of time.
- **Standby/secondary master**: a hot or warm standby continuously replays the operation log to keep a near-current copy of the metadata state, ready to take over (with a brief failover window) if the primary master fails — this is the real-world approach used by HDFS High Availability (Active/Standby NameNodes) built specifically to address this exact gap in the original GFS/HDFS design.

## Mitigating the Scalability Ceiling

- **Federation / metadata sharding**: split the namespace itself across multiple independent master nodes (e.g., by top-level directory or a hash of the path), so each master only needs to hold metadata for its own slice of the namespace — this is the approach HDFS Federation takes, trading "one simple master" for "multiple simpler masters, each with a bounded slice of the problem."
- **Smaller metadata footprint per file**: using larger chunk sizes (GFS's 64MB, HDFS's default 128MB) directly reduces the number of chunk-location-map entries the master must hold per unit of total data stored — this is *why* both systems use unusually large chunk sizes compared to a typical local filesystem's block size.

## Client Read Path

1. Client asks the master: "which chunks make up `/path/to/file`, and which chunkservers hold each chunk?"
2. Master returns the ordered chunk ID list plus, for each chunk, a list of chunkserver locations (the master is consulted only for this metadata — it is never in the data path itself).
3. Client contacts a chunkserver **directly** (picking any replica, often the closest one) to read the actual chunk bytes — keeping the master off the critical path for the actual (much larger) data transfer, which is essential since a single master could never handle the data-transfer bandwidth of the entire cluster.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Centralized single master (vs. fully distributed metadata) | Simpler consistency model, no consensus protocol needed for ordinary ops | SPOF and memory ceiling, requiring extra mechanisms (standby, federation) to address |
| Large chunk size (64-128MB) | Smaller metadata footprint per byte stored, fewer chunk-map entries | Wastes space for files much smaller than one chunk; not ideal for workloads with many small files |
| Master out of the data path | Master never becomes a data-transfer bottleneck | Adds one extra round-trip (ask master, then ask chunkserver) before any read can begin |
