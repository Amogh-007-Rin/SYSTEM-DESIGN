# Design Challenge 01 — Solution: Authentication System for a Multi-Tenant SaaS App

This prompt is answered in full in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md) — summarized here for the exercise format.

## Architecture

A dedicated **Identity Service** owns authentication and token issuance; every other service trusts tokens it issues rather than implementing its own auth logic. This is least privilege and defense in depth applied to the *organization* of the system itself: one well-audited place to get authentication right instead of N services each with their own chance to get it wrong.

## Token Mechanism

A short-lived **JWT access token** (10–15 min) carrying `user_id`, `tenant_id`, and `role`, paired with a long-lived, **rotating refresh token** stored server-side. `tenant_id` is set authoritatively at issuance from the verified identity provider's response — never trusted from a client-supplied parameter on any later request. Revocation works via refresh-token-family invalidation (see [`02-deep-dive/examples/token-rotation.ts`](../../02-deep-dive/examples/token-rotation.ts)): an admin "revoke all sessions" action kills the refresh chain, and the short-lived access token expires naturally within minutes regardless.

## SSO Without Duplicated Logic

SAML (for enterprise customers whose IT departments mandate it) and OIDC (for modern IdPs) both terminate in the Identity Service and get translated into the *same* internal token format. No other service in the system needs to know or care which protocol a given tenant's users actually authenticated through.

## Authorization and Tenant Isolation

RBAC for the coarse role check (`admin` / `member` / `viewer`), combined with a **mandatory** tenant-scoping check enforced at a shared data-access layer every service must route through — not an individual query author's responsibility to remember. Every data access verifies `resource.tenant_id === token.tenant_id` as a non-skippable step, the same layered pattern as [`01-concepts/examples/rbac-engine.ts`](../../01-concepts/examples/rbac-engine.ts) but with `tenant_id` as the enforced attribute.

| Role | Typical Permissions |
|---|---|
| `admin` | Manage tenant users/roles, view audit logs, configure SSO, full data access within the tenant |
| `member` | Create/read/update most resources within the tenant |
| `viewer` | Read-only access within the tenant |

## Audit Logging

Every sensitive action (login, permission change, data export, SSO config change) is written to an **append-only audit log in a separate datastore** from the primary application database, capturing actor, tenant, action, resource, timestamp, and source IP. The separate datastore matters specifically because it means a compromised application service can't also erase its own tracks.

## Trade-offs

| Decision | Choice | Trade-off |
|---|---|---|
| Tenant isolation | Mandatory shared data-access layer | Extra layer every service must route through; removes the single most catastrophic failure mode (cross-tenant leakage) from depending on individual developer vigilance |
| SSO protocols | Support both SAML and OIDC | More integration/maintenance surface, necessary because enterprise customers often mandate SAML specifically |
| Revocation | Short-lived JWT + rotating refresh token | Slightly delayed effective revocation (bounded by access token expiry) for no DB lookup on the hot read path |

See the full discussion — including why `tenant_id` placement in the token is the single highest-leverage decision in this design — in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md).
