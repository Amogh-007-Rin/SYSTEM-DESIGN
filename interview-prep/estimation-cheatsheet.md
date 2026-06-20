# Estimation Cheatsheet

> Capacity estimation is a fluency skill, not a knowledge skill — you don't need to memorize every number on this page, but you need to be fast enough at the *common* ones that you're not visibly doing arithmetic for 90 seconds mid-interview. See [Module 01 — Foundations](../modules/module-01-foundations/02-deep-dive/README.md) for the full framework this cheatsheet supports.

---

## Powers of Two

| Power | Value | Common Name |
|---|---|---|
| 2^10 | 1,024 | 1 Kilo (K) |
| 2^20 | 1,048,576 | 1 Mega (M) |
| 2^30 | 1,073,741,824 | 1 Giga / ~1 Billion (B) |
| 2^40 | ~1.10 × 10^12 | 1 Tera (T) |

> 💡 **Note:** In an interview, round 2^10 → 1,000, 2^20 → 1,000,000, 2^30 → 1,000,000,000. Nobody is checking decimal precision — they're checking that you can move between bytes/requests and human-readable scale instantly.

---

## Time Reference Table

| Unit | Seconds |
|---|---|
| 1 minute | 60 |
| 1 hour | 3,600 |
| 1 day | 86,400 (~100,000 for quick mental math) |
| 1 month | ~2.6 million |
| 1 year | ~31.5 million |

---

## QPS From DAU — Worked Examples

The general formula: `avg QPS = (DAU × requests per user per day) / 86,400`, and `peak QPS ≈ 2 × avg QPS` unless told otherwise.

| DAU | Requests/User/Day | Avg QPS | Peak QPS (×2) |
|---|---|---|---|
| 1M | 10 | ~116 | ~232 |
| 10M | 10 | ~1,157 | ~2,314 |
| 100M | 10 | ~11,574 | ~23,148 |

> 🎯 **Interview Tip:** A fast shortcut: 1M requests/day ≈ 12 QPS, and 1B requests/day ≈ 11,574 QPS. Memorize these two anchors and scale linearly from there instead of doing long division live.

---

## Latency Numbers Every Engineer Should Know

| Operation | Latency |
|---|---|
| L1 cache reference | 1 ns |
| L2 cache reference | 4 ns |
| L3 cache reference | 40 ns |
| Main memory (RAM) reference | 100 ns |
| SSD random read (NVMe) | 16 μs |
| SSD sequential read | 200 μs |
| HDD seek | 4–10 ms |
| Same-datacenter round trip | 0.5 ms |
| US West ↔ US East | ~40 ms |
| US ↔ Europe | ~80 ms |
| US ↔ Australia | ~150 ms |

> 💡 **Note:** The relative ordering matters more than the exact values: cache ≪ memory ≪ SSD ≪ same-DC network ≪ HDD seek ≪ cross-region network. If your design's hot path requires a cross-region round trip on every request, that's almost always worth flagging as a latency risk.

---

## Storage Sizes

| Unit | Bytes |
|---|---|
| 1 KB | 1,000 (or 1,024 binary) |
| 1 MB | 1,000 KB |
| 1 GB | 1,000 MB |
| 1 TB | 1,000 GB |
| 1 PB | 1,000 TB |

---

## Common Object Sizes

| Item | Size |
|---|---|
| UUID | 16 bytes |
| Short URL code | 7 bytes |
| Tweet (max length) | 280 bytes |
| Average URL | ~200 bytes |
| Small JSON payload | ~1 KB |
| Average web page (with assets) | ~2 MB |
| Profile photo (compressed) | ~200 KB |
| High-resolution photo | 2–5 MB |
| 1 minute of 720p video | ~50 MB |
| 1 minute of MP3 audio | ~1 MB |

---

## Availability and the "Nines"

| Availability | Downtime / Year | Downtime / Month |
|---|---|---|
| 99% | ~3.65 days | ~7.3 hours |
| 99.9% | ~8.77 hours | ~43.8 minutes |
| 99.95% | ~4.38 hours | ~21.9 minutes |
| 99.99% | ~52.6 minutes | ~4.4 minutes |
| 99.999% | ~5.3 minutes | ~26 seconds |

> ⚠️ **Warning:** Each additional nine is a roughly 10× harder engineering problem, not a 10% harder one — going from 99.9% to 99.99% typically requires eliminating entire categories of single points of failure (multi-AZ, then multi-region), not just "trying harder."

---

## Throughput Reference

| Resource | Typical Throughput |
|---|---|
| Network within a datacenter | 1–10 Gbps |
| Disk sequential read (SSD/NVMe) | 500 MB/s – 3.5 GB/s |
| Disk sequential read (HDD) | ~100 MB/s |
| RAM bandwidth | 10–20 GB/s |
| Typical broadband (residential) | 100–500 Mbps |

---

## Common QPS Benchmarks (Single Node, Rough Order of Magnitude)

| System | Approximate Single-Node QPS |
|---|---|
| PostgreSQL (simple indexed reads) | ~5,000–10,000 |
| Redis (GET/SET) | ~100,000+ |
| Nginx (static content) | ~10,000–50,000 |
| Node.js (simple JSON API) | ~5,000–15,000 |
| Kafka (single partition, sustained writes) | ~10,000+ messages/sec |

> 💡 **Note:** These are rough, hardware-dependent ballparks — useful for sanity-checking "do I need 50 database nodes or 2" in an interview, not for capacity planning a real production system.

---

## Worked Storage Calculation: Photo-Sharing App

**Scenario:** 50M DAU, each user uploads 1 photo/day on average, average compressed photo size 200KB, 5-year retention.

```
Daily uploads        = 50,000,000 users × 1 photo/day        = 50,000,000 photos/day
Daily storage         = 50,000,000 × 200KB                    = 10,000,000,000 KB ≈ 10 TB/day
Total over 5 years    = 10 TB/day × 365 days × 5 years        = 18,250 TB ≈ 18.25 PB
```

> 🎯 **Interview Tip:** Always state whether your storage number includes replication. If the design uses 3× replication for durability (common for object storage), the real infrastructure footprint here is closer to ~55 PB, not 18.25 PB — say this out loud, it shows you're thinking about durability, not just raw bytes.

---

## Quick Calculation Template

When estimating any new system, work through these in order:

1. **Total requests/day** = DAU × actions/user/day
2. **Avg QPS** = total requests/day ÷ 86,400
3. **Peak QPS** = avg QPS × 2 (adjust if given a different peak factor)
4. **Daily storage** = writes/day × avg payload size
5. **Total storage** = daily storage × retention period (× replication factor if relevant)
6. **Bandwidth** = total requests/day × avg payload size ÷ 86,400

See [Module 01 — Foundations](../modules/module-01-foundations/) for the full worked derivation of this template, and [`numbers-every-engineer-should-know.md`](../cheatsheets/numbers-every-engineer-should-know.md) for the underlying hardware numbers.

---

← [Back to Interview Prep](./README.md)
