# Module 15 — Interview Prep: Reasoning About Security Under Pressure

## Why This Matters

"How would you secure this?" rarely arrives as its own question — it shows up as a follow-up after you've already designed the happy-path architecture, often with the interviewer deliberately probing a specific weak spot they noticed in your design. The candidates who do well aren't the ones who memorized the most acronyms; they're the ones who can name a structured set of concerns and apply them to *this specific system*, the same way you'd apply CAP theorem or the read/write trade-off in any other module.

---

## A Framework for "How Would You Secure This System?"

1. **State the principles first** — least privilege, defense in depth, zero trust. This gives the interviewer a structure to follow and signals you're not reaching for "add HTTPS" as a reflexive answer.
2. **Separate authentication from authorization explicitly** — say out loud which mechanism verifies identity and which mechanism decides permissions, even if a framework merges them into one middleware call in the actual implementation.
3. **Walk the request path layer by layer** — network/edge (TLS, DDoS mitigation), authentication, authorization, input validation, data storage (encryption at rest) — and name the specific defense at each layer, not just "it's secure."
4. **Name the attack you're most worried about for *this* system specifically** — a payments system's biggest worry isn't the same as a social feed's. A multi-tenant SaaS app's biggest worry is usually cross-tenant data leakage; a public API's is usually credential stuffing and scraping. Generic answers ("SQL injection") are weaker than specific, system-relevant ones.
5. **Acknowledge a trade-off** — every security control costs something (latency, complexity, user friction, false positives). An answer that treats security as free signals you haven't operated a real system; an answer that says "we accept X cost for Y protection because Z" signals seniority.

> 🎯 **Interview Tip:** When an interviewer asks "how would you secure this?" immediately after you finish a non-security design, that's almost always a deliberate probe — they've likely already spotted a specific gap (e.g., you described an admin endpoint with no mention of who can call it). Re-scan your own design out loud for the most obvious gap before reaching for generic security trivia.

---

## What Interviewers Are Actually Listening For

- **Architectural thinking, not technology name-dropping.** "We'll use OAuth" is weaker than "users authenticate via OIDC against our IdP, services communicate via mTLS inside the mesh, and admin actions are additionally gated by a fine-grained ABAC check on top of the coarse RBAC role" — the second answer shows you know *where* each mechanism sits in the system, not just that it exists.
- **Honesty about trade-offs.** Claiming a design has no security weaknesses is itself a red flag — every real system has residual risk; naming it (and what you'd do to monitor or mitigate it) is the stronger answer.
- **The specific vulnerability classes that recur in system design interviews**: broken object-level authorization (a user accessing another user's resource because an endpoint forgot an ownership check), credential/token leakage across services, and missing audit trails in multi-tenant or compliance-sensitive systems.

See [`common-questions.md`](./common-questions.md) for a curated Q&A bank, and the full worked example in [`sample-answer.md`](./sample-answer.md) ("Design an authentication system for a multi-tenant SaaS platform").
