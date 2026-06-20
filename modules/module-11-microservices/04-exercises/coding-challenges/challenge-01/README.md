# Coding Challenge 01: Implement a Circuit Breaker

## Problem Statement

Implement a `CircuitBreaker` class in TypeScript that wraps calls to a potentially-failing async function and protects callers from cascading failure, following the classic three-state model (closed → open → half-open) covered in [02-deep-dive](../../../02-deep-dive/README.md#circuit-breaker-pattern).

## Requirements

1. `CircuitBreaker` constructor takes:
   - `failureThreshold: number` — number of consecutive failures (while closed) that trips the breaker open.
   - `resetTimeoutMs: number` — how long the breaker stays open before allowing a half-open trial call.
2. `execute<T>(fn: () => Promise<T>): Promise<T>` — runs `fn` through the breaker:
   - **Closed**: calls `fn()` normally. On success, reset the consecutive-failure counter. On failure, increment it; if it reaches `failureThreshold`, transition to **open** (recording the time it opened) before re-throwing the original error.
   - **Open**: don't call `fn()` at all. If `resetTimeoutMs` hasn't elapsed since opening, throw immediately (fast-fail) with a clear "circuit is open" error. If it has elapsed, transition to **half-open** and allow exactly this one call through as a trial.
   - **Half-open**: calls `fn()` as a trial. Success transitions back to **closed** (and resets the failure counter). Failure transitions back to **open** (resetting the open timestamp) and re-throws the original error.
3. Expose a `getState(): "closed" | "open" | "half-open"` method so callers/tests can observe the current state.
4. The original error thrown by `fn()` must propagate to the caller on a real failure (don't swallow it) — only a fast-fail while open should throw the breaker's own synthetic error.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx tsc --noEmit starter.ts   # type-checks cleanly
npx ts-node starter.ts        # throws "Not implemented" until you fill in the TODOs
npx ts-node solution.ts       # full reference implementation, runs end-to-end
```

Expected behavior (see `solution.ts`'s usage example output): a flaky function that always fails drives the breaker from closed to open after `failureThreshold` consecutive failures; while open, calls fail immediately without ever invoking the flaky function (you'll see no new "attempt" log lines during this window); once `resetTimeoutMs` elapses, the next call is allowed through as a half-open probe — if it succeeds, the breaker closes again and resumes calling normally.

> 🎯 **Interview Tip:** When asked to implement this live, narrate the state transitions as you write them — interviewers are listening for whether you actually understand *why* half-open allows exactly one trial call (to avoid slamming a barely-recovered dependency with a burst of traffic) rather than just memorizing the three state names.
