/**
 * Leader Election via Heartbeats, Timeouts, and Majority Vote
 * Module: 12 — Distributed Systems Fundamentals
 * Concept: Simulates a small cluster electing a leader using the same basic
 *   mechanics real systems use (heartbeats, election timeouts, terms, and a
 *   majority vote) — without yet needing a full consensus algorithm like Raft
 *   (that's Module 13). Demonstrates: (1) a leader is elected via majority,
 *   (2) when the leader "crashes" (stops heartbeating), followers detect it
 *   via a missed-heartbeat timeout and elect a new leader, (3) stale messages
 *   from an old term are rejected once a higher term exists.
 * Run: npx ts-node leader-election.ts
 * Dependencies: none
 */

type NodeState = "follower" | "candidate" | "leader";

interface VoteRequest {
  term: number;
  candidateId: string;
}

interface VoteResponse {
  term: number;
  granted: boolean;
}

interface Heartbeat {
  term: number;
  leaderId: string;
}

class ClusterNode {
  public state: NodeState = "follower";
  public currentTerm = 0;
  public leaderId: string | null = null;
  private votedForInTerm: Map<number, string> = new Map();
  private alive = true;

  constructor(public readonly id: string, private cluster: () => ClusterNode[]) {}

  crash(): void {
    this.alive = false;
    console.log(`  [${this.id}] CRASHED (stops sending/receiving everything)`);
  }

  isAlive(): boolean {
    return this.alive;
  }

  // A follower whose election timeout fires becomes a candidate and starts
  // a new term — this is what triggers an election in the first place.
  startElection(): void {
    if (!this.alive) return;
    this.currentTerm++;
    this.state = "candidate";
    this.leaderId = null;
    this.votedForInTerm.set(this.currentTerm, this.id); // votes for itself
    console.log(`  [${this.id}] times out waiting for leader -> starts election for term ${this.currentTerm}`);

    const peers = this.cluster().filter((n) => n.id !== this.id);
    let votes = 1; // self-vote

    for (const peer of peers) {
      const response = peer.handleVoteRequest({ term: this.currentTerm, candidateId: this.id });
      if (response.granted) votes++;
      // If a peer is on a HIGHER term, this candidate's request is stale —
      // step down rather than incorrectly believe it's still in the running.
      if (response.term > this.currentTerm) {
        this.currentTerm = response.term;
        this.state = "follower";
        return;
      }
    }

    const majority = Math.floor(this.cluster().length / 2) + 1;
    if (votes >= majority) {
      this.becomeLeader();
    } else {
      console.log(`  [${this.id}] only got ${votes}/${this.cluster().length} votes (needed ${majority}) -> stays follower`);
      this.state = "follower";
    }
  }

  // Votes are granted at most once per term, and only for a candidate whose
  // term is not behind ours — this is exactly what prevents a stale or
  // partitioned-away node from winning an election it has no business winning.
  handleVoteRequest(req: VoteRequest): VoteResponse {
    if (!this.alive) return { term: this.currentTerm, granted: false };

    if (req.term < this.currentTerm) {
      return { term: this.currentTerm, granted: false }; // reject stale request
    }
    if (req.term > this.currentTerm) {
      this.currentTerm = req.term; // catch up — a newer term exists
      this.state = "follower";
    }
    const alreadyVoted = this.votedForInTerm.has(req.term);
    if (!alreadyVoted) {
      this.votedForInTerm.set(req.term, req.candidateId);
      return { term: this.currentTerm, granted: true };
    }
    return { term: this.currentTerm, granted: false };
  }

  private becomeLeader(): void {
    this.state = "leader";
    this.leaderId = this.id;
    console.log(`  [${this.id}] WON the election for term ${this.currentTerm} -> becomes LEADER`);
  }

  // Leaders periodically heartbeat; followers reset their timeout on receipt.
  // This is what tells the rest of the cluster "the leader is still here."
  sendHeartbeat(): void {
    if (!this.alive || this.state !== "leader") return;
    const peers = this.cluster().filter((n) => n.id !== this.id);
    for (const peer of peers) {
      peer.handleHeartbeat({ term: this.currentTerm, leaderId: this.id });
    }
  }

  handleHeartbeat(hb: Heartbeat): void {
    if (!this.alive) return;
    // Reject a heartbeat from a stale (lower-term) leader — this is the
    // mechanism that protects against an old leader that was merely slow or
    // partitioned away (not actually crashed) from being believed once a new
    // leader with a higher term has already been elected.
    if (hb.term < this.currentTerm) {
      console.log(`  [${this.id}] ignored stale heartbeat from ${hb.leaderId} (term ${hb.term} < my term ${this.currentTerm})`);
      return;
    }
    this.currentTerm = hb.term;
    this.leaderId = hb.leaderId;
    if (this.state !== "leader") this.state = "follower";
  }
}

// === USAGE EXAMPLE ===
let nodes: ClusterNode[] = [];
const getCluster = () => nodes;
nodes = [new ClusterNode("A", getCluster), new ClusterNode("B", getCluster), new ClusterNode("C", getCluster), new ClusterNode("D", getCluster), new ClusterNode("E", getCluster)];

function printClusterState(label: string): void {
  console.log(`\n--- ${label} ---`);
  for (const n of nodes) {
    console.log(`  ${n.id}: state=${n.state}, term=${n.currentTerm}, alive=${n.isAlive()}, believesLeaderIs=${n.leaderId}`);
  }
}

console.log("=== Initial election (5-node cluster, no leader yet) ===");
nodes[0].startElection(); // A times out first and triggers the first election
printClusterState("After initial election");

console.log("\n=== Leader sends heartbeats; followers stay in sync ===");
const currentLeader = () => nodes.find((n) => n.state === "leader")!;
currentLeader().sendHeartbeat();
printClusterState("After heartbeat");

console.log("\n=== Leader crashes — followers will eventually miss heartbeats ===");
const deadLeader = currentLeader();
deadLeader.crash();

console.log("\n=== A follower's election timeout fires; it starts a new election ===");
const nextCandidate = nodes.find((n) => n.id !== deadLeader.id)!;
nextCandidate.startElection();
printClusterState("After re-election");

console.log("\n=== The old (crashed) leader, if it somehow came back, sends a stale heartbeat ===");
deadLeader.crash; // already crashed; simulate it "waking up" still believing its old term
(deadLeader as any).alive = true;
deadLeader.sendHeartbeat(); // term is from before the crash — should be rejected by the new leader's followers
printClusterState("Final state — stale heartbeat correctly ignored, new leader still in charge");
