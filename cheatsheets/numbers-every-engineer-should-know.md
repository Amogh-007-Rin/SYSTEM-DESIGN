# Numbers Every Engineer Should Know

> The original list traces back to Jeff Dean's "Numbers Everyone Should Know" talk at Google. These numbers haven't changed in *kind* since then, even as hardware has gotten faster — the relative gaps between cache, memory, disk, and network are what matter for system design intuition.

> 🎯 **Interview Tip:** You don't need exact numbers in an interview. You need the right order of magnitude and the right relative ordering: cache < memory < SSD < network-same-DC < disk-seek < cross-region-network.

---

## Latency Numbers

| Operation | Latency |
|---|---|
| L1 cache reference | 1 ns |
| L2 cache reference | 4 ns |
| Main memory (RAM) reference | 100 ns |
| SSD random read (NVMe) | 16 μs |
| Disk sequential read (1MB) | ~100 μs–1 ms (SSD) |
| Round trip within same datacenter | 0.5 ms |
| HDD seek | 4 ms |
| Send 1MB over 1 Gbps network | ~10 ms |
| Round trip CA → Netherlands (cross-region) | ~100 ms |

---

## Bandwidth / Throughput Numbers

| Resource | Typical Throughput |
|---|---|
| Disk sequential read | ~100 MB/s (HDD), ~500 MB/s–3.5 GB/s (SSD/NVMe) |
| Network within a datacenter | 1–10 Gbps |
| Network across regions | Often the bottleneck — budget far less than intra-DC |

---

## Powers of Two

| Power | Value | Common Name |
|---|---|---|
| 2^10 | 1,024 | 1 Kilo (K) |
| 2^20 | 1,048,576 | 1 Mega (M) |
| 2^30 | 1,073,741,824 | 1 Giga (B, ~1 billion) |
| 2^40 | ~1.1 × 10^12 | 1 Tera (T) |
| 2^50 | ~1.1 × 10^15 | 1 Peta (P) |

> 💡 **Note:** In system design interviews, round 2^30 to "1 billion" and 2^20 to "1 million" — nobody is checking your arithmetic to the decimal point, they're checking that you can reason in orders of magnitude quickly.

---

## Common Request / Object Sizes

| Item | Size |
|---|---|
| A tweet (max length, UTF-8) | 280 bytes |
| Short URL code | 7 bytes |
| Average URL | ~200 bytes |
| Small JSON API response | ~1 KB |
| Average web page (with assets) | ~2 MB |
| Compressed profile photo | ~200 KB |
| High-resolution photo | 2–5 MB |
| 1 minute of 720p video | ~50 MB |
| 1 minute of MP3 audio | ~1 MB |

---

## Why This Matters

These numbers are the raw material of [capacity estimation](../modules/module-01-foundations/02-deep-dive/README.md). When you're asked "design a system that stores all tweets for 5 years," you multiply a request size by a request rate by a retention period — and the cache vs. memory vs. disk numbers tell you whether your hot path can live in RAM or needs to hit disk, which changes your entire architecture.

See also: [estimation-cheatsheet.md](../interview-prep/estimation-cheatsheet.md) for worked QPS and storage examples, and [Module 01 — Foundations](../modules/module-01-foundations/) for the full capacity estimation framework.
