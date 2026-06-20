/**
 * SNS-to-SQS Fan-Out Simulation
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: A single producer publishes ONE event to a pub/sub topic (SNS-style),
 *   which fans it out to multiple independent point-to-point queues (SQS-style),
 *   each consumed by a different downstream service at its own pace. This is the
 *   standard AWS pattern for "one event, several independent reactions" without
 *   the producer knowing how many consumers exist or one slow consumer blocking
 *   the others.
 * Run: npx ts-node sns-fanout-simulation.ts
 * Dependencies: none
 */

interface OrderPlacedEvent {
  orderId: string;
  userId: string;
  totalCents: number;
}

// A minimal SQS-style queue: point-to-point, FIFO, in-memory.
// Each subscriber gets its OWN queue instance — that's what makes one slow
// consumer unable to block any of the others.
class SimpleQueue<T> {
  private messages: T[] = [];
  constructor(public readonly name: string) {}

  push(message: T): void {
    this.messages.push(message);
  }

  drainAll(): T[] {
    const drained = this.messages;
    this.messages = [];
    return drained;
  }

  get depth(): number {
    return this.messages.length;
  }
}

// A minimal SNS-style topic: producers publish once; the topic fans the same
// message out to every subscribed queue. The producer never learns how many
// subscribers exist, satisfying the decoupling goal from the concepts README.
class SimpleTopic<T> {
  private subscribers: SimpleQueue<T>[] = [];

  subscribe(queue: SimpleQueue<T>): void {
    this.subscribers.push(queue);
  }

  publish(message: T): void {
    // Fan-out: every subscriber gets an independent copy of the same message.
    // If "inventory" is slow to drain its queue, "analytics" and
    // "notifications" are completely unaffected — that isolation is the
    // entire point of fan-out over a single shared queue.
    for (const queue of this.subscribers) {
      queue.push(message);
    }
  }
}

// Simulates a downstream service slowly draining its own queue at its own pace.
async function processQueue(
  queue: SimpleQueue<OrderPlacedEvent>,
  serviceName: string,
  simulatedLatencyMs: number
): Promise<void> {
  const messages = queue.drainAll();
  for (const event of messages) {
    await new Promise((resolve) => setTimeout(resolve, simulatedLatencyMs));
    console.log(
      `  [${serviceName}] handled order ${event.orderId} ($${(event.totalCents / 100).toFixed(2)})`
    );
  }
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const orderPlacedTopic = new SimpleTopic<OrderPlacedEvent>();

  // Three independent services, each with its own queue, each reacting to the
  // SAME order-placed event for a completely different reason.
  const inventoryQueue = new SimpleQueue<OrderPlacedEvent>("inventory-service-queue");
  const analyticsQueue = new SimpleQueue<OrderPlacedEvent>("analytics-service-queue");
  const notificationQueue = new SimpleQueue<OrderPlacedEvent>("notification-service-queue");

  orderPlacedTopic.subscribe(inventoryQueue);
  orderPlacedTopic.subscribe(analyticsQueue);
  orderPlacedTopic.subscribe(notificationQueue);

  console.log("=== Producer publishes ONE event per order to the topic ===");
  const orders: OrderPlacedEvent[] = [
    { orderId: "order-1001", userId: "user-1", totalCents: 4999 },
    { orderId: "order-1002", userId: "user-2", totalCents: 1250 },
  ];
  for (const order of orders) {
    orderPlacedTopic.publish(order);
    console.log(`Published order-placed event for ${order.orderId}`);
  }

  console.log(
    `\nQueue depths after publish — inventory: ${inventoryQueue.depth}, ` +
      `analytics: ${analyticsQueue.depth}, notifications: ${notificationQueue.depth}`
  );
  console.log("(each subscriber got its own copy of both events)\n");

  console.log("=== Each consumer drains its own queue independently ===");
  // Notice these run concurrently and at different simulated speeds — a slow
  // inventory service does not delay analytics or notifications at all.
  await Promise.all([
    processQueue(inventoryQueue, "inventory-service", 80), // slowest: stock checks
    processQueue(analyticsQueue, "analytics-service", 10), // fastest: just logs an event
    processQueue(notificationQueue, "notification-service", 40), // sends a confirmation email
  ]);

  console.log("\nAll consumers finished independently — fan-out complete.");
}

main();
