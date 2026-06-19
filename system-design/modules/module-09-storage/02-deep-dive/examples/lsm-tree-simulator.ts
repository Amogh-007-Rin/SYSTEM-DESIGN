/**
 * LSM Tree Simulator
 * Module: 09 — Storage Systems
 * Concept: A simplified Log-Structured Merge tree showing the three pieces
 *   that make it fast for writes: an in-memory memtable that absorbs writes,
 *   periodic flushes to immutable "SSTables" once the memtable fills, and a
 *   compaction step that merges SSTables together. Reads check the memtable
 *   first, then SSTables newest-first, so the most recent write for a key
 *   always wins even though older values for the same key may still be
 *   sitting in older, not-yet-compacted SSTables.
 * Run: npx ts-node lsm-tree-simulator.ts
 * Dependencies: none (Node.js built-ins only)
 */

type Operation = { type: "put"; value: string } | { type: "delete" };

// A single immutable, sorted-by-key snapshot of writes — once created, an
// SSTable is never modified in place. This immutability is exactly what
// lets the original flush be one fast sequential disk write instead of many
// scattered random ones.
class SSTable {
  private readonly entries: ReadonlyMap<string, Operation>;
  public readonly createdAtSequence: number;

  constructor(entries: Map<string, Operation>, sequence: number) {
    // Sorting mirrors a real SSTable's on-disk layout, which is what makes
    // range scans and binary-search-style lookups within a table efficient.
    this.entries = new Map([...entries.entries()].sort(([a], [b]) => a.localeCompare(b)));
    this.createdAtSequence = sequence;
  }

  get(key: string): Operation | undefined {
    return this.entries.get(key);
  }

  size(): number {
    return this.entries.size;
  }

  allEntries(): ReadonlyMap<string, Operation> {
    return this.entries;
  }
}

class LsmTree {
  private memtable = new Map<string, Operation>();
  // Newest SSTable is always at the END of this array — reads walk it
  // backwards so the most recently flushed (i.e. most recent) data wins.
  private ssTables: SSTable[] = [];
  private sequence = 0;
  private flushCount = 0;
  private compactionCount = 0;

  constructor(private readonly memtableFlushThreshold: number) {}

  // A write NEVER touches disk synchronously in this model — it only
  // updates the in-memory memtable. This is the entire reason LSM-tree
  // writes are fast: no random-access disk seek per write, ever.
  put(key: string, value: string): void {
    this.memtable.set(key, { type: "put", value });
    this.maybeFlush();
  }

  delete(key: string): void {
    // A delete is itself written as an entry (a "tombstone"), not an
    // in-place removal — consistent with the "never mutate in place"
    // philosophy that makes everything else about LSM trees work.
    this.memtable.set(key, { type: "delete" });
    this.maybeFlush();
  }

  private maybeFlush(): void {
    if (this.memtable.size < this.memtableFlushThreshold) return;

    // Flushing turns the (already sorted-on-flush) memtable into a new
    // immutable SSTable in one sequential write — the core LSM trick.
    const flushed = new SSTable(this.memtable, this.sequence++);
    this.ssTables.push(flushed);
    this.memtable = new Map();
    this.flushCount++;
  }

  // Reads check the memtable first (it holds the newest, not-yet-flushed
  // writes), then fall back to SSTables from NEWEST to OLDEST, returning on
  // the first match. This ordering is what guarantees "most recent write
  // wins" even though stale values for the same key may still exist in
  // older SSTables that haven't been compacted away yet.
  get(key: string): string | undefined {
    if (this.memtable.has(key)) {
      const op = this.memtable.get(key)!;
      return op.type === "put" ? op.value : undefined; // tombstone = deleted
    }

    for (let i = this.ssTables.length - 1; i >= 0; i--) {
      const op = this.ssTables[i].get(key);
      if (op !== undefined) {
        return op.type === "put" ? op.value : undefined;
      }
    }
    return undefined; // never written, or written then deleted and compacted away
  }

