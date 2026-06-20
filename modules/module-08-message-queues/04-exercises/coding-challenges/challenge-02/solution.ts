// SOLUTION FILE — try starter.ts first!
/**
 * Kafka Consumer Group Simulation
 * Module: 08 — Message Queues & Event-Driven Architecture
 * Concept: A topic's partitions are divided among the active consumers in a
 *   consumer group. When a consumer joins or leaves, a rebalance reassigns
 *   partitions across whoever is currently active, as evenly as possible.
 * Run: npx ts-node solution.ts
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

class ConsumerGroup {
  private activeConsumers: string[] = [];
  private assignment: Map<string, number[]> = new Map();

  constructor(private topic: Topic) {}

  addConsumer(consumerId: string): void {
    if (this.activeConsumers.includes(consumerId)) return;
    this.activeConsumers.push(consumerId);
    // A consumer joining is exactly the trigger for a real Kafka rebalance:
    // the group coordinator must redraw partition ownership now that the
    // member set has changed.
    this.rebalance();
  }

  removeConsumer(consumerId: string): void {
    this.activeConsumers = this.activeConsumers.filter((id) => id !== consumerId);
    // The departed consumer's partitions can't just sit unassigned — every
    // partition must always have an owner (or none, if the group is empty),
    // so removal also triggers a rebalance.
    this.rebalance();
  }

  rebalance(): void {
    const newAssignment = new Map<string, number[]>();

    if (this.activeConsumers.length === 0) {
      this.assignment = newAssignment;
      return;
    }

    for (const consumerId of this.activeConsumers) {
      newAssignment.set(consumerId, []);
    }

    // Round-robin: partition i goes to activeConsumers[i % activeConsumers.length].
    // This guarantees every consumer's partition count differs by at most 1,
    // which is the property a correct rebalance must hold regardless of how
    // many partitions or consumers there are.
    for (const partitionId of this.topic.partitionIds) {
      const consumerIndex = partitionId % this.activeConsumers.length;
      const consumerId = this.activeConsumers[consumerIndex];
      newAssignment.get(consumerId)!.push(partitionId);
    }

    this.assignment = newAssignment;
  }

  getAssignment(): Map<string, number[]> {
    // Return a defensive copy (including the inner arrays) so callers can't
    // mutate this group's internal assignment state directly.
    const copy = new Map<string, number[]>();
    this.assignment.forEach((partitions, consumerId) => {
      copy.set(consumerId, [...partitions]);
    });
    return copy;
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
