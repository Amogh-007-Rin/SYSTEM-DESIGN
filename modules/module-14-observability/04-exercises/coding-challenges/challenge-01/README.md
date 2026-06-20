# Coding Challenge 01: Instrument an Express App with Prometheus Metrics

## Problem Statement

Instrument a TypeScript Express app with Prometheus metrics using `prom-client`: a request **rate** counter, an **error rate** counter (or the same counter labeled by status), and a request **latency histogram** — then expose them on a `/metrics` endpoint in Prometheus text format, ready to be scraped.

## Requirements

1. A `Counter` named `http_requests_total`, labeled by `method`, `route`, and `status_code`, incremented once per completed request.
2. A `Histogram` named `http_request_duration_seconds`, labeled by `method` and `route`, observing each request's duration.
3. Middleware that wraps every request, records its duration and final status code, and updates both metrics — without modifying every individual route handler.
4. A `GET /metrics` endpoint that returns `prom-client`'s registry output (`Content-Type: text/plain`), in the standard Prometheus text exposition format.
5. At least one demo route that sometimes fails (returns a 5xx), so the error label actually varies.

> 💡 **Note:** Label cardinality matters in real Prometheus deployments — labeling by something unbounded (like a raw user ID or request ID) explodes the number of distinct time series and can take down a Prometheus server. `route` should be the route *pattern* (e.g., `/orders/:id`), never the literal path with a real ID substituted in.

## Starter / Solution

- [`starter.ts`](./starter.ts) — Express app skeleton with TODOs for registering the Counter/Histogram, the recording middleware, and the `/metrics` endpoint. Type-checks but the metrics aren't wired up yet.
- [`solution.ts`](./solution.ts) — complete, working implementation with a self-contained usage example.

## Usage Example

```bash
npx ts-node solution.ts
```

The solution's `main()` starts the server, fires several requests at a mix of routes (including the one that sometimes errors), prints the scraped `/metrics` output showing real counter and histogram values, then shuts the server down and exits.

> 🎯 **Interview Tip:** If asked to instrument a service live in an interview, narrate the label cardinality trade-off out loud — naming the route-vs-raw-path distinction is a strong, specific signal that you've actually run Prometheus in production, not just read about it.
