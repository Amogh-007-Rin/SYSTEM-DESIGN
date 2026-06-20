# Module 10 — Common Interview Questions

**Q1: How does a CDN know which edge server is closest to a given user?**
Primarily through Anycast: the same IP address is announced from every Point of Presence, and BGP routing naturally delivers each user's packets to whichever announcement is topologically nearest, with no per-request decision-making needed. Many CDNs combine this with GeoDNS, which resolves a hostname to a different IP depending on the resolver's geographic location, steering the user toward a nearby PoP before a packet is even sent.

**Q2: What's the difference between a push CDN and a pull CDN, and when would you choose each?**
A pull CDN fetches content from the origin lazily on the first request for a URL, then caches it — low operational overhead, and the default choice for almost everything. A push CDN requires you to proactively upload content ahead of any user request, which is worth the extra effort only when you need guaranteed instant availability everywhere with zero "first request is slow" penalty, such as a scheduled high-profile content release.

**Q3: What does the `Vary` header do, and why does it matter for CDN caching?**
It tells caches that the response differs based on a specific request header — for example, `Vary: Accept-Encoding` means the CDN must store separate cached copies per distinct encoding rather than serving one cached response (e.g., gzip-compressed) to a client that didn't ask for it. Forgetting `Vary` when responses genuinely differ by header can cause a CDN to serve the wrong variant of a response to the wrong client.

**Q4: What is `stale-while-revalidate`, and what problem does it solve?**
It lets an edge node serve an already-expired cached response immediately while asynchronously fetching a fresh copy in the background, instead of forcing the requesting user to wait on a synchronous round-trip to the origin. The trade-off is a small window where users may see slightly stale data, in exchange for the user-facing latency of a cache miss effectively disappearing for that request.

**Q5: How does CDN cache invalidation differ from invalidating a single key in a cache like Redis?**
A CDN's cached copies are spread across potentially hundreds of geographically distributed edge nodes, so "invalidate this" has to propagate globally rather than updating one process's memory instantly. Purging by URL works but isn't instantaneous everywhere and is rate-limited by most providers; surrogate keys (cache tags) let you purge every cached object tied to a logical entity in one call; and versioned URLs sidestep the problem entirely for static assets by never reusing a URL for different content.

**Q6: Why are versioned URLs (e.g., `app.a1b2c3.js`) preferred over relying on cache purges for static assets?**
Because purge propagation across many edge nodes isn't instantaneous, "purge and hope it's gone everywhere quickly" introduces uncertainty about exactly when users stop seeing the old version. A versioned URL makes the old and new files genuinely different URLs — the old one simply stops being referenced and ages out of cache naturally via TTL, with no explicit invalidation step and no propagation-delay uncertainty at all.

**Q7: How does adaptive bitrate streaming (HLS/DASH) let a video player handle changing network conditions?**
The source video is pre-encoded into multiple quality renditions, each sliced into short segments (commonly 2-10 seconds). The player continuously measures its own download throughput and buffer health, then independently picks which rendition to request for the *next* segment — meaning quality can step down when bandwidth drops and step back up when it recovers, with each decision point only a few seconds apart and no server-side involvement.

**Q8: Why is video streaming such a good fit for CDN caching, compared to, say, a live chat API?**
Once encoded, every HLS/DASH segment is a small, immutable file that's identical for every viewer requesting that rendition at that timestamp — a textbook cacheable asset with effectively unlimited reuse across millions of viewers. A live chat API, by contrast, returns per-user, constantly changing data that has little to no reuse across different requests, so there's almost nothing for a cache to actually save.

**Q9: How does a CDN help with DDoS mitigation?**
Anycast (the same mechanism used for normal routing) naturally spreads an attack's traffic across every Point of Presence simultaneously rather than letting it concentrate on a single origin IP, and the CDN's aggregate bandwidth and request-filtering capacity vastly exceeds what a typical origin could absorb alone. This is why "put a CDN in front of it" is one of the most common and effective DDoS mitigations used in production today.

**Q10: What's the trade-off involved in adopting a multi-CDN strategy?**
You gain resilience against any single provider's regional outage or misconfiguration, plus the ability to route to whichever provider currently performs best in a given region. The cost is meaningfully more operational complexity: cache invalidation, edge configuration, and security rules (WAF, TLS) all need to be kept consistent across multiple independent platforms, each with its own API — which is why multi-CDN is a deliberate choice for large, latency-critical products rather than a default for most systems.
