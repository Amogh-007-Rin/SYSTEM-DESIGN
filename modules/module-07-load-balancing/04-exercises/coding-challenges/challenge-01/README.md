# Coding Challenge 01: Round Robin and Least Connections Load Balancer

## Problem Statement

Implement a Round Robin and a Least Connections load balancer in TypeScript, both operating over the same pool of mock backend servers.

## Requirements

1. `RoundRobinLoadBalancer`
   - `selectBackend()` — returns the next backend in fixed rotating order, regardless of current load. Must skip any backend currently marked unhealthy.
   - Wraps back to the first backend after reaching the last one.
2. `LeastConnectionsLoadBalancer`
   - `selectBackend()` — returns the healthy backend with the fewest active connections at the moment of selection (ties broken by lowest backend index).
   - `startRequest(backendId)` / `finishRequest(backendId)` — increment/decrement that backend's active connection count, so later selections reflect real-time load.
3. Both balancers
   - Must skip backends marked unhealthy (`healthy: false`) entirely — never select one.
   - Throw a clear error if every backend in the pool is unhealthy.

## Starter / Solution

- [`starter.ts`](./starter.ts)
- [`solution.ts`](./solution.ts)

## Usage Example

```bash
npx ts-node starter.ts   # type-checks; the TODOs throw "Not implemented" until you fill them in
npx ts-node solution.ts  # full reference implementation, runs end-to-end
```

Expected behavior (see `solution.ts`'s usage example output): with 3 backends and uniform request cost, Round Robin and Least Connections initially agree on the same selection order. Once one backend is given several long-running requests (simulated as connections that don't immediately finish), Least Connections routes new requests *away* from that backend while Round Robin keeps blindly sending it traffic — that divergence is the entire point of the exercise.
