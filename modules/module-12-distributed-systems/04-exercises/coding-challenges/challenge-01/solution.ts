// SOLUTION FILE — try starter.ts first!
/**
 * Lamport Timestamps
 * Module: 12 — Distributed Systems Fundamentals
 * Concept: Logical clocks provide happened-before ordering without a global clock.
 *   Rule: increment before send; on receive, clock = max(local, received) + 1.
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

interface LamportEvent {
  nodeId: string;
  eventName: string;
  timestamp: number;
}

class LamportNode {
  public readonly nodeId: string;
  private clock = 0;
  private eventLog: LamportEvent[] = [];

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  // A purely local event (no communication involved) still advances the
  // clock — every event on a node, local or not, gets its own tick.
  localEvent(name: string): LamportEvent {
    this.clock++;
    const event: LamportEvent = { nodeId: this.nodeId, eventName: name, timestamp: this.clock };
    this.eventLog.push(event);
    return event;
  }

  // Sending a message is itself an event: increment first, then stamp the
  // outgoing message with the new clock value so the receiver can fold it
  // into its own clock.
  send(name: string): { event: LamportEvent; timestamp: number } {
    this.clock++;
    const event: LamportEvent = { nodeId: this.nodeId, eventName: name, timestamp: this.clock };
    this.eventLog.push(event);
    return { event, timestamp: this.clock };
  }

  // The core Lamport rule: a receiver's clock must end up strictly greater
  // than both what it already knew (its own clock) AND what the sender knew
  // at send time (senderTimestamp) — this is exactly what guarantees
  // "receive" is ordered after the "send" that caused it, no matter how the
  // two nodes' clocks had drifted apart beforehand.
  receive(name: string, senderTimestamp: number): LamportEvent {
    this.clock = Math.max(this.clock, senderTimestamp) + 1;
    const event: LamportEvent = { nodeId: this.nodeId, eventName: name, timestamp: this.clock };
    this.eventLog.push(event);
    return event;
  }

  printLog(): void {
    console.log(`\n[Node ${this.nodeId}] Event Log:`);
    this.eventLog.forEach((e) =>
      console.log(`  T=${String(e.timestamp).padStart(3)} — ${e.eventName}`)
    );
  }
}

// === USAGE EXAMPLE ===
const A = new LamportNode("A");
const B = new LamportNode("B");
const C = new LamportNode("C");

A.localEvent("Process job #1");
const { timestamp: t1 } = A.send("Send request → B");
B.receive("Receive request from A", t1);

B.localEvent("Process request");
const { timestamp: t2 } = B.send("Send result → C");
C.receive("Receive result from B", t2);

C.localEvent("Local computation");
const { timestamp: t3 } = C.send("Send ack → A");
A.receive("Receive ack from C", t3);

A.printLog();
B.printLog();
C.printLog();

// === WHY THE TIMESTAMPS ARE CORRECTLY ORDERED ===
// A:1 (local) -> A:2 (send to B) -> B:3 (receive, max(1,2)+1=3) -> B:4 (local)
// -> B:5 (send to C) -> C:6 (receive, max(1,5)+1=6) -> C:7 (local)
// -> C:8 (send to A) -> A:9 (receive, max(2,8)+1=9)
// Every "receive" timestamp is strictly greater than the "send" timestamp
// that caused it, on EVERY node — exactly the happened-before guarantee
// Lamport timestamps are supposed to provide.
