/**
 * Idempotent Consumer
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: At-least-once delivery means a consumer must expect the same
 *   message to arrive more than once (e.g., a crash after processing but
 *   before acknowledging causes redelivery). An idempotent consumer makes
 *   processing the same message twice produce the same end state as
 *   processing it once, so duplicates are harmless instead of a correctness
 *   bug (e.g., double-charging a customer or double-decrementing stock).
 * Run: npx ts-node idempotent-consumer.ts
 * Dependencies: none
 */

interface PaymentEvent {
  messageId: string; // unique per logical event, stable across redeliveries
  orderId: string;
  amountCents: number;
}

// Simulates an at-least-once delivery channel: every message is delivered,
// but some are deliberately redelivered to mimic a consumer crashing after
// processing but before acknowledging (the canonical at-least-once scenario).
function simulateAtLeastOnceDelivery(events: PaymentEvent[]): PaymentEvent[] {
  const delivered: PaymentEvent[] = [];
  events.forEach((event, index) => {
    delivered.push(event);
    // Redeliver every other message to simulate an ack that was lost in
    // transit or a consumer crash right after processing it.
    if (index % 2 === 0) {
      delivered.push(event);
    }
  });
  return delivered;
}

// A NON-idempotent consumer: charges the account every time a message is
// processed, with no awareness of duplicates. This is what naive at-least-once
// handling looks like, and it's the bug this whole pattern exists to prevent.
class NaiveAccountBalanceConsumer {
  private balanceCents = 0;
  private processedCount = 0;

  handle(event: PaymentEvent): void {
    this.balanceCents += event.amountCents; // unconditional — duplicates double-charge
    this.processedCount++;
  }

  getBalanceCents(): number {
    return this.balanceCents;
  }

  getProcessedCount(): number {
    return this.processedCount;
  }
}

// An IDEMPOTENT consumer: tracks which message IDs have already been applied
// and skips duplicates. In production this dedup set would be a database
// table with a unique constraint on messageId (so it survives a restart),
// not an in-memory Set — but the logic is identical.
class IdempotentAccountBalanceConsumer {
  private balanceCents = 0;
  private processedMessageIds = new Set<string>();
  private duplicatesSkipped = 0;

  handle(event: PaymentEvent): void {
    if (this.processedMessageIds.has(event.messageId)) {
      // Same message arriving again — this is expected under at-least-once
      // delivery, not an error. Skip it instead of re-applying the effect.
      this.duplicatesSkipped++;
      return;
    }
    this.balanceCents += event.amountCents;
    this.processedMessageIds.add(event.messageId);
  }

  getBalanceCents(): number {
    return this.balanceCents;
  }

  getDuplicatesSkipped(): number {
    return this.duplicatesSkipped;
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const uniqueEvents: PaymentEvent[] = [
    { messageId: "evt-1", orderId: "order-1001", amountCents: 5000 },
    { messageId: "evt-2", orderId: "order-1002", amountCents: 2500 },
    { messageId: "evt-3", orderId: "order-1003", amountCents: 1000 },
  ];
  const expectedTotalCents = uniqueEvents.reduce((sum, e) => sum + e.amountCents, 0);

  const deliveredStream = simulateAtLeastOnceDelivery(uniqueEvents);
  console.log(
    `Simulated at-least-once delivery: ${uniqueEvents.length} unique events delivered as ` +
      `${deliveredStream.length} messages (some redelivered)\n`
  );

  console.log("=== Naive consumer (NOT idempotent) ===");
  const naive = new NaiveAccountBalanceConsumer();
  deliveredStream.forEach((event) => naive.handle(event));
  console.log(`Messages processed: ${naive.getProcessedCount()}`);
  console.log(`Resulting balance: $${(naive.getBalanceCents() / 100).toFixed(2)}`);
  console.log(`Expected balance:  $${(expectedTotalCents / 100).toFixed(2)}`);
  console.log(
    naive.getBalanceCents() !== expectedTotalCents
      ? "BUG: balance is wrong because duplicate deliveries were double-applied.\n"
      : "(unexpectedly correct)\n"
  );

  console.log("=== Idempotent consumer (dedup by message ID) ===");
  const idempotent = new IdempotentAccountBalanceConsumer();
  deliveredStream.forEach((event) => idempotent.handle(event));
  console.log(`Duplicate deliveries skipped: ${idempotent.getDuplicatesSkipped()}`);
  console.log(`Resulting balance: $${(idempotent.getBalanceCents() / 100).toFixed(2)}`);
  console.log(`Expected balance:  $${(expectedTotalCents / 100).toFixed(2)}`);
  console.log(
    idempotent.getBalanceCents() === expectedTotalCents
      ? "Correct: redelivered messages were detected and skipped."
      : "BUG: balance is wrong."
  );
}

main();
