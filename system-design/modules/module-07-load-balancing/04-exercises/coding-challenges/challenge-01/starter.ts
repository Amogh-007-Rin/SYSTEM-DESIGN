/**
 * Round Robin & Least Connections Load Balancer
 * Module: 07 — Load Balancing
 * Concept: Round Robin distributes by fixed rotation regardless of load;
 *   Least Connections adapts to real-time backend load. Implementing both
 *   against the same backend pool makes the difference observable instead
 *   of theoretical.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface Backend {
  id: string;
  healthy: boolean;
}

/**
 * TODO: Implement RoundRobinLoadBalancer.
 *
 * - selectBackend(): returns the next healthy backend in fixed rotating
 *   order, wrapping around after the last one. Unhealthy backends are
 *   skipped entirely (never returned). Throw if no backend is healthy.
 */
class RoundRobinLoadBalancer {
  private nextIndex = 0;
  constructor(private backends: Backend[]) {}

  selectBackend(): Backend {
    // TODO: implement — walk backends starting at this.nextIndex, skipping
    // unhealthy ones, advancing this.nextIndex for next time. Throw
    // new Error("No healthy backends available") if none are healthy.
    throw new Error("Not implemented");
  }
}

/**
 * TODO: Implement LeastConnectionsLoadBalancer.
 *
 * - selectBackend(): returns the healthy backend with the fewest active
 *   connections (ties broken by lowest index in the original backends
 *   array). Throw if no backend is healthy.
 * - startRequest(backendId): increment that backend's active connection
 *   count.
 * - finishRequest(backendId): decrement that backend's active connection
 *   count (never below 0).
 */
class LeastConnectionsLoadBalancer {
  private connectionCounts: Map<string, number> = new Map();

  constructor(private backends: Backend[]) {
    for (const backend of backends) {
      this.connectionCounts.set(backend.id, 0);
    }
  }

  selectBackend(): Backend {
    // TODO: implement — find the healthy backend with the lowest value in
    // this.connectionCounts. Throw new Error("No healthy backends available")
    // if none are healthy.
    throw new Error("Not implemented");
  }

  startRequest(backendId: string): void {
    // TODO: implement
  }

  finishRequest(backendId: string): void {
    // TODO: implement
  }

  getConnectionCount(backendId: string): number {
    return this.connectionCounts.get(backendId) ?? 0;
  }
}

// === USAGE EXAMPLE ===
// This section is intentionally left calling the unimplemented methods —
// it will throw "Not implemented" until you fill in the TODOs above.
// That's by design: fill in the classes, then re-run this file.
const backends: Backend[] = [
  { id: "backend-1", healthy: true },
  { id: "backend-2", healthy: true },
  { id: "backend-3", healthy: true },
];

console.log("=== Round Robin ===");
const roundRobin = new RoundRobinLoadBalancer(backends);
for (let i = 0; i < 5; i++) {
  console.log(`Request ${i}: ${roundRobin.selectBackend().id}`);
}

console.log("\n=== Least Connections ===");
const leastConn = new LeastConnectionsLoadBalancer(backends);
const busyBackend = leastConn.selectBackend();
leastConn.startRequest(busyBackend.id);
leastConn.startRequest(busyBackend.id);
console.log(`${busyBackend.id} now has ${leastConn.getConnectionCount(busyBackend.id)} active connections`);
console.log(`Next selection avoids it: ${leastConn.selectBackend().id}`);
