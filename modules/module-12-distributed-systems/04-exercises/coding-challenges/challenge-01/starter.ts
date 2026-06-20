/**
 * Lamport Timestamps
 * Module: 12 — Distributed Systems Fundamentals
 * Concept: Logical clocks provide happened-before ordering without a global clock.
 *   Rule: increment before send; on receive, clock = max(local, received) + 1.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

interface LamportEvent {
  nodeId: string;
  eventName: string;
  timestamp: number;
}

/**
 * TODO: Implement LamportNode.
 *
 * localEvent(name): LamportEvent
 *   clock++; log and return event.
 *
 * send(name): { event, timestamp }
 *   clock++; log and return event + timestamp to include in message.
 *
 * receive(name, senderTimestamp): LamportEvent
 *   clock = max(clock, senderTimestamp) + 1; log and return event.
 *
 * printLog(): void
 *   Print all events sorted by timestamp.
 */
class LamportNode {
  public readonly nodeId: string;
  private clock = 0;
  private eventLog: LamportEvent[] = [];

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  localEvent(name: string): LamportEvent {
    // TODO: implement
    throw new Error("Not implemented");
  }

  send(name: string): { event: LamportEvent; timestamp: number } {
    // TODO: implement
    throw new Error("Not implemented");
  }

  receive(name: string, senderTimestamp: number): LamportEvent {
    // TODO: implement
    throw new Error("Not implemented");
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
