# Design Challenge 02: Distributed File System Metadata Layer

**Difficulty:** Hard

## Prompt

Design the metadata layer for a distributed file system in the style of GFS/HDFS — the system that tracks the directory hierarchy, file ownership/permissions, and which chunks of a file live on which physical machines. Assume the actual file data storage (chunkservers/DataNodes, replication of chunks) is already handled; focus specifically on the metadata layer.

## What to Produce

1. What information must the metadata layer track per file and per chunk? Sketch the rough shape of the records.
2. GFS and HDFS both centralize metadata in a single master/NameNode. Explain why this simplifies the design, and name the two biggest risks of that choice.
3. Design a mitigation for the single point of failure risk (what happens if the master node crashes?).
4. Design a mitigation for the scalability ceiling risk (what happens when there are too many files for one machine's memory to track?).
5. Describe how a client actually reads a file end-to-end: what does it ask the metadata layer, and what does it do with the answer?
6. At least 2 explicit trade-offs in your design.

There is no single "correct" architecture here — focus on identifying the real constraints (a single master is simple but is both a SPOF and a ceiling) and proposing concrete, named mitigations (not just "add more servers").
