/**
 * Simplified Raft Leader Election (no log replication)
 * Module: 13 — Consistency, Consensus & CAP Theorem
 * Concept: A cluster of nodes, each a follower/candidate/leader, elects a
 *   single leader using randomized election timeouts and majority voting —
 *   the same mechanism real Raft uses, with log replication left out so the
 *   election mechanics stand on their own.
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

type NodeState = "follower" | "candidate" | "leader";

interface RequestVoteArgs {
  term: number;
  candidateId: string;
}

interface RequestVoteResult {
  term: number;
  voteGranted: boolean;
}

/**
 * TODO: Implement RaftNode's election logic.
 *
 * startElectionTimer(): void
 *   Schedule a randomized election timeout. If it fires with no heartbeat
 *   received in the meantime, the node should become a candidate and start
 *   an election (increment term, vote for self, request votes from peers).
 *
 * resetElectionTimer(): void
 *   Cancel and reschedule the election timeout (call this whenever the node
 *   hears from a current leader or grants a vote, per Raft's rules).
 *
 * becomeCandidate(): void
 *   Transition to "candidate", increment `term`, vote for self, and request
 *   votes from all peers. If a majority (including self) vote yes in this
 *   term, become leader. Otherwise, remain a candidate (or fall back to
 *   follower if a higher-term message is observed) until the next timeout.
 *
 * handleRequestVote(args): RequestVoteResult
 *   Grant a vote if args.term >= this.term and this node hasn't already
 *   voted in args.term. Update this.term if args.term is higher. Reset the
 *   election timer if a vote is granted.
 *
 * becomeLeader(): void
 *   Transition to "leader" and begin sending heartbeats to suppress peers'
 *   election timeouts (heartbeats can be simulated by directly calling
 *   resetElectionTimer() on peers in this in-process simulation).
 */
class RaftNode {
  readonly id: string;
  state: NodeState = "follower";
  term: number = 0;
  votedFor: string | null = null;
  peers: RaftNode[] = [];

  private electionTimer: NodeJS.Timeout | null = null;
  private readonly minTimeoutMs: number;
  private readonly maxTimeoutMs: number;

  constructor(id: string, minTimeoutMs = 150, maxTimeoutMs = 300) {
    this.id = id;
    this.minTimeoutMs = minTimeoutMs;
    this.maxTimeoutMs = maxTimeoutMs;
  }

  setPeers(peers: RaftNode[]): void {
    this.peers = peers;
  }

  startElectionTimer(): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  resetElectionTimer(): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  becomeCandidate(): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  handleRequestVote(args: RequestVoteArgs): RequestVoteResult {
    // TODO: implement
    throw new Error("Not implemented");
  }

  becomeLeader(): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  stop(): void {
    if (this.electionTimer) clearTimeout(this.electionTimer);
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const nodeIds = ["N1", "N2", "N3", "N4", "N5"];
  const nodes = nodeIds.map((id) => new RaftNode(id));
  nodes.forEach((node) => node.setPeers(nodes.filter((n) => n !== node)));

  console.log(`Starting a ${nodes.length}-node Raft cluster (election only)...`);
  nodes.forEach((node) => node.startElectionTimer());

  // Give the cluster time to run an election (or several, if split votes occur).
  setTimeout(() => {
    const leaders = nodes.filter((n) => n.state === "leader");
    console.log("\nFinal cluster state:");
    nodes.forEach((n) => console.log(`  ${n.id}: state=${n.state} term=${n.term}`));
    console.log(`\nLeaders elected: ${leaders.length} (expected: exactly 1)`);
    nodes.forEach((n) => n.stop());
  }, 3000);
}

main();
