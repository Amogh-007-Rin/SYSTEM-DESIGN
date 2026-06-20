# Module 11 — Interview Prep: Microservices Architecture

## Why This Matters

"Would you use microservices for this system, and how would you decompose it?" shows up constantly in mid-to-senior system design interviews, and it's a trap for candidates who've only memorized the buzzwords. Interviewers are listening for whether you treat microservices as a default best practice (a red flag) or as a deliberate trade-off you're choosing for specific, namable reasons. The strongest answers sound like an engineer who has actually been paged at 3am because a saga didn't compensate correctly — not someone reciting a blog post.

---

## A Framework for "Should This Be Microservices?"

1. **Name the actual forcing function.** Don't answer yes/no in the abstract — identify *why* this specific system would benefit: team scale (multiple teams need to ship independently), divergent scaling needs (one component is 100x hotter than the rest), or technology heterogeneity (one component genuinely needs a different runtime/language).
2. **Acknowledge what a modular monolith gets you for free.** If the actual problem is "our codebase is a mess," that's a modularity problem, solvable inside one deployable unit — splitting into network-separated services doesn't fix bad internal boundaries, it just makes them expensive to cross.
3. **Propose service boundaries using a real method**, not arbitrary slicing — business capability, DDD bounded contexts, or Conway's Law alignment with team structure. Say which one you're using and why.
4. **For every boundary you draw, say who owns the data** and what API the boundary exposes — a service that doesn't own its data isn't really independent yet.
5. **Pick communication style per interaction**, not globally — synchronous where the caller needs the answer to proceed, asynchronous/event-driven where it doesn't.
6. **Address what happens when a call fails** — timeouts, retries, circuit breakers, and for any multi-service write, name the saga and its compensations explicitly.

> 🎯 **Interview Tip:** The single biggest signal of a strong answer is naming a real cost early and unprompted — "this means the order flow loses ACID guarantees across services, and I need to handle that with a saga" — rather than waiting for the interviewer to ask "but what about consistency?"

---

## What Interviewers Are Actually Listening For

- Whether you can articulate *both* sides of the monolith/microservices trade-off without being prompted (see [01-concepts](../01-concepts/README.md#benefits-of-microservices) and [costs](../01-concepts/README.md#costs-of-microservices)).
- Whether your decomposition is driven by a real method (business capability / DDD / Conway's Law) instead of guesswork — and whether you can defend a boundary when challenged ("why is Inventory separate from Catalog?").
- Whether you reach for a saga with explicit compensations the moment a flow spans more than one service's database, instead of hand-waving "we'll just make sure it's consistent."
- Whether you know the resilience patterns by name and by purpose: circuit breaker (stop calling a failing dependency), bulkhead (limit blast radius), and can distinguish them from each other instead of treating "resilience" as one undifferentiated idea.
- Whether you can size the operational cost honestly — service discovery, distributed tracing, per-service CI/CD, observability — instead of presenting microservices as architecturally free.

> 💡 **Note:** Interviewers will often deliberately push on a boundary you drew ("why not put Payments inside Order service?") specifically to see whether you have a real reason or just drew lines arbitrarily. Always have one sentence of justification ready for every boundary in your design.

---

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Decompose a monolithic e-commerce app into microservices").
