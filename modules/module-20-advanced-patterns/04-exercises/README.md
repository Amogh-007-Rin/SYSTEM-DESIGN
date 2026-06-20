# Module 20 — Exercises

> 💡 **Note:** This module has **design challenges only — no coding challenges**. As the capstone module, the exercises here are three full system-design capstones that synthesize the *entire* course (APIs, databases, caching, scalability, load balancing, message queues, storage, CDN, microservices, distributed systems, consistency, observability, security, real-time systems, and the patterns introduced in this module's own concepts and deep dive) into one end-to-end design each — that synthesis is the point, and it doesn't fit a small isolated coding problem the way earlier modules' coding challenges did. The hands-on coding for this module instead lives in the worked TypeScript examples in [`01-concepts/examples/`](../01-concepts/examples/) (distributed ID generation, backoff with jitter) and [`02-deep-dive/examples/`](../02-deep-dive/examples/) (canary routing) — make sure you've run and understood those before attempting these capstones.

## Design Challenges (Capstones)

| Challenge | Description |
|---|---|
| [01 — URL Shortener](./design-challenges/challenge-01.md) | Design a URL shortener from scratch: functional requirements, NFRs, capacity estimation, API design, database schema, caching strategy, scaling, observability |
| [02 — Twitter](./design-challenges/challenge-02.md) | Design Twitter from scratch: the full system across every layer — feed generation/fan-out, sharding, caching, search, ranking |
| [03 — Uber](./design-challenges/challenge-03.md) | Design Uber from scratch: geospatial indexing, real-time location updates, rider-driver matching, surge pricing |

**How to use these:** attempt each prompt yourself first — write out requirements, do capacity estimation, sketch the architecture, and name your trade-offs — before reading the paired solution file. These three prompts ("URL shortener," "Twitter," "Uber") are also three of the most common real interview questions at every level from mid to staff, so treat each attempt as practice for an actual 45-minute session: state your assumptions out loud (or in writing), drive your own structure per [`03-interview-prep/README.md`](../03-interview-prep/README.md), and resist jumping straight to a database schema before stating what the system actually needs to do.

Each solution is written at the same senior/staff depth as this module's [`sample-answer.md`](../03-interview-prep/sample-answer.md) ("Design a distributed rate limiter") — complete trade-off tables, explicit capacity math, and a closing note on what was deliberately deprioritized and why.
