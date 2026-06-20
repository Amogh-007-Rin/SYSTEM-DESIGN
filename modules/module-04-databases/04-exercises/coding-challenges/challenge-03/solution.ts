// SOLUTION FILE — try starter.ts first!
/**
 * Consistent Hashing
 * Module: 04 — Databases
 * Concept: Consistent hashing minimises key remapping when nodes join/leave.
 *   Used in Cassandra, DynamoDB, and distributed caches.
 * Run: npx ts-node solution.ts
 * Dependencies: none (uses Node.js built-in crypto)
 */

import * as crypto from "crypto";

function hashToRingPosition(key: string, ringSize: number): number {
  const hex = crypto.createHash("md5").update(key).digest("hex");
  return parseInt(hex.substring(0, 8), 16) % ringSize;
}

class ConsistentHashRing {
  private readonly RING_SIZE = 2 ** 32;
  private virtualNodesPerNode: number;
  private ring: Map<number, string> = new Map();
  private sortedPositions: number[] = [];

  constructor(virtualNodesPerNode = 150) {
    this.virtualNodesPerNode = virtualNodesPerNode;
  }

  addNode(nodeName: string): void {
    for (let i = 0; i < this.virtualNodesPerNode; i++) {
      const position = hashToRingPosition(`${nodeName}:vnode-${i}`, this.RING_SIZE);
      this.ring.set(position, nodeName);
    }
    this.resort();
  }

  removeNode(nodeName: string): void {
    for (const [position, owner] of this.ring) {
      if (owner === nodeName) this.ring.delete(position);
    }
    this.resort();
  }

  private resort(): void {
    this.sortedPositions = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  getNode(key: string): string {
    if (this.sortedPositions.length === 0) {
      throw new Error("ring is empty — add at least one node first");
    }

    const position = hashToRingPosition(key, this.RING_SIZE);

    // Binary search for the first ring position >= our key's position —
    // this is the "walk clockwise" step. If we run off the end, wrap to the
    // first position on the ring (the ring has no real "end").
    let low = 0;
    let high = this.sortedPositions.length - 1;
    let result = this.sortedPositions[0];

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sortedPositions[mid] >= position) {
        result = this.sortedPositions[mid];
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    // If position is greater than every ring position, low overshoots and
    // `result` still holds sortedPositions[0] from initialization — the wrap.
    if (position > this.sortedPositions[this.sortedPositions.length - 1]) {
      result = this.sortedPositions[0];
    }

    return this.ring.get(result)!;
  }

  getDistribution(keys: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const key of keys) {
      const node = this.getNode(key);
      counts.set(node, (counts.get(node) ?? 0) + 1);
    }
    return counts;
  }
}

// === USAGE EXAMPLE ===
const ring = new ConsistentHashRing(150);
["node-A", "node-B", "node-C"].forEach((n) => ring.addNode(n));
const testKeys = Array.from({ length: 1000 }, (_, i) => `user:${i}`);

console.log("=== Distribution with 3 nodes ===");
ring.getDistribution(testKeys).forEach((count, node) =>
  console.log(`  ${node}: ${count} keys (${((count / 1000) * 100).toFixed(1)}%)`)
);

ring.removeNode("node-B");
console.log("\n=== After removing node-B ===");
ring.getDistribution(testKeys).forEach((count, node) =>
  console.log(`  ${node}: ${count} keys (${((count / 1000) * 100).toFixed(1)}%)`)
);
