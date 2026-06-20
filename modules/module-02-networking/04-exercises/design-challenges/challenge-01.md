# Design Challenge 01: Network Topology for a Global Web App

**Difficulty:** Easy–Medium

## Prompt

You're designing the network topology for a web application with users in North America, Europe, and Asia-Pacific. Decide: where do you place servers, and what DNS strategy do you use to route users to them?

## What to Produce

1. Clarifying questions you'd ask (traffic split by region? static vs. dynamic content? latency target?)
2. A DNS/routing strategy (GeoDNS? Anycast? a single region with a CDN in front?) with a justification
3. Where application servers and databases live, and how write traffic is handled if you have multiple regional database replicas
4. At least 2 trade-offs in your chosen topology
5. What changes about your design if 80% of traffic suddenly came from one region instead of being evenly split

A full worked solution is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — it answers this exact prompt in detail.
