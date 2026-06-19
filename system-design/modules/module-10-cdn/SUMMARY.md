# Module 10 — Content Delivery Networks (CDNs): Summary

> This module covered how CDNs make global products feel fast: routing users to nearby edge nodes via Anycast/GeoDNS, the push vs. pull caching models, HTTP-header-driven caching and invalidation, and the two areas where CDN architecture gets genuinely advanced — adaptive bitrate video streaming and the security/edge-compute capabilities built into modern edge networks.

---

## Key Concepts

1. **Point of Presence (PoP) / edge node** — a geographically distributed server that caches and serves content close to users, avoiding a round trip to the origin.
2. **Anycast routing** — the same IP address announced from every PoP; BGP delivers each user to the topologically nearest one automatically.
3. **Push vs. pull CDN** — pull (lazy, fetch-on-miss) is the default; push (proactive upload) trades effort for guaranteed instant availability.
4. **`stale-while-revalidate`** — serves a stale cached response immediately while refreshing it asynchronously, trading brief staleness for eliminating cache-miss latency.
5. **Surrogate keys / cache tags** — tag related cached objects so an entire group can be purged together by one logical label instead of per-URL.
6. **Versioned URLs** — embedding a version/hash in a static asset's URL sidesteps invalidation entirely; old URLs simply age out of cache.
7. **Adaptive bitrate streaming (HLS/DASH)** — video pre-encoded into multiple renditions, sliced into segments; the player picks the best sustainable rendition per segment based on measured throughput and buffer health.
8. **Edge compute (Cloudflare Workers, Lambda@Edge)** — running small, stateless, latency-sensitive code at CDN edge nodes rather than only at the origin.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| CDN content model | Pull (lazy) | Push (proactive) | General-purpose content, low operational overhead desired | A scheduled high-profile release needs zero first-viewer latency |
| Invalidation strategy | Versioned URLs | Purge / surrogate keys | Content is static and safe to version (JS/CSS bundles, images) | Content's URL must stay stable but its contents change (a product page, an API response) |
| Freshness vs. latency | Strict TTL only | `stale-while-revalidate` | Staleness is unacceptable even briefly | A brief staleness window is an acceptable trade for eliminating miss latency |
| CDN provider count | Single CDN | Multi-CDN | Most products — simpler operations | Large-scale, latency/availability-critical products that can justify the added complexity |
| Video delivery | Progressive download | Adaptive bitrate (HLS/DASH) | Simple use case, stable high bandwidth guaranteed | Variable network conditions across a large, diverse viewer base |

---

## Common Interview Questions from This Module

- How does a CDN know which edge server is closest to a given user?
- What's the difference between a push CDN and a pull CDN, and when would you choose each?
- How does adaptive bitrate streaming (HLS/DASH) let a video player handle changing network conditions?
- How does CDN cache invalidation differ from invalidating a single key in a cache like Redis?
- How does a CDN help with DDoS mitigation?

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| Anycast/GeoDNS routing | Delivers each user to a nearby PoP without client-side routing logic |
| Cache-Control / TTL / `Vary` / stale-while-revalidate | Controls what gets cached, for how long, and how staleness is tolerated at the edge |
| Surrogate keys (cache tags) | Makes invalidation of many related cached objects tractable with one purge call |
| Versioned URLs | Eliminates the invalidation problem entirely for static assets |
| Adaptive bitrate rendition ladder + segment-based delivery | Lets video quality adapt to changing bandwidth without server-side involvement |
| Edge compute (Workers/Lambda@Edge) | Runs cheap, stateless, latency-sensitive logic close to users instead of only at the origin |

---

## What This Unlocks

After this module, you can tackle:
- [Module 11 — Microservices](../module-11-microservices/), where service-to-service communication patterns build on the networking and edge-delivery fundamentals from this module
- Video/media-heavy system design interview questions (e.g., "design YouTube," "design Netflix," "design a live-streaming platform")
- Any system design prompt involving global/multi-region users, where "how do you make this fast worldwide" is really a CDN-and-caching question

---

## Quick Reference

- **Anycast** routes by network topology; **GeoDNS** routes by resolving to different IPs per region — both get a user to a nearby PoP.
- **Pull CDN** = lazy, default. **Push CDN** = proactive, for known high-traffic-in-advance content.
- **Versioned URLs** beat purging for static assets — no propagation-delay uncertainty at all.
- **HLS/DASH** = multiple renditions, sliced into segments; the *player* decides which rendition to fetch next based on throughput + buffer health.
- A CDN accelerates **reads**, not writes — and is a natural enforcement point for DDoS mitigation, WAF, and TLS termination because all read traffic already passes through it.

---

← [Previous Module ← Module 09 — Storage Systems](../module-09-storage/) | [Next Module → Module 11 — Microservices](../module-11-microservices/)
