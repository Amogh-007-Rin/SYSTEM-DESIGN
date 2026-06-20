/**
 * Service Discovery: Client-Side Registry with Heartbeats (Eureka-style)
 * Module: 11 — Microservices Architecture
 * Concept: In a microservices system, service instances scale up/down and
 *   get rescheduled constantly — nothing has a fixed address. A service
 *   registry solves this: instances register themselves and send periodic
 *   heartbeats; the registry prunes any instance that stops heartbeating
 *   (it crashed, was killed, or lost network connectivity). A client doing
 *   client-side discovery (the Eureka model) queries the registry directly
 *   and picks a healthy instance itself.
 * Run: npx ts-node service-registry.ts
 * Dependencies: none
 */

interface ServiceInstance {
  id: string;
  serviceName: string;
  host: string;
  port: number;
  lastHeartbeatAt: number;
}

/**
 * A minimal in-memory service registry. Real registries (Eureka, Consul)
 * are themselves distributed and replicated for availability, but the
 * core mechanism — register, heartbeat, prune-on-timeout — is the same.
 */
class ServiceRegistry {
  private instances = new Map<string, ServiceInstance>();

  constructor(private readonly heartbeatTimeoutMs: number) {}

  // A new instance announces itself on startup.
  register(instance: Omit<ServiceInstance, "lastHeartbeatAt">): void {
    this.instances.set(instance.id, { ...instance, lastHeartbeatAt: Date.now() });
    console.log(`[registry] registered ${instance.id} (${instance.serviceName} @ ${instance.host}:${instance.port})`);
  }

  // Called periodically by each instance to prove it's still alive.
  heartbeat(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.log(`[registry] heartbeat from unknown instance ${instanceId} ignored`);
      return;
    }
    instance.lastHeartbeatAt = Date.now();
  }

  // An instance can also deregister cleanly on graceful shutdown.
  deregister(instanceId: string): void {
    if (this.instances.delete(instanceId)) {
      console.log(`[registry] deregistered ${instanceId}`);
    }
  }

  // Prunes any instance whose last heartbeat is older than the timeout —
  // this is how the registry detects crashed instances that never got a
  // chance to deregister cleanly.
  pruneStaleInstances(now: number = Date.now()): string[] {
    const pruned: string[] = [];
    for (const [id, instance] of this.instances) {
      if (now - instance.lastHeartbeatAt > this.heartbeatTimeoutMs) {
        this.instances.delete(id);
        pruned.push(id);
      }
    }
    if (pruned.length > 0) {
      console.log(`[registry] pruned stale instances (missed heartbeat): ${pruned.join(", ")}`);
    }
    return pruned;
  }

  // What a client calls: "give me every currently-healthy instance of X."
  lookup(serviceName: string): ServiceInstance[] {
    return [...this.instances.values()].filter((i) => i.serviceName === serviceName);
  }
}

/**
 * The calling side of client-side discovery: query the registry, then pick
 * an instance using simple round-robin load balancing across whatever is
 * currently healthy. If a backend disappears (pruned for missed
 * heartbeats), the client transparently stops routing to it on the next
 * lookup — no client-side health check needed, the registry already did it.
 */
class DiscoveringClient {
  private roundRobinCursor = 0;

  constructor(private registry: ServiceRegistry) {}

  callService(serviceName: string): string {
    const healthyInstances = this.registry.lookup(serviceName);
    if (healthyInstances.length === 0) {
      throw new Error(`No healthy instances of '${serviceName}' available`);
    }
    const instance = healthyInstances[this.roundRobinCursor % healthyInstances.length];
    this.roundRobinCursor++;
    return `${instance.id} (${instance.host}:${instance.port})`;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const registry = new ServiceRegistry(/* heartbeatTimeoutMs */ 150);
  const client = new DiscoveringClient(registry);

  // Three instances of the same service start up and register.
  registry.register({ id: "inventory-1", serviceName: "inventory", host: "10.0.0.1", port: 8080 });
  registry.register({ id: "inventory-2", serviceName: "inventory", host: "10.0.0.2", port: 8080 });
  registry.register({ id: "inventory-3", serviceName: "inventory", host: "10.0.0.3", port: 8080 });

  console.log("\n--- All 3 instances healthy: round-robin across all of them ---");
  for (let i = 0; i < 6; i++) {
    console.log("client -> inventory:", client.callService("inventory"));
  }

  // Two of the three instances keep heartbeating; inventory-2 crashes and
  // simply stops sending heartbeats (no clean deregister call).
  console.log("\n--- inventory-2 crashes silently (stops heartbeating) ---");
  for (let elapsed = 0; elapsed < 200; elapsed += 50) {
    registry.heartbeat("inventory-1");
    registry.heartbeat("inventory-3");
    // inventory-2 sends nothing.
    await sleep(50);
  }
  registry.pruneStaleInstances();

  console.log("\n--- After pruning: only 2 healthy instances remain ---");
  for (let i = 0; i < 4; i++) {
    console.log("client -> inventory:", client.callService("inventory"));
  }

  // inventory-3 also goes away, but this time gracefully.
  console.log("\n--- inventory-3 shuts down gracefully ---");
  registry.deregister("inventory-3");

  console.log("\n--- Only inventory-1 left ---");
  console.log("client -> inventory:", client.callService("inventory"));

  // If every instance disappears, the client gets a clear error instead of
  // hanging or silently routing nowhere.
  console.log("\n--- inventory-1 also disappears: lookup for a different, unregistered service ---");
  try {
    client.callService("payments");
  } catch (err) {
    console.log("Expected error:", (err as Error).message);
  }
}

main();
