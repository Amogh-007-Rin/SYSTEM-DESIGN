/**
 * Change Data Capture (CDC) Simulator
 * Module: 17 — Data Pipelines & Stream Processing
 * Concept: A simplified stand-in for Debezium: a mock database transaction
 *   log (the kind every real database already writes internally for crash
 *   recovery -- PostgreSQL's WAL, MySQL's binlog) is appended to as an
 *   application performs inserts/updates/deletes. A separate "connector"
 *   tails that log from where it last left off and converts each raw log
 *   entry into a structured change event, publishing it downstream -- with
 *   the application itself never knowing the connector exists. This is the
 *   core trick that makes CDC superior to manually publishing events: the
 *   log is already the source of truth, so nothing can be written to the
 *   database without the connector eventually seeing it.
 * Run: npx ts-node cdc-simulator.ts
 * Dependencies: none (Node.js built-ins only)
 */

type RowOperation = "INSERT" | "UPDATE" | "DELETE";

// A single entry in the database's transaction log -- exactly the kind of
// record a real WAL/binlog already contains for every committed write.
interface TransactionLogEntry {
  lsn: number; // "Log Sequence Number" -- a monotonically increasing position in the log
  table: string;
  operation: RowOperation;
  before: Record<string, unknown> | null; // row state before the change (null for INSERT)
  after: Record<string, unknown> | null; // row state after the change (null for DELETE)
}

// The structured event a CDC connector publishes downstream -- this is what
// a consumer (a search indexer, a cache invalidator, a warehouse loader)
// actually subscribes to, never touching the raw log itself.
interface ChangeEvent {
  table: string;
  operation: RowOperation;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  capturedAtLsn: number;
}

// Stands in for the database engine: every write the "application" performs
// appends one entry here. This is the ONLY place application writes happen --
// the connector never talks to the application directly.
class MockTransactionLog {
  private entries: TransactionLogEntry[] = [];
  private nextLsn = 1;

  insert(table: string, row: Record<string, unknown>): void {
    this.entries.push({ lsn: this.nextLsn++, table, operation: "INSERT", before: null, after: row });
  }

  update(table: string, before: Record<string, unknown>, after: Record<string, unknown>): void {
    this.entries.push({ lsn: this.nextLsn++, table, operation: "UPDATE", before, after });
  }

  delete(table: string, row: Record<string, unknown>): void {
    this.entries.push({ lsn: this.nextLsn++, table, operation: "DELETE", before: row, after: null });
  }

  // A connector tails the log by asking for everything strictly after the
  // last LSN it has already processed -- exactly how Debezium resumes
  // tailing a WAL/binlog from its last committed offset after a restart.
  readEntriesAfter(lsn: number): TransactionLogEntry[] {
    return this.entries.filter((entry) => entry.lsn > lsn);
  }
}

// Stands in for a Debezium connector + the Kafka topic it publishes to: it
// tails the transaction log, converts raw entries into ChangeEvents, and
// hands them to whichever downstream consumers are subscribed.
class CdcConnector {
  private lastProcessedLsn = 0;
  private subscribers: Array<(event: ChangeEvent) => void> = [];

  constructor(private readonly log: MockTransactionLog, private readonly tableFilter: string) {}

  subscribe(consumer: (event: ChangeEvent) => void): void {
    this.subscribers.push(consumer);
  }

  // In a real Debezium deployment this runs continuously in the background;
  // here we call it explicitly to make each "poll cycle" visible in the demo.
  poll(): number {
    const newEntries = this.log
      .readEntriesAfter(this.lastProcessedLsn)
      .filter((entry) => entry.table === this.tableFilter);

    for (const entry of newEntries) {
      const event: ChangeEvent = {
        table: entry.table,
        operation: entry.operation,
        before: entry.before,
        after: entry.after,
        capturedAtLsn: entry.lsn,
      };
      for (const consumer of this.subscribers) consumer(event);
      this.lastProcessedLsn = entry.lsn;
    }

    return newEntries.length;
  }
}

function describeEvent(event: ChangeEvent): string {
  switch (event.operation) {
    case "INSERT":
      return `INSERT into ${event.table}: ${JSON.stringify(event.after)}`;
    case "UPDATE":
      return `UPDATE on ${event.table}: ${JSON.stringify(event.before)} -> ${JSON.stringify(event.after)}`;
    case "DELETE":
      return `DELETE from ${event.table}: ${JSON.stringify(event.before)}`;
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const log = new MockTransactionLog();
  const connector = new CdcConnector(log, "orders");

  // Two independent downstream consumers, exactly as multiple Kafka consumer
  // groups can each independently subscribe to the same CDC topic.
  const searchIndexEvents: ChangeEvent[] = [];
  const cacheInvalidations: string[] = [];

  connector.subscribe((event) => {
    searchIndexEvents.push(event);
  });
  connector.subscribe((event) => {
    const orderId = (event.after ?? event.before)?.["orderId"];
    cacheInvalidations.push(`order:${orderId}`);
  });

  console.log("=== Application performs writes directly to its own database (no events published) ===");
  log.insert("orders", { orderId: 1001, status: "pending", total: 42.5 });
  log.insert("orders", { orderId: 1002, status: "pending", total: 17.0 });
  // A write to an unrelated table -- the connector is filtered to "orders"
  // only, so this must NOT show up in captured events below.
  log.insert("users", { userId: 7, email: "demo@example.com" });
  console.log("3 raw writes committed to the transaction log (2 to `orders`, 1 to `users`)\n");

  console.log("=== CDC connector polls the transaction log (poll cycle 1) ===");
  const capturedFirstPoll = connector.poll();
  console.log(`Captured ${capturedFirstPoll} change events for table 'orders' (the 'users' write was filtered out)\n`);

  console.log("=== Application updates and deletes rows -- connector hasn't polled yet ===");
  log.update("orders", { orderId: 1001, status: "pending", total: 42.5 }, { orderId: 1001, status: "shipped", total: 42.5 });
  log.delete("orders", { orderId: 1002, status: "pending", total: 17.0 });
  console.log("2 more raw writes committed (1 update, 1 delete) -- still not yet captured\n");

  console.log("=== CDC connector polls again (poll cycle 2) ===");
  const capturedSecondPoll = connector.poll();
  console.log(`Captured ${capturedSecondPoll} more change events\n`);

  console.log("=== All change events captured downstream, in commit order ===");
  for (const event of searchIndexEvents) {
    console.log(`  [lsn ${event.capturedAtLsn}] ${describeEvent(event)}`);
  }

  console.log("\n=== Derived cache invalidation keys (a second, independent consumer) ===");
  console.log(" ", cacheInvalidations.join(", "));

  console.log("\n=== Lesson ===");
  console.log("The application never called an 'emit event' function -- it only ever wrote");
  console.log("to its own database. Every change still reached two independent downstream");
  console.log("consumers because the connector reads the same transaction log the database");
  console.log("already maintains for itself, which is exactly what makes CDC retrofittable");
  console.log("onto a database that has been running in production for years.");
}

main();
