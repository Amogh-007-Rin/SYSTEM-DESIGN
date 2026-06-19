/**
 * Fan-Out Simulator: One Event, Many Subscribers, Via a Pub/Sub Backbone
 * Module: 16 — Real-Time Systems
 * Concept: At scale, a WebSocket server never delivers a message by looking
 *   for a socket directly — it publishes once to a shared pub/sub backbone,
 *   and every "server instance" subscribed to that backbone fans the
 *   message out to the (much smaller) set of connections it personally
 *   holds. This simulates that two-level fan-out (backbone -> instances ->
 *   sockets) in-memory and measures delivery latency and per-instance load,
 *   without needing a real Redis or a real WebSocket fleet.
 * Run: npx ts-node fanout-simulator.ts
 * Dependencies: none (in-memory simulation — see Module 16 deep dive for the
 *   real Redis Pub/Sub equivalent)
 */

import { EventEmitter } from "events";

interface FanoutEvent {
  channel: string;
  payload: { type: string; data: unknown };
  publishedAt: number;
}

/**
 * Stands in for Redis Pub/Sub (or any message broker): a single shared
 * channel that every subscribed server instance receives every message on,
 * regardless of whether any of its local connections actually care.
 */
class PubSubBackbone {
  private emitter = new EventEmitter();
  private publishCount = 0;

  subscribe(channel: string, handler: (event: FanoutEvent) => void): void {
    this.emitter.on(channel, handler);
  }

  publish(channel: string, payload: { type: string; data: unknown }): void {
    this.publishCount++;
    const event: FanoutEvent = { channel, payload, publishedAt: Date.now() };
    this.emitter.emit(channel, event);
  }

  getPublishCount(): number {
    return this.publishCount;
  }
}

/** A single simulated subscriber connection (stands in for one open WebSocket). */
interface SimulatedConnection {
  id: string;
  receivedAt: number | null;
}

/**
 * Stands in for one WebSocket server instance in a horizontally-scaled
 * fleet. It subscribes to the shared backbone once, and on every message
 * fans it out only to the connections it personally holds in memory —
 * exactly the "server B doesn't know about server A's sockets, but does
 * know about its own" model described in the deep dive.
 */
class FanoutServerInstance {
  private connections: SimulatedConnection[] = [];
  private deliveries = 0;

  constructor(private instanceId: string, backbone: PubSubBackbone, channel: string) {
    backbone.subscribe(channel, (event) => this.handleBackboneMessage(event));
  }

  addConnection(connectionId: string): void {
    this.connections.push({ id: connectionId, receivedAt: null });
  }

  private handleBackboneMessage(event: FanoutEvent): void {
    // Fan out to every locally-held connection. In a real server this is
    // the loop that writes to each open socket this process actually owns.
    for (const conn of this.connections) {
      conn.receivedAt = Date.now();
      this.deliveries++;
    }
  }

  getDeliveries(): number {
    return this.deliveries;
  }

  getConnectionCount(): number {
    return this.connections.length;
  }

  getMaxDeliveryLatencyMs(publishedAt: number): number {
    const latest = this.connections.reduce((max, c) => Math.max(max, c.receivedAt ?? 0), 0);
    return latest === 0 ? -1 : latest - publishedAt;
  }
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const CHANNEL = "live-event:championship-final";
  const INSTANCE_COUNT = 5;
  const CONNECTIONS_PER_INSTANCE = 2000; // 5 * 2000 = 10,000 simulated viewers

  console.log("=== Fan-Out Simulation: 1 published event -> many subscribers ===\n");

  const backbone = new PubSubBackbone();
  const instances: FanoutServerInstance[] = [];

  for (let i = 0; i < INSTANCE_COUNT; i++) {
    const instance = new FanoutServerInstance(`server-${i}`, backbone, CHANNEL);
    for (let c = 0; c < CONNECTIONS_PER_INSTANCE; c++) {
      instance.addConnection(`server-${i}-conn-${c}`);
    }
    instances.push(instance);
  }

  const totalConnections = instances.reduce((sum, inst) => sum + inst.getConnectionCount(), 0);
  console.log(
    `Set up ${INSTANCE_COUNT} server instances x ${CONNECTIONS_PER_INSTANCE} connections each = ${totalConnections} total subscribers\n`
  );

  // Publish once — exactly like one "GOAL!" event in a live sports feed.
  const publishedAt = Date.now();
  console.log(`Publishing 1 event to channel "${CHANNEL}"...`);
  backbone.publish(CHANNEL, { type: "score_update", data: { home: 2, away: 1 } });

  console.log(`Backbone publish count: ${backbone.getPublishCount()} (the event was sent exactly once)\n`);

  console.log("Per-instance fan-out results:");
  let totalDeliveries = 0;
  for (const instance of instances) {
    const deliveries = instance.getDeliveries();
    const latencyMs = instance.getMaxDeliveryLatencyMs(publishedAt);
    totalDeliveries += deliveries;
    console.log(
      `  delivered to ${deliveries} local connections (max in-process latency: ${latencyMs}ms)`
    );
  }

  console.log(
    `\nTotal deliveries across the fleet: ${totalDeliveries} (should equal ${totalConnections} total subscribers)`
  );
  console.log(
    `Each server instance only ever had to fan out to its own ${CONNECTIONS_PER_INSTANCE} connections —`
  );
  console.log(
    `not the global ${totalConnections}, which is the per-instance load number that actually matters for capacity planning.`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
