/**
 * Circuit Breaker
 * Module: 11 — Microservices Architecture
 * Concept: Stop calling a downstream dependency once it's known to be
 *   failing, instead of letting every caller wait out a timeout against a
 *   service that's already unhealthy. Three states: closed (normal),
 *   open (fast-fail), half-open (one trial call to test recovery).
 * Run: npx ts-node starter.ts
 * Dependencies: none
 */

type CircuitState = "closed" | "open" | "half-open";

/**
 * TODO: Implement CircuitBreaker.
 *
 * - execute(fn): runs fn() through the breaker according to the current
 *   state.
 *     - closed: call fn(). On success, reset consecutiveFailures to 0.
 *       On failure, increment consecutiveFailures; if it reaches
 *       failureThreshold, transition to "open" and record openedAt =
 *       Date.now(). Re-throw the original error either way.
 *     - open: don't call fn(). If Date.now() - openedAt < resetTimeoutMs,
 *       throw new Error("Circuit is open") immediately. Otherwise
 *       transition to "half-open" and allow this call through as a trial
 *       (fall through to the half-open behavior below for this same call).
 *     - half-open: call fn() as a trial. On success, transition to
 *       "closed" and reset consecutiveFailures to 0. On failure,
 *       transition back to "open", record openedAt = Date.now(), and
 *       re-throw the original error.
 * - getState(): returns the current state.
 */
class CircuitBreaker {
  private state: CircuitState = "closed";
  private consecutiveFailures = 0;
  private openedAt = 0;

  constructor(
    private readonly failureThreshold: number,
    private readonly resetTimeoutMs: number
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // TODO: implement the closed / open / half-open behavior described
    // above.
    throw new Error("Not implemented");
  }

  getState(): CircuitState {
    return this.state;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// === USAGE EXAMPLE ===
// This section is intentionally left calling the unimplemented method — it
// will throw "Not implemented" until you fill in the TODOs above. That's by
// design: fill in the class, then re-run this file.
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

  console.log("=== Driving the breaker to open ===");
  for (let i = 0; i < 4; i++) {
    try {
      await breaker.execute(flakyCall);
    } catch (err) {
      console.log(`  call ${i} failed: ${(err as Error).message} (state: ${breaker.getState()})`);
    }
  }

  console.log("\n=== While open, calls fail fast without invoking flakyCall ===");
  try {
    await breaker.execute(flakyCall);
  } catch (err) {
    console.log(`  fast-failed: ${(err as Error).message} (state: ${breaker.getState()})`);
  }

  console.log("\n=== After resetTimeoutMs, a half-open probe is allowed ===");
  await sleep(250);
  shouldFail = false; // the downstream service has recovered
  const result = await breaker.execute(flakyCall);
  console.log(`  probe succeeded: ${result} (state: ${breaker.getState()})`);
}

main();
