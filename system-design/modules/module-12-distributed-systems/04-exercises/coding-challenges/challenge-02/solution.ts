// SOLUTION FILE — try starter.ts first!
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
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

interface GossipEntry {
  value: string;
  version: number;
}

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

  // Originates a new write locally — bumps the version so that when this
  // entry gossips outward, every peer can tell it's newer than whatever
  // (if anything) they already have for this key.
  localWrite(key: string, value: string): void {
    const current = this.state.get(key);
    const nextVersion = (current?.version ?? 0) + 1;
    this.state.set(key, { value, version: nextVersion });
  }

  pickRandomPeer(): GossipNode | null {
    if (this.peers.length === 0) return null;
    const index = Math.floor(Math.random() * this.peers.length);
    return this.peers[index];
  }

  // Exchanges state with a random peer. The merge is symmetric: for every
  // key known to EITHER side, both ends end up holding whichever
  // {value, version} pair has the higher version number. This symmetry is
  // exactly what makes repeated random gossip rounds converge the whole
  // cluster on the same data without anyone needing to track who-knows-what.
  gossipRound(): void {
    const peer = this.pickRandomPeer();
    if (!peer) return;

    const allKeys = new Set([...this.state.keys(), ...peer.state.keys()]);
    for (const key of allKeys) {
      const mine = this.state.get(key);
      const theirs = peer.state.get(key);

      if (!theirs || (mine && mine.version > theirs.version)) {
        // My version is newer (or peer doesn't have this key at all) — push it.
        peer.state.set(key, { ...mine! });
      } else if (!mine || theirs.version > mine.version) {
        // Peer's version is newer (or I don't have this key at all) — pull it.
        this.state.set(key, { ...theirs });
      }
      // If versions are equal, the two sides already agree — nothing to do.
    }
  }

  getValue(key: string): string | undefined {
    return this.state.get(key)?.value;
  }

  getVersion(key: string): number {
    return this.state.get(key)?.version ?? 0;
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
let convergedAtRound: number | null = null;
for (let round = 1; round <= MAX_ROUNDS; round++) {
  // Every node gossips once per round, in random order.
  const order = [...nodes].sort(() => Math.random() - 0.5);
  order.forEach((n) => n.gossipRound());

  const converged = countConverged("config:feature-flag", "enabled");
  console.log(`Round ${round}: ${converged}/${NODE_COUNT} nodes have the value`);

  if (converged === NODE_COUNT) {
    convergedAtRound = round;
    console.log(`\nFully converged after ${round} round(s).`);
    break;
  }
}

if (convergedAtRound === null) {
  console.log(`\nDid not fully converge within ${MAX_ROUNDS} rounds (run again — gossip is probabilistic).`);
  process.exitCode = 1;
} else {
  console.log(`\n=== Convergence check: every node agrees on both value AND version ===`);
  const expectedVersion = nodes[0].getVersion("config:feature-flag");
  const allAgree = nodes.every(
    (n) => n.getValue("config:feature-flag") === "enabled" && n.getVersion("config:feature-flag") === expectedVersion
  );
  nodes.forEach((n) =>
    console.log(`  ${n.id}: value="${n.getValue("config:feature-flag")}", version=${n.getVersion("config:feature-flag")}`)
  );
  console.log(`\nAll nodes converged on identical (value, version): ${allAgree}`);
  console.log(
    `\nThis is the O(log N) convergence property in action: with ${NODE_COUNT} nodes, full propagation took only ${convergedAtRound} round(s) of random pairwise gossip — no central broadcaster required.`
  );
}
