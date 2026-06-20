# Module 15 — Security in System Design

> A system that's fast, scalable, and consistent but insecure isn't a system you can ship — security is an architectural concern you design for deliberately, not a checklist you run afterward.

---

## Prerequisites

| Module | Topics Needed |
|---|---|
| [Module 03 — API Design](../module-03-apis/) | JWTs, OAuth 2.0, and API keys at the API layer — this module goes deeper into how they behave at scale and what surrounds them |
| [Module 11 — Microservices](../module-11-microservices/) | Service-to-service communication, the network boundaries security has to defend, and why "internal" traffic still needs to be secured |

> 💡 Complete prerequisite modules first — this one builds directly on them.

---

## What You'll Learn

By the end of this module you will be able to:
- Apply least privilege, defense in depth, and zero trust as explicit, named design principles rather than vague intuitions
- Compare session tokens, JWTs, OAuth 2.0 + OIDC, and SAML on statefulness and revocability, and choose correctly for a given architecture
- Choose between RBAC, ABAC, and ACLs for an authorization model, and implement a working RBAC permission engine
- Identify SQL injection, XSS, CSRF, SSRF, DDoS, and MITM attacks and name the specific system-level defense for each
- Design secrets management, encryption (at rest and in transit), and zero-trust networking (mTLS) for a real architecture
- Implement and reason about OAuth scopes, refresh token rotation, and PKCE, including detecting refresh-token reuse
- Design a complete authentication system for a multi-tenant SaaS platform, and audit an existing design for concrete vulnerabilities

---

## Estimated Time

**4–5 hours** total: Concepts: ~2h | Deep dive: ~1.5h | Exercises: ~1.5h

---

## Module Contents

| Section | Description |
|---|---|
| [01 — Concepts](./01-concepts/) | Core theory and foundational knowledge |
| [02 — Deep Dive](./02-deep-dive/) | Advanced nuances, internals, trade-offs |
| [03 — Interview Prep](./03-interview-prep/) | Framework, Q&A, sample answers |
| [04 — Exercises](./04-exercises/) | Design challenges (no coding challenges in this module) |
| [05 — Further Reading](./05-further-reading/) | Curated external resources |
| [Summary](./SUMMARY.md) | Key takeaways and quick reference |

---

→ [Begin with the concepts](./01-concepts/README.md)

← [Previous Module ← Module 14 — Observability](../module-14-observability/) | [Next Module → Module 16 — Real-Time Systems](../module-16-real-time-systems/)
