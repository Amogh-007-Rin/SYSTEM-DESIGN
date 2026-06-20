/**
 * Gossip Protocol Simulation
 * Module: 12 — Distributed Systems Fundamentals
 * Concept: Nodes propagate state by periodically exchanging it with a random
 *   peer instead of relying on a central broadcaster. Each node keeps a map
 *   of key -> {value, version}; on each gossip round, two nodes merge their
 *   maps by keeping, per key, whichever side has the HIGHER version. Repeat
 *   enough rounds and a value written at one node eventually reaches every
 *   node — this is how Cassandra/Dynamo-style systems propagate writes and
 *   membership/failure information without a leader.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface GossipEntry {
  value: string;
  version: number;
}

/**
 * TODO: Implement GossipNode.
 *
 * Internals:
 *   peers: GossipNode[] — the other nodes this node can gossip with.
 *   state: Map<string, GossipEntry> — this node's local key -> {value, version} map.
 *
 * Public:
 *   setPeers(peers): void — already implemented below, do not modify.
 *
 *   localWrite(key, value): void
 *     Originates a NEW write at this node: bump the version for `key` to
 *     (current version + 1), store {value, version}. If the key doesn't
 *     exist yet locally, start at version 1.
 *
 *   pickRandomPeer(): GossipNode | null
 *     Returns a uniformly random peer from `peers`, or null if there are
 *     no peers.
 *
 *   gossipRound(): void
 *     Picks a random peer (via pickRandomPeer) and exchanges state with it:
 *     for every key in EITHER node's state map, both nodes should end up
 *     agreeing on whichever {value, version} pair has the higher version
 *     (i.e., merge-by-highest-version, applied to BOTH sides so the
 *     exchange is symmetric — this is what makes gossip converge).
 *
 *   getValue(key): string | undefined
 *     Returns the current value for a key on this node, or undefined.
 *
 *   getVersion(key): number
 *     Returns the current version for a key on this node, or 0 if unknown.
 */
class GossipNode {
  public readonly id: string;
  private peers: GossipNode[] = [];
  private state: Map<string, GossipEntry> = new Map();

  constructor(id: string) {
    this.id = id;
  }

  setPeers(peers: GossipNode[]): void {
    this.peers = peers;
  }

  localWrite(key: string, value: string): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  pickRandomPeer(): GossipNode | null {
    // TODO: implement
    throw new Error("Not implemented");
  }

  gossipRound(): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getValue(key: string): string | undefined {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getVersion(key: string): number {
    // TODO: implement
    throw new Error("Not implemented");
  }
}

// === USAGE EXAMPLE ===
const NODE_COUNT = 6;
const nodes: GossipNode[] = Array.from({ length: NODE_COUNT }, (_, i) => new GossipNode(`N${i}`));
nodes.forEach((n) => n.setPeers(nodes.filter((other) => other !== n)));

console.log(`=== ${NODE_COUNT}-node cluster; N0 originates a write that must spread via gossip ===`);
nodes[0].localWrite("config:feature-flag", "enabled");
console.log(`N0 writes config:feature-flag="enabled" (version ${nodes[0].getVersion("config:feature-flag")})`);

function countConverged(key: string, expectedValue: string): number {
  return nodes.filter((n) => n.getValue(key) === expectedValue).length;
}

const MAX_ROUNDS = 10;
for (let round = 1; round <= MAX_ROUNDS; round++) {
  // Every node gossips once per round, in random order.
  const order = [...nodes].sort(() => Math.random() - 0.5);
  order.forEach((n) => n.gossipRound());

  const converged = countConverged("config:feature-flag", "enabled");
  console.log(`Round ${round}: ${converged}/${NODE_COUNT} nodes have the value`);

  if (converged === NODE_COUNT) {
    console.log(`\nFully converged after ${round} round(s).`);
    break;
  }
}
