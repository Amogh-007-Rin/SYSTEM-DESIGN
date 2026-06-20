/**
 * Outbox Pattern
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: A service that updates its own database AND separately publishes
 *   an event to a broker can fail between the two steps, leaving them
 *   permanently disagreeing (DB says "paid", no event was ever published).
 *   The outbox pattern fixes this by writing the event into an outbox table
 *   in the SAME transaction as the business write, then having a separate
 *   poller publish unpublished outbox rows afterward. Either both writes
 *   happen or neither does — the event can never be silently forgotten.
 * Run: npx ts-node outbox-pattern.ts
 * Dependencies: none
 */

interface Order {
  id: string;
  status: "PENDING" | "PAID";
}

interface OutboxRow {
  id: string;
  eventType: string;
  payload: string; // JSON-serialized event body
  published: boolean;
}

// A mock broker — stands in for Kafka/RabbitMQ/SQS. Publishing can fail
// transiently, simulated below, to show why the poller must retry rather
// than assume a single publish attempt always succeeds.
class MockMessageBroker {
  private publishedEvents: string[] = [];
  private failNextAttempt = false;

  publish(eventType: string, payload: string): void {
    if (this.failNextAttempt) {
      this.failNextAttempt = false;
      throw new Error("Simulated transient broker outage");
    }
    this.publishedEvents.push(`${eventType}:${payload}`);
  }

  simulateNextPublishFailure(): void {
    this.failNextAttempt = true;
  }

  getPublishedEvents(): string[] {
    return [...this.publishedEvents];
  }
}

// Simulates a relational database with one "business" table (orders) and one
// "outbox" table. The key property this models: writeOrderAsPaid() commits
// BOTH rows atomically, as a single transaction would in a real database —
// there is no code path where one write happens without the other.
class MockDatabaseWithOutbox {
  private orders = new Map<string, Order>();
  private outbox: OutboxRow[] = [];
  private outboxIdCounter = 0;

  seedOrder(order: Order): void {
    this.orders.set(order.id, order);
  }

  // Models a single atomic transaction: the order status flips to PAID and
  // an outbox row recording "OrderPaid" is inserted together, or (in a real
  // DB) neither is committed if the transaction fails. This atomicity is the
  // entire reason the outbox pattern works.
  markOrderPaidWithOutboxEntry(orderId: string): void {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    order.status = "PAID";
    this.outboxIdCounter++;
    this.outbox.push({
      id: `outbox-${this.outboxIdCounter}`,
      eventType: "OrderPaid",
      payload: JSON.stringify({ orderId }),
      published: false,
    });
  }

  getUnpublishedOutboxRows(): OutboxRow[] {
    return this.outbox.filter((row) => !row.published);
  }

  markOutboxRowPublished(outboxId: string): void {
    const row = this.outbox.find((r) => r.id === outboxId);
    if (row) row.published = true;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }
}

// The poller: runs periodically (here, called manually for determinism),
// reads unpublished outbox rows, and publishes each one. It is itself just
// another at-least-once consumer of the outbox table — if publish() succeeds
// but the process crashes before markOutboxRowPublished() runs, the row gets
// republished on the next poll. That's expected, not a bug: the downstream
// consumer of OrderPaid must be idempotent for exactly this reason.
function pollAndPublishOutbox(db: MockDatabaseWithOutbox, broker: MockMessageBroker): void {
  const unpublished = db.getUnpublishedOutboxRows();
  for (const row of unpublished) {
    try {
      broker.publish(row.eventType, row.payload);
      db.markOutboxRowPublished(row.id);
      console.log(`  Published ${row.eventType} (outbox row ${row.id})`);
    } catch (err) {
      console.log(
        `  Failed to publish outbox row ${row.id}: ${(err as Error).message} — will retry next poll`
      );
    }
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const db = new MockDatabaseWithOutbox();
  const broker = new MockMessageBroker();

  db.seedOrder({ id: "order-2001", status: "PENDING" });

  console.log("=== Step 1: business write + outbox write happen atomically ===");
  db.markOrderPaidWithOutboxEntry("order-2001");
  console.log(`Order status: ${db.getOrder("order-2001")?.status}`);
  console.log(`Unpublished outbox rows: ${db.getUnpublishedOutboxRows().length}\n`);

  console.log("=== Step 2: first poll attempt — broker is temporarily down ===");
  broker.simulateNextPublishFailure();
  pollAndPublishOutbox(db, broker);
  console.log(`Unpublished outbox rows after failed attempt: ${db.getUnpublishedOutboxRows().length}\n`);

  console.log("=== Step 3: next poll — broker is healthy, publish succeeds ===");
  pollAndPublishOutbox(db, broker);
  console.log(`Unpublished outbox rows remaining: ${db.getUnpublishedOutboxRows().length}`);
  console.log(`Events actually delivered to the broker: ${JSON.stringify(broker.getPublishedEvents())}`);

  console.log(
    "\nThe order was marked PAID even while the broker was down — and the event was " +
      "never lost, just retried on the next poll. Without the outbox, that failed publish " +
      "attempt would have silently dropped the OrderPaid event forever."
  );
}

main();
