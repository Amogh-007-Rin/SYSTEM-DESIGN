# Design Challenge 01: Authentication System for a Multi-Tenant SaaS App

**Difficulty:** Medium–Hard

## Prompt

Design a complete authentication and authorization system for a multi-tenant B2B SaaS platform (think: a project-management tool sold to companies, where each company is a tenant with its own users). Your design must support:

- Individual email/password login **and** enterprise SSO (large customers will mandate SAML or OIDC against their own identity provider)
- Role-based permissions within a tenant (at minimum: admin, member, viewer)
- Strict tenant isolation — a user from one tenant must never be able to access another tenant's data, under any circumstance, including bugs
- An audit log of sensitive actions, sufficient to satisfy a compliance review

## What to Produce

1. The overall architecture: where authentication logic lives, what a token/session contains, and how it flows to other services
2. Your choice of token mechanism (sessions, JWT, or a hybrid) and why, including how you handle revocation
3. How you support both individual login and enterprise SSO without duplicating logic across the rest of the system
4. Your authorization model (RBAC, ABAC, or a combination) and specifically how you guarantee tenant isolation at the data-access layer — not just "we check tenant_id," but *where* and *how* that check is enforced so it can't be skipped by a future developer
5. Your audit logging design: what gets logged, where it's stored, and why that storage choice matters
6. At least 3 trade-offs you made explicitly

A full worked solution is in [`03-interview-prep/sample-answer.md`](../../03-interview-prep/sample-answer.md), which answers this exact prompt in depth. Try to produce your own answer to the points above before reading it.
