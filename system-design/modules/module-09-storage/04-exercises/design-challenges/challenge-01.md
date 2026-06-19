# Design Challenge 01: Photo Storage System (Instagram-style)

**Difficulty:** Medium

## Prompt

Design the storage backend for a photo-sharing application like Instagram: the upload flow, the storage backend for the actual photo bytes, the metadata layer, and how a CDN fits into serving reads at scale.

## What to Produce

1. Characterize the data: rough size per photo, read/write ratio, and mutability — and use that to justify your storage category choice (block, file, or object).
2. Describe the upload flow end-to-end, including whether uploads are proxied through your application servers or go directly to storage, and why.
3. Describe where and how photo **metadata** (owner, caption, timestamp, privacy settings) is stored, separately from the photo bytes, and why that separation matters.
4. Describe the read path: how a CDN fits in, what gets cached, and your cache invalidation strategy for a photo that gets replaced or deleted.
5. Address durability (how you avoid losing photos) and at least one cost optimization (e.g., storage tiering).
6. At least 2 explicit trade-offs.

A full worked solution is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md), which answers this exact prompt in depth.
