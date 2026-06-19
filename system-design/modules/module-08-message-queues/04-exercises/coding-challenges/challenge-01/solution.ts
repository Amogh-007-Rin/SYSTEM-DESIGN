// SOLUTION FILE — try starter.ts first!
/**
 * In-Memory Message Queue with Dead Letter Queue
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: At-least-once delivery with visibility timeout and DLQ.
 *   Messages that fail maxRetries times are moved to the DLQ.
 * Run: npx ts-node solution.ts
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

class MessageQueue<T> {
  private queue: Message<T>[] = [];
  private dlq: Message<T>[] = [];
  private config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;
  }

  enqueue(payload: T): string {
    const id = Date.now().toString() + Math.random();
    const message: Message<T> = {
      id,
      payload,
      attempts: 0,
      enqueuedAt: Date.now(),
      // No visibilityTimeout yet — the message is immediately visible to
      // the first receive() call, exactly like a freshly-published SQS message.
      visibilityTimeout: undefined,
    };
    this.queue.push(message);
    return id;
  }

  receive(): Message<T> | null {
    const now = Date.now();
    // A message is "visible" if it has never been received (no timeout set)
    // or its previous visibility window has already expired — i.e. nobody
    // successfully ack'd it in time, so it's eligible to be handed out again.
    const message = this.queue.find(
      (m) => m.visibilityTimeout === undefined || m.visibilityTimeout <= now
    );
    if (!message) return null;

    message.attempts++;

    // The retry budget is exhausted: this message has now been attempted
    // more times than maxRetries allows. Move it to the DLQ instead of
    // handing it out again, so a permanently-failing message can't block
    // the queue forever or be retried into infinity.
    if (message.attempts > this.config.maxRetries) {
      this.queue = this.queue.filter((m) => m.id !== message.id);
      this.dlq.push(message);
      return null;
    }

    // Hide the message from other receive() calls until the visibility
    // timeout elapses — this is what prevents two consumers from
    // processing the same in-flight message concurrently.
    message.visibilityTimeout = now + this.config.visibilityTimeoutMs;
    return message;
  }

  ack(messageId: string): boolean {
    const sizeBefore = this.queue.length;
    this.queue = this.queue.filter((m) => m.id !== messageId);
    return this.queue.length < sizeBefore;
  }

  nack(messageId: string): void {
    // Explicit failure signal: make the message visible again RIGHT NOW
    // instead of making other consumers wait out the rest of the
    // visibility timeout window before they can retry it.
    const message = this.queue.find((m) => m.id === messageId);
    if (message) {
      message.visibilityTimeout = undefined;
    }
  }

  getStats(): { queueDepth: number; dlqDepth: number; inFlight: number } {
    const now = Date.now();
    const inFlight = this.queue.filter(
      (m) => m.visibilityTimeout !== undefined && m.visibilityTimeout > now
    ).length;
    return {
      queueDepth: this.queue.length,
      dlqDepth: this.dlq.length,
      inFlight,
    };
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
