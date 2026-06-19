/**
 * Object Storage with Eventual Consistency
 * Module: 09 — Storage Systems
 * Concept: A simplified object store that mimics how a real distributed
 *   object store (the classic S3 model, pre-2020 strong consistency) is
 *   built from multiple replica nodes. A write lands on a "primary" replica
 *   immediately, but propagates to other replicas asynchronously — so a read
 *   routed to a different replica right after a write can see stale data
 *   for a short window. This demonstrates that "eventually consistent" is
 *   a measurable, time-bounded property, not a vague disclaimer.
 * Run: npx ts-node object-store-eventual-consistency.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface ObjectMetadata {
  contentType: string;
  sizeBytes: number;
  createdAt: number;
  tags: Record<string, string>;
}

interface StoredObject {
  key: string;
  body: string;
  metadata: ObjectMetadata;
  version: number;
}

// Each replica is an independent copy of the data — exactly like a real
// object store spreading objects across multiple physical nodes for
// durability. They do NOT share memory; they only sync via replicateTo().
class ReplicaNode {
  private objects = new Map<string, StoredObject>();

  constructor(public readonly id: string) {}

  // Writes are always immediately visible on the replica that received them —
  // that's why "read your own writes from the node you wrote to" is a
  // weaker (and easier to provide) guarantee than global strong consistency.
  put(object: StoredObject): void {
    this.objects.set(object.key, object);
  }

  get(key: string): StoredObject | undefined {
    return this.objects.get(key);
  }
}

// Simulates the object store's front door: a load balancer that can route
// any given request to any replica, plus the asynchronous replication
// pipeline that copies a write to the other replicas after some delay.
class EventuallyConsistentObjectStore {
  private replicas: ReplicaNode[];
  private nextVersion = 0;

  constructor(
    replicaCount: number,
    private readonly replicationDelayMs: number
  ) {
    this.replicas = Array.from({ length: replicaCount }, (_, i) => new ReplicaNode(`replica-${i}`));
  }

  // Writes go to one "primary" replica synchronously (the request that
  // issued the PUT waits for this), then asynchronously fan out to the
  // rest. The caller's PUT returns before replication finishes — this gap
  // is the entire eventual-consistency window.
  async put(key: string, body: string, contentType: string, tags: Record<string, string> = {}): Promise<void> {
    const version = this.nextVersion++;
    const object: StoredObject = {
      key,
      body,
      metadata: { contentType, sizeBytes: Buffer.byteLength(body), createdAt: Date.now(), tags },
      version,
    };

    const primary = this.replicas[0];
    primary.put(object);

    // Fire-and-forget replication — intentionally not awaited here, mirroring
    // how a real object store acknowledges the write before every replica
    // has the new data, in exchange for lower write latency.
    for (const replica of this.replicas.slice(1)) {
      setTimeout(() => replica.put(object), this.replicationDelayMs);
    }
  }

  // Reads can land on ANY replica behind the load balancer — in a real
  // system this is driven by load balancing / routing, not client choice.
  // We model that by letting the caller pick which replica index serves
  // the read, exactly as if a load balancer happened to route there.
  get(key: string, replicaIndex: number): StoredObject | undefined {
    const replica = this.replicas[replicaIndex % this.replicas.length];
    return replica.get(key);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const REPLICATION_DELAY_MS = 150;
  const store = new EventuallyConsistentObjectStore(3, REPLICATION_DELAY_MS);

  console.log("=== Writing object 'photos/profile-42.jpg' ===");
  await store.put("photos/profile-42.jpg", "<binary jpeg bytes>", "image/jpeg", {
    tier: "hot",
    uploadedBy: "user-42",
  });
  console.log("Write acknowledged to client (only replica-0 has the data so far)\n");

  console.log("=== Immediately reading from replica-0 (the write's primary) ===");
  const fromPrimary = store.get("photos/profile-42.jpg", 0);
  console.log("replica-0 sees:", fromPrimary ? `version ${fromPrimary.version}, ${fromPrimary.metadata.sizeBytes} bytes` : "MISSING");

  console.log("\n=== Immediately reading from replica-1 (not yet replicated) ===");
  const fromReplicaTooSoon = store.get("photos/profile-42.jpg", 1);
  console.log(
    "replica-1 sees:",
    fromReplicaTooSoon ? `version ${fromReplicaTooSoon.version}` : "MISSING — this is the eventual consistency window"
  );

  console.log(`\n=== Waiting ${REPLICATION_DELAY_MS + 50}ms for replication to catch up ===`);
  await sleep(REPLICATION_DELAY_MS + 50);

  const fromReplicaAfterDelay = store.get("photos/profile-42.jpg", 1);
  console.log(
    "replica-1 now sees:",
    fromReplicaAfterDelay ? `version ${fromReplicaAfterDelay.version}` : "still MISSING (unexpected)"
  );

  console.log("\n=== Lesson ===");
  console.log("The object was 'written' the instant put() returned, but a read");
  console.log("routed to a different replica within the replication window could");
  console.log("have returned a miss. This is exactly why classic object stores are");
  console.log("described as 'eventually consistent' — consistency arrives after a");
  console.log("bounded, but real, propagation delay, not instantly.");
}

main();
