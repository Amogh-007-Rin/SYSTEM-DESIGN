# Module 07 — Interview Prep: Reasoning About Load Balancing

## Why This Matters

"How would you load balance this?" rarely means "name an algorithm." Interviewers use it to see whether you can reason about traffic shape, failure modes, and the load balancer's own availability — not just recite Round Robin and move on. The strongest answers treat the load balancer as a real piece of distributed infrastructure with its own trade-offs and failure modes, not as a black box that magically makes "more servers" work.

---

## A Framework for "How Would You Load Balance This System?"

1. **Pick the layer first** — does the routing decision need to see inside the request (L7: route by path/header) or just spread connections (L4: faster, blind to content)? State this explicitly before naming an algorithm.
2. **Pick an algorithm and justify it against the actual traffic shape** — uniform, cheap requests favor Round Robin; highly variable request cost favors Least Connections; a need for affinity without server-side session storage favors IP Hash.
3. **Name your health check strategy** — active, passive, or both — and what "healthy" actually means for this specific backend (not just "the process responds").
4. **Make the load balancer itself highly available** — say "active-active" or "active-passive behind a floating IP" out loud. Forgetting this is the single most common gap in an otherwise good answer.
5. **Address state** — if there's any session/cart/login state, name where it lives. "Sticky sessions" is an acceptable answer only if you can also say why you didn't just externalize the state instead.
6. **Zoom out to global, if relevant** — multi-region systems need a story for *which region* a user reaches at all, before any single region's load balancer matters (GeoDNS vs. Anycast).

> 🎯 **Interview Tip:** Interviewers listen for whether you treat the load balancer as infrastructure that can fail, not as a given. Explicitly stating "this LB tier needs its own HA story" before being asked is one of the highest-signal, lowest-effort things you can say in a system design interview.

---

## What Interviewers Are Actually Listening For

- **Trade-off awareness, not memorized facts** — "I'd use Least Connections because request costs vary a lot here, even though it needs the LB to track live connection counts" is a far stronger answer than just naming the algorithm.
- **Whether you treat the LB as a potential single point of failure** — candidates who only ever talk about backend redundancy and never mention the load balancer's own availability are missing a core piece of the picture.
- **Precision in terminology** — using "load balancer," "reverse proxy," and "API gateway" correctly and distinctly (see [02-deep-dive](../02-deep-dive/README.md)) signals real understanding, not pattern-matched vocabulary.
- **Connecting back to statelessness** — recognizing that sticky sessions are a symptom of stateful backends, not a free feature, ties this module back to [Module 06](../../module-06-scalability/01-concepts/README.md) and shows layered understanding across the system.

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design highly-available load balancing for a global service").
