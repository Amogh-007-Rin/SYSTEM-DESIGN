/**
 * Connection Pool
 * Module: 04 — Databases
 * Concept: Opening a connection is expensive; a pool amortizes that cost by
 *   reusing a fixed number of connections across many sequential callers
 *   instead of paying setup cost per request.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface PooledConnection {
  id: number;
  query: (sql: string) => Promise<string>;
}

interface PoolStats {
  totalCreated: number;
  idle: number;
  inUse: number;
  waiting: number;
}

/**
 * TODO: Implement ConnectionPool.
 *
 * acquire(): Promise<PooledConnection>
 *   - If an idle connection exists, remove it from idle, mark in-use, resolve with it.
 *   - Else if totalCreated < maxSize, create a new one (await createConnection()),
 *     mark in-use, resolve with it.
 *   - Else, push a resolver function onto a waiting queue and return a Promise
 *     that resolves when release() services it.
 *
 * release(conn): void
 *   - If there's a waiter, hand the connection directly to the longest-waiting
 *     one (FIFO) instead of putting it back in the idle pool.
 *   - Else, mark it idle.
 *
 * getStats(): PoolStats
 */
class ConnectionPool {
  private maxSize: number;
  private createConnection: () => Promise<PooledConnection>;
  private idleConnections: PooledConnection[] = [];
  private inUseCount = 0;
  private totalCreated = 0;
  private waiters: Array<(conn: PooledConnection) => void> = [];

  constructor(maxSize: number, createConnection: () => Promise<PooledConnection>) {
    this.maxSize = maxSize;
    this.createConnection = createConnection;
  }

  async acquire(): Promise<PooledConnection> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  release(conn: PooledConnection): void {
    // TODO: implement
  }

  getStats(): PoolStats {
    return {
      totalCreated: this.totalCreated,
      idle: this.idleConnections.length,
      inUse: this.inUseCount,
      waiting: this.waiters.length,
    };
  }
}

// === USAGE EXAMPLE ===
let connectionCounter = 0;
async function createConnection(): Promise<PooledConnection> {
  await new Promise((r) => setTimeout(r, 50)); // simulate connection setup cost
  const id = ++connectionCounter;
  return { id, query: async (sql) => `result of "${sql}" from connection ${id}` };
}

async function simulatedCaller(pool: ConnectionPool, label: string): Promise<void> {
  const conn = await pool.acquire();
  console.log(`${label}: acquired connection ${conn.id}`);
  await new Promise((r) => setTimeout(r, 100)); // simulate using the connection
  pool.release(conn);
  console.log(`${label}: released connection ${conn.id}`);
}

async function main(): Promise<void> {
  const pool = new ConnectionPool(2, createConnection);

  await Promise.all([
    simulatedCaller(pool, "Caller A"),
    simulatedCaller(pool, "Caller B"),
    simulatedCaller(pool, "Caller C"),
    simulatedCaller(pool, "Caller D"),
    simulatedCaller(pool, "Caller E"),
  ]);

  console.log("\nFinal stats:", pool.getStats());
}

main();
