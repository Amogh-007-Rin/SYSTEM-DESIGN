/**
 * Kafka Consumer Group Simulation
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: A topic's partitions are divided among the active consumers in a
 *   consumer group. When a consumer joins or leaves, a rebalance reassigns
 *   partitions across whoever is currently active, as evenly as possible.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

/**
 * A topic with a fixed number of partitions, numbered 0..partitionCount-1.
 */
class Topic {
  readonly partitionIds: number[];

  constructor(readonly partitionCount: number) {
    this.partitionIds = Array.from({ length: partitionCount }, (_, i) => i);
  }
}

/**
 * TODO: Implement ConsumerGroup.
 *
 * Internals:
 *   topic: Topic — the topic this group is consuming
 *   activeConsumers: string[] — IDs of currently active consumers, in the
 *     order they joined (use this order for round-robin assignment so
 *     results are deterministic and testable)
 *   assignment: Map<string, number[]> — consumerId -> assigned partition IDs
 *
 * addConsumer(consumerId): void
 *   Add consumerId to activeConsumers (no-op if already present).
 *   Call rebalance().
 *
 * removeConsumer(consumerId): void
 *   Remove consumerId from activeConsumers.
 *   Call rebalance() so its partitions are redistributed to the rest.
 *
 * rebalance(): void
 *   Clear the current assignment and redistribute ALL of the topic's
 *   partitions across activeConsumers round-robin: partition 0 -> first
 *   consumer, partition 1 -> second consumer, ... wrapping back to the
 *   first consumer after the last one. If there are no active consumers,
 *   the assignment should end up empty.
 *
 *   Partition counts per consumer must differ by at most 1 (true of any
 *   correct round-robin distribution).
 *
 * getAssignment(): Map<string, number[]>
 *   Return a copy of the current assignment (so callers can't mutate
 *   internal state directly).
 */
class ConsumerGroup {
  private activeConsumers: string[] = [];
  private assignment: Map<string, number[]> = new Map();

  constructor(private topic: Topic) {}

  addConsumer(consumerId: string): void {
    // TODO: implement
  }

  removeConsumer(consumerId: string): void {
    // TODO: implement
  }

  rebalance(): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  getAssignment(): Map<string, number[]> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  printAssignment(): void {
    if (this.assignment.size === 0) {
      console.log("  (no active consumers)");
      return;
    }
    this.assignment.forEach((partitions, consumerId) => {
      console.log(`  ${consumerId}: partitions [${partitions.join(", ")}]`);
    });
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const topic = new Topic(6);
  const group = new ConsumerGroup(topic);

  console.log("=== 3 consumers join a 6-partition topic ===");
  group.addConsumer("consumer-A");
  group.addConsumer("consumer-B");
  group.addConsumer("consumer-C");
  group.printAssignment();
  console.log("(expect 2 partitions per consumer)\n");

  console.log("=== consumer-B leaves (crash / scale-down) — rebalance triggered ===");
  group.removeConsumer("consumer-B");
  group.printAssignment();
  console.log("(expect 3 partitions split across consumer-A and consumer-C)\n");

  console.log("=== consumer-D joins — rebalance triggered again ===");
  group.addConsumer("consumer-D");
  group.printAssignment();
  console.log("(expect 6 partitions split evenly across 3 active consumers again)");
}
main();
