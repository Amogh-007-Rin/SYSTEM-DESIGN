// SOLUTION FILE — try starter.ts first!
/**
 * Round Robin & Least Connections Load Balancer
 * Module: 07 — Load Balancing
 * Concept: Round Robin distributes by fixed rotation regardless of load;
 *   Least Connections adapts to real-time backend load. Implementing both
 *   against the same backend pool makes the difference observable instead
 *   of theoretical.
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

interface Backend {
  id: string;
  healthy: boolean;
}

class RoundRobinLoadBalancer {
  private nextIndex = 0;
  constructor(private backends: Backend[]) {}

  selectBackend(): Backend {
    // Walk at most one full lap of the pool starting from nextIndex, so a
    // single unhealthy backend doesn't infinite-loop us, but a healthy one
    // anywhere in the pool is still found regardless of rotation position.
    for (let attempts = 0; attempts < this.backends.length; attempts++) {
      const candidate = this.backends[this.nextIndex];
      this.nextIndex = (this.nextIndex + 1) % this.backends.length;
      if (candidate.healthy) {
        return candidate;
      }
    }
    throw new Error("No healthy backends available");
  }
}

class LeastConnectionsLoadBalancer {
  private connectionCounts: Map<string, number> = new Map();

  constructor(private backends: Backend[]) {
    for (const backend of backends) {
      this.connectionCounts.set(backend.id, 0);
    }
  }

  selectBackend(): Backend {
    let best: Backend | null = null;
    let bestCount = Infinity;

    // Scanning in array order naturally breaks ties by lowest original
    // index, since we only replace `best` on a strictly lower count.
    for (const backend of this.backends) {
      if (!backend.healthy) continue;
      const count = this.connectionCounts.get(backend.id) ?? 0;
      if (count < bestCount) {
        best = backend;
        bestCount = count;
      }
    }

    if (!best) {
      throw new Error("No healthy backends available");
    }
    return best;
  }

  startRequest(backendId: string): void {
    const current = this.connectionCounts.get(backendId) ?? 0;
    this.connectionCounts.set(backendId, current + 1);
  }

  finishRequest(backendId: string): void {
    const current = this.connectionCounts.get(backendId) ?? 0;
    this.connectionCounts.set(backendId, Math.max(0, current - 1));
  }

  getConnectionCount(backendId: string): number {
    return this.connectionCounts.get(backendId) ?? 0;
  }
}

// === USAGE EXAMPLE ===
const backends: Backend[] = [
  { id: "backend-1", healthy: true },
  { id: "backend-2", healthy: true },
  { id: "backend-3", healthy: true },
];

console.log("=== Round Robin: 6 requests, uniform rotation regardless of load ===");
const roundRobin = new RoundRobinLoadBalancer(backends);
for (let i = 0; i < 6; i++) {
  console.log(`  Request ${i}: ${roundRobin.selectBackend().id}`);
}

console.log("\n=== Round Robin skips an unhealthy backend ===");
backends[1].healthy = false; // backend-2 fails its health check
const roundRobinAfterFailure = new RoundRobinLoadBalancer(backends);
for (let i = 0; i < 4; i++) {
  console.log(`  Request ${i}: ${roundRobinAfterFailure.selectBackend().id}`);
}
backends[1].healthy = true; // restore for the next section

console.log("\n=== Least Connections: diverges from Round Robin once load is uneven ===");
const leastConn = new LeastConnectionsLoadBalancer(backends);

// Simulate backend-1 picking up several long-running requests (e.g. large
// video transcodes) that haven't finished yet — its connection count stays
// elevated until finishRequest() is called for each one.
const busy = backends[0];
leastConn.startRequest(busy.id);
leastConn.startRequest(busy.id);
leastConn.startRequest(busy.id);
console.log(`  ${busy.id} has ${leastConn.getConnectionCount(busy.id)} active connections (busy with long requests)`);

console.log("  Next 4 selections route around the busy backend:");
for (let i = 0; i < 4; i++) {
  const selected = leastConn.selectBackend();
  console.log(`    Request ${i}: ${selected.id} (count was ${leastConn.getConnectionCount(selected.id)})`);
  leastConn.startRequest(selected.id);
}

console.log("\n=== Once the busy backend's requests finish, it re-enters rotation normally ===");
leastConn.finishRequest(busy.id);
leastConn.finishRequest(busy.id);
leastConn.finishRequest(busy.id);
console.log(`  ${busy.id} now has ${leastConn.getConnectionCount(busy.id)} active connections`);
console.log(`  Selection: ${leastConn.selectBackend().id}`);

console.log("\n=== Comparison takeaway ===");
console.log(
  "Round Robin would have kept sending requests to backend-1 on schedule regardless of its " +
    "load; Least Connections actively routed traffic away from it while it was busy, and " +
    "let it back into rotation the moment its load dropped — that adaptiveness is the whole " +
    "trade-off for the extra bookkeeping it requires."
);
