# Module 10 — Deep Dive: Streaming, Security, and the Programmable Edge

## Why This Matters

Knowing what a CDN is gets you through the basics; knowing how Netflix serves the same video at six different quality levels to six different network conditions, how a CDN absorbs a multi-terabit DDoS attack without the origin ever noticing, and how "the edge" became a place you can run your own code — that's what separates a candidate who's used a CDN from one who can design around one. This deep dive covers the parts of CDN architecture that show up once requirements get specific: real-time video, security posture, and multi-provider resilience.

---

## Adaptive Bitrate Streaming (HLS/DASH)

Progressive download (one file, streamed top to bottom) breaks the moment a user's bandwidth is worse than the video's encoded bitrate — the player simply can't download fast enough and playback stalls. **Adaptive bitrate streaming** solves this by giving the player options:

1. The source video is encoded into multiple **renditions** at different resolutions/bitrates (e.g., 1080p at 5 Mbps, 720p at 2.5 Mbps, 480p at 1 Mbps, 240p at 400 Kbps).
2. Each rendition is sliced into short **segments** (commonly 2–10 seconds each).
3. A **manifest file** lists every available rendition and where to find its segments — **HLS** (HTTP Live Streaming, Apple's format, `.m3u8` manifests, `.ts`/fMP4 segments) and **MPEG-DASH** (an open, codec-agnostic standard, `.mpd` manifests) are the two dominant formats, functionally similar in concept.
4. The player continuously measures its own download throughput and buffer health, then picks which rendition to request *for the next segment* — every few seconds, independently, with no server-side involvement in the decision.

This is exactly why a video can start at 480p on a phone walking out of WiFi range and climb to 1080p once it reconnects: each segment is an independent decision point, encoded once and cached at the edge like any other static file. The CDN's job is simply to serve whichever segment the player asks for, from cache, as fast as possible — the adaptive intelligence lives entirely client-side. A simplified version of the rendition-selection algorithm is implemented in [`examples/abr-selector.ts`](./examples/abr-selector.ts).

> 💡 **Note:** Because every rendition/segment combination is just a small, cacheable, immutable file (segments are never edited after encoding), HLS/DASH delivery is "embarrassingly cacheable" — it's one of the best-case workloads for a CDN, which is exactly why video streaming at scale is economically viable at all.

> 🎯 **Interview Tip:** If asked to design video delivery for a streaming platform, naming HLS/DASH and explaining *why* segmenting + multiple renditions solves the bandwidth-variance problem (rather than just saying "use a CDN for video") demonstrates you understand the actual mechanism, not just the product category.

---

## CDN and Security

Because every user request already passes through an edge node before reaching the origin, that edge node is a natural enforcement point for security controls that would otherwise need to run on (and potentially overwhelm) the origin itself:

- **DDoS mitigation** — Anycast (the same routing mechanism covered in [01-concepts](../01-concepts/README.md#how-cdn-routing-works) and [Module 02](../../module-02-networking/02-deep-dive/README.md#anycast-routing)) naturally spreads an attack's traffic across every PoP simultaneously instead of concentrating it on one origin IP. Combined with the CDN's vastly larger aggregate bandwidth and request-filtering capacity compared to a single origin, this is why "put a CDN in front of it" is one of the most effective and common DDoS mitigations in practice.
- **Web Application Firewall (WAF) at the edge** — malicious request patterns (SQL injection attempts, known bad bot signatures, credential-stuffing patterns) can be detected and blocked at the edge node, before the request ever consumes origin compute or touches the database.
- **TLS termination at the edge** — the CDN holds the TLS certificate and terminates HTTPS connections at the nearest PoP, re-encrypting (or using a private, already-fast backbone) for the origin-bound leg. This means the expensive part of a TLS handshake (covered in [Module 02](../../module-02-networking/01-concepts/README.md)) happens close to the user, and the origin is freed from holding/rotating public-facing certificates at all.

> ⚠️ **Warning:** TLS termination at the edge means the CDN provider can see your traffic in plaintext between the edge and the origin (unless you separately re-encrypt that leg). For most products this trade-off is acceptable given the CDN's security track record, but it's worth stating explicitly in a regulated or highly sensitive context rather than treating "TLS terminates at the edge" as a detail with no implications.

---

## Multi-CDN Strategies

A single CDN provider is still a single point of failure and a single point of negotiating leverage. **Multi-CDN** architectures route traffic across two or more CDN providers simultaneously:

- **Why**: resilience against one provider's regional outage or BGP misconfiguration, pricing leverage, and the ability to route to whichever provider currently performs best in a given region (e.g., Provider A is currently faster in Brazil while Provider B is faster in India).
- **How**: typically via DNS-level traffic steering (a layer above GeoDNS that also weighs real-time provider health/performance) or client-side logic that fails over to a secondary CDN's URL if the primary doesn't respond.
- **The cost**: meaningfully more operational complexity — cache invalidation, configuration, and security rules (WAF, TLS) now need to stay consistent across multiple independent platforms, each with its own API and quirks.

> ⚠️ **Warning:** Multi-CDN is a strategy large-scale, latency/availability-critical products (major streaming platforms, large e-commerce) adopt deliberately, not a default. For most products, a single well-chosen CDN provider's own multi-region redundancy is more than sufficient, and the operational overhead of a second provider isn't justified until you can point to a specific outage or performance gap it would have prevented.

---

## Edge Computing

The same edge nodes that cache static content can also execute custom code per-request, close to the user — turning the CDN from a passive cache into a distributed compute platform:

- **Cloudflare Workers** — JavaScript/WebAssembly functions running on Cloudflare's edge network, with near-zero cold-start time (V8 isolates, not full containers), used for A/B test routing, request/response rewriting, auth checks, or even full API logic that needs to run close to the user.
- **Lambda@Edge / CloudFront Functions** — AWS's equivalent, running custom logic at CloudFront edge locations, commonly used for header manipulation, redirects, and lightweight auth checks before a request reaches the origin (or is served from cache).
- **Why this matters for system design**: edge compute lets you move *some* application logic out of a single-region origin and run it everywhere your CDN already has a presence, reducing latency for that logic the same way caching reduces latency for static content. It's not a replacement for your origin's core business logic and data layer, but a place for cheap, stateless, latency-sensitive decisions.

> 💡 **Note:** Edge compute platforms intentionally constrain what you can do (limited CPU time, no arbitrary long-running state, restricted or no direct database access) — the trade-off for running in hundreds of locations simultaneously is that each invocation must be fast, stateless, and side-effect-light.

---

## Key Takeaways

- Adaptive bitrate streaming (HLS/DASH) solves bandwidth variance by encoding multiple renditions split into small, independently cacheable segments, with the player — not the server — deciding which rendition to fetch next.
- CDN edge nodes are a natural enforcement point for DDoS mitigation (via Anycast traffic spreading), WAF rules, and TLS termination, all before traffic reaches the origin.
- Multi-CDN strategies trade meaningful operational complexity for resilience against a single provider's outage — a deliberate choice for large-scale products, not a default.
- Edge computing (Cloudflare Workers, Lambda@Edge) turns CDN nodes into a distributed compute layer for cheap, stateless, latency-sensitive logic — not a replacement for your origin's core application.
- Across all four topics, the throughline is the same: push work (caching, security filtering, simple compute) as close to the user as possible, and reserve the origin for what genuinely requires the source of truth.
