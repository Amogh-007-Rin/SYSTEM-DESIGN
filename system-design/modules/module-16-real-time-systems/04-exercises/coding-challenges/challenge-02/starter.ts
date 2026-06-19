/**
 * Presence System (Heartbeat + Redis TTL)
 * Module: 16 — Real-Time Systems
 * Concept: "Online" is an inference, not a fact the server has perfect
 *   knowledge of — a client's heartbeat refreshes a TTL key, and the
 *   absence of a heartbeat within the timeout window is what "offline"
 *   actually means. The TtlClient interface mirrors ioredis's method
 *   shapes so swapping in real Redis later requires no change to
 *   PresenceTracker itself.
 * Run: npx ts-node starter.ts
 * Dependencies: none (in-memory mock — see README for the real-Redis swap)
 */

interface TtlClient {
  /** Sets `key` to `value` with an expiry `ttlMs` milliseconds from now. */
  set(key: string, value: string, ttlMs: number): Promise<void>;
  /** Returns the stored value, or null if the key is absent or expired. */
  get(key: string): Promise<string | null>;
  /** Returns the epoch-ms timestamp the key expires at, or null if absent/expired. */
  getExpiry(key: string): Promise<number | null>;
  /** Deletes the key immediately, regardless of its TTL. */
  del(key: string): Promise<void>;
}

// A zero-infrastructure stand-in for ioredis with the same method shapes.
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

/**
 * TODO: Implement PresenceTracker.
 *
 * heartbeat(userId): Promise<void>
 *   - key = `presence:${userId}`
 *   - Check whether the user was previously online (cache.getExpiry(key) !== null)
 *     BEFORE refreshing, so you can detect an offline -> online transition.
 *   - cache.set(key, "online", this.timeoutMs) — refresh/create the TTL key.
 *   - If the user was previously offline (or never seen), emit("online", userId).
 *
 * isOnline(userId): Promise<boolean>
 *   - True only if cache.getExpiry(`presence:${userId}`) is non-null (i.e., not expired).
 *
 * startSweep(intervalMs): void
 *   - Every `intervalMs`, for each userId this tracker has ever seen,
 *     check isOnline(userId). If false AND we still think they're online
 *     (per local bookkeeping), emit("offline", userId) and update bookkeeping.
 *   - Store the interval handle so stopSweep() can clear it.
 *
 * stopSweep(): void
 *   - clearInterval on the stored handle, if any.
 *
 * onStatusChange(listener): void
 *   - Register a listener invoked on every online/offline transition.
 */
class PresenceTracker {
  private knownUserIds: Set<string> = new Set();
  private listeners: PresenceListener[] = [];
  private sweepHandle: NodeJS.Timeout | null = null;

  constructor(private cache: TtlClient, private timeoutMs: number = 15_000) {}

  async heartbeat(userId: string): Promise<void> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  async isOnline(userId: string): Promise<boolean> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  startSweep(intervalMs: number): void {
    // TODO: implement
  }

  stopSweep(): void {
    // TODO: implement
  }

  onStatusChange(listener: PresenceListener): void {
    this.listeners.push(listener);
  }

  protected emit(status: "online" | "offline", userId: string): void {
    for (const listener of this.listeners) listener(userId, status);
  }
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const cache = new InMemoryTtlClient();
  const tracker = new PresenceTracker(cache, 500); // 500ms timeout window for the demo

  tracker.onStatusChange((userId, status) => {
    console.log(`[PRESENCE] ${userId} -> ${status}`);
  });

  await tracker.heartbeat("alice");
  await tracker.heartbeat("bob");

  console.log("alice online?", await tracker.isOnline("alice"));
  console.log("bob online?", await tracker.isOnline("bob"));

  tracker.startSweep(200);

  // bob stops heartbeating; alice keeps going. After the timeout window
  // elapses, the sweep should detect bob going offline while alice stays online.
  const aliceInterval = setInterval(() => tracker.heartbeat("alice"), 150);

  setTimeout(async () => {
    console.log("bob online after timeout elapsed?", await tracker.isOnline("bob"));
    clearInterval(aliceInterval);
    tracker.stopSweep();
  }, 1200);
}

main();
