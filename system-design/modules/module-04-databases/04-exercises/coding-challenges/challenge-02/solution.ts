// SOLUTION FILE — try starter.ts first!
/**
 * Connection Pool
 * Module: 04 — Databases
 * Concept: Opening a connection is expensive; a pool amortizes that cost by
 *   reusing a fixed number of connections across many sequential callers
 *   instead of paying setup cost per request.
 * Run: npx ts-node solution.ts
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
    const idle = this.idleConnections.pop();
    if (idle) {
      this.inUseCount++;
      return idle;
    }

    if (this.totalCreated < this.maxSize) {
      this.totalCreated++;
      this.inUseCount++;
      return this.createConnection();
    }

    // Pool is exhausted: queue this caller. release() will resolve this
    // promise directly with a connection instead of ever touching the idle
    // list — this is what makes the wait FIFO instead of a race.
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  release(conn: PooledConnection): void {
    const nextWaiter = this.waiters.shift();
    if (nextWaiter) {
      // Hand the connection straight to the next waiter — inUseCount stays
      // the same since one "in use" slot is immediately replaced by another.
      nextWaiter(conn);
      return;
    }

    this.inUseCount--;
    this.idleConnections.push(conn);
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
  await new Promise((r) => setTimeout(r, 50));
  const id = ++connectionCounter;
  return { id, query: async (sql) => `result of "${sql}" from connection ${id}` };
}

async function simulatedCaller(pool: ConnectionPool, label: string): Promise<void> {
  const conn = await pool.acquire();
  console.log(`${label}: acquired connection ${conn.id}`);
  await new Promise((r) => setTimeout(r, 100));
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
