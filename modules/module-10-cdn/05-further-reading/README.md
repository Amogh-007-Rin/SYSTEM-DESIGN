# Module 10 — Further Reading

- **Cloudflare Learning Center — "What is a CDN?"** (cloudflare.com/learning/cdn/what-is-a-cdn/) — a clear, vendor-neutral explanation of CDN fundamentals, PoPs, and Anycast routing from one of the largest CDN operators.
- **Cloudflare Blog — caching and "How Cloudflare's edge caching works"** (blog.cloudflare.com) — practical, production-grade posts on cache invalidation, `Cache-Control` behavior, and edge architecture at scale.
- **Fastly Developer Hub — "Caching with Fastly"** (developer.fastly.com/learning/concepts/) — detailed documentation on surrogate keys (cache tags), purging, and VCL-based cache control logic, written by a CDN provider that built its product around exactly these primitives.
- **Akamai Engineering Blog** (akamai.com/blog) — long-running engineering blog from one of the oldest CDN operators, covering large-scale edge delivery, security, and performance.
- **MDN Web Docs — "HTTP Caching"** (developer.mozilla.org/en-US/docs/Web/HTTP/Caching) — the authoritative, vendor-neutral reference for `Cache-Control`, `Vary`, `ETag`, and related caching headers.
- **HTTP Live Streaming (HLS) specification — RFC 8216** (datatracker.ietf.org/doc/html/rfc8216) — the official IETF specification for Apple's HLS protocol, including manifest and segment format details.
- **MPEG-DASH overview — "Dynamic Adaptive Streaming over HTTP" (ISO/IEC 23009-1)** — the formal standard for DASH; the DASH Industry Forum (dashif.org) site has more approachable guides and reference implementations.
- **"A Buffer-Based Approach to Rate Adaptation: Evidence from a Large Video Streaming Service" (Huang et al., SIGCOMM 2014)** — a widely-cited research paper (from the team behind early YouTube ABR work) on buffer-based adaptive bitrate algorithms, more rigorous than the simplified throughput-based model in this module's `abr-selector.ts` example.
- **Netflix Technology Blog — streaming and CDN posts (Open Connect)** (netflixtechblog.com) — Netflix's own CDN (Open Connect) and adaptive streaming architecture, described in detail by the engineers who built it.
- **Cloudflare Workers documentation** (developers.cloudflare.com/workers/) and **AWS Lambda@Edge documentation** (docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html) — official docs for the two most widely used edge compute platforms discussed in this module's deep dive.

→ Continue to [Module 11 — Microservices](../../module-11-microservices/).
