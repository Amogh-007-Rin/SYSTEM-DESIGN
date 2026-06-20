# Design Challenge 01: Load Balancing Strategy for a Video Streaming Service

**Difficulty:** Medium

## Prompt

Design the complete load balancing strategy for a video streaming service (think a simplified YouTube/Netflix-style platform): users browse and search a catalog, request video playback (which streams large amounts of data over a sustained connection), and occasionally upload new video content for transcoding.

## What to Produce

1. Identify the distinct traffic types this service has (e.g., catalog/search API calls, video segment streaming, uploads) and explain why they may need **different** load balancing treatment rather than one-size-fits-all.
2. For each traffic type, specify: L4 or L7, and which algorithm (Round Robin, Least Connections, IP Hash, etc.), with justification tied to that traffic type's actual request cost and duration.
3. Your strategy for making the load balancer tier itself highly available.
4. Your global load balancing approach for routing users to the nearest region (GeoDNS vs. Anycast), with justification.
5. How connection draining should be configured differently for a quick catalog API call versus a multi-minute video stream still in progress.
6. At least 2 trade-offs you accepted and why.

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md).
