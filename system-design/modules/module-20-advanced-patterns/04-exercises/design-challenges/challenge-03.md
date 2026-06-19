# Design Challenge 03 (Capstone): Design Uber

**Difficulty:** Capstone (synthesizes Modules 01–02, 04–08, 11–13, 16)

## Prompt

Design Uber: a system that tracks real-time driver locations, lets a rider request a ride, matches the rider with a nearby available driver, and prices the ride (including surge pricing under high demand).

## What to Produce

1. **Functional requirements** — request a ride, track driver location in real time, match rider to nearest available driver, price the ride, track ride state through completion.
2. **Non-functional requirements** — explicit scale numbers (concurrent active drivers, location update frequency, ride requests/sec, matching latency target).
3. **Capacity estimation** — derive location-update throughput and matching latency budget from your stated numbers.
4. **Geospatial indexing strategy** — how you efficiently find "available drivers near this rider" without scanning every driver.
5. **Real-time location updates** — the communication pattern between driver apps and the backend (and why), referencing real-time system patterns.
6. **Matching algorithm** — at a high level, how a rider gets matched to a specific driver.
7. **Surge pricing** — how demand/supply imbalance is detected and turned into a price multiplier, at a high level.
8. **Consistency considerations** — what must be strongly consistent (e.g., a driver can't be matched to two riders at once) vs. what can be eventually consistent.
9. **At least 5 explicit trade-offs.**

A full worked solution is in [`challenge-03-solution.md`](./challenge-03-solution.md) — attempt this yourself first.
