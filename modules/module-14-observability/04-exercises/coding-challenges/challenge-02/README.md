# Coding Challenge 02: Structured Logging with Correlation IDs

## Problem Statement

Add structured (JSON) logging to an Express app, with a **correlation ID** assigned per request — generated fresh if the caller didn't supply one, or propagated forward if it did (via the `x-correlation-id` header) — and included on every log line for that request.

## Requirements

1. Middleware that reads `x-correlation-id` from the incoming request headers; if absent, generates a new one (e.g., a UUID). The ID must be attached to the request object so route handlers can log with it, and echoed back in the response's `x-correlation-id` header so a caller (or the next service in a chain) can keep propagating the same one.
2. A structured logger that emits one JSON object per log line, with at minimum: `timestamp`, `level`, `message`, and `correlationId`. No free-text log lines.
3. At least two demo routes that each log at least one line through the logger, using the request's correlation ID.
4. Verify, in a usage example, that two different requests get two different correlation IDs end-to-end (one generated, one pre-supplied by the caller and correctly echoed through every log line for that request).

> 💡 **Note:** This is the exact mechanism referenced in [01-concepts](../../../01-concepts/README.md#logging-structured-logs-levels-and-centralization) — once every log line carries a correlation ID, "show me every log line for this one request, across every service it touched" becomes a simple centralized-logging query instead of manually cross-referencing timestamps across services.

## Starter / Solution

- [`starter.ts`](./starter.ts) — Express app skeleton with TODOs for the correlation ID middleware and the structured logger. Type-checks but the middleware is a no-op and the logger isn't wired up yet.
- [`solution.ts`](./solution.ts) — complete, working implementation with a self-contained usage example.

## Usage Example

```bash
npx ts-node solution.ts
```

The solution's `main()` starts the server, fires one request with no correlation ID header (server generates one) and one request with a pre-set `x-correlation-id` header (server propagates it unchanged), prints the structured JSON log lines produced for each, then shuts the server down and exits.

> 🎯 **Interview Tip:** When asked how you'd debug one user's specific failed request across five microservices, the correlation ID mechanism from this challenge is the literal answer — it's worth being able to describe exactly how the ID is generated, propagated via headers, and used as the join key across every service's independent log stream.
