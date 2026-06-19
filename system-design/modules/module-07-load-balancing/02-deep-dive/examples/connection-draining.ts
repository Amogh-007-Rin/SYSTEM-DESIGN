/**
 * Connection Draining During a Rolling Deploy
 * Module: 07 — Load Balancing
 * Concept: Simulates removing a backend node from rotation for a deploy.
 *   Naive removal aborts in-flight requests; connection draining instead
 *   stops sending *new* traffic to the node while letting its in-flight
 *   requests finish, up to a deadline — the mechanism that makes
 *   zero-downtime rolling deploys possible.
 * Run: npx ts-node connection-draining.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface InFlightRequest {
  id: number;
  remainingMs: number;
}

type NodeState = "active" | "draining" | "removed";

class BackendNode {
  state: NodeState = "active";
  private inFlight: Map<number, InFlightRequest> = new Map();
  private nextRequestId = 0;

  constructor(public readonly id: string) {}

  /** A new request arrives at this node and will take `durationMs` to finish. */
  acceptRequest(durationMs: number): number {
    const id = this.nextRequestId++;
    this.inFlight.set(id, { id, remainingMs: durationMs });
    return id;
  }

  /** Advance simulated time, completing any requests whose time has elapsed. */
  tick(elapsedMs: number): void {
    // Array.from(...values()) avoids relying on downlevel Map iteration
    // support, keeping this file portable across TS target configs.
    for (const req of Array.from(this.inFlight.values())) {
      req.remainingMs -= elapsedMs;
      if (req.remainingMs <= 0) {
        this.inFlight.delete(req.id);
      }
    }
  }

  inFlightCount(): number {
    return this.inFlight.size;
  }

  /** Begin draining: stop accepting new requests, but let in-flight ones finish. */
  startDraining(): void {
    this.state = "draining";
  }
}

/**
 * Simulates the deregistration delay: a node stops receiving new traffic
 * immediately, but isn't fully removed from rotation until either (a) its
 * in-flight requests all complete, or (b) the drain timeout elapses —
 * whichever happens first. Requests still in flight when the timeout hits
 * are forcibly cut off, which is exactly the failure mode a too-short
 * timeout causes in production.
 */
function drainNode(
  node: BackendNode,
  drainTimeoutMs: number,
  tickMs: number
): { drainedCleanly: boolean; forciblyTerminated: number; elapsedMs: number } {
  node.startDraining();
  let elapsed = 0;

  while (node.inFlightCount() > 0 && elapsed < drainTimeoutMs) {
    node.tick(tickMs);
    elapsed += tickMs;
    console.log(
      `  [t=${elapsed}ms] draining ${node.id}: ${node.inFlightCount()} request(s) still in flight`
    );
  }

  const forciblyTerminated = node.inFlightCount();
  node.state = "removed";
  return { drainedCleanly: forciblyTerminated === 0, forciblyTerminated, elapsedMs: elapsed };
}

// A minimal load balancer that respects node state: only "active" nodes
// receive new requests. A "draining" node keeps serving what it already
// has, but is invisible to new routing decisions — this is the core
// behavior connection draining adds on top of any selection algorithm.
class DrainAwareBalancer {
  private nextIndex = 0;
  constructor(private nodes: BackendNode[]) {}

  routeRequest(durationMs: number): BackendNode | null {
    const activeNodes = this.nodes.filter((n) => n.state === "active");
    if (activeNodes.length === 0) return null;
    const node = activeNodes[this.nextIndex % activeNodes.length];
    this.nextIndex++;
    node.acceptRequest(durationMs);
    return node;
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const nodeA = new BackendNode("node-A (old version)");
  const nodeB = new BackendNode("node-B (old version)");
  const balancer = new DrainAwareBalancer([nodeA, nodeB]);

  console.log("=== Rolling deploy: step 1 — traffic arrives while both nodes are active ===");
  // A few requests land on node-A right before the deploy starts, some slow.
  for (const durationMs of [1500, 4000, 800]) {
    const node = balancer.routeRequest(durationMs);
    console.log(`  Routed a ${durationMs}ms request to ${node?.id}`);
  }
  console.log(`node-A in-flight: ${nodeA.inFlightCount()}`);

  console.log("\n=== Step 2 — node-A is taken out of rotation for the deploy (draining begins) ===");
  console.log("New requests now only go to node-B; node-A's existing requests must finish first.");

  const DRAIN_TIMEOUT_MS = 5000;
  const TICK_MS = 1000;
  const result = drainNode(nodeA, DRAIN_TIMEOUT_MS, TICK_MS);

  console.log("\n=== Step 3 — drain result ===");
  if (result.drainedCleanly) {
    console.log(
      `node-A drained cleanly in ${result.elapsedMs}ms — zero requests were aborted. ` +
        `Safe to deploy the new version now.`
    );
  } else {
    console.log(
      `WARNING: drain timeout (${DRAIN_TIMEOUT_MS}ms) hit with ${result.forciblyTerminated} ` +
        `request(s) still in flight — those were forcibly cut off. ` +
        `Increase the deregistration delay above your p99 latency to avoid this.`
    );
  }

  console.log("\n=== Step 4 — comparison: a too-short drain timeout forcibly cuts off requests ===");
  const nodeC = new BackendNode("node-C (old version)");
  const balancer2 = new DrainAwareBalancer([nodeC]);
  balancer2.routeRequest(6000); // a slow 6-second request
  const badResult = drainNode(nodeC, 2000, 1000); // but the timeout is only 2 seconds
  console.log(
    badResult.drainedCleanly
      ? "Drained cleanly."
      : `${badResult.forciblyTerminated} request(s) forcibly terminated after only ` +
          `${badResult.elapsedMs}ms — this is the outage a short deregistration delay causes.`
  );
}

main();
