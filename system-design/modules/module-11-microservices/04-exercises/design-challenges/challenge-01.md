# Design Challenge 01: Decompose a Monolithic E-Commerce App into Microservices

**Difficulty:** Medium–Hard

## Prompt

You're given a monolithic e-commerce application: a single deployable Rails/Django/Spring-style codebase with one shared relational database, handling product catalog browsing and search, shopping cart, checkout, payment processing, inventory management, order history, and shipping/order-status notifications. Three product teams currently work in this one codebase and increasingly block each other's releases; catalog browsing traffic is read-heavy and spiky, while checkout is write-heavy and consistency-sensitive — and both are stuck sharing the same database's capacity today.

## What to Produce

1. State the actual forcing function(s) that justify decomposing this system at all — don't just say "microservices are better," name the specific symptom (team coordination bottleneck, divergent scaling needs, etc.) you're solving for.
2. Propose a set of services, naming the decomposition method you used for each boundary (business capability, DDD bounded context, or Conway's Law/team alignment) — arbitrary slicing without a stated method is not acceptable.
3. For every service, state **what data it exclusively owns**, and the rule for how other services may access that data (API call vs. published event vs. never).
4. Define the APIs between at least 4 of the service pairs you proposed, and for each, justify **synchronous vs. asynchronous** communication based on whether the caller needs the result to proceed.
5. Identify which parts of the system remain on the user-facing critical path (must respond before the user gets an answer) versus which are safely async/eventually-consistent.
6. At least 2 trade-offs you accepted in this decomposition, and why.

A full worked solution is in [`challenge-01-solution.md`](./challenge-01-solution.md).

> 💡 **Note:** This is also worked end-to-end as the [Module 11 sample interview answer](../../03-interview-prep/sample-answer.md) — attempt this challenge yourself before reading that, since the prompts are intentionally aligned.
