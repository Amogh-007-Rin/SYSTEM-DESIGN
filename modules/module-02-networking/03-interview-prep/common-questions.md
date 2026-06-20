# Module 02 — Common Interview Questions

**Q1: Why would you choose UDP over TCP for a video call application?**
Video calls favor recency over completeness — a frame that arrives late is often useless (the moment has passed), so TCP's retransmission of lost packets actually hurts by delaying delivery of newer data behind a resend of old data. UDP lets the application drop a lost frame and move on, trading guaranteed delivery for lower, more consistent latency.

**Q2: What problem does HTTP/2 multiplexing solve that HTTP/1.1 had?**
HTTP/1.1 effectively allows one in-flight request per TCP connection, so browsers open up to ~6 parallel connections per domain to load multiple resources concurrently — each paying its own handshake cost. HTTP/2 multiplexes many requests over a single connection, removing both the connection-count limit and the repeated handshake overhead.

**Q3: When would you choose WebSockets over Server-Sent Events?**
Choose WebSockets when the client needs to send data to the server frequently and with low latency (chat, collaborative editing, gaming). Choose SSE when communication is purely server-to-client (live score updates, notification streams) — it's simpler to operate, works over plain HTTP, and doesn't need a special client library.

**Q4: What does DNS TTL actually control, and why does it matter operationally?**
TTL controls how long a DNS answer can be cached before a resolver must ask again. It matters because it bounds how fast you can change where traffic goes — a low TTL lets you fail over to a new IP quickly during an incident, at the cost of more DNS query volume; a high TTL reduces query load but means a bad DNS change (or a needed failover) propagates slowly.

**Q5: Why does connection reuse matter so much for performance?**
Establishing a new TCP connection costs a round trip; adding TLS on top costs at least one more. At high request volume, paying that cost per-request instead of reusing an already-open connection can dominate total latency — this is why HTTP keep-alive and database connection pooling are both considered "obvious" production requirements rather than optimizations.

**Q6: What is Anycast, and why is it relevant to system design?**
Anycast advertises the same IP address from many physical locations and lets network routing deliver each client to the nearest one automatically. It underlies CDN edge routing and large-scale DDoS mitigation — no client-side logic is needed to "pick the nearest server," and a flood of attack traffic gets naturally distributed across many points of presence instead of overwhelming one origin.

**Q7: A teammate says "let's just increase the polling interval to reduce load." What are you trading away?**
You're trading latency (how quickly the client learns about new data) for reduced server load and reduced wasted requests-with-no-new-data. This is a real, often acceptable trade-off, but it should be stated explicitly — a 30-second polling interval means a 30-second worst-case delay before a user sees a new comment, which may or may not be acceptable depending on the feature.

**Q8: What does it mean that a load balancer can operate "at L4" or "at L7"?**
L4 balancing makes routing decisions using only transport-layer information (source/destination IP and port) — fast, but blind to the actual HTTP request. L7 balancing can inspect the HTTP request itself (path, headers, cookies) and route based on it (e.g., `/api/*` to one service, `/static/*` to another) at the cost of more processing per request. Covered in depth in [Module 07](../../module-07-load-balancing/).
