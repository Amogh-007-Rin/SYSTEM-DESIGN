# Module 15 — Security: Summary

> This module treated security as a first-class architectural concern rather than a checklist: the principles (least privilege, defense in depth, zero trust), the authentication and authorization mechanisms that implement them at scale, the well-known attacks and their system-level defenses, and the operational realities of running a secure system — secrets management, encryption key handling, zero-trust networking via mTLS, OAuth token rotation, DDoS mitigation, and compliance-driven audit logging.

---

## Key Concepts

1. **Least privilege, defense in depth, zero trust** — the three principles every other mechanism in this module is an implementation of.
2. **Authentication vs. authorization** — verifying identity vs. deciding permissions; most real breaches are authorization bugs, not authentication failures.
3. **Statelessness vs. revocability** — the core trade-off across session tokens, JWTs, OAuth/OIDC, and SAML; short-lived access tokens plus rotating refresh tokens is the standard resolution.
4. **RBAC, ABAC, and ACLs** — role-based scales organizationally, attribute-based handles fine-grained conditions, access lists suit precise per-resource sharing; real systems often combine RBAC with an ABAC-style ownership check.
5. **Refresh token rotation and reuse detection** — rotating refresh tokens on every use, and revoking the entire token family if an already-rotated token is ever presented again, bounds the damage of a stolen refresh token.
6. **PKCE** — closes the authorization-code-interception gap for public clients (mobile, SPA) that can't hold a client secret.
7. **Envelope encryption** — a data encryption key (DEK) encrypts the data, a key encryption key (KEK) encrypts the DEK, making key rotation feasible without re-encrypting an entire dataset.
8. **mTLS / zero trust networking** — both sides of a connection verify certificates, removing the assumption that being "inside the network" is itself a credential.

---

## Key Trade-offs

| Decision | Option A | Option B | Choose A When | Choose B When |
|---|---|---|---|---|
| Token mechanism | Session tokens (stateful) | JWTs (stateless) | Instant revocation matters, single backend | Distributed/microservices system, DB lookup per request too costly |
| Authorization model | RBAC | ABAC | Coarse, organization-scale role management is enough | Fine-grained conditions (e.g., "edit only your own") must be expressed |
| Secrets storage | Environment variables | Dedicated secrets manager (Vault/cloud KMS) | Low-sensitivity config, small scale | Need rotation, audit trail, dynamic short-lived credentials |
| SSO protocol | OIDC | SAML | Modern API/mobile clients, consumer-style login | Enterprise customer's IT department mandates it |
| DDoS defense layer | CDN/edge absorption | Application-layer rate limiting | Volumetric traffic before it reaches your infrastructure | Targeted, low-volume application-layer abuse that gets through the edge |

---

## Common Interview Questions from This Module

- How would you secure this system? (principles first, then layer-by-layer defenses)
- What's the difference between authentication and authorization, and which do most breaches actually exploit?
- How does refresh token rotation work, and why does reuse detection matter?
- RBAC, ABAC, or ACLs — how do you choose, and can you combine them?
- How do you manage encryption keys at scale without re-encrypting everything on rotation?
- Design an authentication system for a multi-tenant SaaS platform (SSO, RBAC, audit logging, tenant isolation).

---

## Patterns Introduced

| Pattern | What It Solves |
|---|---|
| RBAC + ownership attribute check | Combines organization-scale role management with fine-grained per-resource access control |
| Refresh token rotation + reuse detection | Bounds the damage of a stolen refresh token and detects theft via family revocation |
| PKCE (`code_verifier`/`code_challenge`) | Protects the OAuth authorization code exchange for public clients without a client secret |
| Envelope encryption (DEK + KEK) | Makes encryption key rotation operationally feasible without re-encrypting an entire dataset |
| mTLS via service mesh sidecar | Implements zero-trust, per-request service identity verification transparently |
| Tenant-scoped data access layer | Guarantees cross-tenant isolation in multi-tenant systems as a mandatory, non-skippable check |

---

## What This Unlocks

After this module, you can tackle:
- [Module 16 — Real-Time Systems](../module-16-real-time-systems/), where the same authentication/authorization model now has to work over persistent WebSocket connections instead of discrete request/response calls
- Security deep-dives in system design interview questions involving multi-tenant SaaS platforms, payment systems, or any architecture with a compliance requirement (healthcare, finance)
- Confidently answering "how would you secure this?" as a structured follow-up to any other module's design, rather than as an afterthought

---

## Quick Reference

- **AuthN** = who you are. **AuthZ** = what you can do. Most breaches are AuthZ bugs.
- **Stateless (JWT)** trades easy revocation for scalability; **stateful (sessions)** trades scalability for instant revocation. Short-lived access token + rotating refresh token splits the difference.
- **RBAC** scales by role; **ABAC** scales by condition; combine them when RBAC alone can't express ownership.
- **Refresh token reuse = theft signal** — revoke the whole token family, not just the one request.
- **PKCE** is now recommended for all OAuth public clients, not just mobile.
- **Envelope encryption** (DEK + KEK) is how key rotation stays cheap at scale.
- **Zero trust** = no implicit trust from network location, ever — verify every call, mTLS for service-to-service.
- **DDoS**: CDN/edge absorbs volume first; rate limiting and IP reputation catch what gets through.
- **Compliance** (GDPR/HIPAA) usually translates directly into: encryption requirements, data residency, and mandatory audit logs designed in from day one.

---

← [Previous Module ← Module 14 — Observability](../module-14-observability/) | [Next Module → Module 16 — Real-Time Systems](../module-16-real-time-systems/)
