# Design Challenge 02: Find the 5 Vulnerabilities

**Difficulty:** Medium

## Prompt

A team has built **NoteShare**, a simple web app where users write notes and optionally share them with other users by email. Below is their actual architecture and a handful of representative code/config snippets, exactly as they ship them today. Read it carefully and find **5 concrete security vulnerabilities** — not vague "could be more secure" observations, but specific, exploitable flaws.

### Architecture

- **Frontend:** a single-page React app, served over HTTPS from a CDN.
- **Backend:** a single Node.js/Express API server, talking to a PostgreSQL database.
- **Auth:** users log in with email + password. On success, the server returns a JWT. The frontend stores it in `localStorage` and sends it as `Authorization: Bearer <token>` on every request.
- **Sharing:** a note can be shared by ID with another user's email address.

### Snippet 1 — Login endpoint

```js
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query(
    `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`
  );
  if (result.rows.length === 0) return res.status(401).send("Invalid credentials");
  const token = jwt.sign({ userId: result.rows[0].id }, "supersecret123", { expiresIn: "30d" });
  res.json({ token });
});
```

### Snippet 2 — Fetch a note

```js
app.get("/notes/:id", async (req, res) => {
  const note = await db.query(`SELECT * FROM notes WHERE id = ${req.params.id}`);
  res.json(note.rows[0]);
});
```

### Snippet 3 — Render a shared note's title in the UI (React)

```jsx
function NoteTitle({ note }) {
  return <div dangerouslySetInnerHTML={{ __html: note.title }} />;
}
```

### Snippet 4 — Database connection config (committed to the repo)

```js
// db.js
module.exports = {
  host: "noteshare-prod.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "Prod_DB_2019!",
  database: "noteshare",
};
```

### Snippet 5 — CORS configuration

```js
app.use(cors({ origin: "*", credentials: true }));
```

## What to Produce

For **each** of the 5 vulnerabilities you find:
1. Name the vulnerability class (use the standard terminology from this module where applicable).
2. Explain exactly how an attacker would exploit it — be specific about the request/payload, not just "this is insecure."
3. Propose a concrete fix.

There are more than 5 issues in this code if you look closely — find at least 5 and prioritize the most severe ones.

A full worked solution is in [`challenge-02-solution.md`](./challenge-02-solution.md).
