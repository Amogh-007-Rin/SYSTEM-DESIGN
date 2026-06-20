/**
 * Reactive Auto-Scaling Policy Simulator
 * Module: 06 — Scalability
 * Concept: Simulates a Kubernetes-HPA-style reactive auto-scaling loop
 *   against a fluctuating load pattern (a traffic spike followed by a
 *   drop), to make two deep-dive claims concrete and measurable:
 *     1. Reactive scaling lags behind real load because it can only react
 *        to a metric that has already crossed a threshold.
 *     2. Scaling thrash (rapid add/remove oscillation) is a real risk
 *        without a cooldown period and asymmetric scale-out/scale-in rules.
 * Run: npx ts-node autoscaling-simulator.ts
 * Dependencies: none
 */

interface ScalingPolicy {
  targetCpuPercent: number; // the utilization the policy tries to hold steady at
  minReplicas: number;
  maxReplicas: number;
  cooldownTicks: number; // ticks to wait after a scaling action before scaling again
}

interface TickResult {
  tick: number;
  incomingRequests: number;
  replicas: number;
  cpuPercent: number;
  action: "scale-out" | "scale-in" | "none" | "cooldown";
}

// Models CPU utilization as roughly proportional to (load / capacity), where
// each replica contributes a fixed amount of capacity. This is a simplification
// of real autoscaler metrics, but it preserves the property that matters here:
// more replicas serving the same load lowers per-replica CPU, and vice versa.
function estimateCpuPercent(incomingRequests: number, replicas: number): number {
  const capacityPerReplica = 100; // requests/sec one replica can handle at 100% CPU
  const totalCapacity = replicas * capacityPerReplica;
  const utilization = (incomingRequests / totalCapacity) * 100;
  return Math.min(utilization, 300); // cap the display value; real CPU can't exceed ~100%
  // but we allow >100 here to make "we are badly underprovisioned" visible in output.
}

// Implements an HPA-shaped reactive policy: scale out aggressively when over
// target, scale in conservatively when under target, with a cooldown to
// prevent thrashing (the documented failure mode in the deep dive).
class ReactiveAutoscaler {
  private replicas: number;
  private cooldownRemaining = 0;

  constructor(private policy: ScalingPolicy, initialReplicas: number) {
    this.replicas = initialReplicas;
  }

  tick(tick: number, incomingRequests: number): TickResult {
    const cpuPercent = estimateCpuPercent(incomingRequests, this.replicas);
    let action: TickResult["action"] = "none";

    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining--;
      action = "cooldown";
    } else if (cpuPercent > this.policy.targetCpuPercent * 1.2) {
      // Scale out fast: well over target, add replicas proportional to
      // how far over we are (mirrors HPA's proportional scaling behavior).
      const desiredReplicas = Math.ceil(
        (this.replicas * cpuPercent) / this.policy.targetCpuPercent
      );
      const newReplicas = Math.min(desiredReplicas, this.policy.maxReplicas);
      if (newReplicas > this.replicas) {
        this.replicas = newReplicas;
        this.cooldownRemaining = this.policy.cooldownTicks;
        action = "scale-out";
      }
    } else if (cpuPercent < this.policy.targetCpuPercent * 0.5) {
      // Scale in slowly and only ever by one replica per decision — this
      // asymmetry (fast out, slow in) is exactly what prevents thrash.
      const newReplicas = Math.max(this.replicas - 1, this.policy.minReplicas);
      if (newReplicas < this.replicas) {
        this.replicas = newReplicas;
        this.cooldownRemaining = this.policy.cooldownTicks;
        action = "scale-in";
      }
    }

    return { tick, incomingRequests, replicas: this.replicas, cpuPercent, action };
  }
}

// Models a traffic pattern: quiet, then a sudden spike (simulating a launch
// or viral moment), then a drop back to baseline — the canonical case where
// reactive scaling's lag is most visible.
function generateLoadPattern(): number[] {
  const quiet = Array.from({ length: 5 }, () => 80);
  const rampUp = [150, 300, 500, 800, 1000, 1000, 1000];
  const drop = [600, 300, 150, 80, 80];
  return [...quiet, ...rampUp, ...drop];
}

// === USAGE EXAMPLE ===

const policy: ScalingPolicy = {
  targetCpuPercent: 60,
  minReplicas: 1,
  maxReplicas: 12,
  cooldownTicks: 2,
};

const autoscaler = new ReactiveAutoscaler(policy, 1);
const loadPattern = generateLoadPattern();

console.log("=== Reactive Auto-Scaling Simulation ===");
console.log(`Policy: target CPU ${policy.targetCpuPercent}%, min ${policy.minReplicas}, max ${policy.maxReplicas} replicas, cooldown ${policy.cooldownTicks} ticks\n`);
console.log("tick | requests/sec | replicas | CPU%   | action");
console.log("-----|--------------|----------|--------|------------");

let scaleOutEvents = 0;
let ticksOverCapacity = 0;

loadPattern.forEach((requests, i) => {
  const result = autoscaler.tick(i, requests);
  if (result.action === "scale-out") scaleOutEvents++;
  if (result.cpuPercent > 100) ticksOverCapacity++;

  console.log(
    `${String(result.tick).padStart(4)} | ${String(result.incomingRequests).padStart(12)} | ` +
      `${String(result.replicas).padStart(8)} | ${result.cpuPercent.toFixed(0).padStart(5)}% | ${result.action}`
  );
});

console.log(`\nTotal scale-out events: ${scaleOutEvents}`);
console.log(`Ticks where CPU exceeded 100% (overloaded before scaling caught up): ${ticksOverCapacity}`);
console.log(
  "\nThis is the reactive-scaling lag in action: load jumps from 80 to 1000 req/sec across"
);
console.log(
  "a few ticks, but CPU% spikes well past 100% before enough replicas come online to"
);
console.log(
  "absorb it — exactly the gap predictive scaling (forecasting the spike ahead of time)"
);
console.log("is designed to close.");
