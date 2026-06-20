// SOLUTION FILE — try starter.ts first!
/**
 * Circuit Breaker
 * Module: 11 — Microservices Architecture
 * Concept: Stop calling a downstream dependency once it's known to be
 *   failing, instead of letting every caller wait out a timeout against a
 *   service that's already unhealthy. Three states: closed (normal),
 *   open (fast-fail), half-open (one trial call to test recovery).
 * Run: npx ts-node solution.ts
 * Dependencies: none
 */

type CircuitState = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: CircuitState = "closed";
  private consecutiveFailures = 0;
  private openedAt = 0;

  constructor(
    private readonly failureThreshold: number,
    private readonly resetTimeoutMs: number
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed < this.resetTimeoutMs) {
        // Fast-fail: don't even attempt the downstream call while we know
        // it's unhealthy and haven't waited long enough to re-check.
        throw new Error("Circuit is open");
      }
      // Reset timeout elapsed — allow exactly this one call through as a
      // half-open trial probe, instead of immediately reopening the floodgates.
      this.state = "half-open";
    }

    try {
      const result = await fn();
      // A successful call closes the breaker from either "closed" (no-op,
      // just keeps the failure counter at 0) or "half-open" (recovery
      // confirmed — resume normal traffic).
      this.state = "closed";
      this.consecutiveFailures = 0;
      return result;
    } catch (err) {
      if (this.state === "half-open") {
        // The trial probe failed — the dependency hasn't actually
        // recovered. Re-open immediately rather than letting more traffic
        // through, and restart the reset timeout window.
        this.state = "open";
        this.openedAt = Date.now();
      } else {
        // state === "closed": count the failure, and trip the breaker if
        // we've now hit the threshold.
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.failureThreshold) {
          this.state = "open";
          this.openedAt = Date.now();
        }
      }
      // Always propagate the real error to the caller — only the
      // fast-fail path above throws the breaker's own synthetic error.
      throw err;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const breaker = new CircuitBreaker(/* failureThreshold */ 3, /* resetTimeoutMs */ 200);

  let shouldFail = true;
  const flakyCall = async (): Promise<string> => {
    console.log("  attempting flaky call...");
    if (shouldFail) {
      throw new Error("downstream service unavailable");
    }
    return "ok";
  };

  console.log("=== Driving the breaker to open: 4 consecutive failures, threshold is 3 ===");
  for (let i = 0; i < 4; i++) {
    try {
      await breaker.execute(flakyCall);
    } catch (err) {
      console.log(`  call ${i} failed: ${(err as Error).message} (state: ${breaker.getState()})`);
    }
  }

  console.log("\n=== While open, calls fail fast WITHOUT invoking flakyCall (no 'attempting' log below) ===");
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(flakyCall);
    } catch (err) {
      console.log(`  fast-failed: ${(err as Error).message} (state: ${breaker.getState()})`);
    }
  }

  console.log("\n=== Still within resetTimeoutMs (200ms) — still fast-failing ===");
  await sleep(50);
  try {
    await breaker.execute(flakyCall);
  } catch (err) {
    console.log(`  fast-failed: ${(err as Error).message} (state: ${breaker.getState()})`);
  }

  console.log("\n=== After resetTimeoutMs fully elapses, a half-open probe is allowed through ===");
  await sleep(200); // total elapsed since opening is now well past 200ms
  shouldFail = false; // simulate the downstream service having recovered
  const result = await breaker.execute(flakyCall);
  console.log(`  probe succeeded: "${result}" (state: ${breaker.getState()})`);

  console.log("\n=== Breaker is closed again — normal calls resume ===");
  const followUp = await breaker.execute(flakyCall);
  console.log(`  call succeeded: "${followUp}" (state: ${breaker.getState()})`);

  console.log("\n=== Bonus: a half-open probe that fails re-opens the breaker immediately ===");
  shouldFail = true;
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(flakyCall);
    } catch (err) {
      console.log(`  call ${i} failed: ${(err as Error).message} (state: ${breaker.getState()})`);
    }
  }
  await sleep(250); // wait out the reset timeout again
  try {
    await breaker.execute(flakyCall); // half-open probe — still failing
  } catch (err) {
    console.log(`  half-open probe failed: ${(err as Error).message} (state: ${breaker.getState()})`);
  }
  console.log("  breaker re-opened immediately after a failed probe, without waiting for more failures");
}

main();
