// SOLUTION FILE — try starter.ts first!

/**
 * Simplified Raft Leader Election (no log replication)
 * Module: 13 — Consistency, Consensus & CAP Theorem
 * Concept: A cluster of nodes, each a follower/candidate/leader, elects a
 *   single leader using randomized election timeouts and majority voting —
 *   the same mechanism real Raft uses, with log replication left out so the
 *   election mechanics stand on their own.
 * Run: npx ts-node solution.ts
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
 * RaftNode: implements just the leader-election sub-problem of Raft.
 *
 * Each node runs its own randomized election timer. If a node hears nothing
 * (no heartbeat, no vote request it grants) before that timer fires, it
 * assumes there's no functioning leader, becomes a candidate, and requests
 * votes from every peer. Votes are granted at most once per term, so a
 * majority can only ever form around a single candidate in a given term —
 * which is exactly the property that guarantees at most one leader per term.
 *
 * Heartbeats and RequestVote RPCs are simulated as direct synchronous method
 * calls between in-process node objects rather than real network calls —
 * the election *logic* is identical either way; only the transport differs.
 */
class RaftNode {
  readonly id: string;
  state: NodeState = "follower";
  term: number = 0;
  votedFor: string | null = null;
  peers: RaftNode[] = [];

  private electionTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private readonly minTimeoutMs: number;
  private readonly maxTimeoutMs: number;
  private stopped = false;

  constructor(id: string, minTimeoutMs = 150, maxTimeoutMs = 300) {
    this.id = id;
    this.minTimeoutMs = minTimeoutMs;
    this.maxTimeoutMs = maxTimeoutMs;
  }

  setPeers(peers: RaftNode[]): void {
    this.peers = peers;
  }

  private randomTimeout(): number {
    return this.minTimeoutMs + Math.random() * (this.maxTimeoutMs - this.minTimeoutMs);
  }

  /** Schedule (or reschedule) the randomized election timeout. */
  startElectionTimer(): void {
    if (this.stopped) return;
    if (this.electionTimer) clearTimeout(this.electionTimer);
    this.electionTimer = setTimeout(() => {
      // Leaders never time out into a new election themselves — only
      // followers/candidates that have stopped hearing from a leader do.
      if (this.state !== "leader") {
        this.becomeCandidate();
      }
    }, this.randomTimeout());
  }

  /**
   * Reset the timer — called whenever this node hears from a current leader
   * (a heartbeat) or grants a vote to a candidate, per Raft's rule that
   * either event is evidence the cluster doesn't need a new election yet.
   */
  resetElectionTimer(): void {
    this.startElectionTimer();
  }

  /**
   * Become a candidate: bump term, vote for self, and request votes from
   * every peer. If a majority (self included) grant their vote in this
   * term, become leader. Otherwise stay a follower/candidate and wait for
   * the next timeout (a split vote resolves itself this way).
   */
  becomeCandidate(): void {
    if (this.stopped) return;
    this.state = "candidate";
    this.term += 1;
    this.votedFor = this.id;
    let votes = 1; // vote for self

    console.log(`  [term ${this.term}] ${this.id} times out with no leader -> becomes candidate`);

    for (const peer of this.peers) {
      const result = peer.handleRequestVote({ term: this.term, candidateId: this.id });
      // A peer reporting a higher term means our term info is stale; adopt
      // theirs and step down to follower rather than continue this election.
      if (result.term > this.term) {
        this.term = result.term;
        this.state = "follower";
        this.votedFor = null;
        this.resetElectionTimer();
        return;
      }
      if (result.voteGranted) {
        votes += 1;
      }
    }

    const clusterSize = this.peers.length + 1;
    const neededForMajority = Math.floor(clusterSize / 2) + 1;

    if (this.state === "candidate" && votes >= neededForMajority) {
      this.becomeLeader();
    } else if (this.state === "candidate") {
      console.log(
        `  [term ${this.term}] ${this.id} got ${votes}/${clusterSize} votes — no majority` +
          ` (needed ${neededForMajority}); split vote or already-voted peers, will retry on next timeout`
      );
      // Remain a candidate but re-arm the timer so a fresh, re-randomized
      // timeout governs the retry — this is exactly how Raft avoids a
      // repeating split vote: each retry's timeout is drawn independently.
      this.resetElectionTimer();
    }
  }

  /**
   * Decide whether to grant a vote for `args.candidateId` in `args.term`.
   * Grants at most one vote per term — the rule that makes "majority votes
   * in the same term" mean "majority agrees on the same candidate."
   */
  handleRequestVote(args: RequestVoteArgs): RequestVoteResult {
    if (args.term > this.term) {
      // Newer term than we've seen: adopt it and clear our previous vote so
      // we're eligible to vote fresh in this newer term.
      this.term = args.term;
      this.votedFor = null;
      if (this.state !== "follower") this.state = "follower";
    }

    const alreadyVotedForSomeoneElse =
      this.votedFor !== null && this.votedFor !== args.candidateId;

    if (args.term < this.term || alreadyVotedForSomeoneElse) {
      return { term: this.term, voteGranted: false };
    }

    this.votedFor = args.candidateId;
    this.resetElectionTimer(); // granting a vote is evidence of a live election; don't also time out
    return { term: this.term, voteGranted: true };
  }

  /** Become leader: stop the election timer and start sending heartbeats. */
  becomeLeader(): void {
    this.state = "leader";
    console.log(`  [term ${this.term}] ${this.id} wins majority -> becomes LEADER`);
    if (this.electionTimer) clearTimeout(this.electionTimer);
    this.sendHeartbeats();
  }

  /** Periodically reset every peer's election timer, simulating AppendEntries heartbeats. */
  private sendHeartbeats(): void {
    if (this.stopped || this.state !== "leader") return;
    for (const peer of this.peers) {
      if (peer.state !== "leader") {
        peer.state = "follower";
        peer.resetElectionTimer();
      }
    }
    this.heartbeatTimer = setTimeout(() => this.sendHeartbeats(), 50);
  }

  stop(): void {
    this.stopped = true;
    if (this.electionTimer) clearTimeout(this.electionTimer);
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
  }
}

// === USAGE EXAMPLE ===
function main(): void {
  const nodeIds = ["N1", "N2", "N3", "N4", "N5"];
  const nodes = nodeIds.map((id) => new RaftNode(id));
  nodes.forEach((node) => node.setPeers(nodes.filter((n) => n !== node)));

  console.log(`Starting a ${nodes.length}-node Raft cluster (election only)...\n`);
  nodes.forEach((node) => node.startElectionTimer());

  // Give the cluster time to run an election (or several, if split votes occur).
  setTimeout(() => {
    const leaders = nodes.filter((n) => n.state === "leader");
    console.log("\nFinal cluster state:");
    nodes.forEach((n) => console.log(`  ${n.id}: state=${n.state} term=${n.term}`));
    console.log(`\nLeaders elected: ${leaders.length} (expected: exactly 1)`);
    if (leaders.length === 1) {
      console.log(`Result: PASS — ${leaders[0].id} is the sole leader, elected with a majority.`);
    } else {
      console.log("Result: FAIL — expected exactly one leader.");
    }
    nodes.forEach((n) => n.stop());
  }, 3000);
}

main();
