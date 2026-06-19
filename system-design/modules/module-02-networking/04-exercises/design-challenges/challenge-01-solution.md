# Design Challenge 01 — Solution: Network Topology for a Global Web App

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — restated briefly here.

## Summary of Approach

- **DNS:** GeoDNS with a 60–300s TTL, routing each user to their nearest of three regional clusters (US, EU, APAC).
- **Static assets:** Served via CDN, independent of the regional cluster topology — see [Module 10](../../../module-10-cdn/).
- **Dynamic traffic:** Each region runs application servers against a local read replica; a single primary database in one region handles all writes, accepting extra write latency from non-primary regions in exchange for fast local reads everywhere.
- **Connections:** HTTP/2+ at the edge, persistent connection pools internally, to avoid paying handshake costs per request.

## Answering "What if 80% of Traffic Is From One Region?"

This changes the calculus on where the **write primary** should live: if it's not already in the dominant-traffic region, moving it there reduces the now-much-more-common case (writes from the majority region) at the cost of the now-rarer case (writes from minority regions). It also changes capacity planning — the dominant region needs proportionally more application server capacity, while the other two regions can be sized smaller, primarily for redundancy and lower-latency reads for their smaller user base, rather than peak throughput.

See the full trade-off table and follow-up discussion in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
