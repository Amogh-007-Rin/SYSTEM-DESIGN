# Module 03 — Common Interview Questions

**Q1: Why is `POST` not idempotent by default, and how do you make it safe to retry?**
`POST` typically creates a new resource — calling it twice naturally creates two resources. To make retries safe (e.g., after a client timeout where the server may have actually succeeded), use a client-generated idempotency key: the server stores the key with the result of the first successful request and returns that same result for any retry with the same key, instead of repeating the side effect.

**Q2: When would you choose GraphQL over REST?**
When clients have heterogeneous, evolving data needs from the same underlying resources — e.g., a mobile app needing a lean response and a web dashboard needing a richer one from the same endpoint. GraphQL lets each client specify exactly the fields it needs in one request, avoiding both over-fetching and the multiple round-trips REST might require to assemble the same view.

**Q3: What's wrong with fixed-window rate limiting?**
A client can send the full quota right at the end of one window and the full quota again right at the start of the next, achieving up to 2x the intended rate within a short span straddling the window boundary. Token bucket or sliding window avoid this.

**Q4: Why is cursor pagination preferred over offset pagination at scale?**
Offset pagination requires scanning (and discarding) every row before the offset, getting slower the deeper you paginate, and pages can shift if rows are inserted/deleted concurrently. Cursor pagination anchors each page to a specific value and seeks directly to it via an index, with consistent performance and stability regardless of depth.

**Q5: What does an API gateway add in a microservices architecture?**
A single place to handle cross-cutting concerns — authentication, rate limiting, routing, request/response transformation, and logging — instead of every individual service reimplementing them. It also gives clients one stable entry point even as backend services are split, merged, or moved.

**Q6: What's the difference between authentication and authorization?**
Authentication answers "who are you?" (verifying identity — login, token validation). Authorization answers "what are you allowed to do?" (permission checks once identity is known). A request can be successfully authenticated and still be unauthorized for the specific action it's attempting.

**Q7: Why might you choose gRPC for internal services but REST for a public API?**
gRPC's binary Protocol Buffers format and HTTP/2 streaming make it faster and more efficient for high-volume internal service-to-service calls, but it's not human-debuggable without special tooling and isn't natively browser-friendly. A public API benefits more from REST's universal tooling support (`curl`, browsers, every HTTP client library) and human-readability than from gRPC's raw performance advantage.

**Q8: How do you design pagination, filtering, and sorting consistently across many endpoints?**
Pick one pagination style (cursor-based is usually the safer scalable default) and one query parameter convention (e.g., `?sort=-created_at` for descending), and document it once in your API guidelines rather than letting each endpoint owner invent their own. Consistency reduces the cognitive load on every client of your API, public or internal.
