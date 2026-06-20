# Module 02 — Interview Prep: Talking About the Network

## Why This Matters

"How does the request flow?" is one of the most common follow-up questions in a system design interview, and it's really a networking question wearing a system design costume. Interviewers ask it to check whether your architecture diagram is a real model of what happens, or just a row of boxes you'd struggle to walk through step by step.

---

## When Asked "How Does the Request Flow?"

Walk through it as a literal sequence, naming the protocol at each hop:

1. Client resolves the domain via **DNS** (mention TTL if relevant — e.g., "we'd use a low TTL during the migration window").
2. Client opens a **TLS connection** to the resolved IP (note: this is reused across requests via keep-alive, not re-established each time).
3. Client sends an **HTTP** request, which a **load balancer** receives and routes to a backend.
4. Backend may call other internal services (gRPC, or HTTP) before returning.
5. Response flows back over the already-open connection.

> 🎯 **Interview Tip:** Naming the protocol at each hop ("this internal call would be gRPC, not REST, since it's service-to-service and we want the lower overhead") is a small detail that signals you understand the network has a cost, not just an architecture diagram has boxes.

---

## Latency Trade-off Questions

A common interview pattern: "Your p99 latency is too high — where do you look first?" A strong answer enumerates the network-level suspects before jumping to application code:
- Is this a cross-region call that could be made same-region, or cached at the edge?
- Are connections being re-established per request instead of pooled/reused?
- Is the protocol multiplexing requests (HTTP/2+) or serializing them (HTTP/1.1 with few connections)?
- Is a synchronous call chain (A → B → C → D) that could be parallelized or made asynchronous?

See [`common-questions.md`](./common-questions.md) for worked Q&A, and [`sample-answer.md`](./sample-answer.md) for a full design challenge walkthrough.
