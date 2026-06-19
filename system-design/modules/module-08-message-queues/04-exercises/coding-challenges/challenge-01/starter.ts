/**
 * In-Memory Message Queue with Dead Letter Queue
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: At-least-once delivery with visibility timeout and DLQ.
 *   Messages that fail maxRetries times are moved to the DLQ.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface Message<T> {
  id: string;
  payload: T;
  attempts: number;
  enqueuedAt: number;
  visibilityTimeout?: number; // epoch ms when message becomes visible again
}

interface QueueConfig {
  maxRetries: number;
  visibilityTimeoutMs: number;
}

/**
 * TODO: Implement MessageQueue<T>.
 *
 * enqueue(payload): string
 *   Create Message (id = Date.now().toString() + Math.random()), add to queue, return id.
 *
 * receive(): Message<T> | null
 *   Find first visible message (no visibilityTimeout, or it has expired).
 *   Set visibilityTimeout = Date.now() + config.visibilityTimeoutMs.
 *   Increment attempts.
 *   If attempts > maxRetries: move to dlq, return null.
 *   Return the message.
 *
 * ack(messageId): boolean
 *   Remove message from queue. Return true if found.
 *
 * nack(messageId): void
 *   Reset visibilityTimeout to undefined (make immediately visible again).
 *
 * getStats(): { queueDepth, dlqDepth, inFlight }
 *   inFlight = messages with a future visibilityTimeout
 */
class MessageQueue<T> {
  private queue: Message<T>[] = [];
  private dlq: Message<T>[] = [];
  private config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;
  }

  enqueue(payload: T): string {
    // TODO: implement
    throw new Error("Not implemented");
  }

  receive(): Message<T> | null {
    // TODO: implement
    throw new Error("Not implemented");
  }

  ack(messageId: string): boolean {
    // TODO: implement
    throw new Error("Not implemented");
  }

  nack(messageId: string): void {
    // TODO: implement
  }

  getStats(): { queueDepth: number; dlqDepth: number; inFlight: number } {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getDLQMessages(): Message<T>[] {
    return [...this.dlq];
  }
}

// === USAGE EXAMPLE ===
async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function simulate(): Promise<void> {
  const q = new MessageQueue<string>({ maxRetries: 3, visibilityTimeoutMs: 500 });
  q.enqueue("order:1001");
  q.enqueue("order:1002");
  q.enqueue("order:1003");
  console.log("After enqueue:", q.getStats());

  const m1 = q.receive();
  if (m1) { console.log(`Processing: ${m1.payload}`); q.ack(m1.id); }

  for (let i = 0; i < 4; i++) {
    const m = q.receive();
    if (m) {
      console.log(`Attempt ${m.attempts} on ${m.payload} — failing`);
      q.nack(m.id);
      await sleep(100);
    }
  }

  console.log("\nFinal stats:", q.getStats());
  console.log("DLQ:", q.getDLQMessages().map((m) => m.payload));
}
simulate();
