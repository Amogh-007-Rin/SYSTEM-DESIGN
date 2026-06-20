/**
 * Consistent Hashing
 * Module: 04 — Databases
 * Concept: Consistent hashing minimises key remapping when nodes join/leave.
 *   Used in Cassandra, DynamoDB, and distributed caches.
 * Run: npx ts-node starter.ts
 * Dependencies: none (uses Node.js built-in crypto)
 */

import * as crypto from "crypto";

function hashToRingPosition(key: string, ringSize: number): number {
  const hex = crypto.createHash("md5").update(key).digest("hex");
  return parseInt(hex.substring(0, 8), 16) % ringSize;
}

/**
 * TODO: Implement ConsistentHashRing.
 *
 * Properties:
 *   RING_SIZE = 2 ** 32
 *   virtualNodesPerNode: number (default 150)
 *   ring: Map<number, string>   — position → node name
 *   sortedPositions: number[]   — sorted ring positions
 *
 * addNode(nodeName: string): void
 *   For each vnode i in [0, virtualNodesPerNode):
 *     position = hashToRingPosition(`${nodeName}:vnode-${i}`, RING_SIZE)
 *     ring.set(position, nodeName)
 *   Re-sort sortedPositions.
 *
 * removeNode(nodeName: string): void
 *   Remove all positions that map to nodeName.
 *   Re-sort sortedPositions.
 *
 * getNode(key: string): string
 *   pos = hashToRingPosition(key, RING_SIZE)
 *   First position in sortedPositions >= pos (wrap to [0] if none found)
 *   Return ring.get(that position)
 *
 * getDistribution(keys: string[]): Map<string, number>
 *   Count how many keys map to each node.
 */
class ConsistentHashRing {
  private readonly RING_SIZE = 2 ** 32;
  private virtualNodesPerNode: number;
  private ring: Map<number, string> = new Map();
  private sortedPositions: number[] = [];

  constructor(virtualNodesPerNode = 150) {
    this.virtualNodesPerNode = virtualNodesPerNode;
  }

  addNode(nodeName: string): void {
    // TODO: implement
  }

  removeNode(nodeName: string): void {
    // TODO: implement
  }

  getNode(key: string): string {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getDistribution(keys: string[]): Map<string, number> {
    // TODO: implement
    throw new Error("Not implemented");
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
