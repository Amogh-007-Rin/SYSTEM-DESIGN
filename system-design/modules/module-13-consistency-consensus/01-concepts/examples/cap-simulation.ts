/**
 * CAP Theorem Simulation: CP vs. AP Behavior During a Network Partition
 * Module: 13 — Consistency, Consensus & CAP Theorem
 * Concept: When a network partition isolates a replica from the quorum,
 *   a CP node refuses to answer (blocks/errors) until it can confirm it has
 *   the latest write, while an AP node answers immediately with whatever
 *   data it has locally, even if that data might be stale. This file
 *   simulates both behaviors against the *same* partition event so the
 *   trade-off is directly comparable.
 * Run: npx ts-node cap-simulation.ts
 * Dependencies: none
 */

type NodeId = "A" | "B" | "C";

interface ReadResult {
  node: NodeId;
  value: number | null;
  stale: boolean;
  blockedMs: number;
  error?: string;
}

/**
 * A tiny cluster of 3 replicas holding a single integer value, with a
 * simulated network that can be partitioned on demand. Node A is the
 * "primary" that receives writes; B and C replicate from it asynchronously.
 */
class SimulatedCluster {
  private values: Record<NodeId, number> = { A: 0, B: 0, C: 0 };
  private lastWriteVersion: Record<NodeId, number> = { A: 0, B: 0, C: 0 };
  private currentVersion = 0;
  // When true, node A cannot reach B or C (and vice versa) — a partition.
  private partitioned = false;

  setPartitioned(value: boolean): void {
    this.partitioned = value;
  }

  /** Write always lands on A first (the only node accepting writes here). */
  write(value: number): void {
    this.currentVersion++;
    this.values.A = value;
    this.lastWriteVersion.A = this.currentVersion;
    if (!this.partitioned) {
      // Replication only succeeds when the network is healthy.
      this.values.B = value;
      this.lastWriteVersion.B = this.currentVersion;
      this.values.C = value;
      this.lastWriteVersion.C = this.currentVersion;
    }
  }

  /** Can `node` currently reach a majority of the cluster (including itself)? */
  private hasQuorum(node: NodeId): boolean {
    if (!this.partitioned) return true;
    // Simulate a partition that isolates A (the primary) alone on one side,
    // with B and C together on the other side. A 3-node cluster needs 2/3
    // for quorum, so the isolated A loses quorum; B+C retain it.
    return node !== "A";
  }

  /**
   * CP read: only answer if this node can confirm (via quorum) that its
   * local value is not stale. If quorum can't be reached, block until a
   * timeout, then return an error rather than risk returning stale data.
   */
  async readCP(node: NodeId, quorumCheckTimeoutMs = 150): Promise<ReadResult> {
    const start = Date.now();
    if (this.hasQuorum(node)) {
      return { node, value: this.values[node], stale: false, blockedMs: Date.now() - start };
    }
    // No quorum: simulate blocking while repeatedly failing to reach peers,
    // then give up and surface an explicit error instead of a guess.
    await new Promise((resolve) => setTimeout(resolve, quorumCheckTimeoutMs));
    return {
      node,
      value: null,
      stale: false,
      blockedMs: Date.now() - start,
      error: "unavailable: cannot confirm latest write without quorum",
    };
  }

  /**
   * AP read: always answer immediately from local state, regardless of
   * whether this node can reach the rest of the cluster. Flags the result
   * as `stale` if this node's version lags the latest known write.
   */
  async readAP(node: NodeId): Promise<ReadResult> {
    const start = Date.now();
    const isStale = this.lastWriteVersion[node] < this.currentVersion;
    return { node, value: this.values[node], stale: isStale, blockedMs: Date.now() - start };
  }
}

function printResult(label: string, r: ReadResult): void {
  if (r.error) {
    console.log(`  ${label}: ERROR — ${r.error} (waited ${r.blockedMs}ms)`);
  } else {
    console.log(`  ${label}: value=${r.value}${r.stale ? " (STALE)" : ""} (${r.blockedMs}ms)`);
  }
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const cluster = new SimulatedCluster();

  console.log("=== Healthy network: write 42, all replicas converge ===");
  cluster.write(42);
  printResult("A (CP)", await cluster.readCP("A"));
  printResult("B (CP)", await cluster.readCP("B"));
  printResult("C (CP)", await cluster.readCP("C"));

  console.log("\n=== Partition occurs: A isolated, B+C retain quorum ===");
  cluster.setPartitioned(true);
  // A new write lands only on A (the isolated primary); B and C never see it.
  cluster.write(99);

  console.log("\n--- CP behavior: refuse to answer without quorum confirmation ---");
  printResult("A (CP, no quorum)", await cluster.readCP("A"));
  printResult("B (CP, has quorum)", await cluster.readCP("B"));

  console.log("\n--- AP behavior: answer immediately, flag staleness instead of blocking ---");
  printResult("A (AP)", await cluster.readAP("A"));
  printResult("B (AP)", await cluster.readAP("B"));

  console.log(
    "\nTakeaway: A holds the *newest* write (99) but a CP read on A still refuses to serve it\n" +
      "because A cannot prove to itself that it isn't actually the stale, minority side of the\n" +
      "split — quorum is what makes that distinction possible, not raw recency. The AP read on A\n" +
      "serves 99 immediately with no staleness flag (it has no way to know B/C are unreachable\n" +
      "from their own perspective), while AP on B truthfully reports staleness because B knows\n" +
      "its last replicated version (0) is behind the cluster's current write version (2)."
  );

  cluster.setPartitioned(false);
}

main();
