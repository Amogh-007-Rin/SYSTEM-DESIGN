# Module 15 — Common Interview Questions

**Q1: What's the difference between authentication and authorization, and which one do most real-world breaches actually exploit?**
Authentication answers "who are you?"; authorization answers "what are you allowed to do?" Most real breaches exploit authorization bugs on top of *correct* authentication — the system knows exactly who you are, but fails to check whether you should be allowed to touch a specific resource. Broken object-level authorization (e.g., changing an ID in a URL to access another user's data) is OWASP's most common API vulnerability for exactly this reason.

**Q2: When would you choose JWTs over server-side sessions, and what do you give up?**
Choose JWTs when you have a distributed system (microservices, mobile clients) where a database/cache lookup on every request to validate a session is too expensive, or where services need to verify identity independently without all sharing one session store. You give up easy revocation — a JWT is valid until it expires, full stop, unless you add a deny-list (which reintroduces the statefulness you were trying to avoid). Short-lived access tokens plus rotating refresh tokens is the standard way to bound that risk.

**Q3: How does refresh token rotation work, and why does reuse detection matter?**
Every time a refresh token is exchanged, the server issues a brand-new refresh token and invalidates the old one. If the old (already-invalidated) token is ever presented again, that's a strong signal it was stolen — a legitimate client only uses each refresh token once, so a second use means someone else has a copy. The correct response is to revoke the entire token family, not just deny that one request, since you can no longer tell which party is legitimate.

**Q4: What problem does PKCE solve, and why is it required for mobile apps and SPAs specifically?**
PKCE prevents an intercepted OAuth authorization code from being exchanged for tokens by anyone other than the client that initiated the flow. Public clients (mobile apps, single-page apps) can't safely hold a client secret to protect that exchange the way a confidential backend server can, so PKCE substitutes a per-flow `code_verifier`/`code_challenge` pair instead — only the original initiator has the verifier needed to complete the exchange.

**Q5: RBAC, ABAC, or ACLs — how do you choose, and can you combine them?**
RBAC scales best organizationally (assign a role, not a list of permissions) but struggles with conditions like "edit only your own resources." ABAC handles exactly that kind of condition via dynamic attribute evaluation but is harder to audit at scale ("who can access X?" requires evaluating policy logic, not reading a list). ACLs are precise for fine-grained, per-resource sharing but don't organize well across thousands of resources. Real systems commonly combine RBAC for coarse-grained role checks with an ABAC-style ownership check layered on top — exactly the pattern in [`01-concepts/examples/rbac-engine.ts`](../01-concepts/examples/rbac-engine.ts).

**Q6: How would you design SSO for an enterprise SaaS product?**
Support both OIDC and SAML: OIDC for modern API/mobile clients and a good default for new customers, SAML because large enterprise customers' IT departments frequently mandate it as a vendor requirement regardless of its technical merits relative to OIDC. Architecturally this usually means a single internal identity abstraction behind the scenes, with adapters translating either external protocol into your system's own session/token format.

**Q7: What's the difference between encryption in transit and encryption at rest, and do you need both?**
Yes, always — they defend against different threats. In transit (TLS) defeats network eavesdropping and MITM but does nothing once data is stored. At rest defeats an attacker who reaches the storage medium directly (a stolen backup, a misconfigured bucket) without ever touching the network. Neither substitutes for the other.

**Q8: How do you manage encryption keys at scale without re-encrypting your entire dataset every time you rotate a key?**
Envelope encryption: each piece of data is encrypted with its own data encryption key (DEK), and the DEK is itself encrypted by a key encryption key (KEK) held in a separate hardened service (AWS KMS, Vault's transit engine). Rotating the KEK only requires re-wrapping the small DEKs, not re-encrypting every row of actual data — this is what makes rotation operationally feasible.

**Q9: What does "zero trust" actually change about how services talk to each other inside your own VPC?**
It removes the assumption that being "inside the network" is itself a credential. Every service-to-service call, even ones that never leave your own VPC, authenticates and is authorized on its own merits — typically via mTLS, where both sides present and verify certificates rather than just the server. This bounds the damage of a single compromised internal service, since it can no longer make unauthenticated calls to everything else just by virtue of being on the internal network.

**Q10: How would you mitigate a large-scale DDoS attack, layer by layer?**
CDN/edge absorption first — volumetric traffic gets absorbed far from your origin, across edge capacity orders of magnitude larger than any origin could provision. Rate limiting next, for application-layer abuse too targeted to look volumetric (credential stuffing). IP reputation filtering to block or challenge known-bad sources before they consume application resources. Auto-scaling helps absorb legitimate spikes but is not itself a DDoS defense, since an attacker can generate traffic faster than you can provision capacity.
