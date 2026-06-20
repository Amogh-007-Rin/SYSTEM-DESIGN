// SOLUTION FILE — try starter.ts first!
/**
 * Presence System (Heartbeat + Redis TTL)
 * Module: 16 — Real-Time Systems
 * Concept: "Online" is an inference, not a fact the server has perfect
 *   knowledge of — a client's heartbeat refreshes a TTL key, and the
 *   absence of a heartbeat within the timeout window is what "offline"
 *   actually means. The TtlClient interface mirrors ioredis's method
 *   shapes so swapping in real Redis later requires no change to
 *   PresenceTracker itself.
 * Run: npx ts-node solution.ts
 * Dependencies: none (in-memory mock — see README for the real-Redis swap)
 */

interface TtlClient {
  set(key: string, value: string, ttlMs: number): Promise<void>;
  get(key: string): Promise<string | null>;
  getExpiry(key: string): Promise<number | null>;
  del(key: string): Promise<void>;
}

// A zero-infrastructure stand-in for ioredis with the same method shapes.
// Swapping in real Redis means implementing this same interface against
// `ioredis`: `set` maps to `SET key value PX ttlMs`, `getExpiry` maps to
// `PEXPIRETIME key` (Redis 7+) or tracking the expiry client-side, `del`
// maps directly to `DEL key`.
class InMemoryTtlClient implements TtlClient {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.value;
  }

  async getExpiry(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.expiresAt;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

type PresenceListener = (userId: string, status: "online" | "offline") => void;

class PresenceTracker {
  private knownUserIds: Set<string> = new Set();
  // Local bookkeeping of "do we currently believe this user is online,"
  // separate from the TTL key itself — this is what lets the sweep notice
  // a transition exactly once, rather than re-announcing "offline" on every
  // sweep tick for a user who's been offline for a while.
  private believedOnline: Set<string> = new Set();
  private listeners: PresenceListener[] = [];
  private sweepHandle: NodeJS.Timeout | null = null;

  constructor(private cache: TtlClient, private timeoutMs: number = 15_000) {}

  private presenceKey(userId: string): string {
    return `presence:${userId}`;
  }

  async heartbeat(userId: string): Promise<void> {
    this.knownUserIds.add(userId);

    const wasOnline = await this.isOnline(userId);
    await this.cache.set(this.presenceKey(userId), "online", this.timeoutMs);

    if (!wasOnline) {
      this.believedOnline.add(userId);
      this.emit("online", userId);
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    const expiry = await this.cache.getExpiry(this.presenceKey(userId));
    return expiry !== null;
  }

  startSweep(intervalMs: number): void {
    this.sweepHandle = setInterval(() => {
      // Fire-and-forget: the sweep tick itself is synchronous scheduling,
      // but checking each user's TTL is async (mirrors a real Redis round trip).
      void this.runSweepTick();
    }, intervalMs);
  }

  private async runSweepTick(): Promise<void> {
    for (const userId of this.knownUserIds) {
      const stillOnline = await this.isOnline(userId);
      if (!stillOnline && this.believedOnline.has(userId)) {
        this.believedOnline.delete(userId);
        this.emit("offline", userId);
      }
    }
  }

  stopSweep(): void {
    if (this.sweepHandle) {
      clearInterval(this.sweepHandle);
      this.sweepHandle = null;
    }
  }

  onStatusChange(listener: PresenceListener): void {
    this.listeners.push(listener);
  }

  protected emit(status: "online" | "offline", userId: string): void {
    for (const listener of this.listeners) listener(userId, status);
  }
}

// === USAGE EXAMPLE ===
// Uses short real timeouts (not accelerated/mocked time) so the demo stays
// simple to read, while still completing in well under a couple of seconds.
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log("=== Presence System: heartbeat + TTL ===\n");

  const cache = new InMemoryTtlClient();
  const TIMEOUT_MS = 300; // a user is considered offline after 300ms of silence
  const tracker = new PresenceTracker(cache, TIMEOUT_MS);

  const transitions: Array<{ userId: string; status: string; atMs: number }> = [];
  const start = Date.now();
  tracker.onStatusChange((userId, status) => {
    const atMs = Date.now() - start;
    transitions.push({ userId, status, atMs });
    console.log(`[+${atMs.toString().padStart(4)}ms] [PRESENCE] ${userId} -> ${status}`);
  });

  // Three users heartbeat at different cadences:
  //  - alice: every 100ms (well under the 300ms timeout) -> stays online throughout
  //  - bob:   heartbeats twice, then goes silent -> should flip offline after ~300ms of silence
  //  - carol: every 120ms -> stays online throughout
  await tracker.heartbeat("alice");
  await tracker.heartbeat("bob");
  await tracker.heartbeat("carol");
  console.log("Initial heartbeats sent for alice, bob, carol.\n");

  tracker.startSweep(50); // sweep frequently relative to the timeout, for prompt detection

  const aliceTimer = setInterval(() => void tracker.heartbeat("alice"), 100);
  const carolTimer = setInterval(() => void tracker.heartbeat("carol"), 120);
  // bob: one more heartbeat shortly after start, then silence.
  const bobTimer = setTimeout(() => void tracker.heartbeat("bob"), 100);

  // Let the simulation run long enough for bob's silence to exceed the
  // timeout window (300ms) by a comfortable margin, while alice/carol
  // keep heartbeating well within it.
  await sleep(900);

  clearInterval(aliceTimer);
  clearInterval(carolTimer);
  clearTimeout(bobTimer);
  tracker.stopSweep();

  console.log("\n=== Final state ===");
  console.log("alice online?", await tracker.isOnline("alice"), "(expected: true — heartbeated throughout)");
  console.log("bob online?", await tracker.isOnline("bob"), "(expected: false — went silent after ~100ms)");
  console.log("carol online?", await tracker.isOnline("carol"), "(expected: true — heartbeated throughout)");

  const bobWentOffline = transitions.some((t) => t.userId === "bob" && t.status === "offline");
  const aliceNeverWentOffline = !transitions.some((t) => t.userId === "alice" && t.status === "offline");
  console.log(`\nSweep correctly detected bob's offline transition: ${bobWentOffline}`);
  console.log(`alice never incorrectly flagged offline: ${aliceNeverWentOffline}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