  // Compaction merges all current SSTables into one, keeping only the
  // newest operation per key and dropping tombstones entirely (a delete
  // only needs to "win" over older values during compaction — once nothing
  // older remains to shadow, the tombstone itself can be discarded too).
  // This is what keeps read latency bounded: without compaction, the
  // number of SSTables a read might have to check grows forever.
  compact(): void {
    if (this.ssTables.length <= 1) return;

    const merged = new Map<string, Operation>();
    // Apply oldest-to-newest so newer entries overwrite older ones in the map.
    for (const table of this.ssTables) {
      for (const [key, op] of table.allEntries()) {
        merged.set(key, op);
      }
    }
    // Drop tombstones now that compaction has resolved every key to its
    // final state — there's no older SSTable left for them to shadow.
    for (const [key, op] of [...merged.entries()]) {
      if (op.type === "delete") merged.delete(key);
    }

    this.ssTables = [new SSTable(merged, this.sequence++)];
    this.compactionCount++;
  }

  stats(): { memtableSize: number; ssTableCount: number; flushCount: number; compactionCount: number } {
    return {
      memtableSize: this.memtable.size,
      ssTableCount: this.ssTables.length,
      flushCount: this.flushCount,
      compactionCount: this.compactionCount,
    };
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const FLUSH_THRESHOLD = 4; // small on purpose, to make flushes/compaction visible quickly
  const lsm = new LsmTree(FLUSH_THRESHOLD);

  console.log(`=== Writing 10 keys (memtable flushes every ${FLUSH_THRESHOLD} writes) ===`);
  for (let i = 1; i <= 10; i++) {
    lsm.put(`user:${i}`, `profile-data-v1-${i}`);
  }
  console.log("Stats after 10 writes:", lsm.stats());

  console.log("\n=== Overwriting user:3 (newer value must win) ===");
  lsm.put("user:3", "profile-data-v2-UPDATED");
  console.log("get('user:3') ->", lsm.get("user:3"));

  console.log("\n=== Deleting user:7 (writes a tombstone, not an in-place removal) ===");
  lsm.delete("user:7");
  console.log("get('user:7') ->", lsm.get("user:7"), "(expected: undefined)");

  // Force one more flush so the delete's tombstone and the overwrite both
  // land in SSTables, demonstrating that reads still resolve correctly
  // across multiple on-disk tables before any compaction has happened.
  lsm.put("user:11", "profile-data-v1-11");
  lsm.put("user:12", "profile-data-v1-12");
  lsm.put("user:13", "profile-data-v1-13");
  lsm.put("user:14", "profile-data-v1-14");

  console.log("\nStats before compaction:", lsm.stats());
  console.log("get('user:3') before compaction ->", lsm.get("user:3"), "(must still be the UPDATED value)");
  console.log("get('user:7') before compaction ->", lsm.get("user:7"), "(must still read as deleted)");

  console.log("\n=== Running compaction (merges all SSTables into one) ===");
  lsm.compact();
  console.log("Stats after compaction:", lsm.stats());

  console.log("\n=== Re-checking correctness after compaction ===");
  console.log("get('user:3') ->", lsm.get("user:3"), "(still the UPDATED value)");
  console.log("get('user:7') ->", lsm.get("user:7"), "(still undefined — tombstone resolved and dropped)");
  console.log("get('user:1') ->", lsm.get("user:1"), "(untouched original value, unaffected by compaction)");

  console.log("\n=== Lesson ===");
  console.log("Writes never blocked on disk I/O beyond the memtable; SSTable flushes were");
  console.log("single sequential writes; and compaction kept the number of files a read");
  console.log("must check from growing without bound — the three pillars of why LSM trees");
  console.log("are the storage engine of choice for write-heavy systems like Cassandra and RocksDB.");
}

main();
