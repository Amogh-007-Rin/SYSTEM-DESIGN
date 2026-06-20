# Sample Answer: "Design an Authentication System for a Multi-Tenant SaaS Platform"

> A fully worked deep-dive answer. This exact prompt is also [Design Challenge 01](../04-exercises/design-challenges/challenge-01.md) — this is the model answer.

---

## Clarify the Requirements

Before designing anything, pin down what "multi-tenant" means for this system: each customer (tenant) is an organization with its own set of users, and one core invariant dominates everything else — **a user in Tenant A must never be able to access Tenant B's data, even by accident, even under a bug.** Cross-tenant data leakage is the single highest-stakes failure mode for this entire category of system, more so than almost any individual attack from the concepts module. Everything below is designed around preventing it.

Secondary requirements, confirmed with the interviewer: support both individual user logins and enterprise SSO (since large customers will mandate it), role-based permissions within a tenant (admin, member, viewer), and a complete audit trail of sensitive actions for compliance.

## High-Level Architecture

A dedicated **Identity Service**, separate from the rest of the product's services, owns authentication, session/token issuance, and tenant-scoping. Every other service trusts tokens issued by the Identity Service rather than implementing its own auth logic — this is itself a least-privilege and defense-in-depth decision: one well-audited place to get authentication right, rather than N services each with their own chance to get it wrong.

**Authentication flow:**
1. **Individual login** — email/password (hashed with a slow, salted algorithm — bcrypt or Argon2, never raw SHA) or social login via OIDC, both terminating in the Identity Service issuing tokens.
2. **Enterprise SSO** — SAML for enterprise customers whose IT departments mandate it (Okta, Azure AD, ADFS), OIDC for customers with modern IdPs. Both translate into the *same* internal token format afterward — the rest of the system never needs to know which protocol a given tenant's users authenticated through.
3. **Token issuance** — a short-lived **JWT access token** (10–15 minutes) carrying `user_id`, `tenant_id`, and `role`, plus a long-lived, rotating **refresh token** stored server-side. Critically, `tenant_id` is embedded directly in the access token claims and is set once at login from the verified identity provider's response — it is never a value the client can supply or influence on a per-request basis.

> 🎯 **Interview Tip:** Putting `tenant_id` in the token claims, set authoritatively at issuance rather than trusted from a request parameter, is the single highest-leverage design decision in this entire answer — naming it explicitly is what separates a strong answer from a generic "we use JWTs" answer.

## Authorization: RBAC Scoped to Tenant

Every permission check is **two-dimensional**: role AND tenant. A `member` role check alone is insufficient — every data access must also verify `resource.tenant_id === token.tenant_id`, enforced as a non-optional middleware step on every single data-access code path, not something each endpoint author remembers to add individually. This is exactly the layered RBAC + attribute-check pattern from [`01-concepts/examples/rbac-engine.ts`](../01-concepts/examples/rbac-engine.ts), with `tenant_id` as the attribute instead of (or in addition to) resource ownership.

| Role | Typical Permissions |
|---|---|
| `admin` | Manage tenant users/roles, view audit logs, configure SSO, full data access within the tenant |
| `member` | Create/read/update most resources within the tenant |
| `viewer` | Read-only access within the tenant |

> ⚠️ **Warning:** The most common real-world failure mode in multi-tenant systems isn't a sophisticated attack — it's a forgotten `WHERE tenant_id = ?` clause on one query path, or a service that trusts a `tenant_id` passed as a request parameter instead of reading it from the verified token. Enforce tenant scoping as a single shared, mandatory data-access layer (e.g., a query-building wrapper every service must use) rather than trusting every individual query author to remember it.

## Token Lifecycle and Revocation

- Access tokens are short-lived JWTs (stateless, fast to verify, no DB round-trip per request).
- Refresh tokens rotate on every use, with reuse detection: presenting an already-rotated refresh token revokes the entire token family immediately, per the mechanism in [`02-deep-dive/examples/token-rotation.ts`](../02-deep-dive/examples/token-rotation.ts). This bounds the damage of a stolen refresh token to, at most, one undetected use.
- An **admin-initiated "revoke all sessions"** action (e.g., after an employee offboarding) revokes every refresh token family for that user immediately — necessary specifically because access tokens are otherwise stateless and can't be revoked early; killing the refresh chain ensures no new access token can be minted past that point, and the existing access token expires naturally within minutes.

## Audit Logging

Every sensitive action (login, permission change, data export, SSO configuration change) is written to an **append-only audit log in a separate datastore** from the primary application database — so a compromised application service can't also erase its own tracks. Each entry captures actor (`user_id`, `tenant_id`), action, resource, timestamp, and source IP. This satisfies both the compliance requirement (GDPR/HIPAA-style auditability, covered in the [deep dive](../02-deep-dive/README.md)) and gives the security team a forensic trail if a breach is ever suspected.

## Trade-offs Discussed

| Decision | Choice | Trade-off |
|---|---|---|
| Tenant isolation enforcement | Mandatory shared data-access layer checking `tenant_id` | Adds a layer every service must route through; in exchange, removes the single most catastrophic failure mode (cross-tenant leakage) from depending on every individual developer's vigilance |
| SSO protocol support | Both SAML and OIDC | More integration and maintenance surface than supporting just one; necessary because large enterprise customers often mandate SAML regardless of technical preference |
| Token revocation | Short-lived JWT + rotating refresh token, not pure stateful sessions | Slightly delayed effective revocation (bounded by access token expiry) in exchange for no DB lookup on the hot read path |
| Audit log storage | Separate append-only store from the primary DB | Extra infrastructure and write path to maintain, in exchange for a tamper-resistant record that survives a compromise of the main application |
